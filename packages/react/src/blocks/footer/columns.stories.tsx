import { useState } from 'react';

import { CubeTransparentIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Avatar } from '../../components/data/avatar';
import { Skeleton } from '../../components/feedback/skeleton';
import { toast } from '../../components/feedback/toast';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';
import { Divider } from '../../components/layout/divider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Footer/Columns',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const COLUMNS = [
  { title: '서비스', links: ['게시판', '셔틀', '도서관', 'GIST 도우미'] },
  { title: '인포팀', links: ['소개', '블로그', '채용', '문의'] },
  { title: '약관', links: ['이용 약관', '개인정보 처리방침', '운영 정책'] },
];

export const PC: Story = {
  render: function Render() {
    const [language, setLanguage] = useState<string | null>('ko');

    return (
      <div className="flex min-h-dvh flex-col break-keep">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton shape="text" lines={3} />
        </main>

        <Divider />
        <footer className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div className="flex flex-col gap-4">
              <div className="text-subtitle-s2-semibold flex items-center gap-2">
                <Avatar name="인포팀" shape="square" size="tiny" aria-hidden>
                  <Avatar.Fallback>
                    <CubeTransparentIcon />
                  </Avatar.Fallback>
                </Avatar>
                GIST 인포팀
              </div>
              <p className="text-body-b3-regular">
                새 서비스 소식을 한 달에 한 번 메일로 보내 드려요.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  toast.success('소식을 보내 드릴게요');
                }}
              >
                <TextField
                  type="email"
                  aria-label="메일 주소"
                  placeholder="name@gm.gist.ac.kr"
                  required
                >
                  <TextField.Input />
                  <Button type="submit" variant="soft" size="tiny">
                    받기
                  </Button>
                </TextField>
              </form>
            </div>
            {COLUMNS.map((column) => (
              <nav
                key={column.title}
                aria-labelledby={`footer-${column.title}`}
                className="flex flex-col gap-3"
              >
                <h2 id={`footer-${column.title}`} className="text-body-b3-semibold">
                  {column.title}
                </h2>
                <ul className="text-body-b3-regular flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href={`#${link}`}>{link}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <Divider />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-caption-c1-regular">© 2026 GIST 인포팀 · 광주 북구 첨단과기로 123</p>
            <div className="flex items-center gap-2">
              <Select aria-label="언어" size="tiny" value={language} onValueChange={setLanguage}>
                <Select.Item value="ko">한국어</Select.Item>
                <Select.Item value="en">English</Select.Item>
              </Select>
              <IconButton
                asChild
                variant="outline"
                size="tiny"
                aria-label="블로그"
                icon={<GlobeAltIcon />}
              >
                <a href="#blog" />
              </IconButton>
              <IconButton
                asChild
                variant="outline"
                size="tiny"
                aria-label="메일"
                icon={<EnvelopeIcon />}
              >
                <a href="mailto:team@gistory.me" />
              </IconButton>
            </div>
          </div>
        </footer>
      </div>
    );
  },
};
