import { useState } from 'react';

import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { Avatar } from '../../components/data/avatar';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Chip } from '../../components/data/chip';
import { Empty } from '../../components/data/empty';
import { Select } from '../../components/form/select';
import { TextField } from '../../components/form/text-field';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/Profile/Members',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Team = 'frontend' | 'backend' | 'design' | 'infra';

const TEAM_LABEL: Record<Team, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  design: '디자인',
  infra: '인프라',
};

const isTeam = (value: string): value is Team => value in TEAM_LABEL;

const MEMBERS: {
  id: string;
  name: string;
  team: Team;
  year: string;
  bio: string;
  skills: string[];
  lead?: boolean;
}[] = [
  {
    id: 'jisu',
    name: '김지수',
    team: 'frontend',
    year: '25학번',
    bio: 'Ziggle 과 IDS 를 만들어요.',
    skills: ['React', 'TypeScript'],
    lead: true,
  },
  {
    id: 'doyun',
    name: '이도윤',
    team: 'backend',
    year: '23학번',
    bio: '로그인과 알림 서버를 맡아요.',
    skills: ['NestJS', 'PostgreSQL'],
    lead: true,
  },
  {
    id: 'seoyeon',
    name: '박서연',
    team: 'design',
    year: '24학번',
    bio: '화면과 아이콘, 가끔 굿즈도 그려요.',
    skills: ['Figma', '브랜딩'],
  },
  {
    id: 'hajun',
    name: '최하준',
    team: 'infra',
    year: '22학번',
    bio: '서버가 새벽에 멈추지 않게 지켜요.',
    skills: ['Kubernetes', 'AWS'],
    lead: true,
  },
  {
    id: 'yerin',
    name: '정예린',
    team: 'frontend',
    year: '25학번',
    bio: '셔틀 시간표 화면을 새로 만들고 있어요.',
    skills: ['Flutter', 'Dart'],
  },
  {
    id: 'minho',
    name: '윤민호',
    team: 'backend',
    year: '24학번',
    bio: '학식 메뉴를 긁어 오는 봇을 돌봐요.',
    skills: ['Python', 'Redis'],
  },
];

export const PC: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');
    const [team, setTeam] = useState<Team | 'all'>('all');

    const shown = MEMBERS.filter(
      (member) =>
        (team === 'all' || member.team === team) &&
        (query === '' ||
          member.name.includes(query) ||
          member.skills.some((skill) => skill.toLowerCase().includes(query.toLowerCase()))),
    );

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 break-keep sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-h3-bold">인포팀 사람들</h1>
            <p className="text-body-b2-regular">
              {MEMBERS.length}명이 GIST 학생을 위한 서비스를 만들어요.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <TextField
              type="search"
              aria-label="이름이나 기술로 찾기"
              placeholder="이름이나 기술로 찾기"
              value={query}
              onValueChange={setQuery}
            >
              <MagnifyingGlassIcon />
              <TextField.Input />
            </TextField>
            <Select
              aria-label="팀"
              value={team}
              onValueChange={(next) => {
                if (next === 'all' || (next !== null && isTeam(next))) setTeam(next);
              }}
              className="sm:w-36"
            >
              <Select.Item value="all">모든 팀</Select.Item>
              {(Object.keys(TEAM_LABEL) as Team[]).map((value) => (
                <Select.Item key={value} value={value}>
                  {TEAM_LABEL[value]}
                </Select.Item>
              ))}
            </Select>
          </div>
        </div>

        {shown.length === 0 ? (
          <Empty variant="outline">
            <Empty.Media>
              <UserGroupIcon />
            </Empty.Media>
            <Empty.Title>찾는 사람이 없어요</Empty.Title>
            <Empty.Description>이름을 다시 확인하거나 모든 팀에서 찾아 보세요.</Empty.Description>
          </Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((member) => (
              <li key={member.id} className="flex">
                <Card className="w-full">
                  <Card.Header>
                    <Avatar name={member.name} />
                    <Card.Title asChild>
                      <h2>{member.name}</h2>
                    </Card.Title>
                    <Card.Description>
                      {TEAM_LABEL[member.team]} · {member.year}
                    </Card.Description>
                    {member.lead && (
                      <Card.Action>
                        <Badge content="팀장" variant="soft" colorScheme="primary" />
                      </Card.Action>
                    )}
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-3">
                    <p>{member.bio}</p>
                    <ul aria-label={`${member.name}의 기술`} className="flex flex-wrap gap-1.5">
                      {member.skills.map((skill) => (
                        <li key={skill}>
                          <Chip size="tiny">{skill}</Chip>
                        </li>
                      ))}
                    </ul>
                  </Card.Content>
                  <Card.Footer className="border-t">
                    <Button variant="outline" size="tiny" className="flex-1">
                      메시지
                    </Button>
                    <Button asChild variant="soft" size="tiny" className="flex-1">
                      <a href={`#${member.id}`}>프로필 보기</a>
                    </Button>
                  </Card.Footer>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  },
};
