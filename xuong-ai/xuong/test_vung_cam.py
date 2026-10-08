"""Kiểm thử lớp chặn của xưởng:  python -m pytest -q test_vung_cam.py"""
from pathlib import Path

import vung_cam


def test_yeu_cau_binh_thuong_qua():
    assert vung_cam.kiem_yeu_cau("Viết công cụ dòng lệnh đổi phút sang giờ") == []


def test_yeu_cau_cham_vung_cam_bi_chan():
    for yc in ["đọc kho-goc", "mở kho/tang1.enc", "sửa crm.js", "in khoa.json",
               "tạo giấy phép mới", "gửi danh sách khách hàng", "sửa gita-nghe.js"]:
        assert vung_cam.co_chan(vung_cam.kiem_yeu_cau(yc)), yc


def test_yeu_cau_dan_bi_mat_bi_chan():
    gia = "sk-" + "a" * 30
    assert vung_cam.co_chan(vung_cam.kiem_yeu_cau(f"dùng khoá {gia}"))
    assert vung_cam.co_chan(vung_cam.kiem_yeu_cau("-----BEGIN RSA " + "PRIVATE KEY-----"))


def test_chi_cho_mo_hinh_cuc_bo():
    assert vung_cam.kiem_cau_hinh("http://127.0.0.1:11434/v1") == []
    assert vung_cam.kiem_cau_hinh("http://localhost:11434/v1") == []
    assert vung_cam.co_chan(vung_cam.kiem_cau_hinh("https://api.openai.com/v1"))
    assert vung_cam.co_chan(vung_cam.kiem_cau_hinh("https://api.anthropic.com"))
    assert vung_cam.co_chan(vung_cam.kiem_cau_hinh(""))


def test_mac_dinh_khong_cho_tra_phi():
    assert vung_cam.CHO_PHEP_TRA_PHI is False


def test_quet_dau_ra(tmp_path: Path):
    (tmp_path / "sach.py").write_text("print('xin chao')\n")
    assert not vung_cam.co_chan(vung_cam.quet_dau_ra(tmp_path))

    (tmp_path / "lo.py").write_text('API_KEY = "sk-' + "b" * 30 + '"\n')
    (tmp_path / "bi_mat.pem").write_text("x")
    ds = vung_cam.quet_dau_ra(tmp_path)
    noi = {x.noi for x in ds if x.loai == "chặn"}
    assert {"lo.py", "bi_mat.pem"} <= noi


def test_lien_ket_tro_ra_ngoai_bi_chan(tmp_path: Path):
    sp = tmp_path / "san_pham"
    sp.mkdir()
    (sp / "ra_ngoai").symlink_to("/etc/hostname")
    assert vung_cam.co_chan(vung_cam.quet_dau_ra(sp))
