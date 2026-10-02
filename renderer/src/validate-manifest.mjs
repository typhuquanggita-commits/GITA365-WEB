import {readFile} from 'node:fs/promises';
import {validateManifest} from './manifest.mjs';

const file = process.argv[2];
if (!file) throw new Error('Dùng: npm run validate -- /jobs/manifest.json');
const value = JSON.parse(await readFile(file, 'utf8'));
const checked = validateManifest(value);
console.log(JSON.stringify({ok: true, scenes: checked.scenes.length, duration: checked.duration}));
