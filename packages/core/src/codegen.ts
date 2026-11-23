import { copyBundledFonts } from './fonts/copy.ts';
import { buildIr } from './ir/build.ts';
import { writeIr } from './ir/write.ts';
import { writeLegacyOutputs } from './legacy/write.ts';
import { loadSources } from './sources/load.ts';
import { writeCss } from './targets/css/emit.ts';
import { writeTs } from './targets/ts/emit.ts';
import { writeFoundations } from './targets/ts/foundations.ts';

const root = new URL('../', import.meta.url);

const ir = buildIr(await loadSources(root));
writeIr(root, ir);
writeLegacyOutputs(root, ir);
copyBundledFonts(root, ir);
await writeCss(root, ir);
await writeTs(root, ir);
await writeFoundations(root, ir);
