import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Card, IdsProvider, Table } from '../src';
import { testTheme } from './theme';

const ghostTable = (label: string) => (
  <Table variant="ghost" aria-label={label}>
    <Table.Header>
      <Table.Row>
        <Table.Head>이름</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>하나</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

const headerOf = (table: Element) => table.querySelector('thead')!;

const roleColor = (inside: Element, role: string) => {
  const probe = document.createElement('div');
  probe.style.color = `var(--ids-color-${role})`;
  inside.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

test.each(['light', 'dark'] as const)(
  'a ghost Table header takes the color of the surface it sits on in %s mode',
  async (mode) => {
    const screen = await render(
      <IdsProvider theme={testTheme} mode={mode} data-testid="page">
        {ghostTable('페이지')}
        <Card variant="outline" data-testid="card">
          {ghostTable('카드')}
        </Card>
      </IdsProvider>,
    );

    const page = screen.getByTestId('page').element();
    const card = screen.getByTestId('card').element();
    const [onPage, onCard] = [...page.querySelectorAll('table')];

    expect(getComputedStyle(headerOf(onPage!)).backgroundColor).toBe(roleColor(page, 'bg-neutral-subtlest'));
    expect(getComputedStyle(headerOf(onCard!)).backgroundColor).toBe(getComputedStyle(card).backgroundColor);
    expect(getComputedStyle(card).backgroundColor).toBe(roleColor(page, 'bg-panel'));
  },
);

test('a Scope that keeps the mode keeps the card behind it, one that switches paints its own page', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme} mode="dark">
      <Card variant="outline" data-testid="card">
        <IdsProvider.Scope theme={{ radius: 6 }}>{ghostTable('같은 모드')}</IdsProvider.Scope>
        <IdsProvider.Scope mode="light" data-testid="light">
          {ghostTable('밝은 모드')}
        </IdsProvider.Scope>
      </Card>
    </IdsProvider>,
  );

  const card = screen.getByTestId('card').element();
  const light = screen.getByTestId('light').element();
  const [sameMode, switched] = [...card.querySelectorAll('table')];

  expect(getComputedStyle(headerOf(sameMode!)).backgroundColor).toBe(getComputedStyle(card).backgroundColor);
  expect(getComputedStyle(headerOf(switched!)).backgroundColor).toBe(getComputedStyle(light).backgroundColor);
  expect(getComputedStyle(light).backgroundColor).not.toBe(getComputedStyle(card).backgroundColor);
});
