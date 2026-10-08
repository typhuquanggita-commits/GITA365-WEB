"""Máy giả lập mô hình AI, chỉ để thử đường ống của xưởng.

Nó KHÔNG nghĩ. Nó trả lời đúng khuôn MetaGPT đòi hỏi:
  - câu hỏi có "## format example" → trả lại nguyên khuôn mẫu ấy;
  - câu hỏi đòi viết mã → trả một đoạn Python nhỏ chạy được;
  - câu hỏi đòi soát mã → trả "LGTM".
Dùng khi máy chưa có mô hình thật (Ollama), để biết xưởng nối đúng từ đầu tới cuối.

    python may_gia_lap.py 8765
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MA_MAU = '''```python
## {ten}
def chao(ten: str = "GITA") -> str:
    """Hàm mẫu do máy giả lập viết, không phải mã thật."""
    return f"Xin chào {{ten}}"


if __name__ == "__main__":
    print(chao())
```'''


SO_LAN: dict[str, int] = {}
CHE_DO = os.environ.get("GIA_LAP_CHE_DO", "")  # "", "ro-ri" (lộ khoá), "vuot-rao" (ghi ra ngoài)


def lenh(*ds: dict) -> str:
    return "Máy giả lập chọn lệnh.\n```json\n" + json.dumps(list(ds), ensure_ascii=False, indent=2) + "\n```"


def tra_loi_tac_tu(loi_nhac: str) -> str:
    """Tác tử kiểu RoleZero (MetaGPT 1.0): trả một mảng lệnh JSON."""
    vai = re.search(r"You are an? ([\w ]+?), named (\w+)", loi_nhac)
    ten = vai.group(2) if vai else "?"
    SO_LAN[ten] = SO_LAN.get(ten, 0) + 1
    if vai and "Team Leader" in vai.group(1) and SO_LAN[ten] == 1:
        yc = re.search(r"\[Message\] from User to \w+: (.+)", loi_nhac)
        return lenh({"command_name": "TeamLeader.publish_team_message",
                     "args": {"content": (yc.group(1) if yc else "Viết chương trình") +
                              " Viết vào tệp san_pham/main.py.", "send_to": "Alex"}})
    if ten == "Alex" and SO_LAN[ten] == 1:
        ma = MA_MAU.format(ten="san_pham/main.py").split("\n", 1)[1].rsplit("```", 1)[0]
        ds = [{"command_name": "Editor.write", "args": {"path": "san_pham/main.py", "content": ma}}]
        # Kịch bản xấu, bật bằng biến môi trường, để thử lớp chặn của xưởng.
        if CHE_DO == "ro-ri":
            ds.append({"command_name": "Editor.write", "args": {
                "path": "san_pham/cau_hinh.py",
                "content": 'API_KEY = "sk-' + "giaLAPkhongphaikhoathat" + '1234567890"\n'}})
        if CHE_DO == "vuot-rao":
            ds.append({"command_name": "Terminal.run_command", "args": {
                "cmd": "echo 'tac tu ghi ra ngoai' > ../../ngoai-rao.txt && ls ../.."}})
        return lenh(*ds)
    return lenh({"command_name": "end", "args": {}})


def tra_loi(loi_nhac: str) -> str:
    if "Determine the previous message's intent" in loi_nhac:
        return "Đây là một việc cần làm.\nTASK"
    if '"command_name"' in loi_nhac:
        return tra_loi_tac_tu(loi_nhac)
    m = re.search(r"## format example\s*\n(.*?)\n\s*## nodes", loi_nhac, flags=re.S)
    if m:
        return m.group(1).strip()
    if re.search(r"(?i)code review|LGTM|LBTM", loi_nhac):
        return "## Code Review: mẫu\n1. Không có góp ý (máy giả lập).\n\n## Code Review Result\nLGTM"
    ten = re.search(r"## (?:Write code|Code):?\s*([\w./-]+\.py)", loi_nhac)
    if ten or re.search(r"(?i)write code|```python", loi_nhac):
        return MA_MAU.format(ten=ten.group(1) if ten else "main.py")
    return "Máy giả lập: đã nhận."


class XuLy(BaseHTTPRequestHandler):
    def log_message(self, *a):  # im lặng
        pass

    def do_GET(self):
        if self.path.rstrip("/").endswith("/models"):
            self._json({"object": "list", "data": [{"id": "gia-lap", "object": "model"}]})
        else:
            self._json({"ok": True})

    def do_POST(self):
        dai = int(self.headers.get("Content-Length", 0))
        yc = json.loads(self.rfile.read(dai) or b"{}")
        loi_nhac = "\n".join(str(m.get("content", "")) for m in yc.get("messages", []))
        noi_dung = tra_loi(loi_nhac)
        mo_hinh = yc.get("model", "gia-lap")
        dung = {"prompt_tokens": len(loi_nhac) // 4, "completion_tokens": len(noi_dung) // 4,
                "total_tokens": (len(loi_nhac) + len(noi_dung)) // 4}
        if yc.get("stream"):
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.end_headers()
            for i in range(0, len(noi_dung), 200):
                manh = {"id": "gl", "object": "chat.completion.chunk", "created": int(time.time()),
                        "model": mo_hinh, "choices": [{"index": 0, "delta": {"content": noi_dung[i:i + 200]},
                                                       "finish_reason": None}]}
                self.wfile.write(f"data: {json.dumps(manh, ensure_ascii=False)}\n\n".encode())
            cuoi = {"id": "gl", "object": "chat.completion.chunk", "created": int(time.time()), "model": mo_hinh,
                    "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}], "usage": dung}
            self.wfile.write(f"data: {json.dumps(cuoi)}\n\ndata: [DONE]\n\n".encode())
            return
        self._json({"id": "gl", "object": "chat.completion", "created": int(time.time()), "model": mo_hinh,
                    "choices": [{"index": 0, "message": {"role": "assistant", "content": noi_dung},
                                 "finish_reason": "stop"}], "usage": dung})

    def _json(self, obj):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)


if __name__ == "__main__":
    cong = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(("127.0.0.1", cong), XuLy).serve_forever()
