import { useState, type FormEvent } from 'react';

import {
  ArrowDownTrayIcon,
  BookmarkIcon,
  ChatBubbleOvalLeftIcon,
  DocumentTextIcon,
  HeartIcon,
  LinkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Toggle } from '../../components/action/toggle';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Chip } from '../../components/data/chip';
import { Image } from '../../components/data/image';
import { Item } from '../../components/data/item';
import { Alert } from '../../components/feedback/alert';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { Breadcrumb } from '../../components/navigation/breadcrumb';
import { Menu } from '../../components/overlay/menu';
import { cn } from '../../utils';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Patterns/PostDetail',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function scene(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 80%)"/><stop offset="1" stop-color="hsl(${hue} 60% 94%)"/></linearGradient></defs><rect width="960" height="720" fill="url(#sky)"/><circle cx="690" cy="216" r="72" fill="hsl(${(hue + 40) % 360} 90% 68%)"/><path d="M0 720 L270 331 L500 533 L710 360 L960 720 Z" fill="hsl(${hue} 32% 38%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PHOTOS = [
  { id: 'stage', alt: '작년 축제의 야외 무대', caption: '작년 축제 야외 무대', hue: 20 },
  { id: 'booths', alt: '학생회관 앞에 늘어선 부스', caption: '학생회관 앞 부스 거리', hue: 200 },
  { id: 'night', alt: '불이 켜진 축제의 밤', caption: '둘째 날 밤', hue: 265 },
].map((photo) => ({ ...photo, src: scene(photo.hue) }));

const ATTACHMENTS = [
  { id: 'map', name: '부스 배치도.pdf', size: '2.1MB' },
  { id: 'form', name: '부스 신청서.hwp', size: '84KB' },
];

type Comment = {
  id: number;
  author: string;
  time: string;
  text: string;
  replies: Omit<Comment, 'replies'>[];
};

const COMMENTS: Comment[] = [
  {
    id: 1,
    author: '박서연',
    time: '2시간 전',
    text: '부스마다 전기를 몇 kW 까지 쓸 수 있나요? 모니터를 두 대 놓고 싶어서요.',
    replies: [
      {
        id: 2,
        author: '총학생회',
        time: '1시간 전',
        text: 'B 구역은 한 부스에 2kW 까지 됩니다. 신청서에 적어 주세요!',
      },
    ],
  },
  {
    id: 3,
    author: '이도윤',
    time: '40분 전',
    text: '작년처럼 먹거리 부스는 따로 뽑나요?',
    replies: [],
  },
];

const link = cn(
  'rounded-indicator text-(--ids-color-accent) underline underline-offset-4 focus-ring hover:decoration-2',
);

