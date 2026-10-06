"""GITA · bộ chạy LongCat-Video (Meituan, model mở MIT) cho xưởng phim nội bộ.

Bản demo gốc (run_demo_image_to_video.py, run_demo_long_video.py) cứng ảnh và prompt; tệp này dựng
lại ĐÚNG trình tự của demo nhưng nhận tham số, để động cơ gọi cho từng cảnh:

  · ảnh → video (generate_i2v) cho đoạn đầu, rồi
  · nối đoạn (generate_vc, 13 khung điều kiện) cho tới đủ thời lượng  → cảnh dài 10–30 giây liền mạch
  · --cond_video: bắt đầu bằng NỐI TIẾP từ clip cảnh trước (giữ người, tư thế, ánh sáng)

Gọi (động cơ tự gọi):
  PYTHONPATH=LongCat-Video torchrun --nproc_per_node=1 chay_longcat.py --checkpoint_dir LongCat-Video/weights/LongCat-Video \
      --image anh.png --prompt "..." --out clip.mp4 --giay 12 [--cond_video truoc.mp4 --stride 2]
Cần card ~80GB (A100/H100). Chưa chạy thử trên GPU trong môi trường dựng app.
"""
import os, argparse, datetime
import numpy as np
import PIL.Image
import torch
import torch.distributed as dist
from transformers import AutoTokenizer, UMT5EncoderModel
from torchvision.io import write_video
from diffusers.utils import load_image, load_video

from longcat_video.pipeline_longcat_video import LongCatVideoPipeline
from longcat_video.modules.scheduling_flow_match_euler_discrete import FlowMatchEulerDiscreteScheduler
from longcat_video.modules.autoencoder_kl_wan import AutoencoderKLWan
from longcat_video.modules.longcat_video_dit import LongCatVideoTransformer3DModel
from longcat_video.context_parallel import context_parallel_util
from longcat_video.context_parallel.context_parallel_util import init_context_parallel

FPS, KHUNG, DIEU_KIEN = 15, 93, 13      # như demo: 93 khung / đoạn ở 15fps, 13 khung điều kiện khi nối


def anh_pil(arr):
    return [PIL.Image.fromarray((arr[i] * 255).astype(np.uint8)) for i in range(arr.shape[0])]


def main(a):
    rank = int(os.environ["RANK"]); n = torch.cuda.device_count(); local = rank % n
    torch.cuda.set_device(local)
    dist.init_process_group(backend="nccl", timeout=datetime.timedelta(seconds=3600 * 24))
    init_context_parallel(context_parallel_size=1, global_rank=dist.get_rank(), world_size=dist.get_world_size())
    cp_split_hw = context_parallel_util.get_optimal_split(context_parallel_util.get_cp_size())

    ck = a.checkpoint_dir
    pipe = LongCatVideoPipeline(
        tokenizer=AutoTokenizer.from_pretrained(ck, subfolder="tokenizer", torch_dtype=torch.bfloat16),
        text_encoder=UMT5EncoderModel.from_pretrained(ck, subfolder="text_encoder", torch_dtype=torch.bfloat16),
        vae=AutoencoderKLWan.from_pretrained(ck, subfolder="vae", torch_dtype=torch.bfloat16),
        scheduler=FlowMatchEulerDiscreteScheduler.from_pretrained(ck, subfolder="scheduler", torch_dtype=torch.bfloat16),
        dit=LongCatVideoTransformer3DModel.from_pretrained(ck, subfolder="dit", cp_split_hw=cp_split_hw, torch_dtype=torch.bfloat16),
    )
    pipe.to(local)
    g = torch.Generator(device=local); g.manual_seed(a.seed)
    can = max(KHUNG, int(round(float(a.giay) * FPS)))            # số khung cần cho cảnh

    tat_ca, hien = [], None
    if a.cond_video:                                             # nối tiếp cảnh trước
        vd = load_video(a.cond_video)[:: max(1, a.stride)]
        hien = vd[-(DIEU_KIEN * 3):]
        kich = vd[0].size
    else:                                                        # đoạn đầu: ảnh → video
        anh = load_image(a.image); kich = anh.size
        ra = pipe.generate_i2v(image=anh, prompt=a.prompt, negative_prompt=a.negative, resolution=a.resolution,
                               num_frames=KHUNG, num_inference_steps=a.buoc, guidance_scale=4.0, generator=g)[0]
        hien = anh_pil(ra); tat_ca.extend(hien)
    while len(tat_ca) < can:                                     # nối đoạn như run_demo_long_video.py
        ra = pipe.generate_vc(video=hien, prompt=a.prompt, negative_prompt=a.negative, resolution=a.resolution,
                              num_frames=KHUNG, num_cond_frames=DIEU_KIEN, num_inference_steps=a.buoc,
                              guidance_scale=4.0, generator=g, use_kv_cache=True, offload_kv_cache=False,
                              enhance_hf=True)[0]
        moi = anh_pil(ra); tat_ca.extend(moi[DIEU_KIEN:]); hien = moi
        torch.cuda.empty_cache()
    if local == 0:
        khung = [f.resize(kich, PIL.Image.BICUBIC) for f in tat_ca[:can]]
        write_video(a.out, torch.from_numpy(np.array(khung)), fps=FPS, video_codec="libx264", options={"crf": "12"})
        print("LONGCAT_XONG", a.out, len(khung), "khung")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--checkpoint_dir", required=True)
    p.add_argument("--image", default="")
    p.add_argument("--cond_video", default="")
    p.add_argument("--stride", type=int, default=1)
    p.add_argument("--prompt", required=True)
    p.add_argument("--negative", default="")
    p.add_argument("--out", required=True)
    p.add_argument("--giay", type=float, default=6)
    p.add_argument("--resolution", default="480p", choices=["480p", "720p"])
    p.add_argument("--buoc", type=int, default=50)
    p.add_argument("--seed", type=int, default=42)
    main(p.parse_args())
