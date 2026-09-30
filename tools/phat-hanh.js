#!/usr/bin/env node
/*
GITA 365 — PHÁT HÀNH MỘT LỆNH
Chạy toàn bộ quy trình kiểm tra + dựng bundle + tạo tag + hướng dẫn đẩy.

Dùng:
  node tools/phat-hanh.js          # kiểm, dựng, gợi ý push
  node tools/phat-hanh.js --tag    # thêm git tag theo phiên bản

Lưu ý:
  · Không tự động triển khai Cloudflare — để tránh vô tình phát hành giữa chừng.
  · Sau khi tool báo sẵn sàng, người làm push nhánh main hoặc tạo PR merge.
  · Các secrets và khoá giải mã KHÔNG nằm trong repo; xem TRIEN-KHAI.md.
*/

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: opts.silent ? ['pipe', 'pipe', 'pipe'] : 'inherit',
    ...opts,
  });
  if (r.error) throw r.error;
  if (!opts.okErrors && r.status !== 0) {
    process.exit(r.status || 1);
  }
  return r;
}

function readVersion() {
  const core = fs.readFileSync(path.join(ROOT, 'src', 'data.core.js'), 'utf-8');
  const m = core.match(/version\s*:\s*['"]([^'"]+)['"]/);
  return m ? m[1] : 'unknown';
}

function gitSha() {
  const r = run('git', ['rev-parse', '--short', 'HEAD'], { silent: true });
  return r.stdout.trim();
}

function gitBranch() {
  const r = run('git', ['branch', '--show-current'], { silent: true });
  return r.stdout.trim();
}

function gitIsClean() {
  const r = run('git', ['status', '--porcelain'], { silent: true });
  return r.stdout.trim() === '';
}

function main() {
  const doTag = process.argv.includes('--tag');
  const version = readVersion();

  console.log(`\nGITA 365 — PHÁT HÀNH · bản ${version}\n`);

  // 1. Kiểm sẵn sàng
  console.log('▶ 1/5 Chạy tools/soat-san-sang.js...');
  const check = run('node', ['tools/soat-san-sang.js'], { silent: true, okErrors: true });
  process.stdout.write(check.stdout);
  if (check.status !== 0) {
    console.error('\n❌ Chưa sẵn sàng phát hành. Sửa lỗi trên rồi chạy lại.');
    process.exit(1);
  }

  // 2. Dựng bundle
  console.log('\n▶ 2/5 Dựng bundle từ src/...');
  run('node', ['tools/gop-src.js']);
  run('node', ['tools/gop-src.js', '--kiem']);

  // 3. Kiểm git
  console.log('\n▶ 3/5 Kiểm trạng thái git...');
  const branch = gitBranch();
  const sha = gitSha();
  console.log(`   Nhánh hiện tại: ${branch} · commit ${sha}`);
  if (!gitIsClean()) {
    console.log('   ⚠ Có thay đổi chưa commit. Commit trước khi phát hành.');
  } else {
    console.log('   ✓ Working tree sạch.');
  }

  // 4. Tag
  if (doTag) {
    console.log('\n▶ 4/5 Tạo git tag...');
    const tagName = `v${version}`;
    const exists = run('git', ['tag', '-l', tagName], { silent: true }).stdout.trim();
    if (exists) {
      console.log(`   ⚠ Tag ${tagName} đã tồn tại, bỏ qua.`);
    } else {
      run('git', ['tag', '-a', tagName, '-m', `Phát hành GITA 365 ${version}`]);
      console.log(`   ✓ Đã tạo tag ${tagName}`);
    }
  } else {
    console.log('\n▶ 4/5 Bỏ qua tag (thêm --tag để tạo).');
  }

  // 5. Hướng dẫn
  console.log('\n▶ 5/5 Kế tiếp — đẩy lên GitHub/Cloudflare:\n');
  console.log('   git add -A && git commit -m "' + `Phát hành GITA 365 ${version}"`);
  if (doTag) console.log(`   git push origin ${branch} --tags`);
  else console.log(`   git push origin ${branch}`);
  console.log('   # Sau đó: Actions → "Deploy GITA365 to Cloudflare" sẽ chạy trên nhánh main.');
  console.log('   # Hoặc: tạo Pull Request merge nhánh này vào main.\n');

  console.log(`✓ Sẵn sàng phát hành GITA 365 ${version}.`);
}

main();
