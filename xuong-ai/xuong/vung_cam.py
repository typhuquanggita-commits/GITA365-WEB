"""Vùng cấm của Xưởng AI ba cổng.

Ba việc tệp này làm:
  1. Chặn yêu cầu nhắc tới tệp hay dữ liệu cấm của GITA365, hoặc dán bí mật vào.
  2. Chỉ cho xưởng gọi mô hình AI chạy trên chính máy này (không dịch vụ trả phí).
  3. Quét sản phẩm xưởng làm ra: có bí mật, khoá, tệp mã hoá thì chặn lại.

Máy không được tự sửa tệp này. Muốn đổi một luật, người chủ sửa tay,
và thay đổi đó đi qua cổng 1 như mọi thay đổi khác.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

# Đổi thành True chỉ khi chủ sở hữu đã quyết bật ngân sách AI trả phí có trần.
# Xưởng không bao giờ tự đổi dòng này.
CHO_PHEP_TRA_PHI = False

# "ollama" là tên máy Ollama trong mạng nội bộ không có Internet của docker-compose.yml.
MAY_CUC_BO = {"127.0.0.1", "localhost", "::1", "0.0.0.0", "ollama"}

# Tên tệp, thư mục, chủ đề không bao giờ được đi vào xưởng.
# Chỉ ghi tên để chặn; xưởng không đọc nội dung của chúng.
TEN_CAM = [
    (r"kho-goc", "kho nội dung gốc"),
    (r"(^|[\s/'\"`])kho/", "thư mục kho mã hoá"),
    (r"khoa\.json", "tệp khoá"),
    (r"\.enc\b", "tệp đã mã hoá"),
    (r"\.pem\b", "khoá riêng"),
    (r"rieng\.pem|soat-khoa", "khoá riêng"),
    (r"crm\.js", "dữ liệu khách hàng (CRM)"),
    (r"studio\.js", "studio nội bộ"),
    (r"gita-nghe\.js", "tệp phải giữ nguyên từng byte"),
    (r"gi[aấ]y[\s-]*ph[eé]p|cap-?phep|CapPhep|license\s*key", "giấy phép"),
    (r"\bCRM\b|danh s[aá]ch kh[aá]ch h[aà]ng", "dữ liệu khách hàng"),
]

# Mẫu bí mật thường gặp. Thấy là chặn, không in giá trị ra.
MAU_BI_MAT = [
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "khoá riêng"),
    (r"\bsk-(?:ant-|proj-)?[A-Za-z0-9_\-]{20,}", "khoá API"),
    (r"\bgh[pousr]_[A-Za-z0-9]{30,}", "mã truy cập GitHub"),
    (r"\bAKIA[0-9A-Z]{16}\b", "khoá AWS"),
    (r"\bAIza[0-9A-Za-z_\-]{35}\b", "khoá Google"),
    (r"\bxox[abpr]-[A-Za-z0-9\-]{10,}", "mã Slack"),
    (r"(?i)\b(api[_-]?key|secret|token|password|mat[_-]?khau)\s*[:=]\s*['\"][^'\"\s]{12,}['\"]", "bí mật gán cứng"),
]

DUOI_CAM = {".enc", ".pem", ".key", ".p12", ".pfx", ".kdbx"}


@dataclass
class PhatHien:
    loai: str          # "chặn" hoặc "cần xem"
    noi: str           # nơi thấy (tên tệp hoặc "yêu cầu")
    ly_do: str

    def __str__(self) -> str:
        return f"[{self.loai}] {self.noi}: {self.ly_do}"


def kiem_yeu_cau(van_ban: str) -> list[PhatHien]:
    """Yêu cầu một dòng của người chủ. Trả về danh sách lý do chặn (rỗng là qua)."""
    ket_qua = []
    for mau, ly_do in TEN_CAM:
        if re.search(mau, van_ban, flags=re.IGNORECASE):
            ket_qua.append(PhatHien("chặn", "yêu cầu", f"nhắc tới {ly_do}"))
    for mau, ly_do in MAU_BI_MAT:
        if re.search(mau, van_ban):
            ket_qua.append(PhatHien("chặn", "yêu cầu", f"có dạng {ly_do} dán vào"))
    return ket_qua


def kiem_cau_hinh(base_url: str, api_type: str = "") -> list[PhatHien]:
    """Chỉ cho gọi mô hình chạy trên máy này, trừ khi chủ sở hữu đã bật trả phí."""
    host = urlparse(base_url or "").hostname or ""
    if host in MAY_CUC_BO:
        return []
    if CHO_PHEP_TRA_PHI:
        return [PhatHien("cần xem", "cấu hình", f"gọi dịch vụ ngoài {host} (đã được chủ sở hữu cho phép trả phí)")]
    return [PhatHien("chặn", "cấu hình",
                     f"mô hình ở '{host or base_url}' không chạy trên máy này. "
                     "Xưởng chỉ dùng mô hình cục bộ; bật trả phí là quyết định của chủ sở hữu.")]


def quet_dau_ra(thu_muc: Path, gioi_han_byte: int = 2_000_000) -> list[PhatHien]:
    """Quét mọi tệp xưởng làm ra."""
    ket_qua: list[PhatHien] = []
    goc = thu_muc.resolve()
    for p in sorted(thu_muc.rglob("*")):
        if ".git" in p.parts:
            continue
        ten = str(p.relative_to(thu_muc))
        if p.is_symlink():
            dich = p.resolve()
            if goc not in dich.parents and dich != goc:
                ket_qua.append(PhatHien("chặn", ten, "liên kết trỏ ra ngoài thư mục sản phẩm"))
            continue
        if not p.is_file():
            continue
        if p.suffix.lower() in DUOI_CAM:
            ket_qua.append(PhatHien("chặn", ten, f"loại tệp cấm ({p.suffix})"))
            continue
        if p.stat().st_size > gioi_han_byte:
            ket_qua.append(PhatHien("cần xem", ten, "tệp lớn bất thường"))
            continue
        try:
            noi_dung = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for mau, ly_do in MAU_BI_MAT:
            if re.search(mau, noi_dung):
                ket_qua.append(PhatHien("chặn", ten, f"có {ly_do}"))
        for mau, ly_do in TEN_CAM:
            if re.search(mau, noi_dung, flags=re.IGNORECASE):
                ket_qua.append(PhatHien("cần xem", ten, f"nhắc tới {ly_do}"))
        if re.search(r"(?i)\b(subprocess|os\.system|eval\(|exec\()", noi_dung) and p.suffix == ".py":
            ket_qua.append(PhatHien("cần xem", ten, "mã gọi lệnh hệ thống hoặc chạy mã động"))
        if re.search(r"https?://(?!127\.0\.0\.1|localhost)[\w.-]+", noi_dung) and p.suffix in {".py", ".js", ".ts", ".sh"}:
            ket_qua.append(PhatHien("cần xem", ten, "mã có địa chỉ mạng bên ngoài"))
    return ket_qua


def co_chan(ds: list[PhatHien]) -> bool:
    return any(x.loai == "chặn" for x in ds)
