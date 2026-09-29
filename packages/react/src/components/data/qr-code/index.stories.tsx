import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { QRCode } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const shapes = ['square', 'rounded', 'dots'] as const;
const finderShapes = ['square', 'rounded', 'circle'] as const;
const levels = ['L', 'M', 'Q', 'H'] as const;

const PROFILE = 'https://gistory.me/profile/alice';
const BRAND_MARK = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#2563eb"/><path d="M12 12h16v5H17v6h6v-2h-3v-4h8v11H12z" fill="#fff"/></svg>',
)}`;

const relativeLuminance = (color: string) => {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((channel) => {
    const value = Number(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

const plateColors = (root: Element) => ({
  foreground: relativeLuminance(getComputedStyle(root.querySelector('path')!).fill),
  background: relativeLuminance(getComputedStyle(root.querySelector('rect')!).fill),
});

const meta = {
  title: 'Data/QRCode',
  component: QRCode,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['standard', 'tiny', 192] },
    shape: { control: 'radio', options: shapes },
    finderShape: { control: 'radio', options: [undefined, ...finderShapes] },
    errorCorrection: { control: 'radio', options: [undefined, ...levels] },
    quietZone: { control: { type: 'number', min: 0, max: 8 } },
    inverted: { control: 'radio', options: [undefined, false, true] },
  },
  args: { value: PROFILE, size: 'standard', shape: 'square', quietZone: 4 },
} satisfies Meta<typeof QRCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Shape × Finder"
        description="모듈 모양과 세 모서리의 파인더 모양을 따로 고릅니다."
      >
        <Showcase.Matrix
          rows={shapes}
          columns={finderShapes}
          render={(shape, finderShape) => (
            <QRCode value={PROFILE} shape={shape} finderShape={finderShape} />
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Size" description="standard 128px, tiny 96px, 숫자는 px 입니다.">
        <Showcase.Row label="size">
          <QRCode value={PROFILE} size="tiny" />
          <QRCode value={PROFILE} size="standard" />
          <QRCode value={PROFILE} size={192} />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Error correction"
        description="높은 수준일수록 가려지거나 더러워져도 읽히지만 모듈이 촘촘해집니다."
      >
        <Showcase.Row label="level">
          {levels.map((level) => (
            <QRCode key={level} value={PROFILE} errorCorrection={level} />
          ))}
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Tone"
        description="기본은 테마를 따라 다크 모드에서 반전됩니다. inverted={false} 는 어느 모드에서나 밝은 바탕에 어두운 모듈입니다."
      >
        <Showcase.Row label="theme">
          <QRCode value={PROFILE} shape="rounded" />
        </Showcase.Row>
        <Showcase.Row label="inverted={false}">
          <QRCode value={PROFILE} shape="rounded" inverted={false} />
        </Showcase.Row>
        <Showcase.Row label="inverted">
          <QRCode value={PROFILE} shape="rounded" inverted />
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Logo"
        description="로고가 있으면 가운데 모듈을 비우고 오류 정정 수준을 H 로 올립니다."
      >
        <Showcase.Row label="image">
          <QRCode value={PROFILE} shape="rounded">
            <QRCode.Logo>
              <img src={BRAND_MARK} alt="" />
            </QRCode.Logo>
          </QRCode>
          <QRCode value={PROFILE} shape="dots" size={192}>
            <QRCode.Logo>
              <img src={BRAND_MARK} alt="" />
            </QRCode.Logo>
          </QRCode>
        </Showcase.Row>
        <Showcase.Row label="icon">
          <QRCode value={PROFILE}>
            <QRCode.Logo>
              <AcademicCapIcon />
            </QRCode.Logo>
          </QRCode>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section
        title="Quiet zone"
        description="둘레의 빈 칸 수입니다. 표준은 4칸이고, 0 이면 모서리도 둥글게 깎지 않습니다."
      >
        <Showcase.Row label="quietZone">
          <QRCode value={PROFILE} quietZone={4} />
          <QRCode value={PROFILE} quietZone={2} />
          <QRCode value={PROFILE} quietZone={0} />
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const WithLogo: Story = {
  render: () => (
    <QRCode value="https://gistory.me/pay/8203" shape="rounded" aria-label="결제 페이지 QR 코드">
      <QRCode.Logo>
        <img src={BRAND_MARK} alt="" />
      </QRCode.Logo>
    </QRCode>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`QRCode.Logo` 를 넣으면 가운데 약 22% 의 모듈을 비우고 그 안에 로고를 둡니다. `errorCorrection` 을 주지 않으면 H(30% 복구)로 올라갑니다. 로고는 `img` 나 아이콘이고, 아이콘은 모듈 색을 따릅니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const code = canvas.getByRole('img', { name: '결제 페이지 QR 코드' });
    await expect(code).toHaveAttribute('data-error-correction', 'H');
    await expect(canvasElement.querySelector('[data-qr-code-logo]')).toBeVisible();
  },
};

export const Contrast: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <QRCode value={PROFILE} aria-label="테마를 따르는 QR 코드" />
      <QRCode value={PROFILE} inverted={false} aria-label="밝은 바탕의 QR 코드" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '색은 `on-surface` 모듈에 `surface` 바탕이라 다크 모드에서는 밝은 모듈이 어두운 바탕에 놓입니다. 휴대폰 카메라 앱은 반전된 코드도 읽지만 오래된 스캐너는 못 읽을 수 있습니다. 결제나 출입처럼 어떤 스캐너가 읽을지 모를 때는 `inverted={false}` 로 항상 밝은 바탕에 어두운 모듈을 그립니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const light = plateColors(canvas.getByRole('img', { name: '밝은 바탕의 QR 코드' }));
    await expect(light.background).toBeGreaterThan(light.foreground);
    await expect((light.background + 0.05) / (light.foreground + 0.05)).toBeGreaterThan(15);

    const theme = plateColors(canvas.getByRole('img', { name: '테마를 따르는 QR 코드' }));
    const ratio =
      (Math.max(theme.background, theme.foreground) + 0.05) /
      (Math.min(theme.background, theme.foreground) + 0.05);
    await expect(ratio).toBeGreaterThan(15);
  },
};

export const AccessibleName: Story = {
  render: () => (
    <figure className="flex flex-col items-center gap-2">
      <QRCode value={PROFILE} aria-labelledby="qr-profile-caption" />
      <figcaption id="qr-profile-caption" className="text-body-b3-regular">
        Alice 의 프로필 <span className="font-mono">{PROFILE}</span>
      </figcaption>
    </figure>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '스크린 리더는 `role="img"` 의 이름만 읽습니다. 기본 이름은 "QR 코드" 이고 긴 URL 을 읽지 않습니다. `aria-label` 이나 `aria-labelledby` 로 무엇으로 가는 코드인지 적고, 스캔할 수 없는 사람을 위해 주소를 글자로도 보여 줍니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: `Alice 의 프로필 ${PROFILE}` })).toBeVisible();
  },
};
