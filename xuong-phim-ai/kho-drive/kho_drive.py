"""GITA 365 · nói chuyện với Kho phim Google Drive (Apps Script) từ máy dựng phim (GitHub Action / Kaggle / Colab).

  python kho_drive.py doc-viec  <jobid> <thư_mục_ra>     # lấy kế hoạch + ảnh mẫu
  python kho_drive.py bao       <jobid> <trangThai> "<bước>" [phanTram]
  python kho_drive.py tai-len   <jobid> <tệp.mp4> [chinh|phude] ["Tên phim"]
  python kho_drive.py tai-ve-du-an <jobid> <thư_mục>     # dự án: kế hoạch + mọi tệp cảnh (mở link tạm, xong khoá lại)
  python kho_drive.py tai-len-canh <jobid> <mã_dự_án> <tệp.mp4> <05.mp4>   # cảnh AI → Du-an/<tên>/AI/

Cần biến môi trường: KHO_DRIVE_URL (địa chỉ Web app Apps Script) · KHO_DRIVE_KHOA (KHOA_MAY).
Phim đi THẲNG vào Drive bằng phiên tải lên nối tiếp (resumable): chia mảnh 16MB, rớt mạng thì hỏi Drive
đã nhận tới đâu rồi gửi tiếp — không cầm token Google nào, chỉ cầm địa chỉ phiên do Apps Script cấp.
"""
import base64, json, os, sys, time
from pathlib import Path

import requests

MANH = 16 * 1024 * 1024                      # bội số của 256KB theo quy định Drive
TAI_VE = "https://drive.usercontent.google.com/download?id={id}&export=download&confirm=t"


