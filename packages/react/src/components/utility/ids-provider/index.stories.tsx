import { useState } from 'react';

import { expect, within } from 'storybook/test';

import { Showcase, paletteHues, palettes } from '~story-kit';

import { cn } from '../../../utils';
import { Button } from '../../action/button';
import { Card } from '../../data/card';
import { Chip } from '../../data/chip';
import { ChipGroup } from '../../data/chip-group';
import { Checkbox } from '../../form/checkbox';
import { TextField } from '../../form/text-field';

import { IdsProvider, defineIdsTheme, useTheme } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const modes = ['light', 'dark'] as const;

const demoThemes = {
  blue: defineIdsTheme({ primary: palettes.blue }),
  'orange, squircle': defineIdsTheme({
    primary: palettes.orange,
    radius: 14,
    cornerShape: 'squircle',
  }),
  'emerald, sharp': defineIdsTheme({ primary: palettes.emerald, radius: 4 }),
  'seed #0d9488': defineIdsTheme({ primary: '#0d9488' }),
  'blue, ×1.5': defineIdsTheme({ primary: palettes.blue, scale: 1.5 }),
};

const seeds = [
  '#e11d48',
  '#f59e0b',
  '#16a34a',
  '#0891b2',
  '#7c3aed',
  'oklch(0.6 0.08 250)',
  '#8a8a8a',
];

const scales = [0.875, 1, 1.25, 1.5];

const brandSets = {
  'primary 만': { primary: palettes.blue, secondary: undefined, tertiary: undefined },
  'secondary violet': { primary: palettes.blue, secondary: palettes.violet, tertiary: undefined },
  'secondary violet, tertiary teal': {
    primary: palettes.blue,
    secondary: palettes.violet,
    tertiary: palettes.teal,
  },
};

const neutrals = ['pure', 'tinted'] as const;

const statusModes = ['harmonized', 'fixed'] as const;

const statusFamilies = ['success', 'warning', 'danger', 'info'] as const;

const tintedPrimaries = ['blue', 'orange', 'emerald'] as const;

const meta = {
  title: 'Utility/IdsProvider',
  component: IdsProvider,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: Object.keys(demoThemes),
      mapping: demoThemes,
    },
    mode: { control: 'radio', options: [...modes, 'system'] },
    asChild: { control: false },
  },
  args: { theme: demoThemes['orange, squircle'], mode: 'dark' },
} satisfies Meta<typeof IdsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Readout() {
  const { theme, scale, mode, resolvedMode } = useTheme();
  return (
    <dl className="text-caption-c1-regular text-neutral grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono">
      <dt>primary</dt>
      <dd data-testid="palette">
        {typeof theme.primary === 'string'
          ? theme.primary
          : theme.primary !== undefined && 'light' in theme.primary
            ? theme.primary.light[6]
            : theme.primary?.[600]}
      </dd>
      <dt>scale</dt>
      <dd data-testid="scale">{scale ?? 1}</dd>
      <dt>mode</dt>
      <dd data-testid="mode">{mode}</dd>
      <dt>resolvedMode</dt>
      <dd data-testid="resolved">{resolvedMode}</dd>
    </dl>
  );
}

const region = cn('concentric-p-4 inset-ring-1 inset-ring-neutral');

export const Playground: Story = {
  render: (args) => (
    <IdsProvider {...args} asChild>
      <div className={region}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button>저장</Button>
            <Button variant="soft">임시 저장</Button>
            <Button variant="outline">취소</Button>
            <Chip variant="outline">초안</Chip>
          </div>
          <TextField aria-label="제목" placeholder="제목" />
          <Checkbox defaultChecked aria-label="알림 받기" />
          <Readout />
        </div>
      </div>
    </IdsProvider>
  ),
};

