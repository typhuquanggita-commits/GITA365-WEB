import {mkdir, readFile, realpath, writeFile} from 'node:fs/promises';
import {resolve, relative, basename, dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {validateManifest} from './manifest.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? '' : process.argv[index + 1] || '';
}
function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {stdio: 'ignore'});
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolvePromise() : reject(new Error(command + ' thất bại (' + code + ').')));
  });
}
async function inside(root, candidate) {
  const resolvedRoot = await realpath(root);
  const resolvedFile = await realpath(candidate);
  if (relative(resolvedRoot, resolvedFile).startsWith('..')) throw new Error('Đường dẫn phải nằm trong thư mục mount riêng.');
  return resolvedFile;
}
const inputRoot = process.env.RENDER_INPUT_ROOT || '/jobs';
const outputRoot = process.env.RENDER_OUTPUT_ROOT || '/output';
const manifestArg = arg('--manifest');
if (!manifestArg) throw new Error('Dùng: renderer --manifest /jobs/<job>/manifest.json');
if (process.env.RENDERER_PRODUCTION === 'true' && !process.env.REMOTION_LICENSE_KEY)
  throw new Error('Môi trường production cần REMOTION_LICENSE_KEY sau khi xác nhận giấy phép Remotion.');

const manifestPath = await inside(inputRoot, manifestArg);
const manifestBytes = await readFile(manifestPath);
const checked = validateManifest(JSON.parse(manifestBytes.toString('utf8')));
const jobId = basename(dirname(manifestPath)).replace(/[^a-zA-Z0-9_-]/g, '');
if (!jobId) throw new Error('Không xác định được mã job.');
const jobRoot = dirname(manifestPath);
const presenterArg = arg('--presenter');
const attestationArg = arg('--presenter-attestation');
let presenter = '';
let presenterAttestation = null;
if (presenterArg || attestationArg) {
  if (!presenterArg || !attestationArg) throw new Error('MC/Trainer thật cần cả tệp video và tệp xác nhận quyền.');
  presenter = await inside(jobRoot, presenterArg);
  if (!/\.(mp4|mov|webm)$/i.test(presenter)) throw new Error('Tệp MC/Trainer phải là MP4, MOV hoặc WebM.');
  const attestationPath = await inside(jobRoot, attestationArg);
  presenterAttestation = JSON.parse(await readFile(attestationPath, 'utf8'));
  if (!presenterAttestation.identityConsent || !presenterAttestation.videoConsent ||
      !['mc', 'trainer'].includes(String(presenterAttestation.role || '').toLowerCase()) ||
      !String(presenterAttestation.attestedBy || '').trim())
    throw new Error('Thiếu đồng ý hình ảnh/video hoặc người xác nhận cho MC/Trainer.');
}
const outputDir = resolve(outputRoot, jobId);
await mkdir(outputDir, {recursive: true});
const browserExecutable = process.env.REMOTION_CHROME_EXECUTABLE || '/usr/bin/chromium';
const serveUrl = await bundle({
  entryPoint: resolve('src/index.jsx'),
  webpackOverride: config => ({...config, cache: false})
});
const composition = await selectComposition({
  serveUrl, id: 'StudioV20', inputProps: checked.project, browserExecutable
});
const baseLocation = resolve(outputDir, 'base.mp4');
const outputLocation = resolve(outputDir, 'video.mp4');
await renderMedia({
  composition, serveUrl, codec: 'h264', outputLocation: baseLocation, inputProps: checked.project,
  browserExecutable, chromiumOptions: {enableMultiProcessOnLinux: false}
});
if (presenter) {
  await run('ffmpeg', ['-y', '-i', baseLocation, '-stream_loop', '-1', '-i', presenter,
    '-filter_complex', '[1:v]scale=iw*0.32:ih*0.32:force_original_aspect_ratio=decrease[p];[0:v][p]overlay=W-w-56:H-h-150:shortest=1[v]',
    '-map', '[v]', '-map', '1:a?', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
    '-shortest', outputLocation]);
} else {
  await run('ffmpeg', ['-y', '-i', baseLocation, '-c', 'copy', outputLocation]);
}
const thumbnailLocation = resolve(outputDir, 'thumbnail.png');
await renderStill({composition, serveUrl, output: thumbnailLocation, frame: 0, inputProps: checked.project, browserExecutable});
const checksum = async file => createHash('sha256').update(await readFile(file)).digest('hex');
const result = {
  ok: true, jobId, projectId: checked.project.studioProjectId, output: outputLocation, duration: checked.duration,
  thumbnail: thumbnailLocation, mp4Sha256: await checksum(outputLocation),
  thumbnailSha256: await checksum(thumbnailLocation), manifestSha256: createHash('sha256').update(manifestBytes).digest('hex'),
  sceneCount: checked.scenes.length, voices: checked.voices.map(voice => ({
    voiceId: voice.voiceId, provider: voice.provider, locale: voice.locale,
    tier: voice.tier, audioHash: voice.audioHash
  })),
  delivery: checked.delivery, presenter: presenter ? {role: presenterAttestation.role, verified: true} : null
};
await writeFile(resolve(outputDir, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
