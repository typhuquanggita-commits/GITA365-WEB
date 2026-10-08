# Xưởng AI ba cổng trong một hộp kín. Dựng từ thư mục cha của xuong/:
#   docker compose -f xuong/docker-compose.yml build
FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends git bash && rm -rf /var/lib/apt/lists/*
ARG MGPT_COMMIT=11cdf466d042aece04fc6cfd13b28e1a70341b1f
WORKDIR /xuong-ai
COPY xuong/ ./xuong/
RUN git clone -q https://github.com/FoundationAgents/MetaGPT metagpt-src \
 && git -C metagpt-src checkout -q "$MGPT_COMMIT" \
 && git -C metagpt-src apply ../xuong/va-terminal-dong-cuoi.patch \
 && pip install --no-cache-dir uv \
 && uv pip install --system --no-cache --override xuong/rang-buoc.txt -e ./metagpt-src pytest \
 && rm -rf xuong/lan-chay && mkdir -p xuong/lan-chay
RUN useradd -m tho && chown -R tho xuong/lan-chay
USER tho
WORKDIR /xuong-ai/xuong
ENTRYPOINT ["python", "chay_xuong.py", "--cau-hinh", "cau-hinh/config2.docker.yaml"]