export const Usage: Story = {
  render: () => (
    <IdsProvider theme={defineIdsTheme({ primary: '#0d9488' })}>
      <div className="flex gap-2">
        <Button>저장</Button>
        <Button variant="soft">임시 저장</Button>
      </div>
    </IdsProvider>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section
        title="Palette × Mode"
        description="앱이 준 primary 팔레트 하나에서 IdsProvider 가 라이트와 다크의 역할 색을 대비로 고릅니다. 여기는 레포 데모 팔레트 17개입니다. 밝은 팔레트는 채움 위 글자가 검은색입니다."
      >
        <Showcase.Matrix
          rows={paletteHues}
          columns={modes}
          render={(hue, mode) => (
            <IdsProvider.Scope theme={{ primary: palettes[hue] }} mode={mode} asChild>
              <div className={region}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button>저장</Button>
                  <Button variant="soft">임시 저장</Button>
                  <Button variant="outline">취소</Button>
                  <Chip variant="outline">초안</Chip>
                </div>
              </div>
            </IdsProvider.Scope>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="Seed × Mode"
        description="primary 에 색 하나를 주면 IdsProvider 가 그 색의 hue 와 채도로 50~950 을 만듭니다. 고른 색이 그대로 들어간다는 보장은 없습니다. 회색을 주면 회색 팔레트가 됩니다."
      >
        <Showcase.Matrix
          rows={seeds}
          columns={modes}
          render={(seed, mode) => (
            <IdsProvider.Scope theme={{ primary: seed }} mode={mode} asChild>
              <div className={region}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button>저장</Button>
                  <Button variant="soft">임시 저장</Button>
                  <Chip variant="outline">초안</Chip>
                </div>
              </div>
            </IdsProvider.Scope>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="Brand families × Mode"
        description="secondary 와 tertiary 는 선택입니다. 생략한 계열은 primary 에서 만듭니다. secondary 는 같은 hue 에 채도 1/3, tertiary 는 hue 를 60° 돌린 색입니다."
      >
        <Showcase.Matrix
          rows={Object.keys(brandSets) as (keyof typeof brandSets)[]}
          columns={modes}
          render={(set, mode) => (
            <IdsProvider.Scope theme={brandSets[set]} mode={mode} asChild>
              <div className={region}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button>primary</Button>
                  <Button colorScheme="secondary">secondary</Button>
                  <Button colorScheme="tertiary">tertiary</Button>
                  <Chip variant="soft" colorScheme="secondary">
                    soft
                  </Chip>
                  <Chip variant="outline" colorScheme="tertiary">
                    outline
                  </Chip>
                </div>
              </div>
            </IdsProvider.Scope>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="Neutral: pure × tinted"
        description="neutral: 'tinted' 는 같은 밝기의 회색에 primary 의 색상을 채도 0.02 이하로 섞습니다. 배경, 구조선, 보조 글자, 옅은 채움이 함께 물듭니다."
      >
        {tintedPrimaries.map((hue) => (
          <Showcase.Row key={hue} label={hue}>
            <div className="flex flex-wrap gap-4">
              {neutrals.flatMap((neutral) =>
                modes.map((mode) => (
                  <IdsProvider.Scope
                    key={`${neutral}:${mode}`}
                    theme={{ primary: palettes[hue], neutral }}
                    mode={mode}
                    asChild
                  >
                    <div className="w-56">
                      <Card>
                        <Card.Header>
                          <Card.Title>
                            {neutral} · {mode}
                          </Card.Title>
                          <Card.Description>구조선과 보조 글자</Card.Description>
                        </Card.Header>
                        <Card.Content>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="soft" colorScheme="neutral">
                              취소
                            </Button>
                            <Chip variant="soft" colorScheme="neutral">
                              초안
                            </Chip>
                          </div>
                        </Card.Content>
                      </Card>
                    </div>
                  </IdsProvider.Scope>
                )),
              )}
            </div>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section
        title="Status: harmonized × fixed"
        description="기본 'harmonized' 는 상태 색의 색상을 primary 쪽으로 최대 15° 돌리고 그 상태의 범위 안에 둡니다. 'fixed' 는 green, yellow, red, sky 그대로입니다."
      >
        <Showcase.Matrix
          rows={tintedPrimaries}
          columns={statusModes}
          render={(hue, status) => (
            <IdsProvider.Scope theme={{ primary: palettes[hue], status }} asChild>
              <div className={region}>
                <ChipGroup>
                  {statusFamilies.map((family) => (
                    <Chip variant="solid" key={family} colorScheme={family}>
                      {family}
                    </Chip>
                  ))}
                  {statusFamilies.map((family) => (
                    <Chip key={family} variant="soft" colorScheme={family}>
                      {family}
                    </Chip>
                  ))}
                </ChipGroup>
              </div>
            </IdsProvider.Scope>
          )}
        />
      </Showcase.Section>
      <Showcase.Section
        title="Scale"
        description="크기, 간격, 글자 크기, radius 에 scale 을 곱하고 px 로 반올림합니다. 테두리, focus ring, 그림자는 그대로입니다. 안쪽 Scope 의 scale 은 곱하지 않고 바꿉니다."
      >
        {scales.map((scale) => (
          <Showcase.Row key={scale} label={`×${scale}`}>
            <IdsProvider.Scope theme={{ scale }} asChild>
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <div className="w-40">
                  <TextField aria-label={`제목 ${scale}`} placeholder="제목" />
                </div>
                <Checkbox defaultChecked aria-label={`선택 ${scale}`} />
                <Chip variant="solid">새 글</Chip>
              </div>
            </IdsProvider.Scope>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section
        title="Radius"
        description="standard 하나를 받고 indicator 는 0.4배, container 는 1.6배로 계산합니다. concentric 공식은 그대로입니다."
      >
        {[0, 6, 10, 14, 18].map((radius) => (
          <Showcase.Row key={radius} label={`${radius}px`}>
            <IdsProvider.Scope theme={{ radius }} asChild>
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <div className="w-40">
                  <TextField aria-label={`제목 ${radius}`} placeholder="제목" />
                </div>
                <Checkbox defaultChecked aria-label={`선택 ${radius}`} />
                <div className="w-40">
                  <Card size="tiny">
                    <Card.Title>카드</Card.Title>
                  </Card>
                </div>
              </div>
            </IdsProvider.Scope>
          </Showcase.Row>
        ))}
      </Showcase.Section>
      <Showcase.Section
        title="Corner shape"
        description="squircle 은 CSS corner-shape 로 그립니다. rounded-full 은 원으로 남고, corner-shape 를 모르는 브라우저는 round 로 그립니다."
      >
        {(['round', 'squircle'] as const).map((cornerShape) => (
          <Showcase.Row key={cornerShape} label={cornerShape}>
            <IdsProvider.Scope theme={{ radius: 14, cornerShape }} asChild>
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <Button variant="soft">임시 저장</Button>
                <Chip variant="solid">새 글</Chip>
                <div className="w-40">
                  <Card size="tiny">
                    <Card.Title>카드</Card.Title>
                  </Card>
                </div>
              </div>
            </IdsProvider.Scope>
          </Showcase.Row>
        ))}
      </Showcase.Section>
    </Showcase>
  ),
};

function ModeSwitcher() {
  const { mode, setMode, toggleMode } = useTheme();
  return (
    <div className="flex flex-wrap gap-2">
      {(['light', 'dark', 'system'] as const).map((option) => (
        <Button
          key={option}
          size="tiny"
          variant={mode === option ? 'solid' : 'outline'}
          aria-pressed={mode === option}
          onClick={() => setMode(option)}
        >
          {option}
        </Button>
      ))}
      <Button size="tiny" variant="soft" onClick={toggleMode}>
        반전
      </Button>
    </div>
  );
}

export const ControlTheModeFromTheApp: Story = {
  render: function Render() {
    const [mode, setMode] = useState<IdsProvider.Mode>('light');

    return (
      <div className="flex flex-col gap-3">
        <IdsProvider
          theme={defineIdsTheme({ primary: palettes.blue })}
          mode={mode}
          onModeChange={setMode}
          data-testid="provider"
          asChild
        >
          <div className={region}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button>저장</Button>
                <Button variant="soft">임시 저장</Button>
                <Button variant="outline">취소</Button>
              </div>
              <Readout />
              <ModeSwitcher />
            </div>
          </div>
        </IdsProvider>
        <output aria-label="부모 상태" className="text-caption-c1-regular font-mono">
          {mode}
        </output>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'mode를 넘기면 제어 모드입니다. useTheme().setMode는 onModeChange를 부르고, 화면은 부모가 값을 바꿀 때 바뀝니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const provider = canvas.getByTestId('provider');
    await userEvent.click(canvas.getByRole('button', { name: 'dark' }));
    await expect(provider).toHaveAttribute('data-mode', 'dark');
    await expect(canvas.getByLabelText('부모 상태')).toHaveTextContent('dark');
    await userEvent.click(canvas.getByRole('button', { name: '반전' }));
    await expect(provider).toHaveAttribute('data-mode', 'light');
    await expect(provider.style.colorScheme).toBe('light');
  },
};

export const FollowTheSystemMode: Story = {
  render: () => (
    <IdsProvider
      theme={defineIdsTheme({ primary: palettes.blue })}
      defaultMode="system"
      data-testid="provider"
      asChild
    >
      <div className={region}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button>저장</Button>
            <Button variant="soft">임시 저장</Button>
            <Button variant="outline">취소</Button>
          </div>
          <Readout />
          <ModeSwitcher />
        </div>
      </div>
    </IdsProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'mode="system"은 운영체제의 prefers-color-scheme을 따르고, 설정이 바뀌면 새로고침 없이 바로 바뀝니다. resolvedMode가 실제로 칠해진 모드입니다. 두 모드의 역할 색이 처음부터 HTML 에 있어서 깜빡이지 않습니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const expected = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const provider = canvas.getByTestId('provider');
    await expect(provider).toHaveAttribute('data-mode', expected);
    await expect(canvas.getByTestId('mode')).toHaveTextContent('system');
    await expect(canvas.getByTestId('resolved')).toHaveTextContent(expected);
  },
};

export const ChangePartOfTheTheme: Story = {
  render: () => (
    <IdsProvider
      theme={defineIdsTheme({ primary: palettes.blue })}
      defaultMode="light"
      data-testid="outer"
      asChild
    >
      <div className={region}>
        <div className="flex flex-col gap-4">
          <Readout />
          <IdsProvider.Scope mode="dark" data-testid="dark" asChild>
            <div className={region}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button>저장</Button>
                  <Button variant="soft">임시 저장</Button>
                  <Button variant="outline">취소</Button>
                </div>
                <Readout />
              </div>
            </div>
          </IdsProvider.Scope>
          <IdsProvider.Scope
            theme={{ primary: palettes.orange, radius: 16 }}
            data-testid="orange"
            asChild
          >
            <div className={region}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button>저장</Button>
                  <Button variant="soft">임시 저장</Button>
                  <Button variant="outline">취소</Button>
                </div>
                <Readout />
                <ModeSwitcher />
              </div>
            </div>
          </IdsProvider.Scope>
        </div>
      </div>
    </IdsProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'IdsProvider.Scope 는 하위 트리의 테마 일부나 mode 만 바꾸고 나머지는 물려받습니다. 물려받은 mode 의 setter 는 그 mode 를 가진 바깥 Provider 를 바꿉니다. 모드가 바뀌는 영역은 스스로 배경을 칠합니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const outer = canvas.getByTestId('outer');
    const dark = canvas.getByTestId('dark');
    const orange = canvas.getByTestId('orange');
    await expect(within(dark).getByTestId('palette')).toHaveTextContent(palettes.blue[600]);
    await expect(dark).toHaveAttribute('data-mode', 'dark');
    await expect(within(orange).getByTestId('palette')).toHaveTextContent(palettes.orange[600]);
    await expect(orange).toHaveAttribute('data-mode', 'light');
    await expect(dark.className).toContain('bg-base');
    await expect(orange.className).not.toContain('bg-base');
    await userEvent.click(within(orange).getByRole('button', { name: 'dark' }));
    await expect(outer).toHaveAttribute('data-mode', 'dark');
    await expect(orange).toHaveAttribute('data-mode', 'dark');
  },
};

export const ThemeAnElementWithoutAWrapper: Story = {
  render: () => (
    <IdsProvider.Scope asChild theme={{ primary: palettes.green }} mode="dark">
      <section aria-label="녹색 영역" className={region}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button>저장</Button>
            <Button variant="soft">임시 저장</Button>
            <Button variant="outline">취소</Button>
          </div>
          <Readout />
        </div>
      </section>
    </IdsProvider.Scope>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` 면 감싸는 div 없이 자식 요소에 모드와 테마를 바로 씁니다. 영역에 이름을 주거나 시맨틱 태그를 쓸 때 고릅니다.',
      },
    },
  },
  play: async ({ canvas }) => {
    const section = canvas.getByRole('region', { name: '녹색 영역' });
    await expect(section).toHaveAttribute('data-mode', 'dark');
    await expect(Object.values(palettes.green)).toContain(
      section.style.getPropertyValue('--ids-theme-dark-bg-primary-solid'),
    );
    await expect(section.parentElement).not.toBe(null);
  },
};
