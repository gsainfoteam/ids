import { describe, expect, test } from 'vitest';

import {
  fillSizes,
  fitPanel,
  handleRange,
  keyTarget,
  moveHandle,
  type PanelConstraints,
} from '../src/components/layout/splitter/layout';

const free: PanelConstraints = { minSize: 0, maxSize: 100, collapsible: false, collapsedSize: 0 };
const atLeast = (minSize: number): PanelConstraints => ({ ...free, minSize });
const folding = (minSize: number): PanelConstraints => ({ ...free, minSize, collapsible: true });

describe('fillSizes', () => {
  test('shares what the given sizes leave among the rest', () => {
    expect(fillSizes([30, undefined, 20], 3)).toEqual([30, 50, 20]);
    expect(fillSizes([], 4)).toEqual([25, 25, 25, 25]);
    expect(fillSizes([60, 60, undefined], 3), 'nothing left is nothing, never negative').toEqual([
      60, 60, 0,
    ]);
    expect(fillSizes([10, 20, 30], 2), 'sizes past the panel count are dropped').toEqual([10, 20]);
  });
});

describe('fitPanel', () => {
  test('clamps to the bounds and folds a collapsible panel below half its minimum', () => {
    expect(fitPanel(atLeast(20), 15)).toBe(20);
    expect(fitPanel({ ...free, maxSize: 60 }, 75)).toBe(60);
    expect(fitPanel(folding(20), 12)).toBe(20);
    expect(fitPanel(folding(20), 8)).toBe(0);
  });
});

describe('moveHandle', () => {
  test('trades size between the two panels beside the handle', () => {
    expect(moveHandle([50, 50], [free, free], 0, 10)).toEqual([60, 40]);
    expect(moveHandle([50, 50], [free, free], 0, -10)).toEqual([40, 60]);
  });

  test('pushes past a neighbour at its minimum into the next panel', () => {
    expect(moveHandle([20, 30, 50], [free, atLeast(10), atLeast(10)], 0, 60)).toEqual([80, 10, 10]);
    expect(moveHandle([20, 30, 50], [atLeast(10), atLeast(10), free], 1, -40)).toEqual([
      10, 10, 80,
    ]);
  });

  test('stops where the growing side reaches its maximum', () => {
    expect(moveHandle([50, 50], [{ ...free, maxSize: 70 }, free], 0, 40)).toEqual([70, 30]);
  });

  test('folds a collapsible panel past half its minimum, measured from where the drag began', () => {
    const panels = [folding(20), free];
    expect(moveHandle([30, 70], panels, 0, -15)).toEqual([20, 80]);
    expect(moveHandle([30, 70], panels, 0, -25)).toEqual([0, 100]);
  });

  test('keeps a folded panel shut until it can open to its minimum', () => {
    expect(moveHandle([0, 100], [folding(20), free], 0, 12)).toBeNull();
    expect(moveHandle([0, 100], [folding(20), free], 0, 20)).toEqual([20, 80]);
  });
});

describe('keyTarget and handleRange', () => {
  test('a key opens a folded panel to its minimum and folds one resting at it', () => {
    expect(keyTarget([0, 100], [folding(20), free], 0, 4)).toBe(20);
    expect(keyTarget([20, 80], [folding(20), free], 0, -4)).toBe(0);
    expect(keyTarget([50, 50], [free, free], 0, 4)).toBe(54);
  });

  test('the range counts every other panel and a collapsible panel’s folded size', () => {
    expect(handleRange([30, 50, 20], [atLeast(10), atLeast(15), atLeast(5)], 0)).toEqual({
      now: 30,
      min: 10,
      max: 80,
    });
    expect(handleRange([30, 70], [folding(20), { ...free, maxSize: 90 }], 0)).toEqual({
      now: 30,
      min: 10,
      max: 100,
    });
  });
});
