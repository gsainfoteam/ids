import { useState } from 'react';

import { expect, waitFor } from 'storybook/test';

import { Showcase } from '~story-kit';

import { Badge } from '../badge';

import { Table } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const variants = ['outline', 'ghost'] as const;
const sizes = ['standard', 'tiny'] as const;

const MEMBERS = [
  { id: 'kim', name: '김철수', email: 'kim@example.com', role: '관리자', balance: 125000 },
  { id: 'lee', name: '이영희', email: 'lee@example.com', role: '멤버', balance: 48000 },
  { id: 'park', name: '박민수', email: 'park@example.com', role: '멤버', balance: 9900 },
  { id: 'choi', name: '최지은', email: 'choi@example.com', role: '게스트', balance: 0 },
];

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const meta = {
  title: 'Data/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: variants },
    size: { control: 'radio', options: sizes },
    layout: { control: 'radio', options: ['auto', 'fixed'] },
    striped: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    highlightOnHover: { control: 'boolean' },
  },
  args: { variant: 'outline', size: 'standard', 'aria-label': '멤버' },
  render: (args) => (
    <Table {...args} className="max-w-xl">
      <Table.Header>
        <Table.Row>
          <Table.Head>이름</Table.Head>
          <Table.Head>이메일</Table.Head>
          <Table.Head>역할</Table.Head>
          <Table.Head align="end">잔액</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {MEMBERS.map((member) => (
          <Table.Row key={member.id}>
            <Table.Cell>{member.name}</Table.Cell>
            <Table.Cell>{member.email}</Table.Cell>
            <Table.Cell>{member.role}</Table.Cell>
            <Table.Cell align="end">{won(member.balance)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gallery: Story = {
  render: () => (
    <Showcase>
      <Showcase.Section title="Variant × Size">
        <Showcase.Matrix
          rows={sizes}
          columns={variants}
          render={(size, variant) => (
            <Table variant={variant} size={size} aria-label={`${variant} ${size}`} className="w-80">
              <Table.Header>
                <Table.Row>
                  <Table.Head>이름</Table.Head>
                  <Table.Head align="end">잔액</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {MEMBERS.slice(0, 3).map((member) => (
                  <Table.Row key={member.id}>
                    <Table.Cell>{member.name}</Table.Cell>
                    <Table.Cell align="end">{won(member.balance)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        />
      </Showcase.Section>

      <Showcase.Section title="Rows">
        <Showcase.Row label="striped">
          <Table striped aria-label="줄무늬" className="w-80">
            <Table.Header>
              <Table.Row>
                <Table.Head>이름</Table.Head>
                <Table.Head>역할</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MEMBERS.map((member) => (
                <Table.Row key={member.id}>
                  <Table.Cell>{member.name}</Table.Cell>
                  <Table.Cell>{member.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Showcase.Row>
        <Showcase.Row label="selected">
          <Table highlightOnHover aria-label="선택된 행" className="w-80">
            <Table.Header>
              <Table.Row>
                <Table.Head>이름</Table.Head>
                <Table.Head>역할</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MEMBERS.map((member, index) => (
                <Table.Row key={member.id} selected={index === 1}>
                  <Table.Cell>{member.name}</Table.Cell>
                  <Table.Cell>{member.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Showcase.Row>
        <Showcase.Row label="striped · selected">
          <Table striped aria-label="줄무늬와 선택" className="w-80">
            <Table.Body>
              {MEMBERS.map((member, index) => (
                <Table.Row key={member.id} selected={index === 1}>
                  <Table.Head>{member.name}</Table.Head>
                  <Table.Cell>{member.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Showcase.Row>
      </Showcase.Section>

      <Showcase.Section title="Parts">
        <Showcase.Row label="caption · footer">
          <Table aria-label="잔액" className="w-96">
            <Table.Caption>2026년 9월 기준</Table.Caption>
            <Table.Header>
              <Table.Row>
                <Table.Head>이름</Table.Head>
                <Table.Head>역할</Table.Head>
                <Table.Head align="end">잔액</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MEMBERS.map((member) => (
                <Table.Row key={member.id}>
                  <Table.Cell>{member.name}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="soft" content={member.role} />
                  </Table.Cell>
                  <Table.Cell align="end">{won(member.balance)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.Head colSpan={2}>합계</Table.Head>
                <Table.Cell align="end">
                  {won(MEMBERS.reduce((sum, member) => sum + member.balance, 0))}
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Showcase.Row>
        <Showcase.Row label="align">
          <Table variant="ghost" aria-label="정렬" className="w-96">
            <Table.Header>
              <Table.Row>
                <Table.Head align="start">start</Table.Head>
                <Table.Head align="center">center</Table.Head>
                <Table.Head align="end">end</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell align="start">가</Table.Cell>
                <Table.Cell align="center">나</Table.Cell>
                <Table.Cell align="end">다</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Showcase.Row>
      </Showcase.Section>
    </Showcase>
  ),
};

export const ClickableRows: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <Table aria-label="멤버" className="max-w-md">
        <Table.Header>
          <Table.Row>
            <Table.Head>이름</Table.Head>
            <Table.Head>이메일</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {MEMBERS.map((member) => (
            <Table.Row
              key={member.id}
              selected={selected === member.id}
              onClick={() => setSelected(member.id)}
            >
              <Table.Head>
                <button
                  type="button"
                  aria-pressed={selected === member.id}
                  className="rounded-standard focus-ring cursor-pointer outline-none"
                >
                  {member.name}
                </button>
              </Table.Head>
              <Table.Cell>{member.email}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`onClick` 이 있는 행은 포인터를 올리면 밝아지고 어디를 눌러도 됩니다. 키보드와 스크린 리더는 행 안의 버튼으로 같은 동작에 닿습니다. 행에 `role="button"` 을 주면 표의 행과 열 구조가 사라지므로 주지 않습니다.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('cell', { name: 'lee@example.com' }));
    const row = canvas.getByRole('row', { name: /이영희/ });
    await expect(row).toHaveAttribute('data-selected');
    await expect(canvas.getByRole('button', { name: '이영희' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    canvas.getByRole('button', { name: '김철수' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('row', { name: /김철수/ })).toHaveAttribute('data-selected');
  },
};

export const StickyHeader: Story = {
  render: () => (
    <Table stickyHeader striped aria-label="긴 목록" className="max-h-64 max-w-md">
      <Table.Header>
        <Table.Row>
          <Table.Head>번호</Table.Head>
          <Table.Head>이름</Table.Head>
          <Table.Head align="end">점수</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: 30 }, (_, index) => (
          <Table.Row key={index}>
            <Table.Cell>{index + 1}</Table.Cell>
            <Table.Cell>학생 {index + 1}</Table.Cell>
            <Table.Cell align="end">{(index * 37) % 100}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '높이를 `className` 으로 제한하면 표가 안에서 스크롤하고, `stickyHeader` 는 머리글 행을 위에 붙여 둡니다. 스크롤바는 ScrollArea 가 그립니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
    const header = canvasElement.querySelector<HTMLElement>('[data-table-header]')!;
    const top = header.getBoundingClientRect().top;
    viewport.scrollTop = 400;
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    await expect(header.getBoundingClientRect().top).toBeCloseTo(top, 0);
  },
};

export const WideTable: Story = {
  render: () => (
    <Table aria-label="월별 매출" className="max-w-sm">
      <Table.Header>
        <Table.Row>
          <Table.Head>항목</Table.Head>
          {Array.from({ length: 12 }, (_, month) => (
            <Table.Head key={month} align="end">
              {month + 1}월
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {['매출', '비용', '이익'].map((item, row) => (
          <Table.Row key={item}>
            <Table.Head>{item}</Table.Head>
            {Array.from({ length: 12 }, (_, month) => (
              <Table.Cell key={month} align="end">
                {won((row + 1) * (month + 3) * 1000)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '넓은 표는 가로로 스크롤합니다. 안에 포커스 받을 요소가 없으면 스크롤 영역이 Tab 에 멈춰 방향키로 넘겨 볼 수 있습니다. 몸통의 `Table.Head` 는 `scope="row"` 인 행 머리글입니다.',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-table]')!;
    const viewport = root.querySelector<HTMLElement>('[data-scroll-area-viewport]')!;
    await waitFor(() => expect(root).toHaveAttribute('data-overflow-x'));
    await expect(viewport).toHaveAttribute('tabindex', '0');
    await expect(canvas.getByRole('rowheader', { name: '매출' })).toHaveAttribute('scope', 'row');
  },
};