class KhoDrive:
    def __init__(self, url=None, khoa=None, s=None):
        self.url = (url or os.environ["KHO_DRIVE_URL"]).strip()
        self.khoa = (khoa or os.environ["KHO_DRIVE_KHOA"]).strip()
        self.s = s or requests.Session()

    def goi(self, viec, **kw):
        # Apps Script trả 302 → requests tự theo sang trang kết quả (đúng cách web app Apps Script hoạt động)
        for lan in range(4):
            try:
                r = self.s.post(self.url, data=json.dumps({"khoa": self.khoa, "viec": viec, **kw}),
                                headers={"Content-Type": "text/plain;charset=utf-8"}, timeout=180)
                d = r.json()
                if d.get("loi"): raise RuntimeError(d["loi"])
                return d
            except (requests.RequestException, ValueError) as e:
                if lan == 3: raise
                time.sleep(2 ** (lan + 1)); print("  thử lại", viec, "—", str(e)[:80], flush=True)

    def bao(self, jobid, trang_thai=None, buoc=None, phan_tram=None):
        kw = {k: v for k, v in {"trangThai": trang_thai, "buoc": buoc, "phanTram": phan_tram}.items() if v is not None}
        try: return self.goi("baoViec", jobid=jobid, **kw)
        except Exception as e: print("  không báo được tiến độ:", e, flush=True)

    def doc_viec(self, jobid, ra):
        d = self.goi("docViec", jobid=jobid)
        ra = Path(ra); (ra / "nhan-vat").mkdir(parents=True, exist_ok=True)
        (ra / "ke-hoach.json").write_text(json.dumps(d["ke_hoach"], ensure_ascii=False), encoding="utf-8")
        for nv, b64 in (d.get("anh") or {}).items():
            (ra / "nhan-vat" / f"{nv}.jpg").write_bytes(base64.b64decode(b64))
        return d["ke_hoach"]

    def tai_ve_du_an(self, jobid, ra):
        """Tải kế hoạch + mọi tệp cảnh của dự án. Kho mở link tạm thời; dù lỗi giữa chừng vẫn khoá lại."""
        ra = Path(ra); (ra / "nguon").mkdir(parents=True, exist_ok=True)
        d = self.goi("moTai", jobid=jobid)
        try:
            (ra / "du-an.json").write_text(json.dumps(d["ke_hoach"], ensure_ascii=False), encoding="utf-8")
            for t in d["tep"]:
                dich = ra / "nguon" / Path(t["ten"]).name          # tên đã được kho kiểm dạng 05.mp4
                u = TAI_VE.format(id=t["id"])
                for lan in range(4):
                    try:
                        with self.s.get(u, stream=True, timeout=600) as r:
                            r.raise_for_status()
                            if "text/html" in r.headers.get("content-type", ""): raise RuntimeError("Drive trả trang HTML thay vì tệp")
                            with open(dich, "wb") as f:
                                for k in r.iter_content(1 << 20): f.write(k)
                        break
                    except Exception as e:
                        if lan == 3: raise
                        print("  tải lại", t["ten"], "—", str(e)[:80], flush=True); time.sleep(2 ** (lan + 1))
                print(f"  ✓ {t['nhom']:5} {t['ten']} ({dich.stat().st_size / 1e6:.1f}MB)", flush=True)
        finally:
            print("  khoá lại link tạm:", self.goi("dongTai", jobid=jobid).get("daKhoa"), "tệp", flush=True)
        return d["ke_hoach"]

    def tai_len(self, jobid, tep, ban="chinh", ten_phim=None, du_an=None):
        tep = Path(tep); co = tep.stat().st_size
        if du_an: ten = ten_phim                                   # cảnh AI của dự án: đúng tên 05.mp4
        else: ten = f"{(ten_phim or tep.stem).strip()[:90]} · {jobid[:8]}{' · phụ đề' if ban == 'phude' else ''}.mp4"
        phien = self.goi("phienTaiLen", jobid=jobid, ten=ten, kichThuoc=co, **({"duAn": du_an} if du_an else {}))["uploadUrl"]
        dau, loi = 0, 0
        with open(tep, "rb") as f:
            while True:
                f.seek(dau); manh = f.read(MANH); cuoi = dau + len(manh) - 1
                try:
                    r = self.s.put(phien, data=manh, timeout=600,
                                   headers={"Content-Length": str(len(manh)), "Content-Range": f"bytes {dau}-{cuoi}/{co}"})
                except requests.RequestException as e:
                    r = None; print("  rớt mạng:", str(e)[:80], flush=True)
                if r is not None and r.status_code in (200, 201):
                    fid = r.json()["id"]; break
                if r is not None and r.status_code == 308:            # Drive đã nhận tới đâu
                    rg = r.headers.get("Range"); dau = int(rg.split("-")[1]) + 1 if rg else 0
                    print(f"  đã gửi {dau * 100 // co}%", flush=True); loi = 0; continue
                if r is not None and r.status_code == 404:
                    raise RuntimeError("Phiên tải lên hết hạn — chạy lại bước tải lên.")
                loi += 1
                if loi > 6: raise RuntimeError(f"Tải lên thất bại (mã {getattr(r, 'status_code', '—')}).")
                time.sleep(2 ** loi)
                try:                                                   # hỏi lại vị trí rồi gửi tiếp
                    q = self.s.put(phien, headers={"Content-Length": "0", "Content-Range": f"bytes */{co}"}, timeout=60)
                    if q.status_code in (200, 201): fid = q.json()["id"]; break
                    rg = q.headers.get("Range"); dau = int(rg.split("-")[1]) + 1 if (q.status_code == 308 and rg) else 0
                except requests.RequestException: pass
        self.goi("xongTaiLen", jobid=jobid, fileId=fid, ban="ai" if du_an else ban)
        print(f"✅ Đã lưu vào Drive: {ten} ({co / 1e6:.1f}MB) · id {fid}", flush=True)
        return fid


def main(a):
    k = KhoDrive()
    if a[:1] == ["doc-viec"] and len(a) == 3: k.doc_viec(a[1], a[2]); print("đã lấy kế hoạch", a[1])
    elif a[:1] == ["bao"] and len(a) >= 4: k.bao(a[1], a[2], a[3], int(a[4]) if len(a) > 4 else None)
    elif a[:1] == ["tai-len"] and len(a) >= 3: k.tai_len(a[1], a[2], a[3] if len(a) > 3 else "chinh", a[4] if len(a) > 4 else None)
    elif a[:1] == ["tai-ve-du-an"] and len(a) == 3: k.tai_ve_du_an(a[1], a[2])
    elif a[:1] == ["tai-len-canh"] and len(a) == 5: k.tai_len(a[1], a[3], "ai", a[4], du_an=a[2])
    else: print(__doc__); sys.exit(2)


if __name__ == "__main__":
    main(sys.argv[1:])
