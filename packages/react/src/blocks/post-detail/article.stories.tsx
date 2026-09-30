import { useState, type FormEvent } from 'react';

import {
  ArrowDownTrayIcon,
  BookmarkIcon,
  DocumentTextIcon,
  HeartIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { IconToggle } from '../../components/action/icon-toggle';
import { Toggle } from '../../components/action/toggle';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Item } from '../../components/data/item';
import { toast } from '../../components/feedback/toast';
import { TextArea } from '../../components/form/text-area';
import { Divider } from '../../components/layout/divider';
import { Breadcrumb } from '../../components/navigation/breadcrumb';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/PostDetail/Article',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const AUTHOR = '총학생회';

const ATTACHMENTS = [
  { name: '부스 신청서.hwp', size: '48KB', icon: <DocumentTextIcon /> },
  { name: '광장 배치도.png', size: '1.2MB', icon: <PhotoIcon /> },
];

const TAGS = ['축제', '동아리', '부스'];

type Comment = { id: string; name: string; time: string; text: string; likes: number };

const COMMENTS: (Comment & { replies: Comment[] })[] = [
  {
    id: 'c1',
    name: '박서연',
    time: '2시간 전',
    text: '사진부도 신청해요! 부스 크기는 한 칸이 가로 3미터 맞나요?',
    likes: 3,
    replies: [
      {
        id: 'c1-r1',
        name: AUTHOR,
        time: '1시간 전',
        text: '네, 한 칸은 가로 3미터 세로 2미터예요. 두 칸까지 신청할 수 있어요.',
        likes: 5,
      },
    ],
  },
  {
    id: 'c2',
    name: '이도윤',
    time: '40분 전',
    text: '전기를 쓰는 부스는 따로 표시해야 하나요? 커피 머신을 쓰려고 해요.',
    likes: 1,
    replies: [],
  },
];

export const PC: Story = {
  render: function Render() {
    const [draft, setDraft] = useState('');

    const postComment = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setDraft('');
      toast.success('댓글을 달았어요');
    };

    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
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

        <article className="flex flex-col gap-6">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge content="행사" variant="soft" colorScheme="neutral" />
              <Badge content="마감 D-7" variant="soft" colorScheme="warning" />
            </div>
            <h1 className="text-headline-h2-bold">가을 축제 부스 운영 동아리 모집</h1>
            <Item variant="soft">
              <Item.Media>
                <Avatar name={AUTHOR} />
              </Item.Media>
              <Item.Content>
                <Item.Title>{AUTHOR}</Item.Title>
                <Item.Description>9월 29일 오후 3:20 · 조회 1,320</Item.Description>
              </Item.Content>
              <Item.Actions>
                <IconToggle
                  variant="outline"
                  aria-label="북마크"
                  icon={<BookmarkIcon />}
                  onPressedChange={(pressed) => pressed && toast.success('북마크에 넣었어요')}
                />
                <IconButton
                  variant="outline"
                  aria-label="공유"
                  icon={<ShareIcon />}
                  onClick={() => toast.success('주소를 복사했어요')}
                />
              </Item.Actions>
            </Item>
          </header>

          <Divider />

          <div className="text-body-b1-regular flex flex-col gap-4">
            <p>
              10월 16일과 17일, 학생회관 앞 광장에서 가을 축제가 열립니다. 부스를 내고 싶은 동아리는
              아래 신청서를 채워 10월 6일까지 메일로 보내 주세요.
            </p>
            <p>
              자리는 추첨으로 정하고, 결과는 10월 8일에 이 게시판에 올립니다. 음식을 파는 부스는
              위생 교육을 한 번 들어야 합니다.
            </p>
          </div>

          <Card size="tiny">
            <Card.Header>
              <Card.Title asChild>
                <h2>첨부 파일 {ATTACHMENTS.length}개</h2>
              </Card.Title>
            </Card.Header>
            <Item.Group variant="bordered" size="tiny" aria-label="첨부 파일">
              {ATTACHMENTS.map((file) => (
                <Item key={file.name}>
                  <Item.Media variant="soft">{file.icon}</Item.Media>
                  <Item.Content>
                    <Item.Title>{file.name}</Item.Title>
                    <Item.Description>{file.size}</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <IconButton
                      variant="outline"
                      size="tiny"
                      aria-label={`${file.name} 내려받기`}
                      icon={<ArrowDownTrayIcon />}
                    />
                  </Item.Actions>
                </Item>
              ))}
            </Item.Group>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <Chip key={tag}>#{tag}</Chip>
              ))}
            </div>
            <Toggle variant="outline" defaultPressed>
              <HeartIcon />
              좋아요 24
            </Toggle>
          </div>
        </article>

        <Divider />

        <section aria-labelledby="comments" className="flex flex-col gap-6">
          <h2 id="comments" className="text-headline-h5-bold">
            댓글 {COMMENTS.length + COMMENTS.flatMap((comment) => comment.replies).length}
          </h2>

          <form onSubmit={postComment}>
            <TextArea
              aria-label="댓글"
              placeholder="댓글을 남겨 주세요"
              rows={2}
              maxLength={500}
              value={draft}
              onValueChange={setDraft}
            >
              <TextArea.Input />
              <TextArea.Count />
              <Button type="submit" size="tiny" disabled={draft.trim() === ''}>
                댓글 달기
              </Button>
            </TextArea>
          </form>

          <ol className="flex flex-col gap-6">
            {COMMENTS.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Avatar name={comment.name} size="tiny" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-body-b3-semibold flex items-center gap-2">
                    {comment.name}
                    <span className="text-caption-c1-regular">{comment.time}</span>
                  </p>
                  <p className="text-body-b2-regular">{comment.text}</p>
                  <div className="flex gap-2">
                    <Toggle variant="outline" size="tiny" aria-label={`좋아요 ${comment.likes}개`}>
                      <HeartIcon />
                      {comment.likes}
                    </Toggle>
                    <Button variant="outline" size="tiny">
                      답글
                    </Button>
                  </div>

                  {comment.replies.length > 0 && (
                    <div className="flex gap-3 pt-2">
                      <Divider orientation="vertical" />
                      <ol className="flex flex-1 flex-col gap-4">
                        {comment.replies.map((reply) => (
                          <li key={reply.id} className="flex gap-3">
                            <Avatar name={reply.name} size="tiny" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <p className="text-body-b3-semibold flex items-center gap-2">
                                {reply.name}
                                {reply.name === AUTHOR && (
                                  <Badge content="글쓴이" variant="soft" colorScheme="primary" />
                                )}
                                <span className="text-caption-c1-regular">{reply.time}</span>
                              </p>
                              <p className="text-body-b2-regular">{reply.text}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    );
  },
};
