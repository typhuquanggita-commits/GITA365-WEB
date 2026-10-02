import {mkdir, readFile, realpath, writeFile} from 'node:fs/promises';
import {resolve, relative, basename, dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {validateManifest} from './manifest.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? '' : process.argv[index + 1] || '';
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
const checked = validateManifest(JSON.parse(await readFile(manifestPath, 'utf8')));
const jobId = basename(dirname(manifestPath)).replace(/[^a-zA-Z0-9_-]/g, '');
if (!jobId) throw new Error('Không xác định được mã job.');
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
const outputLocation = resolve(outputDir, 'video.mp4');
await renderMedia({
  composition, serveUrl, codec: 'h264', outputLocation, inputProps: checked.project,
  browserExecutable, chromiumOptions: {enableMultiProcessOnLinux: false}
});
const thumbnailLocation = resolve(outputDir, 'thumbnail.png');
await renderStill({composition, serveUrl, output: thumbnailLocation, frame: 0, inputProps: checked.project, browserExecutable});
const checksum = async file => createHash('sha256').update(await readFile(file)).digest('hex');
const result = {
  ok: true, jobId, output: outputLocation, duration: checked.duration,
  thumbnail: thumbnailLocation, mp4Sha256: await checksum(outputLocation),
  thumbnailSha256: await checksum(thumbnailLocation), sceneCount: checked.scenes.length,
  delivery: checked.delivery
};
await writeFile(resolve(outputDir, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
