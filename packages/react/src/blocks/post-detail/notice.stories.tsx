import { ArrowDownTrayIcon, DocumentTextIcon, ListBulletIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/action/button';
import { IconButton } from '../../components/action/icon-button';
import { Badge } from '../../components/data/badge';
import { Card } from '../../components/data/card';
import { Item } from '../../components/data/item';
import { Table } from '../../components/data/table';
import { Alert } from '../../components/feedback/alert';
import { Breadcrumb } from '../../components/navigation/breadcrumb';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Blocks/PostDetail/Notice',
  globals: { viewport: { value: 'desktop', isRotated: false } },
  tags: ['!autodocs'],
  parameters: { controls: { disable: true }, canvasPadding: false },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SCHEDULE = [
  { step: '수강 정정', when: '9월 29일 (월) 9:00 ~ 10월 2일 (목) 18:00', where: '포털 수강신청' },
  { step: '수강 취소', when: '10월 13일 (월) ~ 10월 17일 (금)', where: '포털 수강신청' },
  { step: '성적 평가 방식 변경', when: '10월 20일 (월) ~ 10월 24일 (금)', where: '학사팀 방문' },
];

const ATTACHMENTS = [
  { name: '2026-2 수강편람.pdf', size: '2.4MB' },
  { name: '수강 정정 신청서.hwp', size: '36KB' },
];

const NEIGHBORS = [
  { id: 'prev', label: '이전 글', title: '중간고사 기간 도서관 24시간 개방' },
  { id: 'next', label: '다음 글', title: '졸업 논문 제출 일정' },
];

export const PC: Story = {
  render: () => (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 break-keep sm:px-6 lg:py-14">
      <Breadcrumb aria-label="위치">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#notices">공지사항</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>학사</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card asChild>
        <article>
          <Card.Header className="border-b">
            <div className="flex flex-wrap gap-1.5">
              <Badge content="학사" variant="soft" colorScheme="neutral" />
              <Badge content="중요" variant="soft" colorScheme="danger" />
            </div>
            <Card.Title asChild>
              <h1 className="text-headline-h4-bold">2026학년도 2학기 수강 정정 안내</h1>
            </Card.Title>
            <Card.Description>학사팀 · 2026년 9월 30일 · 조회 2,841</Card.Description>
          </Card.Header>

          <Card.Content className="text-body-b2-regular flex flex-col gap-5">
            <p>
              2학기 수강 정정 기간을 알려 드립니다. 정정 기간에는 과목을 더하거나 빼거나 분반을 바꿀
              수 있고, 정정 기간이 끝나면 취소만 할 수 있습니다.
            </p>

            <Table aria-label="수강 정정 일정">
              <Table.Header>
                <Table.Row>
                  <Table.Head>구분</Table.Head>
                  <Table.Head>기간</Table.Head>
                  <Table.Head>방법</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {SCHEDULE.map((row) => (
                  <Table.Row key={row.step}>
                    <Table.Cell>{row.step}</Table.Cell>
                    <Table.Cell>{row.when}</Table.Cell>
                    <Table.Cell>{row.where}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <Alert colorScheme="warning">
              <Alert.Title>18학점을 넘기려면 먼저 승인을 받으세요</Alert.Title>
              <Alert.Description>
                직전 학기 평점이 3.5 이상이면 21학점까지 들을 수 있어요. 지도 교수의 승인을 받은
                뒤에 신청해 주세요.
              </Alert.Description>
            </Alert>

            <p>문의는 학사팀(062-715-2000)으로 해 주세요.</p>
          </Card.Content>

          <Card.Footer className="flex-col items-stretch border-t">
            <Item.Group size="tiny" aria-label="첨부 파일">
              {ATTACHMENTS.map((file) => (
                <Item key={file.name}>
                  <Item.Media variant="soft">
                    <DocumentTextIcon />
                  </Item.Media>
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
          </Card.Footer>
        </article>
      </Card>

      <nav aria-label="다른 글">
        <Card size="tiny">
          <Item.Group variant="bordered" aria-label="이전 글과 다음 글">
            {NEIGHBORS.map((neighbor) => (
              <Item key={neighbor.id} asChild>
                <a href={`#${neighbor.id}`}>
                  <Item.Content>
                    <Item.Description>{neighbor.label}</Item.Description>
                    <Item.Title>{neighbor.title}</Item.Title>
                  </Item.Content>
                </a>
              </Item>
            ))}
          </Item.Group>
        </Card>
      </nav>

      <Button asChild variant="outline" className="self-start">
        <a href="#notices">
          <ListBulletIcon />
          목록으로
        </a>
      </Button>
    </main>
  ),
};
