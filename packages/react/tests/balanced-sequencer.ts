import { relative } from 'node:path';

import { BaseSequencer, type TestSpecification } from 'vitest/node';

import durations from './durations.json';

const secondsByFile: Record<string, number> = durations;

const timedSeconds = Object.values(secondsByFile).sort((a, b) => a - b);
const A_FILE_NOBODY_HAS_TIMED = timedSeconds[Math.floor(timedSeconds.length / 2)] ?? 1;

const secondsOf = (file: string) => secondsByFile[file] ?? A_FILE_NOBODY_HAS_TIMED;

export class BalancedSequencer extends BaseSequencer {
  override async shard(specs: TestSpecification[]) {
    const { root, shard } = this.ctx.config;
    if (!shard) return specs;

    const timed = specs
      .map((spec) => ({ spec, file: relative(root, spec.moduleId), project: spec.project.name }))
      .sort(
        (a, b) =>
          secondsOf(b.file) - secondsOf(a.file) ||
          a.file.localeCompare(b.file) ||
          a.project.localeCompare(b.project),
      );

    const shardSeconds = Array.from({ length: shard.count }, () => 0);
    const ours: TestSpecification[] = [];

    for (const { spec, file } of timed) {
      const lightest = shardSeconds.indexOf(Math.min(...shardSeconds));
      shardSeconds[lightest] += secondsOf(file);
      if (lightest === shard.index - 1) ours.push(spec);
    }

    return ours;
  }
}
