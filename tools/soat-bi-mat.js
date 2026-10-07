#!/usr/bin/env node
/*
GITA 365 — SOÁT BÍ MẬT (cổng CI · tầng BM13 của lá chắn 30 tầng)

Khoá thật chỉ được sống trong `wrangler secret` / GitHub Secrets. Công cụ
này quét MỌI tệp git đang theo dõi tìm dáng khoá của các nhà cung cấp
GITA dùng (Anthropic · OpenAI · DeepSeek · xAI · Google · GitHub ·
Cloudflare · AWS · Stripe · khoá riêng PEM). Thấy một dòng là CI đỏ.

Không in giá trị — chỉ in tệp:dòng và loại khoá, để nhật ký CI không
thành nơi rò thứ hai. Dòng nào là ví dụ cố ý thì ghi `gita-bi-mat:bo-qua`
trên chính dòng đó (người duyệt PR sẽ thấy).

Dùng: node tools/soat-bi-mat.js
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const MAU = [
  ['Anthropic', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI/DeepSeek', /\bsk-(?:proj-)?[A-Za-z0-9]{32,}\b/],
  ['xAI', /\bxai-[A-Za-z0-9]{40,}\b/],
  ['Google API', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/],
  ['GitHub PAT', /\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ['AWS key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['Stripe', /\b(?:sk|rk)_live_[0-9A-Za-z]{20,}\b/],
  ['Groq', /\bgsk_[A-Za-z0-9]{40,}\b/],
  ['HuggingFace', /\bhf_[A-Za-z0-9]{34,}\b/],
  ['Slack', /\bxox[baprs]-[A-Za-z0-9-]{20,}/],
  ['Khoá riêng PEM', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/],
  ['Cloudflare token gán cứng', /\b(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN)\s*[:=]\s*['"][A-Za-z0-9_-]{30,}['"]/],
  /* Bổ sung 10/2026 — các nhà cung cấp hệ đang dùng mà bản đầu chưa có */
  ['Resend', /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}\b/],
  ['fal.ai', /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{32}\b/],
  ['Modal', /\b(?:ak|as)-[A-Za-z0-9]{22,}\b/],
  ['Telegram bot', /\b\d{8,10}:AA[A-Za-z0-9_-]{33}\b/],
  ['Discord webhook', /discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]{30,}/],
  ['Kaggle key gán cứng', /\bKAGGLE_KEY\s*[:=]\s*['"]?[0-9a-f]{32}\b/],
  ['R2 / S3 secret gán cứng', /\b(?:R2_SECRET_ACCESS_KEY|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*['"]?[A-Za-z0-9/+]{40,64}\b/],
  ['Mật khẩu / khoá gán cứng', /\b(?:GITA_[A-Z_]*KHOA[A-Z_]*|SUBMIT_TOKEN|GITA_KHOA_QUAY|KHOA_APP)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/]
];

const BO_QUA_DUOI = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|mp3|mp4|webm|pdf|zip|gz|wasm)$/i;
const TRAN_BYTE = 3 * 1024 * 1024;

function dsTep() {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split('\0').filter(Boolean);
  } catch (e) {
    console.error('✗ Không chạy được git ls-files — cổng không được phép đạt khi không đo được.');
    process.exit(2);
  }
}

function quet(noiDung) {
  const thay = [];
  noiDung.split(/\r?\n/).forEach((dong, i) => {
    if (dong.includes('gita-bi-mat:bo-qua')) return;
    for (const [loai, re] of MAU) if (re.test(dong)) thay.push({ dong: i + 1, loai });
  });
  return thay;
}

if (require.main === module) {
  const tep = dsTep();
  let soTep = 0;
  const loi = [];
  for (const rel of tep) {
    if (BO_QUA_DUOI.test(rel)) continue;
    const p = path.join(ROOT, rel);
    let st;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (!st.isFile() || st.size > TRAN_BYTE) continue;
    soTep++;
    quet(fs.readFileSync(p, 'utf8')).forEach(t => loi.push(`${rel}:${t.dong} — dáng khoá ${t.loai}`));
  }
  console.log(`  · Đã quét ${soTep} tệp · ${MAU.length} dáng khoá`);
  if (loi.length) {
    loi.forEach(m => console.log('  ✗ ' + m));
    console.log(`\n✗ SOÁT BÍ MẬT: ${loi.length} dòng nghi khoá thật. Gỡ khỏi mã, XOAY khoá ở nhà cung cấp, nạp lại bằng wrangler secret.`);
    process.exit(1);
  }
  console.log('\n✓ SOÁT BÍ MẬT ĐẠT — không thấy dáng khoá nào trong repo.');
}

module.exports = { MAU, quet };
