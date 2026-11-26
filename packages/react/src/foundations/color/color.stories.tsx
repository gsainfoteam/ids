import { PlusIcon, StarIcon } from '@heroicons/react/16/solid';
import { CalendarDate } from '@internationalized/date';
import { Area, AreaChart, Bar, BarChart, XAxis } from 'recharts';
import { expect } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Toggle } from '../../components/action/toggle';
import { Avatar } from '../../components/data/avatar';
import { Calendar, useCalendar } from '../../components/data/calendar';
import { Card } from '../../components/data/card';
import { Chart } from '../../components/data/chart';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { Skeleton } from '../../components/feedback/skeleton';
import { Spinner } from '../../components/feedback/spinner';
import { Checkbox } from '../../components/form/checkbox';
import { Field } from '../../components/form/field';
import { RadioGroup } from '../../components/form/radio-group';
import { Rating } from '../../components/form/rating';
import { Select } from '../../components/form/select';
import { Slider } from '../../components/form/slider';
import { Switch } from '../../components/form/switch';
import { TextField } from '../../components/form/text-field';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Pagination } from '../../components/navigation/pagination';
import { Stepper } from '../../components/navigation/stepper';
import { Tabs } from '../../components/navigation/tabs';
import { Kbd } from '../../components/typography/kbd';
import { Label } from '../../components/typography/label';
import { Link } from '../../components/typography/link';
import { IdsProvider, checkIdsTheme, useTheme } from '../../components/utility/ids-provider';
import {
  ACCENT_TEXT_LC,
  MARK_LC,
  TEXT_LC,
  lightnessContrast,
} from '../../components/utility/ids-provider/lib/contrast';
import {
  SCALE_STEPS,
  type IdsStatus,
  type IdsThemeOverrides,
} from '../../components/utility/ids-provider/lib/theme';
import { resolveColorsOnce } from '../../components/utility/ids-provider/lib/theme-roles';
import {
  IDS_BRAND_FAMILIES,
  IDS_COLOR_FAMILIES,
  IDS_FAMILY_SLOTS,
  IDS_STATUS_FAMILIES,
} from '../../tokens/color-roles';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Color',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const modes = ['light', 'dark'] as const;

const slotTemplates = IDS_FAMILY_SLOTS.map((template) => template.replace('{family}', '·'));

const slotOf = (template: string, family: string) => template.replace('{family}', family);

type Pairing = readonly [background: string, foreground: string, kind: 'text' | 'accent' | 'mark'];

const pairsOf = (family: string): Pairing[] => [
  [`bg-${family}-solid`, `text-on-${family}-solid`, 'text'],
  [`bg-${family}-soft`, `text-on-${family}-soft`, 'text'],
  ['bg-base', `text-${family}`, 'accent'],
  [`bg-${family}-soft`, `text-${family}`, 'accent'],
  ['bg-base', `text-${family}-strong`, 'text'],
  ['bg-base', `border-${family}-strong`, 'mark'],
];

const pairs: Pairing[] = [
  ['bg-base', 'text-on-base', 'text'],
  ['bg-surface', 'text-on-surface', 'text'],
  ['bg-block', 'text-on-block', 'text'],
  ['bg-base', 'text-neutral-strong', 'text'],
  ['bg-base', 'text-neutral', 'text'],
  ['bg-neutral-soft', 'text-on-neutral-soft', 'text'],
  ['bg-neutral-solid', 'text-on-neutral-solid', 'text'],
  ...[...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES].flatMap(pairsOf),
];

function channels(value: string) {
  const [r = 0, g = 0, b = 0] = (value.match(/[\d.]+/g) ?? []).map(Number);
  return [r, g, b];
}

