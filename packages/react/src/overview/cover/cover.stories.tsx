import {
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BellIcon,
  BookmarkIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
  HeartIcon,
  InboxIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CalendarDate, Time } from '@internationalized/date';
import { noop } from 'es-toolkit';

import enums from '../../../../core/tokens/enums.json';
import { Button } from '../../components/action/button';
import { ButtonGroup } from '../../components/action/button-group';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Toggle } from '../../components/action/toggle';
import { ToggleGroup } from '../../components/action/toggle-group';
import { Accordion } from '../../components/data/accordion';
import { Avatar } from '../../components/data/avatar';
import { AvatarGroup } from '../../components/data/avatar-group';
import { Badge } from '../../components/data/badge';
import { Calendar } from '../../components/data/calendar';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { ColorPicker } from '../../components/data/color-picker';
import { Empty } from '../../components/data/empty';
import { Item } from '../../components/data/item';
import { QRCode } from '../../components/data/qr-code';
import { Table } from '../../components/data/table';
import { TimePicker } from '../../components/data/time-picker';
import { Alert } from '../../components/feedback/alert';
import { Progress } from '../../components/feedback/progress';
import { Skeleton } from '../../components/feedback/skeleton';
import { Spinner } from '../../components/feedback/spinner';
import { Checkbox } from '../../components/form/checkbox';
import { ChipField } from '../../components/form/chip-field';
import { Field } from '../../components/form/field';
import { NumberField } from '../../components/form/number-field';
import { OTPField } from '../../components/form/otp-field';
import { PasswordField } from '../../components/form/password-field';
import { RadioGroup } from '../../components/form/radio-group';
import { Rating } from '../../components/form/rating';
import { Select } from '../../components/form/select';
import { Slider } from '../../components/form/slider';
import { Switch } from '../../components/form/switch';
import { TextArea } from '../../components/form/text-area';
import { TextField } from '../../components/form/text-field';
import { Splitter } from '../../components/layout/splitter';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Pagination } from '../../components/navigation/pagination';
import { Stepper } from '../../components/navigation/stepper';
import { Tabs } from '../../components/navigation/tabs';
import { Kbd } from '../../components/typography/kbd';
import { Label } from '../../components/typography/label';
import { IdsProvider } from '../../components/utility/ids-provider';
import { cn } from '../../utils';

import type { IdsColor } from '../../tokens/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overview/Cover',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const themes = enums.ids.color.values.$value as IdsColor[];

const halves = {
  dark: cn(''),
  light: cn('[clip-path:circle(71%_at_0_0)]'),
};

const column = cn('flex shrink-0 flex-col gap-4');

const tile = cn(
  'shrink-0 shadow-[0_24px_48px_-24px_rgb(15_23_42/0.24)]',
  'dark:bg-(--ids-color-muted) dark:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.8)]',
);

const frame = cn(
  'shrink-0 overflow-hidden rounded-container bg-(--ids-color-surface) inset-ring-1 inset-ring-(--ids-color-border)',
  'shadow-[0_24px_48px_-24px_rgb(15_23_42/0.24)] dark:bg-(--ids-color-muted) dark:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.8)]',
);

const row = cn('flex items-center justify-between gap-3 text-body-b3-medium');

const option = cn('inline-flex items-center gap-2 text-body-b3-medium');

const hint = cn('text-caption-c1-regular text-(--ids-color-on-muted)');

