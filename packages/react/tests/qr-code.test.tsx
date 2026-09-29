import { useState, type ReactNode } from 'react';

import { AcademicCapIcon } from '@heroicons/react/24/solid';
import jsQR, { type Options } from 'jsqr';
import { renderToString } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, QRCode } from '../src';

const PROFILE = 'https://gistory.me/profile/alice';
const RASTER_SIDE = 480;

type Inversion = NonNullable<Options['inversionAttempts']>;

const renderInTheme = (node: ReactNode, mode: 'light' | 'dark' = 'light') =>
  render(<IdsProvider mode={mode}>{node}</IdsProvider>);

const codeIn = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-qr-code]')!;

async function rasterize(code: HTMLElement) {
  const svg = code.querySelector('svg')!;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const painted = [...svg.querySelectorAll('rect, path')];
  clone
    .querySelectorAll('rect, path')
    .forEach((shape, index) => shape.setAttribute('fill', getComputedStyle(painted[index]!).fill));
  clone.setAttribute('width', String(RASTER_SIDE));
  clone.setAttribute('height', String(RASTER_SIDE));

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = RASTER_SIDE;
  canvas.height = RASTER_SIDE;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0);
  return context;
}

function coverWithAnOpaqueLogo(context: CanvasRenderingContext2D, code: HTMLElement) {
  const plate = code.getBoundingClientRect();
  const logo = code.querySelector('[data-qr-code-logo]')!.getBoundingClientRect();
  const scale = RASTER_SIDE / plate.width;
  context.fillStyle = getComputedStyle(code.querySelector('path')!).fill;
  context.fillRect(
    (logo.left - plate.left) * scale,
    (logo.top - plate.top) * scale,
    logo.width * scale,
    logo.height * scale,
  );
}

function decode(context: CanvasRenderingContext2D, inversionAttempts: Inversion = 'dontInvert') {
  const { data } = context.getImageData(0, 0, RASTER_SIDE, RASTER_SIDE);
  return jsQR(data, RASTER_SIDE, RASTER_SIDE, { inversionAttempts })?.data;
}

