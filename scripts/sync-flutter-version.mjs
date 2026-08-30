// pub.dev 자동 배포는 릴리스 태그와 pubspec 의 version 이 일치해야 통과한다.
import { readFileSync, writeFileSync } from 'node:fs';

const PUBSPEC = 'packages/flutter/pubspec.yaml';

// changesets 는 package.json 까지만 올린다. pub 은 pubspec 을 보므로 여기서 옮긴다.
const { version } = JSON.parse(readFileSync('packages/flutter/package.json', 'utf8'));
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (typeof version !== 'string' || !SEMVER.test(version)) {
  throw new Error(`packages/flutter/package.json 의 version 이 유효하지 않다: ${JSON.stringify(version)}`);
}

const pubspec = readFileSync(PUBSPEC, 'utf8');

if (!/^version:/m.test(pubspec)) throw new Error(`${PUBSPEC} 에 version 줄이 없다`);

writeFileSync(PUBSPEC, pubspec.replace(/^version:.*$/m, `version: ${version}`));
console.log(`ids_flutter -> ${version}`);
