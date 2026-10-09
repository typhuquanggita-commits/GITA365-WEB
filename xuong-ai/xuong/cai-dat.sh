#!/usr/bin/env bash
# Cài Xưởng AI ba cổng trên máy của anh (Linux hoặc macOS, Python 3.11).
# Không cần khoá API nào. Mô hình AI chạy bằng Ollama trên chính máy này.
set -euo pipefail
cd "$(dirname "$0")/.."
GOC=$PWD
MGPT_COMMIT=11cdf466d042aece04fc6cfd13b28e1a70341b1f   # MetaGPT 1.0.0, ngày 21/1/2026

command -v uv >/dev/null || { echo "Cần uv: https://docs.astral.sh/uv/"; exit 1; }
[ -d .venv ] || uv venv -p 3.11 .venv
if [ ! -d metagpt-src ]; then
  git clone -q https://github.com/FoundationAgents/MetaGPT metagpt-src
  git -C metagpt-src checkout -q "$MGPT_COMMIT"
  git -C metagpt-src apply "$GOC/xuong/va-terminal-dong-cuoi.patch"
fi
uv pip install -q --python .venv/bin/python --override xuong/rang-buoc.txt -e ./metagpt-src pytest
(cd xuong && ../.venv/bin/python -m pytest -q test_vung_cam.py)
echo
echo "Đã cài xong. Bước tiếp theo:"
echo "  1. Cài Ollama (https://ollama.com) rồi:  ollama pull qwen2.5-coder:14b"
echo "  2. Chạy:  cd xuong && PATH=\$PWD/../.venv/bin:\$PATH ../.venv/bin/python chay_xuong.py \"<một dòng yêu cầu>\" --ten <ten_du_an>"
