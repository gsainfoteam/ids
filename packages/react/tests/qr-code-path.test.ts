import jsQR from 'jsqr';
import { describe, expect, test } from 'vitest';

import {
  dataModules,
  encodeQRCode,
  finderOrigins,
  findersPath,
  logoArea,
  modulesPath,
  qrCodeGeometry,
  type QRCodeErrorCorrection,
} from '../src/components/data/qr-code/qr-path';

const URL_VALUE = 'https://gistory.me/profile/alice';
const SCALE = 6;
const QUIET = 4;

function rasterize(modules: boolean[][]) {
  const side = (modules.length + QUIET * 2) * SCALE;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
  modules.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (!dark) return;
      for (let dy = 0; dy < SCALE; dy += 1)
        for (let dx = 0; dx < SCALE; dx += 1) {
          const index = (((y + QUIET) * SCALE + dy) * side + (x + QUIET) * SCALE + dx) * 4;
          pixels.fill(0, index, index + 3);
        }
    }),
  );
  return jsQR(pixels, side, side, { inversionAttempts: 'dontInvert' })?.data;
}

function withLogoCleared(modules: boolean[][]) {
  const { start, span } = logoArea(modules.length);
  return modules.map((row, y) =>
    row.map(
      (dark, x) => dark && !(x >= start && x < start + span && y >= start && y < start + span),
    ),
  );
}

const count = (path: string, command: string) => path.split(command).length - 1;

describe('encodeQRCode', () => {
  test('returns a square matrix whose three corners hold finder patterns', () => {
    const { version, modules } = encodeQRCode(URL_VALUE, 'M');
    const size = modules.length;

    expect(size).toBe(version * 4 + 17);
    expect(modules.every((row) => row.length === size)).toBe(true);
    for (const [x, y] of finderOrigins(size)) {
      expect(modules[y]![x]).toBe(true);
      expect(modules[y + 1]![x + 1]).toBe(false);
      expect(modules[y + 3]![x + 3]).toBe(true);
    }
  });

  test('a higher error correction level needs the same or a larger version', () => {
    const levels: QRCodeErrorCorrection[] = ['L', 'M', 'Q', 'H'];
    const versions = levels.map((level) => encodeQRCode(URL_VALUE.repeat(4), level).version);

    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(versions.at(-1)).toBeGreaterThan(versions[0]!);
  });

  test('throws when the value does not fit a version 40 code', () => {
    expect(() => encodeQRCode('x'.repeat(5000), 'H')).toThrow();
  });
});

describe('round trip', () => {
  test.each(['L', 'M', 'Q', 'H'] as const)('decodes at level %s', (level) => {
    expect(rasterize(encodeQRCode(URL_VALUE, level).modules)).toBe(URL_VALUE);
  });

  test('decodes Korean text encoded as UTF-8', () => {
    const value = '지스트 인포팀';
    expect(rasterize(encodeQRCode(value, 'M').modules)).toBe(value);
  });

  test.each([URL_VALUE, `${URL_VALUE}?ref=${'a'.repeat(120)}`])(
    'still decodes at level H with the logo area cleared (%#)',
    (value) => {
      expect(rasterize(withLogoCleared(encodeQRCode(value, 'H').modules))).toBe(value);
    },
  );
});

describe('logoArea', () => {
  test.each([21, 25, 29, 57, 177])('is centered on the module grid for size %i', (size) => {
    const { start, span } = logoArea(size);

    expect(Number.isInteger(start)).toBe(true);
    expect(start * 2 + span).toBe(size);
    expect(span / size).toBeGreaterThan(0.18);
    expect(span / size).toBeLessThan(0.3);
  });
});

describe('dataModules', () => {
  test('leaves out the finder patterns and the cleared logo area', () => {
    const { modules } = encodeQRCode(URL_VALUE, 'H');
    const area = logoArea(modules.length);
    const data = dataModules(modules, area);

    for (const [x, y] of finderOrigins(modules.length))
      for (let dy = 0; dy < 7; dy += 1)
        for (let dx = 0; dx < 7; dx += 1) expect(data[y + dy]![x + dx]).toBe(false);
    for (let y = area.start; y < area.start + area.span; y += 1)
      for (let x = area.start; x < area.start + area.span; x += 1) expect(data[y]![x]).toBe(false);
    expect(data.flat().filter(Boolean).length).toBeGreaterThan(0);
  });
});

describe('modulesPath', () => {
  const modules = [
    [true, true, false],
    [false, true, false],
    [false, false, true],
  ];

  test('square joins each horizontal run into one rectangle, moved by the offset', () => {
    expect(modulesPath(modules, 'square', 4)).toBe('M4 4h2v1h-2zM5 5h1v1h-1zM6 6h1v1h-1z');
  });

  test('rounded rounds only the corners whose two neighbours are light', () => {
    const path = modulesPath(modules, 'rounded');
    const [first, second, , lone] = path
      .split('M')
      .slice(1)
      .map((part) => `M${part}`);

    expect(count(first!, 'A')).toBe(2);
    expect(count(second!, 'A')).toBe(1);
    expect(count(lone!, 'A')).toBe(4);
    expect(count(path, 'M')).toBe(4);
  });

  test('dots draws one circle per dark module', () => {
    expect(count(modulesPath(modules, 'dots'), 'M')).toBe(4);
    expect(modulesPath(modules, 'dots')).toContain('M0 0.5a0.5 0.5 0 1 0 1 0');
  });
});

describe('findersPath', () => {
  test.each(['square', 'rounded', 'circle'] as const)(
    '%s draws three nested outlines for each of the three finders',
    (shape) => {
      expect(count(findersPath(21, shape), 'M')).toBe(9);
    },
  );

  test('places the far finders seven modules from the far edge', () => {
    expect(findersPath(21, 'square', 4)).toContain('M18 4h7v7h-7z');
    expect(findersPath(21, 'square', 4)).toContain('M4 18h7v7h-7z');
  });
});

describe('qrCodeGeometry', () => {
  test('adds the quiet zone on both sides of the view box', () => {
    const geometry = qrCodeGeometry(URL_VALUE, {
      errorCorrection: 'M',
      shape: 'square',
      finderShape: 'square',
      quietZone: 4,
      logo: false,
    });

    expect(geometry.viewBox).toBe(geometry.version * 4 + 17 + 8);
    expect(geometry.logo).toBeUndefined();
  });

  test('insets the logo one module inside the cleared area', () => {
    const geometry = qrCodeGeometry(URL_VALUE, {
      errorCorrection: 'H',
      shape: 'rounded',
      finderShape: 'rounded',
      quietZone: 2,
      logo: true,
    });
    const size = geometry.version * 4 + 17;
    const cleared = logoArea(size);

    expect(geometry.logo).toEqual({ start: cleared.start + 2 + 1, span: cleared.span - 2 });
  });
});
