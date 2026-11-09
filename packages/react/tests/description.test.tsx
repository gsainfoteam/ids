import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Alert, Card, Empty, Field, Item, TextField } from '../src';

afterEach(() => {
  vi.restoreAllMocks();
});

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const descriptions: Array<{
  name: string;
  wrap: (description: ReactNode) => ReactNode;
  Description: typeof Card.Description;
}> = [
  {
    name: 'Card.Description',
    wrap: (description) => (
      <Card>
        <Card.Header>
          <Card.Title>Title</Card.Title>
          {description}
        </Card.Header>
      </Card>
    ),
    Description: Card.Description,
  },
  {
    name: 'Item.Description',
    wrap: (description) => (
      <Item>
        <Item.Content>
          <Item.Title>Title</Item.Title>
          {description}
        </Item.Content>
      </Item>
    ),
    Description: Item.Description,
  },
  {
    name: 'Empty.Description',
    wrap: (description) => (
      <Empty>
        <Empty.Title>Title</Empty.Title>
        {description}
      </Empty>
    ),
    Description: Empty.Description,
  },
  {
    name: 'Alert.Description',
    wrap: (description) => (
      <Alert>
        <Alert.Title>Title</Alert.Title>
        {description}
      </Alert>
    ),
    Description: Alert.Description as typeof Card.Description,
  },
  {
    name: 'Field.Description',
    wrap: (description) => (
      <Field>
        <Field.Label>Title</Field.Label>
        {description}
        <TextField />
      </Field>
    ),
    Description: Field.Description as typeof Card.Description,
  },
];

test.each(descriptions)('$name is a paragraph on the server', ({ wrap, Description }) => {
  const doc = parse(renderToString(wrap(<Description>Some text</Description>)));
  const paragraph = [...doc.querySelectorAll('p')].find((p) => p.textContent === 'Some text');
  expect(paragraph, 'the description renders a <p>').toBeDefined();
});

test.each(descriptions)(
  '$name warns in development about a block element inside the paragraph',
  async ({ name, wrap, Description }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      wrap(
        <Description>
          <div>Block</div>
        </Description>,
      ),
    );
    await expect
      .poll(() => warn.mock.calls.flat().join('\n'))
      .toContain(`[IDS] ${name}: it renders a <p>, which cannot hold a <div>.`);
  },
);

test.each(descriptions)(
  '$name takes block content through asChild without a warning',
  async ({ wrap, Description }) => {
    const warn = vi.spyOn(console, 'warn');
    const screen = await render(
      wrap(
        <Description asChild>
          <div>
            <p>First</p>
            <p>Second</p>
          </div>
        </Description>,
      ),
    );
    await expect.element(screen.getByText('Second')).toBeVisible();
    const paragraphOwner = screen.getByText('First').element().parentElement!;
    expect(paragraphOwner.localName).toBe('div');
    expect(warn.mock.calls.flat().join('\n')).not.toContain('cannot hold');
  },
);