export const Cover: Story = {
  render: () => (
    <section className="relative h-dvh min-h-[720px] overflow-hidden">
      <h1 className="sr-only">IDS, GIST Infoteam Design System</h1>

      {(['dark', 'light'] as const).map((mode) => (
        <IdsProvider
          key={mode}
          mode={mode}
          color="blue"
          inert
          aria-hidden
          className={cn(
            'absolute inset-0 overflow-hidden bg-(--ids-color-muted) text-(--ids-color-on-surface) dark:bg-(--ids-color-surface)',
            halves[mode],
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center gap-4">
            <div className={cn(column, 'w-[300px] -translate-y-24')}>
              <IdsProvider color="amber" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>평점 분포</Card.Title>
                    <Card.Description>후기 312개</Card.Description>
                  </Card.Header>
                  <Progress value={78}>
                    <Progress.Label>5점</Progress.Label>
                    <Progress.Value />
                  </Progress>
                  <Progress value={15}>
                    <Progress.Label>4점</Progress.Label>
                    <Progress.Value />
                  </Progress>
                  <Progress value={7}>
                    <Progress.Label>3점 이하</Progress.Label>
                    <Progress.Value />
                  </Progress>
                </Card>
              </IdsProvider>

              <IdsProvider color="lime" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>동아리</Card.Title>
                  </Card.Header>
                  <Table aria-label="동아리">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>이름</Table.Head>
                        <Table.Head>인원</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>인포팀</Table.Cell>
                        <Table.Cell>42</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>밴드부</Table.Cell>
                        <Table.Cell>18</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          사진부 <Badge content="모집 중" variant="soft" colorScheme="primary" />
                        </Table.Cell>
                        <Table.Cell>25</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Card>
              </IdsProvider>

              <IdsProvider color="blue" asChild>
                <Card size="tiny" className={tile}>
                  <Accordion type="single" defaultValue="when">
                    <Accordion.Item value="when">
                      <Accordion.Trigger>셔틀은 언제 다니나요?</Accordion.Trigger>
                      <Accordion.Content>평일 30분마다 다닙니다.</Accordion.Content>
                    </Accordion.Item>
                    <Accordion.Item value="where">
                      <Accordion.Trigger>어디서 타나요?</Accordion.Trigger>
                      <Accordion.Content>학생회관 앞에서 탑니다.</Accordion.Content>
                    </Accordion.Item>
                  </Accordion>
                </Card>
              </IdsProvider>

              <IdsProvider color="emerald" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row flex-wrap gap-2')}>
                  <Chip defaultSelected>전공</Chip>
                  <Chip>교양</Chip>
                  <Chip defaultSelected>영어 강의</Chip>
                  <Chip>온라인</Chip>
                </Card>
              </IdsProvider>

              <IdsProvider color="violet" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>회원가입</Card.Title>
                    <Card.Description>1분이면 끝나요</Card.Description>
                  </Card.Header>
                  <Field>
                    <Field.Label>이름</Field.Label>
                    <TextField defaultValue="김지수" data-1p-ignore data-lpignore="true" />
                  </Field>
                  <Field>
                    <Field.Label>학번</Field.Label>
                    <TextField defaultValue="20265123" data-1p-ignore data-lpignore="true" />
                  </Field>
                  <Label className={option}>
                    <Checkbox defaultChecked />
                    약관에 동의합니다
                  </Label>
                  <Button>가입하기</Button>
                </Card>
              </IdsProvider>

              <IdsProvider color="amber" asChild>
                <Card size="tiny" className={tile}>
                  <div className={row}>
                    <span className="text-headline-h4-bold">4.9</span>
                    <Rating aria-label="동아리 평점" defaultValue={5} />
                  </div>
                  <p className={hint}>후기 312개</p>
                </Card>
              </IdsProvider>

              <IdsProvider color="rose" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>택배</Card.Title>
                    <Card.Description>생활관 A동</Card.Description>
                  </Card.Header>
                  <Stepper progress={false} orientation="vertical" size="tiny" aria-label="택배">
                    <Stepper.Item completed>
                      <Stepper.Title>집하</Stepper.Title>
                      <Stepper.Description>9월 28일</Stepper.Description>
                    </Stepper.Item>
                    <Stepper.Item completed>
                      <Stepper.Title>배송 중</Stepper.Title>
                      <Stepper.Description>9월 29일</Stepper.Description>
                    </Stepper.Item>
                    <Stepper.Item>
                      <Stepper.Title>도착</Stepper.Title>
                      <Stepper.Description>오늘 예정</Stepper.Description>
                    </Stepper.Item>
                  </Stepper>
                </Card>
              </IdsProvider>

              <IdsProvider color="sky" asChild>
                <Card size="tiny" className={tile}>
                  <Empty size="tiny">
                    <Empty.Media>
                      <MagnifyingGlassIcon />
                    </Empty.Media>
                    <Empty.Title>검색 결과가 없어요</Empty.Title>
                    <Empty.Description>다른 낱말로 찾아 보세요.</Empty.Description>
                  </Empty>
                </Card>
              </IdsProvider>

              <IdsProvider color="red" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row gap-2')}>
                  <Button size="tiny" className="flex-1">
                    삭제
                  </Button>
                  <Button size="tiny" variant="soft" className="flex-1">
                    신고
                  </Button>
                  <Button size="tiny" variant="ghost">
                    취소
                  </Button>
                </Card>
              </IdsProvider>

              <IdsProvider color="indigo" asChild>
                <Card size="tiny" className={tile}>
                  <Label className={row}>
                    위치 공유
                    <Switch defaultChecked />
                  </Label>
                  <Label className={row}>
                    방해 금지
                    <Switch />
                  </Label>
                </Card>
              </IdsProvider>

              <IdsProvider color="fuchsia" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>축제 공연 투표</Card.Title>
                    <Card.Description>내일 18시 마감</Card.Description>
                  </Card.Header>
                  <RadioGroup<string> aria-label="축제 공연" defaultValue="band">
                    {({ Item: Radio }) => (
                      <>
                        <Label className={option}>
                          <Radio value="band" />
                          밴드 공연
                        </Label>
                        <Label className={option}>
                          <Radio value="dance" />
                          댄스 공연
                        </Label>
                      </>
                    )}
                  </RadioGroup>
                  <Button size="tiny">투표하기</Button>
                </Card>
              </IdsProvider>

              <IdsProvider color="violet" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row flex-wrap gap-2')}>
                  <Badge content="새 기능" colorScheme="primary" />
                  <Badge content="베타" variant="soft" colorScheme="primary" />
                  <Badge content="안정" variant="outline" colorScheme="success" />
                  <Badge content="주의" variant="soft" colorScheme="warning" />
                  <Badge content="중단" variant="soft" colorScheme="danger" />
                </Card>
              </IdsProvider>
            </div>

            <div className={cn(column, 'w-[300px] translate-y-10')}>
              <IdsProvider color="teal" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>셔틀 시간표</Card.Title>
                  </Card.Header>
                  <Table aria-label="셔틀 시간표">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>출발</Table.Head>
                        <Table.Head>도착</Table.Head>
                        <Table.Head>노선</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>08:30</Table.Cell>
                        <Table.Cell>08:55</Table.Cell>
                        <Table.Cell>송정역</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>09:00</Table.Cell>
                        <Table.Cell>09:20</Table.Cell>
                        <Table.Cell>유스퀘어</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          09:30 <Badge content="곧" variant="soft" colorScheme="primary" />
                        </Table.Cell>
                        <Table.Cell>09:55</Table.Cell>
                        <Table.Cell>송정역</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Card>
              </IdsProvider>

              <IdsProvider color="fuchsia" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>강조 색</Card.Title>
                  </Card.Header>
                  <ColorPicker
                    defaultValue="#D946EF"
                    swatches={['#EF4444', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899']}
                    aria-label="강조 색"
                  />
                </Card>
              </IdsProvider>

              <IdsProvider color="amber" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>인포팀 신입 모집</Card.Title>
                    <Card.Description>10월 12일까지</Card.Description>
                  </Card.Header>
                  <AvatarGroup aria-label="지원자" max={4}>
                    <Avatar name="박서연" />
                    <Avatar name="이도윤" />
                    <Avatar name="최하준" />
                    <Avatar name="정예린" />
                    <Avatar name="한지우" />
                  </AvatarGroup>
                  <div className="flex gap-2">
                    <Button size="tiny" className="flex-1">
                      지원하기
                    </Button>
                    <Button size="tiny" variant="outline">
                      공유
                    </Button>
                  </div>
                </Card>
              </IdsProvider>

              <IdsProvider color="sky" asChild>
                <Card size="tiny" className={tile}>
                  <Item.Group variant="separated" aria-label="파일" size="tiny">
                    <Item>
                      <Item.Media variant="soft">
                        <DocumentTextIcon />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>과제1.pdf</Item.Title>
                        <Item.Description>2.4MB</Item.Description>
                      </Item.Content>
                    </Item>
                    <Item>
                      <Item.Media variant="soft">
                        <PhotoIcon />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>축제 포스터.png</Item.Title>
                        <Item.Description>5.1MB</Item.Description>
                      </Item.Content>
                    </Item>
                    <Item>
                      <Item.Media variant="soft">
                        <FolderIcon />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>발표 자료</Item.Title>
                        <Item.Description>파일 12개</Item.Description>
                      </Item.Content>
                    </Item>
                  </Item.Group>
                </Card>
              </IdsProvider>

              <IdsProvider color="cyan" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>서비스 소개</Card.Title>
                  </Card.Header>
                  <TextArea
                    rows={3}
                    maxLength={200}
                    defaultValue="IDS 로 만든 첫 서비스를 소개합니다."
                    aria-label="서비스 소개"
                  >
                    <TextArea.Input />
                    <TextArea.Count />
                  </TextArea>
                </Card>
              </IdsProvider>

              <IdsProvider color="red" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>알림</Card.Title>
                    <Card.Action>
                      <Badge content={3} aria-label="새 알림 3개" />
                    </Card.Action>
                  </Card.Header>
                  <Item.Group aria-label="알림" size="tiny">
                    <Item>
                      <Item.Media>
                        <Avatar name="박서연" size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>박서연 님이 댓글을 남겼어요</Item.Title>
                        <Item.Description>3분 전</Item.Description>
                      </Item.Content>
                    </Item>
                    <Item>
                      <Item.Media>
                        <Avatar name="이도윤" size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>이도윤 님이 글을 좋아해요</Item.Title>
                        <Item.Description>1시간 전</Item.Description>
                      </Item.Content>
                    </Item>
                  </Item.Group>
                </Card>
              </IdsProvider>

              <IdsProvider color="orange" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row items-center gap-2')}>
                  <ButtonGroup variant="outline" aria-label="글 관리" size="tiny">
                    <Button>보관</Button>
                    <Button>공유</Button>
                    <Button>신고</Button>
                  </ButtonGroup>
                  <IconButton variant="glossy" size="tiny" aria-label="새 글" icon={<PlusIcon />} />
                </Card>
              </IdsProvider>

              <Card size="tiny" className={tile}>
                <Select aria-label="학기" defaultValue="2026-2">
                  <Select.Item value="2026-1">2026년 1학기</Select.Item>
                  <Select.Item value="2026-2">2026년 2학기</Select.Item>
                </Select>
              </Card>

              <Alert colorScheme="info" className="shrink-0">
                <Alert.Title>IDS 0.2 가 나왔어요</Alert.Title>
                <Alert.Description>17가지 색과 새 컴포넌트</Alert.Description>
              </Alert>

              <IdsProvider color="green" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>학점 계산</Card.Title>
                  </Card.Header>
                  <div className={row}>
                    이수 학점
                    <NumberField
                      aria-label="이수 학점"
                      defaultValue={96}
                      size="tiny"
                      className="w-24"
                    >
                      <NumberField.Decrement />
                      <NumberField.Input className="text-center" />
                      <NumberField.Increment />
                    </NumberField>
                  </div>
                  <Progress value={53}>
                    <Progress.Label>졸업까지</Progress.Label>
                    <Progress.Value />
                  </Progress>
                </Card>
              </IdsProvider>

              <IdsProvider color="rose" asChild>
                <Card size="tiny" className={cn(tile, 'items-center')}>
                  <Calendar
                    defaultMonth={new CalendarDate(2026, 12, 1)}
                    defaultValue={new CalendarDate(2026, 12, 24)}
                  />
                </Card>
              </IdsProvider>
            </div>

            <div className={cn(column, 'w-[320px] -translate-y-16')}>
              <IdsProvider color="lime" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>택시 합승</Card.Title>
                    <Card.Description>기숙사에서 광주송정역, 17:40</Card.Description>
                  </Card.Header>
                  <AvatarGroup aria-label="합승 인원" max={3}>
                    <Avatar name="한지우" />
                    <Avatar name="오세린" />
                  </AvatarGroup>
                  <div className="flex gap-2">
                    <Button size="tiny" className="flex-1">
                      함께 타기
                    </Button>
                    <Button size="tiny" variant="ghost">
                      채팅
                    </Button>
                  </div>
                </Card>
              </IdsProvider>

              <Alert colorScheme="info" className="shrink-0">
                <Alert.Title>오늘은 점호가 없어요</Alert.Title>
                <Alert.Description>생활관 운영팀</Alert.Description>
              </Alert>

              <Alert colorScheme="success" className="shrink-0">
                <Alert.Title>좌석이 예약되었습니다</Alert.Title>
                <Alert.Description>중앙도서관 3층 A-12</Alert.Description>
              </Alert>

              <IdsProvider color="teal" asChild>
                <Card size="tiny" className={tile}>
                  <Table aria-label="준비 상태">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>기준</Table.Head>
                        <Table.Head>상태</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>접근성</Table.Cell>
                        <Table.Cell>
                          <Badge content="완료" variant="soft" colorScheme="success" />
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>다크 모드</Table.Cell>
                        <Table.Cell>
                          <Badge content="완료" variant="soft" colorScheme="success" />
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>17가지 색</Table.Cell>
                        <Table.Cell>
                          <Badge content="완료" variant="soft" colorScheme="success" />
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Flutter</Table.Cell>
                        <Table.Cell>
                          <Badge content="진행 중" variant="soft" colorScheme="warning" />
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Card>
              </IdsProvider>

              <IdsProvider color="teal" asChild>
                <Card size="tiny" className={tile}>
                  <Accordion type="single" defaultValue="free">
                    <Accordion.Item value="free">
                      <Accordion.Trigger>IDS 는 무료인가요?</Accordion.Trigger>
                      <Accordion.Content>MIT 라이선스로 누구나 씁니다.</Accordion.Content>
                    </Accordion.Item>
                    <Accordion.Item value="flutter">
                      <Accordion.Trigger>Flutter 도 되나요?</Accordion.Trigger>
                      <Accordion.Content>같은 토큰으로 만듭니다.</Accordion.Content>
                    </Accordion.Item>
                  </Accordion>
                </Card>
              </IdsProvider>

              <IdsProvider
                color="cyan"
                className="h-[600px] shrink-0 overflow-hidden rounded-[48px] border-[10px] border-(--ids-color-on-surface) bg-(--ids-color-surface) p-5 shadow-[0_32px_64px_-24px_rgb(15_23_42/0.4)] dark:border-(--ids-color-muted-active)"
              >
                <div className="mx-auto mb-4 h-6 w-24 rounded-full bg-(--ids-color-on-surface) dark:bg-(--ids-color-muted-active)" />
                <p className="text-caption-c1-medium text-(--ids-color-on-muted)">gistory</p>
                <p className="text-headline-h5-bold mb-4">최근 활동</p>
                <Stepper progress={false} orientation="vertical" size="tiny" aria-label="최근 활동">
                  <Stepper.Item completed>
                    <Stepper.Title>Carousel 을 합쳤어요</Stepper.Title>
                    <Stepper.Description>방금 전</Stepper.Description>
                  </Stepper.Item>
                  <Stepper.Item completed>
                    <Stepper.Title>배포 성공</Stepper.Title>
                    <Stepper.Description>12분 전</Stepper.Description>
                  </Stepper.Item>
                  <Stepper.Item>
                    <Stepper.Title>리뷰를 남겼어요</Stepper.Title>
                    <Stepper.Description>1시간 전</Stepper.Description>
                    <Stepper.Body>
                      <Card variant="soft" size="tiny" className="text-caption-c1-regular mt-2">
                        모서리 손잡이가 예뻐요
                      </Card>
                    </Stepper.Body>
                  </Stepper.Item>
                  <Stepper.Item error>
                    <Stepper.Title>시각 테스트 실패</Stepper.Title>
                    <Stepper.Description>어제</Stepper.Description>
                  </Stepper.Item>
                </Stepper>
              </IdsProvider>

              <IdsProvider color="pink" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>셔틀 노선</Card.Title>
                  </Card.Header>
                  <RadioGroup<string> aria-label="셔틀 노선" defaultValue="station">
                    {({ Item: Radio }) => (
                      <>
                        <Label className={option}>
                          <Radio value="campus" />
                          교내 순환
                        </Label>
                        <Label className={option}>
                          <Radio value="station" />
                          광주송정역
                        </Label>
                        <Label className={option}>
                          <Radio value="terminal" />
                          유스퀘어
                        </Label>
                      </>
                    )}
                  </RadioGroup>
                </Card>
              </IdsProvider>

              <IdsProvider color="orange" asChild>
                <Card size="tiny" className={tile}>
                  <div className={row}>
                    <span className="text-headline-h4-bold">4.8</span>
                    <Rating aria-label="강의 평점" defaultValue={5} />
                  </div>
                  <p className={hint}>리뷰 1,204개</p>
                </Card>
              </IdsProvider>

              <Card size="tiny" className={cn(tile, 'flex-row items-center gap-3')}>
                <Skeleton shape="circle" />
                <Skeleton lines={2} className="text-body-b3-regular flex-1" />
              </Card>

              <IdsProvider color="amber" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>대출 중인 책</Card.Title>
                  </Card.Header>
                  <Item.Group variant="bordered" aria-label="대출 중인 책" size="tiny">
                    <Item>
                      <Item.Content>
                        <Item.Title>클린 코드</Item.Title>
                        <Item.Description>10월 3일 반납</Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <Badge content="D-3" variant="soft" colorScheme="warning" />
                      </Item.Actions>
                    </Item>
                    <Item>
                      <Item.Content>
                        <Item.Title>디자인의 디자인</Item.Title>
                        <Item.Description>10월 9일 반납</Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <Button size="tiny" variant="soft">
                          연장
                        </Button>
                      </Item.Actions>
                    </Item>
                  </Item.Group>
                </Card>
              </IdsProvider>

              <IdsProvider color="indigo" asChild>
                <Card size="tiny" className={tile}>
                  <div className={row}>
                    밝기
                    <span className={hint}>80%</span>
                  </div>
                  <Slider aria-label="밝기" defaultValue={80} />
                  <div className={row}>
                    음량
                    <span className={hint}>35%</span>
                  </div>
                  <Slider aria-label="음량" defaultValue={35} />
                </Card>
              </IdsProvider>
            </div>

            <div className="grid h-full w-[840px] shrink-0 grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4">
              <div className="flex items-end gap-4">
                <div className={cn(column, 'w-[300px]')}>
                  <IdsProvider color="blue" asChild>
                    <Card size="tiny" className={tile}>
                      <Card.Header>
                        <Card.Title>학생회비 납부</Card.Title>
                        <Card.Description>2026년 2학기</Card.Description>
                      </Card.Header>
                      <Select aria-label="결제 수단" defaultValue="card">
                        <Select.Item value="card">신용카드</Select.Item>
                        <Select.Item value="transfer">계좌 이체</Select.Item>
                      </Select>
                      <Button>15,000원 결제</Button>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="purple" asChild>
                    <Card size="tiny" className={tile}>
                      <Empty size="tiny">
                        <Empty.Media>
                          <KeyIcon />
                        </Empty.Media>
                        <Empty.Title>분실물이 없어요</Empty.Title>
                        <Empty.Description>잃어버린 물건을 등록해 보세요.</Empty.Description>
                        <Empty.Actions>
                          <Button size="tiny" variant="soft">
                            등록하기
                          </Button>
                        </Empty.Actions>
                      </Empty>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="emerald" asChild>
                    <Card size="tiny" className={tile}>
                      <p className={hint}>이번 주 방문자</p>
                      <div className="flex items-end justify-between">
                        <p className="text-headline-h3-bold">12,840</p>
                        <Badge content="+18%" variant="soft" colorScheme="success" />
                      </div>
                      <Progress value={64} aria-label="목표 대비 방문자" />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="sky" asChild>
                    <Card size="tiny" className={tile}>
                      <Tabs defaultValue="notice">
                        <Tabs.List aria-label="게시판">
                          <Tabs.Trigger value="all">전체</Tabs.Trigger>
                          <Tabs.Trigger value="notice">공지</Tabs.Trigger>
                          <Tabs.Trigger value="event">행사</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="all">전체 글</Tabs.Content>
                        <Tabs.Content value="notice">
                          <Item.Group aria-label="공지" size="tiny">
                            <Item>
                              <Item.Content>
                                <Item.Title>기숙사 점호 안내</Item.Title>
                                <Item.Description>생활관 운영팀</Item.Description>
                              </Item.Content>
                              <Item.Actions>
                                <Badge content="새 글" variant="soft" colorScheme="primary" />
                              </Item.Actions>
                            </Item>
                            <Item>
                              <Item.Content>
                                <Item.Title>축제 부스 모집</Item.Title>
                                <Item.Description>총학생회</Item.Description>
                              </Item.Content>
                            </Item>
                          </Item.Group>
                        </Tabs.Content>
                        <Tabs.Content value="event">행사 글</Tabs.Content>
                      </Tabs>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="green" asChild>
                    <Card size="tiny" className={tile}>
                      <Card.Header>
                        <Card.Title>오늘의 학식</Card.Title>
                        <Card.Description>9월 30일 점심</Card.Description>
                        <Card.Action>
                          <Badge content={2} aria-label="새 메뉴 2개">
                            <IconButton variant="ghost" aria-label="알림" icon={<BellIcon />} />
                          </Badge>
                        </Card.Action>
                      </Card.Header>
                      <Item.Group variant="bordered" aria-label="식당" size="tiny">
                        <Item>
                          <Item.Media variant="soft">
                            <BuildingStorefrontIcon />
                          </Item.Media>
                          <Item.Content>
                            <Item.Title>제1학생식당</Item.Title>
                            <Item.Description>돈까스 정식</Item.Description>
                          </Item.Content>
                          <Item.Actions>5,000원</Item.Actions>
                        </Item>
                        <Item>
                          <Item.Media variant="soft">
                            <CakeIcon />
                          </Item.Media>
                          <Item.Content>
                            <Item.Title>제2학생식당</Item.Title>
                            <Item.Description>비빔밥</Item.Description>
                          </Item.Content>
                          <Item.Actions>4,500원</Item.Actions>
                        </Item>
                      </Item.Group>
                    </Card>
                  </IdsProvider>
                </div>

                <div className={cn(column, 'w-[260px]')}>
                  <IdsProvider color="sky" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row flex-wrap gap-2')}>
                      <Chip defaultSelected>중간고사</Chip>
                      <Chip>퀴즈</Chip>
                      <Chip defaultSelected>기말고사</Chip>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="red" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row items-center justify-between')}>
                      <IconButton aria-label="좋아요" icon={<HeartIcon />} />
                      <IconButton variant="soft" aria-label="공유" icon={<ShareIcon />} />
                      <IconButton variant="outline" aria-label="저장" icon={<BookmarkIcon />} />
                      <IconButton
                        variant="ghost"
                        aria-label="더 보기"
                        icon={<EllipsisHorizontalIcon />}
                      />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="rose" asChild>
                    <Card size="tiny" className={tile}>
                      <div className="flex items-center gap-3">
                        <Avatar name="오세린" />
                        <div className="min-w-0">
                          <p className="text-body-b2-semibold">오세린</p>
                          <p className={cn(hint, 'truncate')}>룸메이트 구해요</p>
                        </div>
                      </div>
                      <Button size="tiny" variant="soft">
                        연락하기
                      </Button>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="purple" asChild>
                    <Card size="tiny" className={cn(tile, 'items-center')}>
                      <Pagination defaultPage={2} pageCount={4} size="tiny" variant="soft" />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="teal" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row items-center justify-between')}>
                      <ToggleGroup aria-label="정렬" defaultValue="center">
                        <IconToggle
                          value="left"
                          icon={<Bars3BottomLeftIcon />}
                          aria-label="왼쪽 정렬"
                        />
                        <IconToggle value="center" icon={<Bars3Icon />} aria-label="가운데 정렬" />
                        <IconToggle
                          value="right"
                          icon={<Bars3BottomRightIcon />}
                          aria-label="오른쪽 정렬"
                        />
                      </ToggleGroup>
                      <Spinner />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="pink" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row flex-wrap gap-2')}>
                      <Chip defaultSelected>전체</Chip>
                      <Chip defaultSelected>학사</Chip>
                      <Chip>장학</Chip>
                      <Chip>행사</Chip>
                      <Chip variant="solid" colorScheme="primary" onRemove={noop}>
                        기숙사
                      </Chip>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="amber" asChild>
                    <Card size="tiny" className={tile}>
                      <Card.Header>
                        <Card.Title>강의 평가</Card.Title>
                        <Card.Description>자료구조, 2026 가을</Card.Description>
                      </Card.Header>
                      <Rating aria-label="강의 평점" defaultValue={4} />
                      <Slider aria-label="난이도" defaultValue={70} />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="sky" asChild>
                    <Card size="tiny" className={tile}>
                      <div className="text-body-b3-medium flex items-center gap-2">
                        <Spinner />
                        과제.pdf 올리는 중
                      </div>
                      <Progress value={40} aria-label="과제.pdf" />
                    </Card>
                  </IdsProvider>
                </div>

                <div className={cn(column, 'w-[240px]')}>
                  <IdsProvider color="yellow" asChild>
                    <Card size="tiny" className={cn(tile, 'items-center')}>
                      <Rating aria-label="만족도" defaultValue={3} />
                    </Card>
                  </IdsProvider>

                  <Card
                    size="tiny"
                    className={cn(tile, 'text-body-b3-medium flex-row items-center gap-2')}
                  >
                    <Spinner />
                    불러오는 중
                  </Card>

                  <IdsProvider color="pink" asChild>
                    <Card size="tiny" className={tile}>
                      <Label className={row}>
                        좋아요 알림
                        <Switch defaultChecked />
                      </Label>
                      <Label className={row}>
                        댓글 알림
                        <Switch />
                      </Label>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="orange" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row items-center justify-between')}>
                      <AvatarGroup aria-label="참여자" max={3}>
                        <Avatar name="김지수" />
                        <Avatar name="박서연" />
                        <Avatar name="이도윤" />
                        <Avatar name="최하준" />
                      </AvatarGroup>
                      <Button size="tiny" variant="soft">
                        초대
                      </Button>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="blue" asChild>
                    <Card size="tiny" className={cn(tile, 'grid grid-cols-2 gap-2')}>
                      <Button size="tiny">저장</Button>
                      <Button size="tiny" variant="soft">
                        임시 저장
                      </Button>
                      <Button size="tiny" variant="outline">
                        미리 보기
                      </Button>
                      <Button size="tiny" variant="ghost">
                        취소
                      </Button>
                      <Button size="tiny" variant="glossy" className="col-span-2">
                        게시하기
                      </Button>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="yellow" asChild>
                    <Card size="tiny" className={cn(tile, 'items-center')}>
                      <ToggleGroup aria-label="보기" defaultValue="week">
                        <Toggle value="day">일</Toggle>
                        <Toggle value="week">주</Toggle>
                        <Toggle value="month">월</Toggle>
                      </ToggleGroup>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="lime" asChild>
                    <Card size="tiny" className={tile}>
                      <Label className={row}>
                        공지사항
                        <Switch defaultChecked />
                      </Label>
                      <Label className={row}>
                        학식 메뉴
                        <Switch defaultChecked />
                      </Label>
                      <Label className={row}>
                        셔틀 도착
                        <Switch />
                      </Label>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="cyan" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row items-center justify-between')}>
                      <span className="text-body-b3-medium">인원</span>
                      <NumberField aria-label="인원" defaultValue={4} size="tiny" className="w-24">
                        <NumberField.Decrement />
                        <NumberField.Input className="text-center" />
                        <NumberField.Increment />
                      </NumberField>
                    </Card>
                  </IdsProvider>
                </div>
              </div>

              <div className="flex flex-col items-center gap-5 py-2">
                <div className="flex items-center gap-5">
                  <Card size="tiny" className={cn(tile, 'w-[240px]')}>
                    <Card.Header>
                      <Card.Title>17가지 테마</Card.Title>
                      <Card.Description>색 하나로 전부 바뀝니다</Card.Description>
                    </Card.Header>
                    <div className="grid grid-cols-6 gap-2">
                      {themes.map((color) => (
                        <IdsProvider
                          key={color}
                          color={color}
                          className="aspect-square rounded-full bg-(--ids-color-primary)"
                        />
                      ))}
                    </div>
                  </Card>

                  <p className="-me-[0.1em] bg-linear-to-b from-(--ids-color-on-surface) to-(--ids-color-on-muted) bg-clip-text pe-[0.1em] font-[system-ui] text-[200px] leading-none font-black tracking-[-0.06em] text-transparent">
                    IDS
                  </p>

                  <IdsProvider color="violet" asChild>
                    <Card size="tiny" className={cn(tile, 'w-[240px] gap-2')}>
                      <p className="text-caption-c1-medium text-(--ids-color-on-muted)">app.tsx</p>
                      <pre className="text-body-b3-regular font-mono">
                        <code>
                          {'<IdsProvider\n  color='}
                          <span className="text-(--ids-color-accent)">{'"violet"'}</span>
                          {'\n  mode='}
                          <span className="text-(--ids-color-accent)">{'"dark"'}</span>
                          {'\n>\n  <App />\n</IdsProvider>'}
                        </code>
                      </pre>
                    </Card>
                  </IdsProvider>
                </div>

                <div className="flex items-center gap-4">
                  <IdsProvider color="sky" asChild>
                    <Card size="tiny" className={cn(tile, 'w-[560px] flex-row items-center gap-1')}>
                      <MagnifyingGlassIcon className="ms-1 size-5 shrink-0 text-(--ids-color-on-muted)" />
                      <TextField
                        aria-label="검색"
                        defaultValue="Button"
                        variant="ghost"
                        className="flex-1"
                      />
                      <IconToggle
                        aria-label="대소문자 구분"
                        defaultPressed
                        icon={<span className="text-body-b3-semibold">Aa</span>}
                      />
                      <IconButton variant="ghost" aria-label="지우기" icon={<XMarkIcon />} />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="rose" asChild>
                    <Chip variant="solid" colorScheme="primary" className="[zoom:2.4]">
                      #gistory
                    </Chip>
                  </IdsProvider>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={cn(column, 'w-[300px]')}>
                  <IdsProvider color="blue" asChild>
                    <Card size="tiny" className={cn(tile, 'items-center')}>
                      <Calendar
                        selectionMode="range"
                        defaultMonth={new CalendarDate(2026, 10, 1)}
                        defaultValue={{
                          start: new CalendarDate(2026, 10, 13),
                          end: new CalendarDate(2026, 10, 17),
                        }}
                      />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="emerald" asChild>
                    <Card size="tiny" className={tile}>
                      <Progress value={72}>
                        <Progress.Label>졸업 요건</Progress.Label>
                        <Progress.Value />
                      </Progress>
                      <p className={hint}>130 / 180 학점</p>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="orange" asChild>
                    <Card size="tiny" className={cn(tile, 'items-center')}>
                      <Pagination defaultPage={3} pageCount={8} size="tiny" />
                    </Card>
                  </IdsProvider>

                  <Card size="tiny" className={tile}>
                    <div className="flex items-center gap-3">
                      <Skeleton shape="circle" />
                      <Skeleton lines={2} className="text-body-b3-regular flex-1" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton shape="circle" />
                      <Skeleton lines={2} className="text-body-b3-regular flex-1" />
                    </div>
                  </Card>

                  <IdsProvider color="orange" asChild>
                    <Card size="tiny" className={tile}>
                      <Card.Header>
                        <Card.Title>공지 작성</Card.Title>
                      </Card.Header>
                      <TextField aria-label="제목" defaultValue="동아리 박람회 안내" />
                      <TextArea
                        rows={2}
                        defaultValue="10월 7일 학생회관 앞에서 열립니다."
                        aria-label="내용"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="tiny" variant="ghost">
                          취소
                        </Button>
                        <Button size="tiny">올리기</Button>
                      </div>
                    </Card>
                  </IdsProvider>
                </div>

                <div className={cn(column, 'w-[260px]')}>
                  <IdsProvider color="purple" asChild>
                    <Card size="tiny" className={cn(tile, 'gap-2')}>
                      <TextField aria-label="명령" placeholder="명령 찾기" variant="soft" />
                      <Item.Group aria-label="명령" size="tiny">
                        <Item>
                          <Item.Content>
                            <Item.Title>새 공지 작성</Item.Title>
                          </Item.Content>
                          <Item.Actions>
                            <Kbd keys="Mod+N" />
                          </Item.Actions>
                        </Item>
                        <Item selected>
                          <Item.Content>
                            <Item.Title>강의 검색</Item.Title>
                          </Item.Content>
                          <Item.Actions>
                            <Kbd keys="Mod+K" />
                          </Item.Actions>
                        </Item>
                        <Item>
                          <Item.Content>
                            <Item.Title>테마 바꾸기</Item.Title>
                          </Item.Content>
                          <Item.Actions>
                            <Kbd keys="Mod+Shift+L" />
                          </Item.Actions>
                        </Item>
                      </Item.Group>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="rose" asChild>
                    <Card size="tiny" className={tile}>
                      <Card.Header>
                        <Card.Title>인증번호</Card.Title>
                        <Card.Description>문자로 받은 6자리</Card.Description>
                      </Card.Header>
                      <OTPField length={6} defaultValue="4829" aria-label="인증번호" size="tiny" />
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="indigo" asChild>
                    <Card size="tiny" className={tile}>
                      <Field>
                        <Field.Label>관심 분야</Field.Label>
                        <ChipField defaultValue={['react', 'design']}>
                          <ChipField.Item value="react">React</ChipField.Item>
                          <ChipField.Item value="flutter">Flutter</ChipField.Item>
                          <ChipField.Item value="design">디자인</ChipField.Item>
                        </ChipField>
                      </Field>
                    </Card>
                  </IdsProvider>

                  <Alert colorScheme="danger" className="shrink-0">
                    <Alert.Title>결제에 실패했어요</Alert.Title>
                    <Alert.Description>카드 한도를 확인하세요</Alert.Description>
                  </Alert>

                  <IdsProvider color="blue" asChild>
                    <Card size="tiny" className={tile}>
                      <Card.Header>
                        <Card.Title>소식 받기</Card.Title>
                        <Card.Description>매주 금요일에 보내요</Card.Description>
                      </Card.Header>
                      <div className="flex gap-2">
                        <TextField
                          aria-label="소식 받을 이메일"
                          placeholder="이메일"
                          className="flex-1"
                          data-1p-ignore
                          data-lpignore="true"
                        />
                        <Button>구독</Button>
                      </div>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="lime" asChild>
                    <Card size="tiny" className={tile}>
                      <Accordion type="single" defaultValue="umbrella">
                        <Accordion.Item value="umbrella">
                          <Accordion.Trigger>우산 대여</Accordion.Trigger>
                          <Accordion.Content>학생회관 1층에서 빌려요.</Accordion.Content>
                        </Accordion.Item>
                        <Accordion.Item value="printer">
                          <Accordion.Trigger>프린터</Accordion.Trigger>
                          <Accordion.Content>도서관 2층에 있어요.</Accordion.Content>
                        </Accordion.Item>
                      </Accordion>
                    </Card>
                  </IdsProvider>
                </div>

                <div className={cn(column, 'w-[240px]')}>
                  <IdsProvider color="indigo" asChild>
                    <Card size="tiny" className={tile}>
                      <div className="flex items-center gap-3">
                        <Avatar name="김지수" />
                        <div className="min-w-0">
                          <p className="text-body-b2-semibold">김지수</p>
                          <p className={cn(hint, 'truncate')}>전기전자컴퓨터공학부</p>
                        </div>
                      </div>
                      <AvatarGroup aria-label="함께 아는 사람" max={3}>
                        <Avatar name="박서연" />
                        <Avatar name="이도윤" />
                        <Avatar name="최하준" />
                        <Avatar name="정예린" />
                      </AvatarGroup>
                      <div className="flex gap-2">
                        <Button size="tiny" className="flex-1">
                          팔로우
                        </Button>
                        <Button size="tiny" variant="soft" className="flex-1">
                          메시지
                        </Button>
                      </div>
                    </Card>
                  </IdsProvider>

                  <IdsProvider color="red" asChild>
                    <Card size="tiny" className={cn(tile, 'flex-row items-center gap-2')}>
                      <NumberField
                        aria-label="수강 학점"
                        defaultValue={18}
                        size="tiny"
                        className="w-24"
                      >
                        <NumberField.Decrement />
                        <NumberField.Input className="text-center" />
                        <NumberField.Increment />
                      </NumberField>
                      <Button size="tiny" className="flex-1">
                        수강 신청
                      </Button>
                    </Card>
                  </IdsProvider>

                  <Card size="tiny" className={cn(tile, 'flex-row items-center justify-between')}>
                    <span className="text-body-b3-medium">어디서나 찾기</span>
                    <Kbd keys="Mod+K" />
                  </Card>

                  <Card size="tiny" className={cn(tile, 'items-center')}>
                    <QRCode
                      value="https://github.com/gsainfoteam/ids"
                      shape="dots"
                      aria-label="IDS 저장소"
                    />
                    <p className={hint}>github.com/gsainfoteam/ids</p>
                  </Card>

                  <IdsProvider color="emerald" asChild>
                    <Card size="tiny" className={cn(tile, 'grid grid-cols-2 gap-2')}>
                      <Button size="tiny">확인</Button>
                      <Button size="tiny" variant="soft">
                        보류
                      </Button>
                      <Button size="tiny" variant="outline" className="col-span-2">
                        나중에 하기
                      </Button>
                    </Card>
                  </IdsProvider>

                  <Card size="tiny" className={tile}>
                    <Breadcrumb aria-label="위치" size="tiny">
                      <Breadcrumb.Item>
                        <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Breadcrumb.Link href="#club">동아리</Breadcrumb.Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Breadcrumb.Page>인포팀</Breadcrumb.Page>
                      </Breadcrumb.Item>
                    </Breadcrumb>
                  </Card>

                  <IdsProvider color="teal" asChild>
                    <Card size="tiny" className={tile}>
                      <Stepper defaultValue={2} size="tiny" aria-label="주문 단계">
                        <Stepper.Item>
                          <Stepper.Title>주문</Stepper.Title>
                        </Stepper.Item>
                        <Stepper.Item>
                          <Stepper.Title>조리</Stepper.Title>
                        </Stepper.Item>
                        <Stepper.Item>
                          <Stepper.Title>픽업</Stepper.Title>
                        </Stepper.Item>
                      </Stepper>
                    </Card>
                  </IdsProvider>
                </div>
              </div>
            </div>

            <div className={cn(column, 'w-[320px] translate-y-8')}>
              <IdsProvider color="indigo" asChild>
                <Card size="tiny" className={tile}>
                  <Tabs defaultValue="open">
                    <Tabs.List aria-label="스터디">
                      <Tabs.Trigger value="open">모집 중</Tabs.Trigger>
                      <Tabs.Trigger value="closed">마감</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="open">
                      <Item.Group aria-label="모집 중인 스터디" size="tiny">
                        <Item>
                          <Item.Content>
                            <Item.Title>알고리즘 스터디</Item.Title>
                            <Item.Description>3 / 6명</Item.Description>
                          </Item.Content>
                          <Item.Actions>
                            <Button size="tiny" variant="soft">
                              참여
                            </Button>
                          </Item.Actions>
                        </Item>
                        <Item>
                          <Item.Content>
                            <Item.Title>토익 스터디</Item.Title>
                            <Item.Description>5 / 8명</Item.Description>
                          </Item.Content>
                          <Item.Actions>
                            <Button size="tiny" variant="soft">
                              참여
                            </Button>
                          </Item.Actions>
                        </Item>
                      </Item.Group>
                    </Tabs.Content>
                    <Tabs.Content value="closed">마감된 스터디</Tabs.Content>
                  </Tabs>
                </Card>
              </IdsProvider>

              <Alert colorScheme="success" className="shrink-0">
                <Alert.Title>택배가 도착했어요</Alert.Title>
                <Alert.Description>생활관 A동 우편함</Alert.Description>
              </Alert>

              <IdsProvider color="yellow" asChild>
                <Card size="tiny" className={tile}>
                  <Empty size="tiny">
                    <Empty.Media>
                      <InboxIcon />
                    </Empty.Media>
                    <Empty.Title>새 알림이 없어요</Empty.Title>
                    <Empty.Description>새 공지가 오면 여기에 보여요.</Empty.Description>
                    <Empty.Actions>
                      <Button size="tiny">알림 설정</Button>
                    </Empty.Actions>
                  </Empty>
                </Card>
              </IdsProvider>

              <IdsProvider color="fuchsia" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>로그인</Card.Title>
                    <Card.Description>GIST 계정으로 계속하기</Card.Description>
                  </Card.Header>
                  <Field>
                    <Field.Label>이메일</Field.Label>
                    <TextField
                      type="email"
                      defaultValue="hello@gistory.me"
                      data-1p-ignore
                      data-lpignore="true"
                    />
                  </Field>
                  <Field>
                    <Field.Label>비밀번호</Field.Label>
                    <PasswordField
                      name="password"
                      defaultValue="infoteam"
                      data-1p-ignore
                      data-lpignore="true"
                    />
                  </Field>
                  <Label className={option}>
                    <Checkbox defaultChecked />
                    로그인 유지
                  </Label>
                  <div className="flex gap-2">
                    <Button className="flex-1">로그인</Button>
                    <Button variant="outline">가입</Button>
                  </div>
                </Card>
              </IdsProvider>

              <IdsProvider color="rose" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>셔틀 출발</Card.Title>
                  </Card.Header>
                  <TimePicker
                    aria-label="출발 시각"
                    hourCycle="24h"
                    defaultValue={new Time(9, 30)}
                  />
                </Card>
              </IdsProvider>

              <IdsProvider color="orange" className={frame}>
                <div className="flex items-center gap-1.5 border-b border-(--ids-color-border) px-4 py-3">
                  <span className="size-3 rounded-full bg-(--ids-color-danger)" />
                  <span className="size-3 rounded-full bg-(--ids-color-warning)" />
                  <span className="size-3 rounded-full bg-(--ids-color-success)" />
                  <span className="text-caption-c1-medium ms-3 text-(--ids-color-on-muted)">
                    gistory.me
                  </span>
                </div>
                <Splitter className="h-56">
                  <Splitter.Panel defaultSize={40}>
                    <Item.Group aria-label="폴더" size="tiny" className="p-2">
                      <Item selected>
                        <Item.Content>
                          <Item.Title>공지</Item.Title>
                        </Item.Content>
                      </Item>
                      <Item>
                        <Item.Content>
                          <Item.Title>과제</Item.Title>
                        </Item.Content>
                      </Item>
                      <Item>
                        <Item.Content>
                          <Item.Title>동아리</Item.Title>
                        </Item.Content>
                      </Item>
                    </Item.Group>
                  </Splitter.Panel>
                  <Splitter.Panel>
                    <div className="flex flex-col gap-3 p-4">
                      <Breadcrumb aria-label="경로" size="tiny">
                        <Breadcrumb.Item>
                          <Breadcrumb.Link href="#home">홈</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                          <Breadcrumb.Page>공지</Breadcrumb.Page>
                        </Breadcrumb.Item>
                      </Breadcrumb>
                      <Skeleton lines={3} className="text-body-b3-regular" />
                      <Button size="tiny" variant="soft">
                        더 보기
                      </Button>
                    </div>
                  </Splitter.Panel>
                </Splitter>
              </IdsProvider>

              <IdsProvider color="purple" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>이번 주 시간표</Card.Title>
                  </Card.Header>
                  <Table aria-label="시간표">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>요일</Table.Head>
                        <Table.Head>과목</Table.Head>
                        <Table.Head>강의실</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>월</Table.Cell>
                        <Table.Cell>자료구조</Table.Cell>
                        <Table.Cell>C207</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          화 <Badge content="오늘" variant="soft" colorScheme="primary" />
                        </Table.Cell>
                        <Table.Cell>선형대수</Table.Cell>
                        <Table.Cell>B104</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>수</Table.Cell>
                        <Table.Cell>운영체제</Table.Cell>
                        <Table.Cell>C207</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Card>
              </IdsProvider>

              <Alert colorScheme="warning" className="shrink-0">
                <Alert.Title>수강 정정 마감 D-1</Alert.Title>
                <Alert.Description>10월 2일 18시까지</Alert.Description>
              </Alert>

              <IdsProvider color="emerald" asChild>
                <Card size="tiny" className={tile}>
                  <Progress value={82}>
                    <Progress.Label>저장 공간</Progress.Label>
                    <Progress.Value />
                  </Progress>
                  <p className={hint}>16.4GB / 20GB</p>
                  <Button size="tiny" variant="soft">
                    용량 늘리기
                  </Button>
                </Card>
              </IdsProvider>

              <Card size="tiny" className={tile}>
                <Select aria-label="언어" defaultValue="ko">
                  <Select.Item value="ko">한국어</Select.Item>
                  <Select.Item value="en">English</Select.Item>
                </Select>
              </Card>

              <IdsProvider color="cyan" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row flex-wrap gap-2')}>
                  <Chip defaultSelected>월</Chip>
                  <Chip>화</Chip>
                  <Chip defaultSelected>수</Chip>
                  <Chip>목</Chip>
                  <Chip defaultSelected>금</Chip>
                </Card>
              </IdsProvider>
            </div>

            <div className={cn(column, 'w-[300px] -translate-y-20')}>
              <IdsProvider color="sky" asChild>
                <Card size="tiny" className={tile}>
                  <div className="flex items-center gap-3">
                    <Avatar name="한지우" />
                    <div className="min-w-0">
                      <p className="text-body-b2-semibold">한지우</p>
                      <p className={cn(hint, 'truncate')}>물리광과학과</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="tiny" className="flex-1">
                      팔로우
                    </Button>
                    <Button size="tiny" variant="outline" className="flex-1">
                      메시지
                    </Button>
                  </div>
                </Card>
              </IdsProvider>

              <IdsProvider color="yellow" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>메모</Card.Title>
                  </Card.Header>
                  <TextArea
                    rows={3}
                    defaultValue="금요일까지 발표 자료 정리하기"
                    aria-label="메모"
                  />
                </Card>
              </IdsProvider>

              <IdsProvider color="emerald" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>함께 편집</Card.Title>
                  </Card.Header>
                  <Item.Group aria-label="편집자" size="tiny">
                    <Item>
                      <Item.Media>
                        <Avatar name="김지수" size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>김지수</Item.Title>
                      </Item.Content>
                      <Item.Actions>
                        <Badge content="소유자" variant="soft" colorScheme="primary" />
                      </Item.Actions>
                    </Item>
                    <Item>
                      <Item.Media>
                        <Avatar name="오세린" size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>오세린</Item.Title>
                      </Item.Content>
                      <Item.Actions>
                        <span className={hint}>편집 가능</span>
                      </Item.Actions>
                    </Item>
                  </Item.Group>
                </Card>
              </IdsProvider>

              <Card size="tiny" className={tile}>
                <Card.Header>
                  <Card.Title>단축키</Card.Title>
                </Card.Header>
                <div className={row}>
                  검색
                  <Kbd keys="Mod+K" />
                </div>
                <div className={row}>
                  새 글
                  <Kbd keys="Mod+N" />
                </div>
                <div className={row}>
                  저장
                  <Kbd keys="Mod+S" />
                </div>
                <div className={row}>
                  닫기
                  <Kbd keys="Escape" />
                </div>
              </Card>

              <IdsProvider color="lime" asChild>
                <Card size="tiny" className={cn(tile, 'items-center')}>
                  <Calendar
                    defaultMonth={new CalendarDate(2026, 11, 1)}
                    defaultValue={new CalendarDate(2026, 11, 20)}
                  />
                </Card>
              </IdsProvider>

              <IdsProvider color="violet" asChild>
                <Card size="tiny" className={tile}>
                  <Stepper defaultValue={1} size="tiny" aria-label="지원 단계">
                    <Stepper.Item>
                      <Stepper.Title>지원</Stepper.Title>
                    </Stepper.Item>
                    <Stepper.Item>
                      <Stepper.Title>면접</Stepper.Title>
                    </Stepper.Item>
                    <Stepper.Item>
                      <Stepper.Title>합격</Stepper.Title>
                    </Stepper.Item>
                  </Stepper>
                </Card>
              </IdsProvider>

              <IdsProvider color="green" asChild>
                <Card size="tiny" className={tile}>
                  <div className="flex items-center gap-3">
                    <Avatar name="박서연" />
                    <div className="min-w-0">
                      <p className="text-body-b2-semibold">박서연</p>
                      <p className={cn(hint, 'truncate')}>인포팀 디자이너</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="tiny" className="flex-1">
                      커피챗
                    </Button>
                    <Button size="tiny" variant="outline" className="flex-1">
                      프로필
                    </Button>
                  </div>
                </Card>
              </IdsProvider>

              <IdsProvider color="orange" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>정렬</Card.Title>
                  </Card.Header>
                  <RadioGroup<string> aria-label="정렬" defaultValue="popular">
                    {({ Item: Radio }) => (
                      <>
                        <Label className={option}>
                          <Radio value="recent" />
                          최신순
                        </Label>
                        <Label className={option}>
                          <Radio value="popular" />
                          인기순
                        </Label>
                        <Label className={option}>
                          <Radio value="comments" />
                          댓글순
                        </Label>
                      </>
                    )}
                  </RadioGroup>
                </Card>
              </IdsProvider>

              <IdsProvider color="sky" asChild>
                <Card size="tiny" className={tile}>
                  <Progress value={56}>
                    <Progress.Label>강의 영상</Progress.Label>
                    <Progress.Value />
                  </Progress>
                </Card>
              </IdsProvider>

              <Alert colorScheme="danger" className="shrink-0">
                <Alert.Title>연결이 끊겼어요</Alert.Title>
                <Alert.Description>다시 시도하는 중입니다</Alert.Description>
              </Alert>

              <IdsProvider color="lime" asChild>
                <Card size="tiny" className={tile}>
                  <div className="text-body-b3-medium flex items-center gap-2">
                    <Spinner />
                    자료집 받는 중
                  </div>
                  <Progress value={62} aria-label="자료집" />
                </Card>
              </IdsProvider>

              <IdsProvider color="orange" asChild>
                <Card size="tiny" className={tile}>
                  <div className={row}>
                    <span className="text-headline-h4-bold">4.6</span>
                    <Rating aria-label="식당 평점" defaultValue={4} />
                  </div>
                  <p className={hint}>제2학생식당 후기 86개</p>
                </Card>
              </IdsProvider>

              <IdsProvider color="teal" asChild>
                <Card size="tiny" className={tile}>
                  <Label className={row}>
                    셔틀 알림
                    <Switch defaultChecked />
                  </Label>
                  <Label className={row}>
                    학식 알림
                    <Switch />
                  </Label>
                  <Label className={row}>
                    과제 마감
                    <Switch defaultChecked />
                  </Label>
                </Card>
              </IdsProvider>

              <Card size="tiny" className={tile}>
                <Card.Header>
                  <Card.Title>편집 단축키</Card.Title>
                </Card.Header>
                <div className={row}>
                  굵게
                  <Kbd keys="Mod+B" />
                </div>
                <div className={row}>
                  기울임
                  <Kbd keys="Mod+I" />
                </div>
                <div className={row}>
                  되돌리기
                  <Kbd keys="Mod+Z" />
                </div>
              </Card>
            </div>

            <div className={cn(column, 'w-[300px] translate-y-14')}>
              <IdsProvider color="blue" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row items-center gap-4')}>
                  <QRCode value="gistory:student:20265123" size="tiny" aria-label="모바일 학생증" />
                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <p className={hint}>모바일 학생증</p>
                    <p className="text-body-b1-semibold">김지수</p>
                    <Badge content="재학" variant="soft" colorScheme="primary" />
                  </div>
                </Card>
              </IdsProvider>

              <IdsProvider color="red" asChild>
                <Card size="tiny" className={tile}>
                  <p className={hint}>이번 달 지출</p>
                  <div className="flex items-end justify-between">
                    <p className="text-headline-h4-bold">128,400원</p>
                    <Badge content="-6%" variant="soft" colorScheme="success" />
                  </div>
                  <Progress value={48} aria-label="예산 대비 지출" />
                </Card>
              </IdsProvider>

              <IdsProvider color="teal" asChild>
                <Card size="tiny" className={cn(tile, 'gap-2')}>
                  <TextField aria-label="사람 찾기" placeholder="사람 찾기" variant="soft" />
                  <Item.Group aria-label="사람" size="tiny">
                    <Item selected>
                      <Item.Media>
                        <Avatar name="최하준" size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>최하준</Item.Title>
                      </Item.Content>
                    </Item>
                    <Item>
                      <Item.Media>
                        <Avatar name="정예린" size="tiny" />
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>정예린</Item.Title>
                      </Item.Content>
                    </Item>
                  </Item.Group>
                </Card>
              </IdsProvider>

              <IdsProvider color="pink" asChild>
                <Card size="tiny" className={tile}>
                  <Table aria-label="성적">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>과목</Table.Head>
                        <Table.Head>학점</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>일반물리</Table.Cell>
                        <Table.Cell>A+</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>미적분학</Table.Cell>
                        <Table.Cell>A0</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>
                          글쓰기 <Badge content="재수강" variant="soft" colorScheme="primary" />
                        </Table.Cell>
                        <Table.Cell>B+</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Card>
              </IdsProvider>

              <IdsProvider color="purple" asChild>
                <Card size="tiny" className={tile}>
                  <div className="flex items-center gap-3">
                    <Avatar name="이도윤" />
                    <div className="min-w-0">
                      <p className="text-body-b2-semibold">이도윤</p>
                      <p className={cn(hint, 'truncate')}>신소재공학부</p>
                    </div>
                  </div>
                  <Button size="tiny">팔로우</Button>
                </Card>
              </IdsProvider>

              <IdsProvider color="orange" asChild>
                <Card size="tiny" className={tile}>
                  <Progress value={30}>
                    <Progress.Label>봉사 시간</Progress.Label>
                    <Progress.Value />
                  </Progress>
                  <Progress value={90}>
                    <Progress.Label>영어 인증</Progress.Label>
                    <Progress.Value />
                  </Progress>
                </Card>
              </IdsProvider>

              <IdsProvider color="violet" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>알람</Card.Title>
                  </Card.Header>
                  <TimePicker
                    aria-label="알람 시각"
                    hourCycle="24h"
                    defaultValue={new Time(7, 15)}
                  />
                </Card>
              </IdsProvider>

              <IdsProvider color="yellow" asChild>
                <Card size="tiny" className={cn(tile, 'flex-row flex-wrap gap-2')}>
                  <Chip defaultSelected>맑음</Chip>
                  <Chip>흐림</Chip>
                  <Chip>비</Chip>
                  <Chip defaultSelected>주말</Chip>
                </Card>
              </IdsProvider>

              <Alert colorScheme="success" className="shrink-0">
                <Alert.Title>제출했어요</Alert.Title>
                <Alert.Description>과제 3, 9월 30일 14시</Alert.Description>
              </Alert>

              <IdsProvider color="lime" asChild>
                <Card size="tiny" className={tile}>
                  <div className="text-body-b3-medium flex items-center gap-2">
                    <Spinner />
                    사진 12장 올리는 중
                  </div>
                  <Progress value={75} aria-label="사진" />
                </Card>
              </IdsProvider>

              <IdsProvider color="cyan" asChild>
                <Card size="tiny" className={tile}>
                  <Card.Header>
                    <Card.Title>학식 만족도</Card.Title>
                  </Card.Header>
                  <RadioGroup<string> aria-label="학식 만족도" defaultValue="good">
                    {({ Item: Radio }) => (
                      <>
                        <Label className={option}>
                          <Radio value="good" />
                          좋아요
                        </Label>
                        <Label className={option}>
                          <Radio value="okay" />
                          보통이에요
                        </Label>
                        <Label className={option}>
                          <Radio value="bad" />
                          아쉬워요
                        </Label>
                      </>
                    )}
                  </RadioGroup>
                  <Button size="tiny">제출</Button>
                </Card>
              </IdsProvider>

              <IdsProvider color="amber" asChild>
                <Card size="tiny" className={cn(tile, 'grid grid-cols-2 gap-2')}>
                  <Button size="tiny">예약</Button>
                  <Button size="tiny" variant="soft">
                    대기
                  </Button>
                  <Button size="tiny" variant="outline">
                    변경
                  </Button>
                  <Button size="tiny" variant="ghost">
                    취소
                  </Button>
                </Card>
              </IdsProvider>

              <Alert colorScheme="warning" className="shrink-0">
                <Alert.Title>비밀번호를 바꿔 주세요</Alert.Title>
                <Alert.Description>마지막으로 바꾼 지 90일이 지났어요</Alert.Description>
              </Alert>

              <IdsProvider color="pink" asChild>
                <Card size="tiny" className={tile}>
                  <Accordion type="single" defaultValue="leave">
                    <Accordion.Item value="leave">
                      <Accordion.Trigger>휴학 신청</Accordion.Trigger>
                      <Accordion.Content>학기 시작 전까지 신청해요.</Accordion.Content>
                    </Accordion.Item>
                    <Accordion.Item value="return">
                      <Accordion.Trigger>복학 신청</Accordion.Trigger>
                      <Accordion.Content>포털에서 바로 할 수 있어요.</Accordion.Content>
                    </Accordion.Item>
                  </Accordion>
                </Card>
              </IdsProvider>
            </div>
          </div>
        </IdsProvider>
      ))}
    </section>
  ),
};
