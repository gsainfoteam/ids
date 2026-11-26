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

import { paletteHues, palettes } from '~story-kit';

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
import { ItemGroup } from '../../components/data/item-group';
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

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Overview/Cover',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const otherMode = { dark: 'light', light: 'dark' } as const;

const halves = {
  dark: cn(''),
  light: cn('[clip-path:circle(71%_at_0_0)]'),
};

const column = cn('flex shrink-0 flex-col gap-4');

const row = cn('flex items-center justify-between gap-3 text-body-b3-medium');

const hint = cn('text-caption-c1-regular text-neutral');

export const Cover: Story = {
  render: () => (
    <section className="relative h-dvh min-h-[720px] overflow-hidden">
      <h1 className="sr-only">IDS, GIST Infoteam Design System</h1>

      {(['dark', 'light'] as const).map((mode) => (
        <IdsProvider.Scope key={mode} mode={otherMode[mode]} asChild>
          <div
            inert
            aria-hidden
            className={cn('absolute inset-0 grid overflow-hidden', halves[mode])}
          >
            <IdsProvider.Scope mode={mode} theme={{ primary: palettes.blue }}>
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                <div className={cn(column, 'w-[300px] -translate-y-24')}>
                  <IdsProvider.Scope theme={{ primary: palettes.amber }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                    <Card size="tiny">
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
                              사진부{' '}
                              <Chip variant="soft" colorScheme="primary">
                                모집 중
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>25</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.blue }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.emerald }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-wrap gap-2">
                        <Chip defaultSelected>전공</Chip>
                        <Chip>교양</Chip>
                        <Chip defaultSelected>영어 강의</Chip>
                        <Chip>온라인</Chip>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.violet }} asChild>
                    <Card size="tiny">
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
                      <Label>
                        <Checkbox defaultChecked />
                        약관에 동의합니다
                      </Label>
                      <Button>가입하기</Button>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.amber }} asChild>
                    <Card size="tiny">
                      <div className={row}>
                        <span className="text-headline-h4-bold">4.9</span>
                        <Rating aria-label="동아리 평점" defaultValue={5} />
                      </div>
                      <p className={hint}>후기 312개</p>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.rose }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>택배</Card.Title>
                        <Card.Description>생활관 A동</Card.Description>
                      </Card.Header>
                      <Stepper
                        progress={false}
                        orientation="vertical"
                        size="tiny"
                        aria-label="택배"
                      >
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
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                    <Card size="tiny">
                      <Empty size="tiny">
                        <Empty.Media>
                          <MagnifyingGlassIcon />
                        </Empty.Media>
                        <Empty.Title>검색 결과가 없어요</Empty.Title>
                        <Empty.Description>다른 낱말로 찾아 보세요.</Empty.Description>
                      </Empty>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.red }} asChild>
                    <Card size="tiny">
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <Button size="tiny">삭제</Button>
                        <Button size="tiny" variant="soft">
                          신고
                        </Button>
                        <Button size="tiny" variant="ghost">
                          취소
                        </Button>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.indigo }} asChild>
                    <Card size="tiny">
                      <Label>
                        <span className="flex-1">위치 공유</span>
                        <Switch defaultChecked />
                      </Label>
                      <Label>
                        <span className="flex-1">방해 금지</span>
                        <Switch />
                      </Label>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.fuchsia }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>축제 공연 투표</Card.Title>
                        <Card.Description>내일 18시 마감</Card.Description>
                      </Card.Header>
                      <RadioGroup<string> aria-label="축제 공연" defaultValue="band">
                        {({ Item: Radio }) => (
                          <>
                            <Label>
                              <Radio value="band" />
                              밴드 공연
                            </Label>
                            <Label>
                              <Radio value="dance" />
                              댄스 공연
                            </Label>
                          </>
                        )}
                      </RadioGroup>
                      <Button size="tiny">투표하기</Button>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.violet }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-wrap gap-2">
                        <Chip variant="solid" colorScheme="primary">
                          새 기능
                        </Chip>
                        <Chip variant="soft" colorScheme="primary">
                          베타
                        </Chip>
                        <Chip variant="outline" colorScheme="success">
                          안정
                        </Chip>
                        <Chip variant="soft" colorScheme="warning">
                          주의
                        </Chip>
                        <Chip variant="soft" colorScheme="danger">
                          중단
                        </Chip>
                      </div>
                    </Card>
                  </IdsProvider.Scope>
                </div>

                <div className={cn(column, 'w-[300px] translate-y-10')}>
                  <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                    <Card size="tiny">
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
                              09:30{' '}
                              <Chip variant="soft" colorScheme="primary">
                                곧
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>09:55</Table.Cell>
                            <Table.Cell>송정역</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.fuchsia }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>강조 색</Card.Title>
                      </Card.Header>
                      <ColorPicker defaultValue="#D946EF" aria-label="강조 색">
                        <ColorPicker.Area />
                        <ColorPicker.HueSlider />
                        <ColorPicker.Swatches>
                          {['#EF4444', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899'].map(
                            (color) => (
                              <ColorPicker.Swatch key={color} value={color} />
                            ),
                          )}
                        </ColorPicker.Swatches>
                      </ColorPicker>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.amber }} asChild>
                    <Card size="tiny">
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
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Button size="tiny">지원하기</Button>
                        <Button size="tiny" variant="outline">
                          공유
                        </Button>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                    <Card size="tiny">
                      <ItemGroup variant="separated" aria-label="파일" size="tiny">
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
                      </ItemGroup>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.cyan }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.red }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>알림</Card.Title>
                        <Card.Action>
                          <Chip variant="solid" aria-label="새 알림 3개" colorScheme="danger">
                            {3}
                          </Chip>
                        </Card.Action>
                      </Card.Header>
                      <ItemGroup aria-label="알림" size="tiny">
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
                      </ItemGroup>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                    <Card size="tiny">
                      <div className="flex items-center gap-2">
                        <ButtonGroup variant="outline" aria-label="글 관리" size="tiny">
                          <Button>보관</Button>
                          <Button>공유</Button>
                          <Button>신고</Button>
                        </ButtonGroup>
                        <IconButton
                          variant="glossy"
                          size="tiny"
                          aria-label="새 글"
                          icon={<PlusIcon />}
                        />
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <Card size="tiny">
                    <Select aria-label="학기" defaultValue="2026-2">
                      <Select.Item value="2026-1">2026년 1학기</Select.Item>
                      <Select.Item value="2026-2">2026년 2학기</Select.Item>
                    </Select>
                  </Card>

                  <Alert colorScheme="info">
                    <Alert.Title>IDS 0.2 가 나왔어요</Alert.Title>
                    <Alert.Description>17가지 색과 새 컴포넌트</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.green }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>학점 계산</Card.Title>
                      </Card.Header>
                      <div className={row}>
                        이수 학점
                        <div className="w-24">
                          <NumberField aria-label="이수 학점" defaultValue={96} size="tiny">
                            <NumberField.Decrement />
                            <NumberField.Input />
                            <NumberField.Increment />
                          </NumberField>
                        </div>
                      </div>
                      <Progress value={53}>
                        <Progress.Label>졸업까지</Progress.Label>
                        <Progress.Value />
                      </Progress>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.rose }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar aria-label="달력" defaultValue={new CalendarDate(2026, 12, 24)} />
                      </div>
                    </Card>
                  </IdsProvider.Scope>
                </div>

                <div className={cn(column, 'w-[320px] -translate-y-16')}>
                  <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>택시 합승</Card.Title>
                        <Card.Description>기숙사에서 광주송정역, 17:40</Card.Description>
                      </Card.Header>
                      <AvatarGroup aria-label="합승 인원" max={3}>
                        <Avatar name="한지우" />
                        <Avatar name="오세린" />
                      </AvatarGroup>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Button size="tiny">함께 타기</Button>
                        <Button size="tiny" variant="ghost">
                          채팅
                        </Button>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <Alert colorScheme="info">
                    <Alert.Title>오늘은 점호가 없어요</Alert.Title>
                    <Alert.Description>생활관 운영팀</Alert.Description>
                  </Alert>

                  <Alert colorScheme="success">
                    <Alert.Title>좌석이 예약되었습니다</Alert.Title>
                    <Alert.Description>중앙도서관 3층 A-12</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                    <Card size="tiny">
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
                              <Chip variant="soft" colorScheme="success">
                                완료
                              </Chip>
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>다크 모드</Table.Cell>
                            <Table.Cell>
                              <Chip variant="soft" colorScheme="success">
                                완료
                              </Chip>
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>17가지 색</Table.Cell>
                            <Table.Cell>
                              <Chip variant="soft" colorScheme="success">
                                완료
                              </Chip>
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Flutter</Table.Cell>
                            <Table.Cell>
                              <Chip variant="soft" colorScheme="warning">
                                진행 중
                              </Chip>
                            </Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>

                  <div className="grid h-[600px] shrink-0">
                    <IdsProvider.Scope theme={{ primary: palettes.cyan }} asChild>
                      <Card>
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                          <div className="bg-neutral-solid mx-auto mb-4 h-6 w-24 rounded-full dark:bg-(--ids-color-border-neutral-strong)" />
                          <p className="text-caption-c1-medium text-neutral">gistory</p>
                          <p className="text-headline-h5-bold mb-4">최근 활동</p>
                          <Stepper
                            progress={false}
                            orientation="vertical"
                            size="tiny"
                            aria-label="최근 활동"
                          >
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
                                <div className="pt-2">
                                  <Card variant="soft" size="tiny">
                                    모서리 손잡이가 예뻐요
                                  </Card>
                                </div>
                              </Stepper.Body>
                            </Stepper.Item>
                            <Stepper.Item error>
                              <Stepper.Title>시각 테스트 실패</Stepper.Title>
                              <Stepper.Description>어제</Stepper.Description>
                            </Stepper.Item>
                          </Stepper>
                        </div>
                      </Card>
                    </IdsProvider.Scope>
                  </div>

                  <IdsProvider.Scope theme={{ primary: palettes.pink }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>셔틀 노선</Card.Title>
                      </Card.Header>
                      <RadioGroup<string> aria-label="셔틀 노선" defaultValue="station">
                        {({ Item: Radio }) => (
                          <>
                            <Label>
                              <Radio value="campus" />
                              교내 순환
                            </Label>
                            <Label>
                              <Radio value="station" />
                              광주송정역
                            </Label>
                            <Label>
                              <Radio value="terminal" />
                              유스퀘어
                            </Label>
                          </>
                        )}
                      </RadioGroup>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                    <Card size="tiny">
                      <div className={row}>
                        <span className="text-headline-h4-bold">4.8</span>
                        <Rating aria-label="강의 평점" defaultValue={5} />
                      </div>
                      <p className={hint}>리뷰 1,204개</p>
                    </Card>
                  </IdsProvider.Scope>

                  <Card size="tiny">
                    <div className="flex items-center gap-3">
                      <Skeleton loading asChild>
                        <Avatar name="김지스트" />
                      </Skeleton>
                      <div className="flex-1">
                        <Skeleton loading>
                          <p className="text-body-b3-medium">김지스트</p>
                          <p className="text-body-b3-regular">인포팀 프론트엔드</p>
                        </Skeleton>
                      </div>
                    </div>
                  </Card>

                  <IdsProvider.Scope theme={{ primary: palettes.amber }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>대출 중인 책</Card.Title>
                      </Card.Header>
                      <ItemGroup aria-label="대출 중인 책" size="tiny">
                        <Item>
                          <Item.Content>
                            <Item.Title>클린 코드</Item.Title>
                            <Item.Description>10월 3일 반납</Item.Description>
                          </Item.Content>
                          <Item.Actions>
                            <Chip variant="soft" colorScheme="warning">
                              D-3
                            </Chip>
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
                      </ItemGroup>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.indigo }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>
                </div>

                <div className="grid h-full w-[840px] shrink-0 grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4">
                  <div className="flex items-end gap-4">
                    <div className={cn(column, 'w-[300px]')}>
                      <IdsProvider.Scope theme={{ primary: palettes.blue }} asChild>
                        <Card size="tiny">
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
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.purple }} asChild>
                        <Card size="tiny">
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
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.emerald }} asChild>
                        <Card size="tiny">
                          <p className={hint}>이번 주 방문자</p>
                          <div className="flex items-end justify-between">
                            <p className="text-headline-h3-bold">12,840</p>
                            <Chip variant="soft" colorScheme="success">
                              +18%
                            </Chip>
                          </div>
                          <Progress value={64} aria-label="목표 대비 방문자" />
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                        <Card size="tiny">
                          <Tabs defaultValue="notice">
                            <Tabs.List aria-label="게시판">
                              <Tabs.Trigger value="all">전체</Tabs.Trigger>
                              <Tabs.Trigger value="notice">공지</Tabs.Trigger>
                              <Tabs.Trigger value="event">행사</Tabs.Trigger>
                            </Tabs.List>
                            <Tabs.Content value="all">전체 글</Tabs.Content>
                            <Tabs.Content value="notice">
                              <ItemGroup aria-label="공지" size="tiny">
                                <Item>
                                  <Item.Content>
                                    <Item.Title>기숙사 점호 안내</Item.Title>
                                    <Item.Description>생활관 운영팀</Item.Description>
                                  </Item.Content>
                                  <Item.Actions>
                                    <Chip variant="soft" colorScheme="primary">
                                      새 글
                                    </Chip>
                                  </Item.Actions>
                                </Item>
                                <Item>
                                  <Item.Content>
                                    <Item.Title>축제 부스 모집</Item.Title>
                                    <Item.Description>총학생회</Item.Description>
                                  </Item.Content>
                                </Item>
                              </ItemGroup>
                            </Tabs.Content>
                            <Tabs.Content value="event">행사 글</Tabs.Content>
                          </Tabs>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.green }} asChild>
                        <Card size="tiny">
                          <Card.Header>
                            <Card.Title>오늘의 학식</Card.Title>
                            <Card.Description>9월 30일 점심</Card.Description>
                            <Card.Action>
                              <Badge content={2} aria-label="새 메뉴 2개">
                                <IconButton variant="ghost" aria-label="알림" icon={<BellIcon />} />
                              </Badge>
                            </Card.Action>
                          </Card.Header>
                          <ItemGroup aria-label="식당" size="tiny">
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
                          </ItemGroup>
                        </Card>
                      </IdsProvider.Scope>
                    </div>

                    <div className={cn(column, 'w-[260px]')}>
                      <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-wrap gap-2">
                            <Chip defaultSelected>중간고사</Chip>
                            <Chip>퀴즈</Chip>
                            <Chip defaultSelected>기말고사</Chip>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.red }} asChild>
                        <Card size="tiny">
                          <div className="flex items-center justify-between">
                            <IconButton aria-label="좋아요" icon={<HeartIcon />} />
                            <IconButton variant="soft" aria-label="공유" icon={<ShareIcon />} />
                            <IconButton
                              variant="outline"
                              aria-label="저장"
                              icon={<BookmarkIcon />}
                            />
                            <IconButton
                              variant="ghost"
                              aria-label="더 보기"
                              icon={<EllipsisHorizontalIcon />}
                            />
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.rose }} asChild>
                        <Card size="tiny">
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
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.purple }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-col items-center gap-3">
                            <Pagination
                              aria-label="페이지 탐색"
                              defaultPage={2}
                              pageCount={4}
                              size="tiny"
                              variant="soft"
                            />
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                        <Card size="tiny">
                          <div className="flex items-center justify-between">
                            <ToggleGroup aria-label="정렬" defaultValue="center">
                              <IconToggle
                                value="left"
                                icon={<Bars3BottomLeftIcon />}
                                aria-label="왼쪽 정렬"
                              />
                              <IconToggle
                                value="center"
                                icon={<Bars3Icon />}
                                aria-label="가운데 정렬"
                              />
                              <IconToggle
                                value="right"
                                icon={<Bars3BottomRightIcon />}
                                aria-label="오른쪽 정렬"
                              />
                            </ToggleGroup>
                            <Spinner />
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.pink }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-wrap gap-2">
                            <Chip defaultSelected>전체</Chip>
                            <Chip defaultSelected>학사</Chip>
                            <Chip>장학</Chip>
                            <Chip>행사</Chip>
                            <Chip variant="solid" colorScheme="primary" onRemove={noop}>
                              기숙사
                            </Chip>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.amber }} asChild>
                        <Card size="tiny">
                          <Card.Header>
                            <Card.Title>강의 평가</Card.Title>
                            <Card.Description>자료구조, 2026 가을</Card.Description>
                          </Card.Header>
                          <Rating aria-label="강의 평점" defaultValue={4} />
                          <Slider aria-label="난이도" defaultValue={70} />
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                        <Card size="tiny">
                          <div className="text-body-b3-medium flex items-center gap-2">
                            <Spinner />
                            과제.pdf 올리는 중
                          </div>
                          <Progress value={40} aria-label="과제.pdf" />
                        </Card>
                      </IdsProvider.Scope>
                    </div>

                    <div className={cn(column, 'w-[240px]')}>
                      <IdsProvider.Scope theme={{ primary: palettes.yellow }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-col items-center gap-3">
                            <Rating aria-label="만족도" defaultValue={3} />
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <Card size="tiny">
                        <div className="text-body-b3-medium flex items-center gap-2">
                          <Spinner />
                          불러오는 중
                        </div>
                      </Card>

                      <IdsProvider.Scope theme={{ primary: palettes.pink }} asChild>
                        <Card size="tiny">
                          <Label>
                            <span className="flex-1">좋아요 알림</span>
                            <Switch defaultChecked />
                          </Label>
                          <Label>
                            <span className="flex-1">댓글 알림</span>
                            <Switch />
                          </Label>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                        <Card size="tiny">
                          <div className="flex items-center justify-between">
                            <AvatarGroup aria-label="참여자" max={3}>
                              <Avatar name="김지수" />
                              <Avatar name="박서연" />
                              <Avatar name="이도윤" />
                              <Avatar name="최하준" />
                            </AvatarGroup>
                            <Button size="tiny" variant="soft">
                              초대
                            </Button>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.blue }} asChild>
                        <Card size="tiny">
                          <div className="grid grid-cols-2 gap-2">
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
                            <div className="col-span-2 grid">
                              <Button size="tiny" variant="glossy">
                                게시하기
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.yellow }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-col items-center gap-3">
                            <ToggleGroup aria-label="보기" defaultValue="week">
                              <Toggle value="day">일</Toggle>
                              <Toggle value="week">주</Toggle>
                              <Toggle value="month">월</Toggle>
                            </ToggleGroup>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                        <Card size="tiny">
                          <Label>
                            <span className="flex-1">공지사항</span>
                            <Switch defaultChecked />
                          </Label>
                          <Label>
                            <span className="flex-1">학식 메뉴</span>
                            <Switch defaultChecked />
                          </Label>
                          <Label>
                            <span className="flex-1">셔틀 도착</span>
                            <Switch />
                          </Label>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.cyan }} asChild>
                        <Card size="tiny">
                          <div className="flex items-center justify-between">
                            <span className="text-body-b3-medium">인원</span>
                            <div className="w-24">
                              <NumberField aria-label="인원" defaultValue={4} size="tiny">
                                <NumberField.Decrement />
                                <NumberField.Input />
                                <NumberField.Increment />
                              </NumberField>
                            </div>
                          </div>
                        </Card>
                      </IdsProvider.Scope>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-5 py-2">
                    <div className="flex items-center gap-5">
                      <div className="w-[240px]">
                        <Card size="tiny">
                          <Card.Header>
                            <Card.Title>17가지 테마</Card.Title>
                            <Card.Description>색 하나로 전부 바뀝니다</Card.Description>
                          </Card.Header>
                          <div className="grid grid-cols-6 gap-2">
                            {paletteHues.map((color) => (
                              <IdsProvider.Scope
                                key={color}
                                theme={{ primary: palettes[color] }}
                                asChild
                              >
                                <span className="bg-primary-solid aspect-square rounded-full" />
                              </IdsProvider.Scope>
                            ))}
                          </div>
                        </Card>
                      </div>

                      <p className="-me-[0.1em] bg-linear-to-b from-(--ids-color-text-neutral-strong) to-(--ids-color-text-neutral) bg-clip-text pe-[0.1em] font-[system-ui] text-[200px] leading-none font-black tracking-[-0.06em] text-transparent">
                        IDS
                      </p>

                      <div className="w-[240px]">
                        <IdsProvider.Scope theme={{ primary: palettes.violet }} asChild>
                          <Card size="tiny">
                            <div className="flex flex-col gap-2">
                              <p className="text-caption-c1-medium text-neutral">app.tsx</p>
                              <pre className="text-body-b3-regular font-mono">
                                <code>
                                  {'<IdsProvider\n  theme='}
                                  <span className="text-primary">{'{theme}'}</span>
                                  {'\n  mode='}
                                  <span className="text-primary">{'"dark"'}</span>
                                  {'\n>\n  <App />\n</IdsProvider>'}
                                </code>
                              </pre>
                            </div>
                          </Card>
                        </IdsProvider.Scope>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-[560px]">
                        <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                          <Card size="tiny">
                            <div className="flex items-center gap-1">
                              <MagnifyingGlassIcon className="text-neutral ms-1 size-5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <TextField
                                  aria-label="검색"
                                  defaultValue="Button"
                                  variant="ghost"
                                />
                              </div>
                              <IconToggle
                                aria-label="대소문자 구분"
                                defaultPressed
                                icon={<span className="text-body-b3-semibold">Aa</span>}
                              />
                              <IconButton
                                variant="ghost"
                                aria-label="지우기"
                                icon={<XMarkIcon />}
                              />
                            </div>
                          </Card>
                        </IdsProvider.Scope>
                      </div>

                      <div className="[zoom:2.4]">
                        <IdsProvider.Scope theme={{ primary: palettes.rose }} asChild>
                          <Chip variant="solid" colorScheme="primary">
                            #gistory
                          </Chip>
                        </IdsProvider.Scope>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={cn(column, 'w-[300px]')}>
                      <IdsProvider.Scope theme={{ primary: palettes.blue }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-col items-center gap-3">
                            <Calendar
                              aria-label="달력"
                              selectionMode="range"
                              defaultValue={{
                                start: new CalendarDate(2026, 10, 13),
                                end: new CalendarDate(2026, 10, 17),
                              }}
                            />
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.emerald }} asChild>
                        <Card size="tiny">
                          <Progress value={72}>
                            <Progress.Label>졸업 요건</Progress.Label>
                            <Progress.Value />
                          </Progress>
                          <p className={hint}>130 / 180 학점</p>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-col items-center gap-3">
                            <Pagination
                              aria-label="페이지 탐색"
                              defaultPage={3}
                              pageCount={8}
                              size="tiny"
                            />
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <Card size="tiny">
                        <div className="flex items-center gap-3">
                          <Skeleton loading asChild>
                            <Avatar name="이인포" />
                          </Skeleton>
                          <div className="flex-1">
                            <Skeleton loading>
                              <p className="text-body-b3-medium">이인포</p>
                              <p className="text-body-b3-regular">인포팀 디자인</p>
                            </Skeleton>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton loading asChild>
                            <Avatar name="박팀장" />
                          </Skeleton>
                          <div className="flex-1">
                            <Skeleton loading>
                              <p className="text-body-b3-medium">박팀장</p>
                              <p className="text-body-b3-regular">인포팀 팀장</p>
                            </Skeleton>
                          </div>
                        </div>
                      </Card>

                      <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                        <Card size="tiny">
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
                      </IdsProvider.Scope>
                    </div>

                    <div className={cn(column, 'w-[260px]')}>
                      <IdsProvider.Scope theme={{ primary: palettes.purple }} asChild>
                        <Card size="tiny">
                          <div className="flex flex-col gap-2">
                            <TextField aria-label="명령" placeholder="명령 찾기" variant="soft" />
                            <ItemGroup aria-label="명령" size="tiny">
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
                            </ItemGroup>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.rose }} asChild>
                        <Card size="tiny">
                          <Card.Header>
                            <Card.Title>인증번호</Card.Title>
                            <Card.Description>문자로 받은 6자리</Card.Description>
                          </Card.Header>
                          <OTPField
                            length={6}
                            defaultValue="4829"
                            aria-label="인증번호"
                            size="tiny"
                          />
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.indigo }} asChild>
                        <Card size="tiny">
                          <Field>
                            <Field.Label>관심 분야</Field.Label>
                            <ChipField defaultValue={['react', 'design']}>
                              <ChipField.Item value="react">React</ChipField.Item>
                              <ChipField.Item value="flutter">Flutter</ChipField.Item>
                              <ChipField.Item value="design">디자인</ChipField.Item>
                            </ChipField>
                          </Field>
                        </Card>
                      </IdsProvider.Scope>

                      <Alert colorScheme="danger">
                        <Alert.Title>결제에 실패했어요</Alert.Title>
                        <Alert.Description>카드 한도를 확인하세요</Alert.Description>
                      </Alert>

                      <IdsProvider.Scope theme={{ primary: palettes.blue }} asChild>
                        <Card size="tiny">
                          <Card.Header>
                            <Card.Title>소식 받기</Card.Title>
                            <Card.Description>매주 금요일에 보내요</Card.Description>
                          </Card.Header>
                          <div className="flex gap-2">
                            <div className="min-w-0 flex-1">
                              <TextField
                                aria-label="소식 받을 이메일"
                                placeholder="이메일"
                                data-1p-ignore
                                data-lpignore="true"
                              />
                            </div>
                            <Button>구독</Button>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                        <Card size="tiny">
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
                      </IdsProvider.Scope>
                    </div>

                    <div className={cn(column, 'w-[240px]')}>
                      <IdsProvider.Scope theme={{ primary: palettes.indigo }} asChild>
                        <Card size="tiny">
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
                          <div className="grid grid-cols-2 gap-2">
                            <Button size="tiny">팔로우</Button>
                            <Button size="tiny" variant="soft">
                              메시지
                            </Button>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <IdsProvider.Scope theme={{ primary: palettes.red }} asChild>
                        <Card size="tiny">
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <NumberField aria-label="수강 학점" defaultValue={18} size="tiny">
                                <NumberField.Decrement />
                                <NumberField.Input />
                                <NumberField.Increment />
                              </NumberField>
                            </div>
                            <div className="grid flex-1">
                              <Button size="tiny">수강 신청</Button>
                            </div>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <Card size="tiny">
                        <div className="flex items-center justify-between">
                          <span className="text-body-b3-medium">어디서나 찾기</span>
                          <Kbd keys="Mod+K" />
                        </div>
                      </Card>

                      <Card size="tiny">
                        <div className="flex flex-col items-center gap-3">
                          <QRCode
                            value="https://github.com/gsainfoteam/ids"
                            shape="dots"
                            aria-label="IDS 저장소"
                          />
                          <p className={hint}>github.com/gsainfoteam/ids</p>
                        </div>
                      </Card>

                      <IdsProvider.Scope theme={{ primary: palettes.emerald }} asChild>
                        <Card size="tiny">
                          <div className="grid grid-cols-2 gap-2">
                            <Button size="tiny">확인</Button>
                            <Button size="tiny" variant="soft">
                              보류
                            </Button>
                            <div className="col-span-2 grid">
                              <Button size="tiny" variant="outline">
                                나중에 하기
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </IdsProvider.Scope>

                      <Card size="tiny">
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

                      <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                        <Card size="tiny">
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
                      </IdsProvider.Scope>
                    </div>
                  </div>
                </div>

                <div className={cn(column, 'w-[320px] translate-y-8')}>
                  <IdsProvider.Scope theme={{ primary: palettes.indigo }} asChild>
                    <Card size="tiny">
                      <Tabs defaultValue="open">
                        <Tabs.List aria-label="스터디">
                          <Tabs.Trigger value="open">모집 중</Tabs.Trigger>
                          <Tabs.Trigger value="closed">마감</Tabs.Trigger>
                        </Tabs.List>
                        <Tabs.Content value="open">
                          <ItemGroup aria-label="모집 중인 스터디" size="tiny">
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
                          </ItemGroup>
                        </Tabs.Content>
                        <Tabs.Content value="closed">마감된 스터디</Tabs.Content>
                      </Tabs>
                    </Card>
                  </IdsProvider.Scope>

                  <Alert colorScheme="success">
                    <Alert.Title>택배가 도착했어요</Alert.Title>
                    <Alert.Description>생활관 A동 우편함</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.yellow }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.fuchsia }} asChild>
                    <Card size="tiny">
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
                      <Label>
                        <Checkbox defaultChecked />
                        로그인 유지
                      </Label>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Button>로그인</Button>
                        <Button variant="outline">가입</Button>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.rose }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>셔틀 출발</Card.Title>
                      </Card.Header>
                      <TimePicker
                        aria-label="출발 시각"
                        hourCycle="24h"
                        defaultValue={new Time(9, 30)}
                      />
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                    <Card size="tiny">
                      <Card.Header className="border-b">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-danger-solid size-3 rounded-full" />
                          <span className="bg-warning-solid size-3 rounded-full" />
                          <span className="bg-success-solid size-3 rounded-full" />
                          <span className="text-caption-c1-medium text-neutral ms-3">
                            gistory.me
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Media>
                        <div className="h-56">
                          <Splitter>
                            <Splitter.Panel defaultSize={40}>
                              <div className="p-2">
                                <ItemGroup aria-label="폴더" size="tiny">
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
                                </ItemGroup>
                              </div>
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
                                <Skeleton loading>
                                  <p className="text-body-b3-regular">
                                    2026 가을 학기 수강 신청은 9월 1일 오전 10시에 열립니다. 신청
                                    전에 졸업 요건을 확인하세요.
                                  </p>
                                </Skeleton>
                                <Button size="tiny" variant="soft">
                                  더 보기
                                </Button>
                              </div>
                            </Splitter.Panel>
                          </Splitter>
                        </div>
                      </Card.Media>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.purple }} asChild>
                    <Card size="tiny">
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
                              화{' '}
                              <Chip variant="soft" colorScheme="primary">
                                오늘
                              </Chip>
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
                  </IdsProvider.Scope>

                  <Alert colorScheme="warning">
                    <Alert.Title>수강 정정 마감 D-1</Alert.Title>
                    <Alert.Description>10월 2일 18시까지</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.emerald }} asChild>
                    <Card size="tiny">
                      <Progress value={82}>
                        <Progress.Label>저장 공간</Progress.Label>
                        <Progress.Value />
                      </Progress>
                      <p className={hint}>16.4GB / 20GB</p>
                      <Button size="tiny" variant="soft">
                        용량 늘리기
                      </Button>
                    </Card>
                  </IdsProvider.Scope>

                  <Card size="tiny">
                    <Select aria-label="언어" defaultValue="ko">
                      <Select.Item value="ko">한국어</Select.Item>
                      <Select.Item value="en">English</Select.Item>
                    </Select>
                  </Card>

                  <IdsProvider.Scope theme={{ primary: palettes.cyan }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-wrap gap-2">
                        <Chip defaultSelected>월</Chip>
                        <Chip>화</Chip>
                        <Chip defaultSelected>수</Chip>
                        <Chip>목</Chip>
                        <Chip defaultSelected>금</Chip>
                      </div>
                    </Card>
                  </IdsProvider.Scope>
                </div>

                <div className={cn(column, 'w-[300px] -translate-y-20')}>
                  <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                    <Card size="tiny">
                      <div className="flex items-center gap-3">
                        <Avatar name="한지우" />
                        <div className="min-w-0">
                          <p className="text-body-b2-semibold">한지우</p>
                          <p className={cn(hint, 'truncate')}>물리광과학과</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="tiny">팔로우</Button>
                        <Button size="tiny" variant="outline">
                          메시지
                        </Button>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.yellow }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>메모</Card.Title>
                      </Card.Header>
                      <TextArea
                        rows={3}
                        defaultValue="금요일까지 발표 자료 정리하기"
                        aria-label="메모"
                      />
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.emerald }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>함께 편집</Card.Title>
                      </Card.Header>
                      <ItemGroup aria-label="편집자" size="tiny">
                        <Item>
                          <Item.Media>
                            <Avatar name="김지수" size="tiny" />
                          </Item.Media>
                          <Item.Content>
                            <Item.Title>김지수</Item.Title>
                          </Item.Content>
                          <Item.Actions>
                            <Chip variant="soft" colorScheme="primary">
                              소유자
                            </Chip>
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
                      </ItemGroup>
                    </Card>
                  </IdsProvider.Scope>

                  <Card size="tiny">
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

                  <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar aria-label="달력" defaultValue={new CalendarDate(2026, 11, 20)} />
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.violet }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.green }} asChild>
                    <Card size="tiny">
                      <div className="flex items-center gap-3">
                        <Avatar name="박서연" />
                        <div className="min-w-0">
                          <p className="text-body-b2-semibold">박서연</p>
                          <p className={cn(hint, 'truncate')}>인포팀 디자이너</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="tiny">커피챗</Button>
                        <Button size="tiny" variant="outline">
                          프로필
                        </Button>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>정렬</Card.Title>
                      </Card.Header>
                      <RadioGroup<string> aria-label="정렬" defaultValue="popular">
                        {({ Item: Radio }) => (
                          <>
                            <Label>
                              <Radio value="recent" />
                              최신순
                            </Label>
                            <Label>
                              <Radio value="popular" />
                              인기순
                            </Label>
                            <Label>
                              <Radio value="comments" />
                              댓글순
                            </Label>
                          </>
                        )}
                      </RadioGroup>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.sky }} asChild>
                    <Card size="tiny">
                      <Progress value={56}>
                        <Progress.Label>강의 영상</Progress.Label>
                        <Progress.Value />
                      </Progress>
                    </Card>
                  </IdsProvider.Scope>

                  <Alert colorScheme="danger">
                    <Alert.Title>연결이 끊겼어요</Alert.Title>
                    <Alert.Description>다시 시도하는 중입니다</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                    <Card size="tiny">
                      <div className="text-body-b3-medium flex items-center gap-2">
                        <Spinner />
                        자료집 받는 중
                      </div>
                      <Progress value={62} aria-label="자료집" />
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                    <Card size="tiny">
                      <div className={row}>
                        <span className="text-headline-h4-bold">4.6</span>
                        <Rating aria-label="식당 평점" defaultValue={4} />
                      </div>
                      <p className={hint}>제2학생식당 후기 86개</p>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                    <Card size="tiny">
                      <Label>
                        <span className="flex-1">셔틀 알림</span>
                        <Switch defaultChecked />
                      </Label>
                      <Label>
                        <span className="flex-1">학식 알림</span>
                        <Switch />
                      </Label>
                      <Label>
                        <span className="flex-1">과제 마감</span>
                        <Switch defaultChecked />
                      </Label>
                    </Card>
                  </IdsProvider.Scope>

                  <Card size="tiny">
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
                  <IdsProvider.Scope theme={{ primary: palettes.blue }} asChild>
                    <Card size="tiny">
                      <div className="flex items-center gap-4">
                        <QRCode
                          value="gistory:student:20265123"
                          size="tiny"
                          aria-label="모바일 학생증"
                        />
                        <div className="flex min-w-0 flex-col items-start gap-1">
                          <p className={hint}>모바일 학생증</p>
                          <p className="text-body-b1-semibold">김지수</p>
                          <Chip variant="soft" colorScheme="primary">
                            재학
                          </Chip>
                        </div>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.red }} asChild>
                    <Card size="tiny">
                      <p className={hint}>이번 달 지출</p>
                      <div className="flex items-end justify-between">
                        <p className="text-headline-h4-bold">128,400원</p>
                        <Chip variant="soft" colorScheme="success">
                          -6%
                        </Chip>
                      </div>
                      <Progress value={48} aria-label="예산 대비 지출" />
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.teal }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-col gap-2">
                        <TextField aria-label="사람 찾기" placeholder="사람 찾기" variant="soft" />
                        <ItemGroup aria-label="사람" size="tiny">
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
                        </ItemGroup>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.pink }} asChild>
                    <Card size="tiny">
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
                              글쓰기{' '}
                              <Chip variant="soft" colorScheme="primary">
                                재수강
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>B+</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.purple }} asChild>
                    <Card size="tiny">
                      <div className="flex items-center gap-3">
                        <Avatar name="이도윤" />
                        <div className="min-w-0">
                          <p className="text-body-b2-semibold">이도윤</p>
                          <p className={cn(hint, 'truncate')}>신소재공학부</p>
                        </div>
                      </div>
                      <Button size="tiny">팔로우</Button>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.orange }} asChild>
                    <Card size="tiny">
                      <Progress value={30}>
                        <Progress.Label>봉사 시간</Progress.Label>
                        <Progress.Value />
                      </Progress>
                      <Progress value={90}>
                        <Progress.Label>영어 인증</Progress.Label>
                        <Progress.Value />
                      </Progress>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.violet }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>알람</Card.Title>
                      </Card.Header>
                      <TimePicker
                        aria-label="알람 시각"
                        hourCycle="24h"
                        defaultValue={new Time(7, 15)}
                      />
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.yellow }} asChild>
                    <Card size="tiny">
                      <div className="flex flex-wrap gap-2">
                        <Chip defaultSelected>맑음</Chip>
                        <Chip>흐림</Chip>
                        <Chip>비</Chip>
                        <Chip defaultSelected>주말</Chip>
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <Alert colorScheme="success">
                    <Alert.Title>제출했어요</Alert.Title>
                    <Alert.Description>과제 3, 9월 30일 14시</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.lime }} asChild>
                    <Card size="tiny">
                      <div className="text-body-b3-medium flex items-center gap-2">
                        <Spinner />
                        사진 12장 올리는 중
                      </div>
                      <Progress value={75} aria-label="사진" />
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.cyan }} asChild>
                    <Card size="tiny">
                      <Card.Header>
                        <Card.Title>학식 만족도</Card.Title>
                      </Card.Header>
                      <RadioGroup<string> aria-label="학식 만족도" defaultValue="good">
                        {({ Item: Radio }) => (
                          <>
                            <Label>
                              <Radio value="good" />
                              좋아요
                            </Label>
                            <Label>
                              <Radio value="okay" />
                              보통이에요
                            </Label>
                            <Label>
                              <Radio value="bad" />
                              아쉬워요
                            </Label>
                          </>
                        )}
                      </RadioGroup>
                      <Button size="tiny">제출</Button>
                    </Card>
                  </IdsProvider.Scope>

                  <IdsProvider.Scope theme={{ primary: palettes.amber }} asChild>
                    <Card size="tiny">
                      <div className="grid grid-cols-2 gap-2">
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
                      </div>
                    </Card>
                  </IdsProvider.Scope>

                  <Alert colorScheme="warning">
                    <Alert.Title>비밀번호를 바꿔 주세요</Alert.Title>
                    <Alert.Description>마지막으로 바꾼 지 90일이 지났어요</Alert.Description>
                  </Alert>

                  <IdsProvider.Scope theme={{ primary: palettes.pink }} asChild>
                    <Card size="tiny">
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
                  </IdsProvider.Scope>
                </div>
              </div>
            </IdsProvider.Scope>
          </div>
        </IdsProvider.Scope>
      ))}
    </section>
  ),
};
