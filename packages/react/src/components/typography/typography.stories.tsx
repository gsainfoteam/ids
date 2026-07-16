import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

type Weight = 'bold' | 'semibold' | 'medium' | 'regular';

const weightLabel: Record<Weight, string> = {
  bold: 'Bold',
  semibold: 'SemiBold',
  medium: 'Medium',
  regular: 'Regular',
};

function SpecLine({
  fontSizePx,
  tracking,
  leading,
}: {
  fontSizePx: number;
  tracking: 'tight' | 'normal';
  leading: number;
}) {
  const trackingLabel = tracking === 'tight' ? '-1%' : '0%';
  const lineHeightPx = Math.round(fontSizePx * leading);

  return (
    <div className="mt-2 flex items-center gap-3 text-caption-c2-regular text-(--ids-color-on-muted)">
      <span>{fontSizePx}px</span>
      <span>{trackingLabel}</span>
      <span>
        {leading.toFixed(3).replace(/\.?0+$/, '')} ({lineHeightPx}px)
      </span>
    </div>
  );
}

function HeadingBlock({
  level,
  fontSizePx,
  weight,
}: {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fontSizePx: number;
  weight: Exclude<Weight, 'regular'>;
}) {
  const className = `text-headline-${level}-${weight}` as const;

  return (
    <div className="pb-6">
      <div className={className}>{level.toUpperCase()} Headline</div>
      <SpecLine fontSizePx={fontSizePx} tracking="tight" leading={1.2} />
    </div>
  );
}

function SubtitleBlock({
  level,
  fontSizePx,
  weight,
}: {
  level: 's1' | 's2';
  fontSizePx: number;
  weight: Exclude<Weight, 'regular'>;
}) {
  const className = `text-subtitle-${level}-${weight}` as const;

  return (
    <div className="pb-6">
      <div className={className}>{level.toUpperCase()} Subtitle</div>
      <SpecLine fontSizePx={fontSizePx} tracking="normal" leading={1.35} />
    </div>
  );
}

function BodyBlock({
  level,
  fontSizePx,
  weight,
  leading,
}: {
  level: 'b1' | 'b2' | 'b3';
  fontSizePx: number;
  weight: Weight;
  leading: number;
}) {
  const className = `text-body-${level}-${weight}` as const;

  return (
    <div className="pb-8">
      <div className={className}>
        {level.toUpperCase()} Body. 동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세
      </div>
      <SpecLine fontSizePx={fontSizePx} tracking="normal" leading={leading} />
    </div>
  );
}

function CaptionBlock({
  level,
  fontSizePx,
  weight,
}: {
  level: 'c1' | 'c2';
  fontSizePx: number;
  weight: Exclude<Weight, 'bold'>;
}) {
  const className = `text-caption-${level}-${weight}` as const;

  return (
    <div className="pb-6">
      <div className={className}>
        {level.toUpperCase()} Caption. 동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세
      </div>
      <SpecLine fontSizePx={fontSizePx} tracking="normal" leading={1.35} />
    </div>
  );
}

function ButtonBlock({ size }: { size: 'standard' | 'tiny' }) {
  const className = `text-button-${size}` as const;
  const fontSizePx = size === 'standard' ? 18 : 12;
  const tracking = size === 'standard' ? 'tight' : 'normal';

  return (
    <div className="pb-6">
      <div className={className}>{size === 'standard' ? 'Default' : 'Tiny'}</div>
      <SpecLine fontSizePx={fontSizePx} tracking={tracking} leading={1} />
    </div>
  );
}

export const Overview: Story = {
  render: () => {
    const headlineLevels = [
      { level: 'h1' as const, fontSizePx: 48 },
      { level: 'h2' as const, fontSizePx: 40 },
      { level: 'h3' as const, fontSizePx: 32 },
      { level: 'h4' as const, fontSizePx: 28 },
      { level: 'h5' as const, fontSizePx: 24 },
      { level: 'h6' as const, fontSizePx: 20 },
    ];

    const subtitleLevels = [
      { level: 's1' as const, fontSizePx: 18 },
      { level: 's2' as const, fontSizePx: 16 },
    ];

    const bodyLevels = [
      { level: 'b1' as const, fontSizePx: 18, leading: 1.333 },
      { level: 'b2' as const, fontSizePx: 16, leading: 1.375 },
      { level: 'b3' as const, fontSizePx: 14, leading: 1.429 },
    ];

    const captionLevels = [
      { level: 'c1' as const, fontSizePx: 12 },
      { level: 'c2' as const, fontSizePx: 10 },
    ];

    return (
      <div className="bg-(--ids-color-surface) p-10 text-(--ids-color-on-surface)">
        <div className="grid grid-cols-3 gap-12">
          {(['bold', 'semibold', 'medium'] as const).map((weight) => (
            <div key={weight}>
              <div className="text-body-b3-medium text-(--ids-color-on-muted)">{weightLabel[weight]}</div>
              <div className="mt-8">
                {headlineLevels.map(({ level, fontSizePx }) => (
                  <HeadingBlock key={level} level={level} fontSizePx={fontSizePx} weight={weight} />
                ))}
                {subtitleLevels.map(({ level, fontSizePx }) => (
                  <SubtitleBlock key={level} level={level} fontSizePx={fontSizePx} weight={weight} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-4 gap-12">
          {(['bold', 'semibold', 'medium', 'regular'] as const).map((weight) => (
            <div key={weight}>
              <div className="text-body-b3-medium text-(--ids-color-on-muted)">
                {weight === 'semibold' ? 'sb' : weight === 'medium' ? 'm' : weight === 'regular' ? 'r' : 'Bold'}
              </div>
              <div className="mt-8">
                {bodyLevels.map(({ level, fontSizePx, leading }) => (
                  <BodyBlock
                    key={level}
                    level={level}
                    fontSizePx={fontSizePx}
                    weight={weight}
                    leading={leading}
                  />
                ))}
                {captionLevels.map(({ level, fontSizePx }) => (
                  <CaptionBlock
                    key={level}
                    level={level}
                    fontSizePx={fontSizePx}
                    weight={weight === 'bold' ? 'semibold' : weight}
                  />
                ))}
                <div className="mt-6 grid grid-cols-2 gap-10">
                  <ButtonBlock size="standard" />
                  <ButtonBlock size="tiny" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

