"""Chạy Xưởng AI ba cổng cho một yêu cầu.

    python chay_xuong.py "Viết công cụ dòng lệnh đổi giờ phút sang phút" --ten doi_gio

Xưởng làm:   kiểm yêu cầu → kiểm cấu hình mô hình → chạy MetaGPT trong một thư mục
             riêng → quét sản phẩm → kiểm biên dịch → viết BAO_CAO.md.
Xưởng KHÔNG: đẩy mã lên kho thật, ghép mã, phát hành, cấp quyền, bật chi tiêu.
             Ba việc ấy là ba cổng của người.
"""
from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

import vung_cam

GOC = Path(__file__).resolve().parent
CAU_HINH_MAC_DINH = GOC / "cau-hinh" / "config2.yaml"

# Biến môi trường có tên như thế này không được chuyển cho xưởng:
# xưởng không được dùng khoá của chủ sở hữu.
BIEN_BI_MAT = re.compile(r"(?i)(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTH)")


def doc_cau_hinh(duong_dan: Path) -> dict:
    with open(duong_dan, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def moi_truong_sach(lan: Path, home: Path) -> dict:
    env = {k: v for k, v in os.environ.items() if not BIEN_BI_MAT.search(k)}
    env["HOME"] = str(home)  # MetaGPT đọc ~/.metagpt/config2.yaml từ HOME riêng của lần chạy
    # Thư mục làm việc mặc định của tác tử (METAGPT_ROOT/workspace) nằm trong lần chạy này.
    env["METAGPT_PROJECT_ROOT"] = str(lan)
    return env


def chup_cay(cac_goc: list[Path], bo_qua: Path) -> dict[str, tuple[int, int]]:
    """Ghi lại kích thước và thời điểm sửa của mọi tệp ngoài thư mục lần chạy này.
    So trước và sau để bắt tác tử ghi ra ngoài phần được phép (kể cả sửa chính xưởng)."""
    anh = {}
    for goc in cac_goc:
        if not goc.exists():
            continue
        for p in goc.rglob("*"):
            if bo_qua in p.parents or "__pycache__" in p.parts or p.suffix == ".pyc" or ".git" in p.parts:
                continue
            try:
                if p.is_file() or p.is_symlink():
                    st = p.lstat()
                    anh[str(p)] = (st.st_size, st.st_mtime_ns)
            except OSError:
                pass
    return anh


def so_anh(truoc: dict, sau: dict, goc: Path) -> list[vung_cam.PhatHien]:
    ds = []
    for p in sorted(set(truoc) | set(sau)):
        if p not in truoc:
            ly_do = "tệp mới ngoài thư mục làm việc"
        elif p not in sau:
            ly_do = "tệp bị xoá ngoài thư mục làm việc"
        elif truoc[p] != sau[p]:
            ly_do = "tệp bị sửa ngoài thư mục làm việc"
        else:
            continue
        try:
            ten = str(Path(p).relative_to(goc))
        except ValueError:
            ten = p
        ds.append(vung_cam.PhatHien("chặn", ten, ly_do))
    return ds


def kiem_bien_dich(thu_muc: Path) -> tuple[int, list[str]]:
    loi, dem = [], 0
    for p in sorted(thu_muc.rglob("*.py")):
        if ".git" in p.parts:
            continue
        dem += 1
        try:
            # Chỉ biên dịch trong bộ nhớ: không chạy mã AI viết, không ghi tệp .pyc.
            compile(p.read_text(encoding="utf-8", errors="replace"), str(p), "exec")
        except SyntaxError as e:
            loi.append(f"{p.relative_to(thu_muc)}: dòng {e.lineno}: {e.msg}")
    return dem, loi


def viet_bao_cao(lan: Path, **tt) -> Path:
    def ds(xs, rong="không có"):
        return "\n".join(f"- {x}" for x in xs) if xs else f"- {rong}"

    tai_lieu = tt.get("tai_lieu") or []
    noi_dung = f"""# Báo cáo xưởng · {tt['ten']}

- **Yêu cầu:** {tt['yeu_cau']}
- **Thời điểm:** {tt['luc']}
- **Mô hình:** {tt['mo_hinh']} tại {tt['base_url']}
- **Thời gian chạy:** {tt['giay']:.0f} giây · mã thoát MetaGPT: {tt['ma_thoat']}
- **Sản phẩm:** `{tt['san_pham'] or 'không có'}` · {tt['so_tep']} tệp

## Quét vùng cấm và bí mật
{ds([str(x) for x in tt['phat_hien']])}

## Kiểm biên dịch Python
- {tt['so_py']} tệp .py, {len(tt['loi_bien_dich'])} tệp lỗi
{ds(tt['loi_bien_dich'], 'không có lỗi biên dịch')}

## Tài liệu xưởng đã viết
{ds(tai_lieu)}

## Kết luận của máy
**{tt['ket_luan']}**

## Ba cổng của người (máy không đánh dấu được các ô này)
- [ ] **Cổng 1 · Ghép mã:** người đã đọc mã, chạy thử trong máy cách ly, và tự tay ghép.
  Duyệt có ghi nhận: `bash duyet_cong1.sh mo {tt['duong_lan']}`, rồi `dong` khi xong.
- [ ] **Cổng 2 · Phát hành:** đủ ba chữ ký trước khi tới tay khách hàng.
- [ ] **Cổng 3 · Tiền và quyền:** không có chi tiêu, khoá hay quyền truy cập nào mới, hoặc đã được người cấp.

Nhật ký đầy đủ: `nhat-ky.txt`.
"""
    duong = lan / "BAO_CAO.md"
    duong.write_text(noi_dung, encoding="utf-8")
    return duong


def main() -> int:
    ap = argparse.ArgumentParser(description="Xưởng AI ba cổng")
    ap.add_argument("yeu_cau", help="một dòng yêu cầu")
    ap.add_argument("--ten", required=True, help="tên dự án, chữ thường không dấu, ví dụ doi_gio")
    ap.add_argument("--vong", type=int, default=5, help="số vòng làm việc của MetaGPT")
    ap.add_argument("--cau-hinh", type=Path, default=CAU_HINH_MAC_DINH)
    ap.add_argument("--metagpt", default=shutil.which("metagpt") or "metagpt")
    ap.add_argument("--gioi-han-giay", type=int, default=3600)
    a = ap.parse_args()

    if not re.fullmatch(r"[a-z][a-z0-9_]{1,40}", a.ten):
        print("Tên dự án chỉ gồm chữ thường không dấu, số và gạch dưới.")
        return 2

    chan = vung_cam.kiem_yeu_cau(a.yeu_cau)
    cfg = doc_cau_hinh(a.cau_hinh)
    llm = cfg.get("llm", {})
    chan += vung_cam.kiem_cau_hinh(llm.get("base_url", ""), llm.get("api_type", ""))
    if vung_cam.co_chan(chan):
        print("Xưởng từ chối chạy:")
        for x in chan:
            print(" ", x)
        return 3

    luc = dt.datetime.now()
    lan = GOC / "lan-chay" / f"{luc:%Y%m%d-%H%M%S}-{a.ten}"
    home = lan / "home"
    ws = lan / "workspace"
    (home / ".metagpt").mkdir(parents=True)
    ws.mkdir()
    cfg_lan = dict(cfg)
    cfg_lan["workspace"] = {"path": str(ws)}
    with open(home / ".metagpt" / "config2.yaml", "w", encoding="utf-8") as f:
        yaml.safe_dump(cfg_lan, f, allow_unicode=True)

    lenh = [a.metagpt, a.yeu_cau, "--project-name", a.ten, "--n-round", str(a.vong),
            "--no-run-tests", "--investment", "0.5"]
    # Canh gác: xưởng, mã MetaGPT và các lần chạy cũ không được thay đổi trong lúc chạy.
    canh = [GOC, GOC.parent / "metagpt-src"]
    truoc = chup_cay(canh, lan)
    bat_dau = dt.datetime.now()
    with open(lan / "nhat-ky.txt", "w", encoding="utf-8") as nk:
        try:
            r = subprocess.run(lenh, cwd=lan, env=moi_truong_sach(lan, home), stdout=nk,
                               stderr=subprocess.STDOUT, timeout=a.gioi_han_giay)
            ma_thoat = r.returncode
        except subprocess.TimeoutExpired:
            ma_thoat = "hết giờ"
    giay = (dt.datetime.now() - bat_dau).total_seconds()
    vuot_rao = so_anh(truoc, chup_cay(canh, lan), GOC.parent)

    # Tác tử kiểu cũ ghi vào workspace/<tên>; tác tử MetaGPT 1.0 ghi thẳng vào workspace.
    sp = ws / a.ten if (ws / a.ten).is_dir() else ws
    if any(sp.rglob("*")):
        tep = [p for p in sp.rglob("*") if p.is_file() and ".git" not in p.parts]
        phat_hien = vung_cam.quet_dau_ra(sp)
        so_py, loi_bd = kiem_bien_dich(sp)
        tai_lieu = sorted(str(p.relative_to(sp)) for p in sp.glob("docs/**/*") if p.is_file())
    else:
        tep, phat_hien, so_py, loi_bd, tai_lieu = [], [], 0, [], []
    phat_hien = vuot_rao + phat_hien

    if vuot_rao:
        ket_luan = "BỊ CHẶN: tác tử đã ghi hoặc sửa tệp ngoài thư mục được phép. Kiểm lại máy trước khi chạy tiếp."
    elif not tep:
        ket_luan = "KHÔNG ĐẠT: xưởng không làm ra sản phẩm. Xem nhật ký."
    elif vung_cam.co_chan(phat_hien):
        ket_luan = "BỊ CHẶN: sản phẩm có bí mật hoặc tệp cấm. Không được đi tiếp tới cổng 1."
    elif loi_bd:
        ket_luan = "CHƯA ĐẠT: có tệp Python không biên dịch được. Trả lại xưởng hoặc sửa tay."
    else:
        ket_luan = "SẴN SÀNG CHO CỔNG 1: máy đã kiểm xong phần của máy. Người đọc và quyết."

    bc = viet_bao_cao(lan, duong_lan=str(lan.relative_to(GOC)), ten=a.ten, yeu_cau=a.yeu_cau, luc=f"{luc:%d/%m/%Y %H:%M}",
                      mo_hinh=llm.get("model", "?"), base_url=llm.get("base_url", "?"),
                      giay=giay, ma_thoat=ma_thoat,
                      san_pham=str(sp.relative_to(GOC)) if sp.is_dir() else "",
                      so_tep=len(tep), phat_hien=phat_hien, so_py=so_py,
                      loi_bien_dich=loi_bd, tai_lieu=tai_lieu, ket_luan=ket_luan)
    print(ket_luan)
    print(f"Báo cáo: {bc}")
    return 0 if ket_luan.startswith("SẴN SÀNG") else 1


if __name__ == "__main__":
    sys.exit(main())