const hex = (value: string) =>
  `#${channels(value)
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;

const gradeOf = (lc: number) =>
  lc >= TEXT_LC ? 'text' : lc >= ACCENT_TEXT_LC ? 'accent' : lc >= MARK_LC ? 'mark' : 'Fail';

function readSwatch(element: HTMLElement | null) {
  const chip = element?.querySelector<HTMLElement>('[data-chip]');
  const output = element?.querySelector('[data-hex]');
  if (!chip || !output) return;

  const style = getComputedStyle(chip);
  const isDefined = style.getPropertyValue(`--ids-color-${element!.dataset.token}`).trim() !== '';
  output.textContent = isDefined ? hex(style.backgroundColor) : '';
}

function useRereadKey() {
  const { theme, resolvedMode } = useTheme();
  return `${JSON.stringify(theme)}:${resolvedMode}`;
}

function Swatch({ token }: { token: string }) {
  const rereadWhenThemeChanges = useRereadKey();
  return (
    <div
      key={rereadWhenThemeChanges}
      ref={readSwatch}
      data-token={token}
      className="flex items-center gap-2"
    >
      <span
        data-chip=""
        className="rounded-indicator inset-ring-neutral size-7 shrink-0 inset-ring-1"
        style={{ background: `var(--ids-color-${token})` }}
      />
      <code data-hex="" className="text-caption-c1-regular text-neutral font-mono" />
    </div>
  );
}

function readPair(element: HTMLElement | null) {
  const sample = element?.querySelector<HTMLElement>('[data-sample]');
  const output = element?.querySelector('[data-ratio]');
  if (!sample || !output) return;

  const style = getComputedStyle(sample);
  const lc = lightnessContrast(hex(style.color), hex(style.backgroundColor));
  output.textContent = `Lc ${Math.round(lc)} ${gradeOf(lc)}`;
}

function Pair({
  background,
  foreground,
  kind,
}: {
  background: string;
  foreground: string;
  kind: Pairing[2];
}) {
  const rereadWhenThemeChanges = useRereadKey();
  return (
    <div
      key={rereadWhenThemeChanges}
      ref={readPair}
      data-pair={`${foreground} on ${background}`}
      data-kind={kind}
      className="flex items-center gap-2"
    >
      <span
        data-sample=""
        className="rounded-indicator text-caption-c1-semibold inset-ring-neutral flex h-7 w-12 shrink-0 items-center justify-center inset-ring-1"
        style={{
          background: `var(--ids-color-${background})`,
          color: `var(--ids-color-${foreground})`,
        }}
      >
        {kind === 'mark' ? '■' : 'Aa 가'}
      </span>
      <code data-ratio="" className="text-caption-c1-regular text-neutral font-mono" />
    </div>
  );
}

const columnLabel = cn('text-caption-c1-medium text-neutral');

const familyRow = cn('grid items-center gap-x-4');
const familyColumns = { gridTemplateColumns: `9rem repeat(${IDS_COLOR_FAMILIES.length}, 6.5rem)` };

function FamilyTable() {
  return (
    <div className="flex flex-col gap-4">
      {modes.map((mode) => (
        <div key={mode} className="w-max">
          <IdsProvider.Scope mode={mode} asChild>
            <Card>
              <div className="flex flex-col gap-2">
                <div className={familyRow} style={familyColumns}>
                  <span className={columnLabel}>{mode}</span>
                  {IDS_COLOR_FAMILIES.map((family) => (
                    <span key={family} className={columnLabel}>
                      {family}
                    </span>
                  ))}
                </div>
                {IDS_FAMILY_SLOTS.map((template, index) => (
                  <div key={template} className={familyRow} style={familyColumns}>
                    <span className="text-body-b3-regular font-mono">{slotTemplates[index]}</span>
                    {IDS_COLOR_FAMILIES.map((family) =>
                      template.includes('{family}') || family === 'neutral' ? (
                        <Swatch key={family} token={slotOf(template, family)} />
                      ) : (
                        <span key={family} />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </IdsProvider.Scope>
        </div>
      ))}
    </div>
  );
}

const labSchemes = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
] as const;

const linkSchemes: readonly string[] = ['primary', 'secondary', 'tertiary', 'neutral'];

const isLinkScheme = (scheme: string): scheme is Link.ColorScheme => linkSchemes.includes(scheme);

const labVariants = ['solid', 'soft', 'outline', 'ghost', 'glossy'] as const;

const labMarkVariants = ['solid', 'soft', 'outline'] as const;

const labToday = new CalendarDate(2026, 9, 15);

const labPaletteFamilies = ['neutral', ...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES] as const;

const LAB_CHART_CONFIG = {
  web: { label: '웹' },
  app: { label: '앱' },
  kiosk: { label: '키오스크' },
} satisfies Chart.Config;

const LAB_FRUITS = [
  ['apple', '사과'],
  ['pear', '배'],
  ['grape', '포도'],
] as const;

const LAB_CHART_ROWS = [
  { day: '월', web: 120, app: 80, kiosk: 30 },
  { day: '화', web: 150, app: 95, kiosk: 42 },
  { day: '수', web: 132, app: 110, kiosk: 38 },
];

const issuesOf = (theme: IdsThemeOverrides) =>
  theme.primary ? checkIdsTheme({ ...theme, primary: theme.primary }) : [];

const sourceOf = (family: string, given: readonly string[], status: IdsStatus | undefined) =>
  given.includes(family)
    ? '준 색'
    : IDS_BRAND_FAMILIES.includes(family as (typeof IDS_BRAND_FAMILIES)[number])
      ? 'primary 에서 만듦'
      : typeof status === 'string'
        ? status
        : 'harmonized';

const labPaletteRow = cn('grid items-center gap-x-2');
const labPaletteColumns = {
  gridTemplateColumns: `6rem 8rem 3rem repeat(${SCALE_STEPS.length}, 4.5rem)`,
};

export const Lab: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '툴바의 Primary, Secondary, Tertiary, Neutral, Status 로 테마를 바꾸면 팔레트, 역할, 대비, 컴포넌트가 바로 다시 그려집니다.',
      },
    },
  },
  render: function Render() {
    const { theme } = useTheme();
    const issues = issuesOf(theme);
    const { colors } = resolveColorsOnce(theme);
    const labCalendar = useCalendar({ display: { today: labToday } });

    return (
      <Showcase>
        <Showcase.Section
          title="checkIdsTheme"
          description="IdsProvider 가 개발 모드에서 알리는 목록과 같습니다."
        >
          {issues.length === 0 ? (
            <div className="max-w-xl">
              <Alert colorScheme="success">
                <Alert.Title>문제 없음</Alert.Title>
                <Alert.Description>checkIdsTheme 이 빈 목록을 돌려줍니다.</Alert.Description>
              </Alert>
            </div>
          ) : (
            <div className="max-w-xl">
              <Alert colorScheme="warning">
                <Alert.Title>문제 {issues.length}개</Alert.Title>
                <Alert.Description asChild>
                  <ul className="list-disc pl-4">
                    {issues.map((issue) => (
                      <li key={`${issue.path}:${issue.message}`}>
                        <code className="font-mono">{issue.path}</code> {issue.message}
                      </li>
                    ))}
                  </ul>
                </Alert.Description>
              </Alert>
            </div>
          )}
        </Showcase.Section>
        <Showcase.Section
          title="Palettes"
          description="모드마다 9단계이고, 번호가 클수록 페이지에서 멀어집니다. 1 base, 2 surface, 3 block, 4 soft, 5 선, 6 진한 선, 7 solid, 8 글자, 9 진한 글자. solid 는 그 위 글자 대비로 고르므로 6 보다 페이지에 가까울 수 있습니다."
        >
          <div className="w-max">
            <Card data-lab-palettes="">
              <div className="flex flex-col gap-2">
                <div className={labPaletteRow} style={labPaletteColumns}>
                  <span className={columnLabel}>계열</span>
                  <span className={columnLabel}>출처</span>
                  <span className={columnLabel}>모드</span>
                  {SCALE_STEPS.map((step) => (
                    <span key={step} className={columnLabel}>
                      {step}
                    </span>
                  ))}
                </div>
                {colors &&
                  labPaletteFamilies.flatMap((family) =>
                    modes.map((mode) => {
                      const scale =
                        family === 'neutral' ? colors.neutral[mode] : colors.palettes[family][mode];
                      return (
                        <div
                          key={`${family}-${mode}`}
                          className={labPaletteRow}
                          style={labPaletteColumns}
                        >
                          <span className="text-body-b3-regular font-mono">{family}</span>
                          <span className="text-caption-c1-regular text-neutral">
                            {family === 'neutral'
                              ? (theme.neutral ?? 'pure')
                              : sourceOf(family, colors.given, theme.status)}
                          </span>
                          <span className="text-caption-c1-regular text-neutral">{mode}</span>
                          {scale.map((color, index) => (
                            <div key={SCALE_STEPS[index]} className="flex flex-col gap-1">
                              <span
                                className="rounded-indicator inset-ring-neutral h-7 w-full inset-ring-1"
                                style={{ background: color }}
                              />
                              <code className="text-caption-c1-regular text-neutral font-mono">
                                {color}
                              </code>
                            </div>
                          ))}
                        </div>
                      );
                    }),
                  )}
              </div>
            </Card>
          </div>
        </Showcase.Section>
        <Showcase.Section
          title="Families × Roles"
          description="배경은 쓰임새(bg-base, bg-surface, bg-block, bg-X-soft, bg-X-solid), 선과 글자는 세기(border-X, border-X-strong, text-X, text-X-strong)로 부릅니다. base, surface, block 은 neutral 만 가집니다. 배경 위 글자 text-on-{배경} 은 provider 가 APCA 로 골라 둡니다."
        >
          <FamilyTable />
        </Showcase.Section>
        <Showcase.Section
          title="Contrast"
          description="같이 쓰는 짝의 APCA 대비(Lc)입니다. text-on 과 text-X-strong 은 hover, press 층 아래에서도 Lc 75, text-X 는 Lc 60, border-X-strong 같은 표시는 Lc 45 이상이어야 합니다."
        >
          <div className="flex flex-wrap gap-4">
            {modes.map((mode) => (
              <div key={mode} className="w-max">
                <IdsProvider.Scope mode={mode} asChild>
                  <Card>
                    <div className="flex flex-col gap-2">
                      <span className={columnLabel}>{mode}</span>
                      {pairs.map(([background, foreground, kind]) => (
                        <div
                          key={`${foreground}:${background}`}
                          className="grid grid-cols-[17rem_auto] items-center gap-3"
                        >
                          <span className="text-body-b3-regular font-mono">
                            {foreground} / {background}
                          </span>
                          <Pair background={background} foreground={foreground} kind={kind} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </IdsProvider.Scope>
              </div>
            ))}
          </div>
        </Showcase.Section>
        {modes.map((mode) => (
          <Showcase.Section key={mode} title={`Components · ${mode}`}>
            <div className="w-full max-w-6xl">
              <IdsProvider.Scope mode={mode} asChild>
                <Card>
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                      <span className={columnLabel}>Button · IconButton · Toggle</span>
                      {labSchemes.map((colorScheme) => (
                        <div key={colorScheme} className="flex flex-wrap items-center gap-2">
                          <span className="text-caption-c1-regular text-neutral w-20 font-mono">
                            {colorScheme}
                          </span>
                          {labVariants.map((variant) => (
                            <Button key={variant} colorScheme={colorScheme} variant={variant}>
                              {variant}
                            </Button>
                          ))}
                          <IconButton
                            colorScheme={colorScheme}
                            icon={<PlusIcon />}
                            aria-label={`${colorScheme} 추가`}
                          />
                          <Toggle colorScheme={colorScheme} variant="outline" defaultPressed>
                            켜짐
                          </Toggle>
                          <Toggle colorScheme={colorScheme} variant="soft" defaultPressed>
                            켜짐
                          </Toggle>
                          <IconToggle
                            colorScheme={colorScheme}
                            variant="solid"
                            defaultPressed
                            icon={<StarIcon />}
                            aria-label={`${colorScheme} 별표`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <span className={columnLabel}>Badge · Chip · Link</span>
                        {labSchemes.map((colorScheme) => (
                          <div key={colorScheme} className="flex flex-wrap items-center gap-2">
                            {labMarkVariants.map((variant) => (
                              <Chip key={variant} variant={variant} colorScheme={colorScheme}>
                                {colorScheme}
                              </Chip>
                            ))}
                            {labMarkVariants.map((variant) => (
                              <Chip key={variant} variant={variant} colorScheme={colorScheme}>
                                칩
                              </Chip>
                            ))}
                            {isLinkScheme(colorScheme) && (
                              <Link colorScheme={colorScheme} href="#lab">
                                링크
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={columnLabel}>Alert · Progress</span>
                        {labSchemes.map((colorScheme) => (
                          <div key={colorScheme} className="grid grid-cols-[1fr_1fr_8rem] gap-2">
                            <Alert colorScheme={colorScheme} variant="soft">
                              <Alert.Title>{colorScheme}</Alert.Title>
                            </Alert>
                            <Alert colorScheme={colorScheme} variant="solid">
                              <Alert.Title>{colorScheme}</Alert.Title>
                            </Alert>
                            <div className="self-center">
                              <Progress
                                value={60}
                                colorScheme={colorScheme}
                                aria-label={`${colorScheme} 진행`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="flex flex-col gap-4">
                        <span className={columnLabel}>Form</span>
                        <Field>
                          <Field.Label>이름</Field.Label>
                          <TextField defaultValue="인포팀" data-1p-ignore data-lpignore="true" />
                        </Field>
                        <Field invalid>
                          <Field.Label>닉네임</Field.Label>
                          <TextField defaultValue="a" data-1p-ignore data-lpignore="true" />
                          <Field.Error>두 글자 이상 적어 주세요.</Field.Error>
                        </Field>
                        <Select aria-label={`과일 ${mode}`} defaultValue="pear">
                          {LAB_FRUITS.map(([value, label]) => (
                            <Select.Item key={value} value={value}>
                              {label}
                            </Select.Item>
                          ))}
                        </Select>
                        <div className="flex flex-wrap items-center gap-4">
                          <Checkbox defaultChecked aria-label={`체크 ${mode}`} />
                          <Switch defaultChecked aria-label={`스위치 ${mode}`} />
                          <RadioGroup<'a' | 'b'>
                            orientation="horizontal"
                            defaultValue="b"
                            aria-label={`선택 ${mode}`}
                          >
                            {({ Item }) =>
                              (['a', 'b'] as const).map((value) => (
                                <Label key={value}>
                                  <Item value={value} />
                                  {value}
                                </Label>
                              ))
                            }
                          </RadioGroup>
                        </div>
                        <Slider defaultValue={40} aria-label={`슬라이더 ${mode}`} />
                        <Rating defaultValue={3.5} step={0.5} aria-label={`별점 ${mode}`} />
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className={columnLabel}>Navigation</span>
                        <Tabs defaultValue="overview">
                          <Tabs.List aria-label={`탭 ${mode}`}>
                            <Tabs.Trigger value="overview">개요</Tabs.Trigger>
                            <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
                          </Tabs.List>
                          <Tabs.Content value="overview">
                            가볍고 오래 가는 키보드입니다.
                          </Tabs.Content>
                          <Tabs.Content value="reviews">리뷰 128개.</Tabs.Content>
                        </Tabs>
                        <Tabs defaultValue="overview" variant="pill">
                          <Tabs.List aria-label={`알약 탭 ${mode}`}>
                            <Tabs.Trigger value="overview">개요</Tabs.Trigger>
                            <Tabs.Trigger value="reviews">리뷰</Tabs.Trigger>
                          </Tabs.List>
                          <Tabs.Content value="overview">개요 내용.</Tabs.Content>
                          <Tabs.Content value="reviews">리뷰 내용.</Tabs.Content>
                        </Tabs>
                        <Pagination
                          defaultPage={3}
                          pageCount={7}
                          getHref={(page) => `#page-${page}`}
                          aria-label={`페이지 ${mode}`}
                        />
                        <Breadcrumb aria-label={`위치 ${mode}`}>
                          <Breadcrumb.List>
                            <Breadcrumb.Item>
                              <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                              <Breadcrumb.Page>설정</Breadcrumb.Page>
                            </Breadcrumb.Item>
                          </Breadcrumb.List>
                        </Breadcrumb>
                        <Stepper aria-label="진행 단계" defaultValue={1}>
                          <Stepper.Item>
                            <Stepper.Title>계정</Stepper.Title>
                          </Stepper.Item>
                          <Stepper.Item>
                            <Stepper.Title>프로필</Stepper.Title>
                          </Stepper.Item>
                          <Stepper.Item>
                            <Stepper.Title>완료</Stepper.Title>
                          </Stepper.Item>
                        </Stepper>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className={columnLabel}>Data · Feedback</span>
                        <Card>
                          <Card.Header>
                            <Card.Title>새 프로젝트</Card.Title>
                            <Card.Description>팀과 함께 쓰는 공간을 만듭니다.</Card.Description>
                          </Card.Header>
                          <Card.Footer>
                            <Button variant="outline">취소</Button>
                            <Button>만들기</Button>
                          </Card.Footer>
                        </Card>
                        <Item variant="outline">
                          <Item.Media>
                            <Avatar name="김철수" />
                          </Item.Media>
                          <Item.Content>
                            <Item.Title>김철수</Item.Title>
                            <Item.Description>디자인 팀</Item.Description>
                          </Item.Content>
                        </Item>
                        <div className="flex items-center gap-3">
                          <Spinner aria-label={`불러오는 중 ${mode}`} />
                          <Skeleton loading>
                            <p className="text-body-b3-regular">학기 공지</p>
                          </Skeleton>
                          <Kbd keys="Mod+K" platform="mac" />
                        </div>
                        <Calendar
                          calendar={labCalendar}
                          defaultValue={labToday.add({ days: 3 })}
                          aria-label={`달력 ${mode}`}
                        />
                      </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <Chart config={LAB_CHART_CONFIG}>
                        <Chart.Title>막대</Chart.Title>
                        <BarChart data={LAB_CHART_ROWS}>
                          <XAxis dataKey="day" tickLine={false} axisLine={false} />
                          <Bar dataKey="web" radius={4} />
                          <Bar dataKey="app" radius={4} />
                          <Bar dataKey="kiosk" radius={4} />
                          <Chart.Legend />
                        </BarChart>
                      </Chart>
                      <Chart config={LAB_CHART_CONFIG}>
                        <Chart.Title>면</Chart.Title>
                        <AreaChart data={LAB_CHART_ROWS}>
                          <XAxis dataKey="day" tickLine={false} axisLine={false} />
                          <Area dataKey="web" type="monotone" />
                          <Area dataKey="app" type="monotone" />
                          <Area dataKey="kiosk" type="monotone" />
                          <Chart.Legend />
                        </AreaChart>
                      </Chart>
                    </div>
                  </div>
                </Card>
              </IdsProvider.Scope>
            </div>
          </Showcase.Section>
        ))}
      </Showcase>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toContain('문제 없음');
    const rows = canvasElement.querySelectorAll('[data-lab-palettes] code');
    await expect(rows.length).toBe(SCALE_STEPS.length * labPaletteFamilies.length * modes.length);
    for (const row of rows) await expect(row.textContent).toMatch(/^#[0-9a-f]{6}$/);

    const outputs = [...canvasElement.querySelectorAll('[data-ratio]')];
    await expect(outputs.length).toBe(pairs.length * modes.length);
    for (const output of outputs)
      await expect(output.textContent).toMatch(/^Lc \d+ (text|accent|mark|Fail)$/);
  },
};