export const Default: Story = {
  render: function Render() {
    const [comments, setComments] = useState(COMMENTS);
    const [draft, setDraft] = useState('');

    const commentCount = comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);

    const addComment = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (draft.trim() === '') return;
      setComments((current) => [
        ...current,
        { id: Date.now(), author: '김지수', time: '방금', text: draft.trim(), replies: [] },
      ]);
      setDraft('');
    };

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8 break-keep sm:px-6 lg:py-12">
        <article className="flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <Breadcrumb aria-label="위치">
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#board">게시판</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#events">행사</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Page>가을 축제 부스 모집</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="flex flex-wrap gap-1.5">
              <Badge content="행사" variant="soft" colorScheme="neutral" />
              <Badge content="모집 중" variant="soft" colorScheme="primary" />
            </div>
            <h1 className="text-headline-h2-bold">가을 축제 부스 운영 동아리 모집</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Avatar name="총학생회" />
              <div className="flex flex-col">
                <span className="text-body-b2-semibold">총학생회</span>
                <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                  9월 29일 오후 3:12 · 조회 1,320
                </span>
              </div>
              <div className="ms-auto flex items-center gap-1">
                <IconToggle variant="outline" aria-label="북마크" icon={<BookmarkIcon />} />
                <Menu>
                  <Menu.Trigger asChild>
                    <IconButton variant="outline" aria-label="공유" icon={<ShareIcon />} />
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item onSelect={() => toast.success('주소를 복사했어요')}>
                      <LinkIcon />
                      주소 복사
                    </Menu.Item>
                    <Menu.Item>
                      <ChatBubbleOvalLeftIcon />
                      카카오톡으로 보내기
                    </Menu.Item>
                  </Menu.Content>
                </Menu>
              </div>
            </div>
          </header>

          <Image.Group layout="grid" columns={3} aria-label="작년 축제 사진">
            {PHOTOS.map((photo) => (
              <Image
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                caption={photo.caption}
                ratio={4 / 3}
              />
            ))}
          </Image.Group>

          <div className="text-body-b1-regular flex flex-col gap-5">
            <p>
              10월 16일과 17일, 학생회관 앞 광장에서 가을 축제가 열립니다. 올해는 동아리 부스를
              작년보다 10자리 늘려 모두 30자리를 준비했어요.
            </p>
            <p>
              부스를 내고 싶은 동아리는 아래 신청서를 채워 메일로 보내 주세요. 자리는 추첨으로
              정합니다.
            </p>
            <ul className="flex list-disc flex-col gap-1.5 ps-6">
              <li>한 동아리당 부스 하나, 운영 인원 4명 이상</li>
              <li>먹거리 부스는 식품 위생 교육을 받은 사람이 한 명 있어야 해요</li>
              <li>전기는 B 구역만 한 부스에 2kW 까지</li>
            </ul>
          </div>

          <Alert colorScheme="info">
            <Alert.Title>10월 5일 18시에 신청을 마감해요</Alert.Title>
            <Alert.Description>추첨 결과는 10월 7일 이 게시판에 올립니다.</Alert.Description>
          </Alert>

          <section aria-labelledby="attachments" className="flex flex-col gap-3">
            <h2 id="attachments" className="text-body-b2-semibold">
              첨부 파일 {ATTACHMENTS.length}개
            </h2>
            <Item.Group variant="separated" size="tiny" aria-label="첨부 파일">
              {ATTACHMENTS.map((file) => (
                <Item key={file.id} asChild>
                  <a href={`#${file.id}`} download={file.name}>
                    <Item.Media variant="soft">
                      <DocumentTextIcon />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{file.name}</Item.Title>
                      <Item.Description>{file.size}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <ArrowDownTrayIcon
                        aria-hidden
                        className="size-5 text-(--ids-color-on-muted)"
                      />
                    </Item.Actions>
                  </a>
                </Item>
              ))}
            </Item.Group>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Chip onClick={() => undefined}>#축제</Chip>
              <Chip onClick={() => undefined}>#동아리</Chip>
              <Chip onClick={() => undefined}>#부스</Chip>
            </div>
            <Toggle variant="outline" aria-label="좋아요 32개">
              <HeartIcon />
              32
            </Toggle>
          </div>
        </article>

        <Divider />

        <section aria-labelledby="comments" className="flex flex-col gap-6">
          <h2 id="comments" className="text-headline-h5-bold">
            댓글 {commentCount}
          </h2>

          <form onSubmit={addComment} className="flex items-start gap-3">
            <Avatar name="김지수" />
            <TextArea
              aria-label="댓글 쓰기"
              placeholder="댓글을 남겨 보세요"
              rows={2}
              maxRows={8}
              maxLength={500}
              value={draft}
              onValueChange={setDraft}
              className="flex-1"
            >
              <TextArea.Input />
              <TextArea.Count />
              <Button type="submit" size="tiny" disabled={draft.trim() === ''} className="ms-auto">
                등록
              </Button>
            </TextArea>
          </form>

          <ol className="flex flex-col gap-6">
            {comments.map((comment) => (
              <li key={comment.id} className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <Avatar name={comment.author} size="tiny" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="flex items-center gap-2">
                      <span className="text-body-b3-semibold">{comment.author}</span>
                      <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                        {comment.time}
                      </span>
                    </p>
                    <p className="text-body-b2-regular">{comment.text}</p>
                    <a
                      href={`#reply-${comment.id}`}
                      className={cn(link, 'text-caption-c1-medium self-start')}
                    >
                      답글 쓰기
                    </a>
                  </div>
                </div>
                {comment.replies.length > 0 && (
                  <ol className="ms-4 flex flex-col gap-4 border-s border-(--ids-color-border) ps-5">
                    {comment.replies.map((reply) => (
                      <li key={reply.id} className="flex gap-3">
                        <Avatar name={reply.author} size="tiny" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="flex items-center gap-2">
                            <span className="text-body-b3-semibold">{reply.author}</span>
                            <Badge content="글쓴이" variant="soft" colorScheme="primary" />
                            <span className="text-caption-c1-regular text-(--ids-color-on-muted)">
                              {reply.time}
                            </span>
                          </p>
                          <p className="text-body-b2-regular">{reply.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </section>

        <nav aria-label="다른 글">
          <Item.Group variant="bordered" aria-label="다른 글">
            <Item asChild>
              <a href="#previous">
                <Item.Content>
                  <Item.Description>이전 글</Item.Description>
                  <Item.Title>인포팀 2026 가을 신입 부원 모집</Item.Title>
                </Item.Content>
              </a>
            </Item>
            <Item asChild>
              <a href="#next">
                <Item.Content>
                  <Item.Description>다음 글</Item.Description>
                  <Item.Title>중간고사 기간 도서관 24시간 개방</Item.Title>
                </Item.Content>
              </a>
            </Item>
          </Item.Group>
        </nav>
      </main>
    );
  },
};