const luminance = (color: string) => {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((channel) => {
    const value = Number(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

const plate = (code: HTMLElement) => ({
  foreground: luminance(getComputedStyle(code.querySelector('path')!).fill),
  background: luminance(getComputedStyle(code.querySelector('rect')!).fill),
});

function ChangingValue() {
  const [value, setValue] = useState('first');
  return (
    <>
      <QRCode value={value} />
      <button type="button" onClick={() => setValue('second value')}>
        change
      </button>
    </>
  );
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

describe('accessible name', () => {
  test('is an image named "QR 코드" without reading the value', async () => {
    const screen = await renderInTheme(<QRCode value={PROFILE} />);

    await expect.element(screen.getByRole('img', { name: 'QR 코드' })).toBeInTheDocument();
    expect(codeIn(screen.container).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.container.textContent).not.toContain(PROFILE);
  });

  test('takes aria-label or aria-labelledby in place of the default', async () => {
    const screen = await renderInTheme(
      <>
        <QRCode value={PROFILE} aria-label="Alice의 프로필" />
        <QRCode value={PROFILE} aria-labelledby="caption" />
        <p id="caption">결제 페이지</p>
      </>,
    );

    await expect.element(screen.getByRole('img', { name: 'Alice의 프로필' })).toBeInTheDocument();
    const labelled = screen.getByRole('img', { name: '결제 페이지' });
    await expect.element(labelled).toBeInTheDocument();
    expect(labelled.element()).not.toHaveAttribute('aria-label');
  });

  test('speaks the translation for the default name', async () => {
    const screen = await render(
      <IdsProvider translate={(key) => (key === 'qrCode.label' ? 'QR code' : undefined)}>
        <QRCode value={PROFILE} />
      </IdsProvider>,
    );

    await expect.element(screen.getByRole('img', { name: 'QR code' })).toBeInTheDocument();
  });
});

describe('round trip through a scanner', () => {
  test.each([
    ['square', 'square'],
    ['rounded', 'rounded'],
    ['dots', 'circle'],
    ['dots', 'square'],
  ] as const)('%s modules with %s finders decode to the value', async (shape, finderShape) => {
    const screen = await renderInTheme(
      <QRCode value={PROFILE} shape={shape} finderShape={finderShape} size={240} />,
    );

    expect(decode(await rasterize(codeIn(screen.container)))).toBe(PROFILE);
  });

  test.each(['L', 'M', 'Q', 'H'] as const)('decodes at error correction %s', async (level) => {
    const screen = await renderInTheme(<QRCode value={PROFILE} errorCorrection={level} />);

    expect(codeIn(screen.container)).toHaveAttribute('data-error-correction', level);
    expect(decode(await rasterize(codeIn(screen.container)))).toBe(PROFILE);
  });

  test('decodes Korean text and a long URL', async () => {
    const long = `${PROFILE}?from=${'campus-event-'.repeat(12)}`;
    const screen = await renderInTheme(
      <>
        <QRCode value="지스트 인포팀" />
        <QRCode value={long} shape="rounded" size={320} />
      </>,
    );
    const [korean, url] = screen.container.querySelectorAll<HTMLElement>('[data-qr-code]');

    expect(decode(await rasterize(korean!))).toBe('지스트 인포팀');
    expect(decode(await rasterize(url!))).toBe(long);
    expect(Number(url!.dataset.version)).toBeGreaterThan(Number(korean!.dataset.version));
  });

  test('draws the new value when it changes', async () => {
    const screen = await renderInTheme(<ChangingValue />);

    await userEvent.click(screen.getByRole('button', { name: 'change' }));
    await expect
      .poll(async () => decode(await rasterize(codeIn(screen.container))))
      .toBe('second value');
  });
});

describe('logo', () => {
  test('raises error correction to H and still decodes under an opaque logo', async () => {
    const screen = await renderInTheme(
      <QRCode value={PROFILE} shape="rounded" size={240}>
        <QRCode.Logo>
          <AcademicCapIcon />
        </QRCode.Logo>
      </QRCode>,
    );
    const code = codeIn(screen.container);

    expect(code).toHaveAttribute('data-error-correction', 'H');
    const context = await rasterize(code);
    expect(decode(context)).toBe(PROFILE);
    coverWithAnOpaqueLogo(context, code);
    expect(decode(context)).toBe(PROFILE);
  });

  test('sits in the middle, about a fifth of the modules wide', async () => {
    const screen = await renderInTheme(
      <QRCode value={PROFILE} size={200}>
        <QRCode.Logo data-testid="logo">
          <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
        </QRCode.Logo>
      </QRCode>,
    );
    const code = codeIn(screen.container).getBoundingClientRect();
    const logo = screen.getByTestId('logo').element().getBoundingClientRect();

    expect(logo.left - code.left).toBeCloseTo(code.right - logo.right, 1);
    expect(logo.top - code.top).toBeCloseTo(code.bottom - logo.bottom, 1);
    expect(logo.width / code.width).toBeGreaterThan(0.1);
    expect(logo.width / code.width).toBeLessThan(0.25);
  });

  test('warns when an explicit level is too low to carry a logo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderInTheme(
      <QRCode value={PROFILE} errorCorrection="M">
        <QRCode.Logo>
          <AcademicCapIcon />
        </QRCode.Logo>
      </QRCode>,
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("use errorCorrection 'Q' or 'H'"));
    warn.mockRestore();
  });

  test('renders an element of its own with asChild', async () => {
    const screen = await renderInTheme(
      <QRCode value={PROFILE}>
        <QRCode.Logo asChild>
          <span data-testid="mark">IDS</span>
        </QRCode.Logo>
      </QRCode>,
    );

    await expect.element(screen.getByTestId('mark')).toHaveAttribute('data-qr-code-logo', '');
  });
});

describe('colors', () => {
  test('follows the theme: dark modules on light in light mode, inverted in dark mode', async () => {
    const light = await renderInTheme(<QRCode value={PROFILE} />);
    const lightPlate = plate(codeIn(light.container));
    expect(lightPlate.background).toBeGreaterThan(lightPlate.foreground);
    expect(decode(await rasterize(codeIn(light.container)))).toBe(PROFILE);
    await light.unmount();

    const dark = await renderInTheme(<QRCode value={PROFILE} />, 'dark');
    const darkPlate = plate(codeIn(dark.container));
    expect(darkPlate.foreground).toBeGreaterThan(darkPlate.background);
    expect(contrast(darkPlate.foreground, darkPlate.background)).toBeGreaterThan(15);
    const context = await rasterize(codeIn(dark.container));
    expect(decode(context, 'dontInvert')).toBeUndefined();
    expect(decode(context, 'invertFirst')).toBe(PROFILE);
  });

  test('inverted={false} keeps dark modules on a light plate in dark mode', async () => {
    const screen = await renderInTheme(<QRCode value={PROFILE} inverted={false} />, 'dark');
    const colors = plate(codeIn(screen.container));

    expect(colors.background).toBeGreaterThan(colors.foreground);
    expect(contrast(colors.foreground, colors.background)).toBeGreaterThan(15);
    expect(decode(await rasterize(codeIn(screen.container)))).toBe(PROFILE);
  });

  test('inverted draws light modules on a dark plate in either mode', async () => {
    for (const mode of ['light', 'dark'] as const) {
      const screen = await renderInTheme(<QRCode value={PROFILE} inverted />, mode);
      const colors = plate(codeIn(screen.container));

      expect(colors.foreground).toBeGreaterThan(colors.background);
      expect(decode(await rasterize(codeIn(screen.container)), 'invertFirst')).toBe(PROFILE);
      await screen.unmount();
    }
  });

  test('takes other colors through the two custom properties', async () => {
    const screen = await renderInTheme(
      <QRCode
        value={PROFILE}
        className="[--qr-code-background:rgb(255,255,255)] [--qr-code-foreground:rgb(0,0,128)]"
      />,
    );
    const code = codeIn(screen.container);

    expect(getComputedStyle(code.querySelector('path')!).fill).toBe('rgb(0, 0, 128)');
    expect(decode(await rasterize(code))).toBe(PROFILE);
  });
});

describe('size and quiet zone', () => {
  test.each([
    ['tiny', 96],
    ['standard', 128],
    [200, 200],
  ] as const)('size %s is %ipx square', async (size, pixels) => {
    const screen = await renderInTheme(<QRCode value={PROFILE} size={size} />);
    const box = codeIn(screen.container).getBoundingClientRect();

    expect(box.width).toBe(pixels);
    expect(box.height).toBe(pixels);
  });

  test('quietZone adds that many modules around the code and 0 drops the rounded corner', async () => {
    const screen = await renderInTheme(
      <>
        <QRCode value={PROFILE} quietZone={4} />
        <QRCode value={PROFILE} quietZone={0} />
      </>,
    );
    const [standard, flush] = screen.container.querySelectorAll<HTMLElement>('[data-qr-code]');
    const modules = Number(standard!.dataset.version) * 4 + 17;

    expect(standard!.querySelector('svg')).toHaveAttribute(
      'viewBox',
      `0 0 ${modules + 8} ${modules + 8}`,
    );
    expect(flush!.querySelector('svg')).toHaveAttribute('viewBox', `0 0 ${modules} ${modules}`);
    expect(getComputedStyle(standard!).borderTopLeftRadius).toBe('10px');
    expect(getComputedStyle(flush!).borderTopLeftRadius).toBe('0px');
  });
});

describe('development warnings', () => {
  test('warns on an empty value', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderInTheme(<QRCode value="" />);

    expect(warn).toHaveBeenCalledWith('[IDS] QRCode: value is empty.');
    warn.mockRestore();
  });

  test('draws an empty plate and warns when the value is too long', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await renderInTheme(<QRCode value={'x'.repeat(4000)} errorCorrection="H" />);
    const code = codeIn(screen.container);

    expect(code).toHaveAttribute('data-overflow', '');
    expect(code.querySelector('path')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('too long to encode at'));
    warn.mockRestore();
  });
});

test('the server HTML already holds the modules, the name and the logo', () => {
  const html = renderToString(
    <QRCode value={PROFILE} aria-label="Alice">
      <QRCode.Logo>
        <AcademicCapIcon />
      </QRCode.Logo>
    </QRCode>,
  );
  const code = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector<HTMLElement>('[data-qr-code]')!;

  expect(code).toHaveAttribute('role', 'img');
  expect(code).toHaveAttribute('aria-label', 'Alice');
  expect(code.querySelector('path')!.getAttribute('d')!.length).toBeGreaterThan(100);
  expect(code.querySelector('[data-qr-code-logo]')).not.toBeNull();
});
