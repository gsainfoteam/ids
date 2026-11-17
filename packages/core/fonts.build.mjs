import { copyFileSync, mkdirSync } from 'node:fs';

const FLUTTER_FONTS = [
  ['pretendard-gov/dist/public/variable/PretendardGOVVariable.ttf', 'PretendardGOVVariable.ttf'],
  ['pretendard-gov/dist/LICENSE.txt', 'PretendardGOV-LICENSE.txt'],
  ['geist/dist/fonts/geist-mono/GeistMono-Variable.ttf', 'GeistMonoVariable.ttf'],
  ['geist/LICENSE.txt', 'GeistMono-LICENSE.txt'],
];

const flutterFonts = new URL('../flutter/fonts/', import.meta.url);
mkdirSync(flutterFonts, { recursive: true });

for (const [from, to] of FLUTTER_FONTS) {
  copyFileSync(new URL(`./node_modules/${from}`, import.meta.url), new URL(to, flutterFonts));
}
