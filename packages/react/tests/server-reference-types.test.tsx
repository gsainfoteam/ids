import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Dialog, Field, IdsProvider, Image, Select, TextField } from '../src';
import { ImageViewer } from '../src/components/data/image/viewer';

const asServerComponentHandsItOver = <T,>(component: T): T =>
  ({
    $$typeof: Symbol.for('react.lazy'),
    _payload: component,
    _init: (payload: T) => payload,
  }) as unknown as T;

test('Select finds items whose type arrives as a resolved lazy reference', async () => {
  const Item = asServerComponentHandsItOver(Select.Item);
  render(
    <Select aria-label="Fruit">
      <Item value="apple">Apple</Item>
      <Item value="cherry">Cherry</Item>
    </Select>,
  );

  await userEvent.click(page.getByRole('combobox', { name: 'Fruit' }));
  await expect.element(page.getByRole('option', { name: 'Cherry' })).toBeVisible();
  await userEvent.click(page.getByRole('option', { name: 'Cherry' }));

  await expect.element(page.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Cherry');
});

test('Field labels a control through a lazily referenced Field.Label', async () => {
  const Label = asServerComponentHandsItOver(Field.Label);
  render(
    <Field>
      <Label>Name</Label>
      <TextField />
    </Field>,
  );

  await expect.element(page.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
});

test('Dialog lifts a lazily referenced Dialog.Overlay out of its children', async () => {
  const Overlay = asServerComponentHandsItOver(Dialog.Overlay);
  render(
    <Dialog defaultOpen>
      <Overlay data-testid="overlay" />
      <Dialog.Content>
        <Dialog.Title>Title</Dialog.Title>
      </Dialog.Content>
    </Dialog>,
  );

  await expect.element(page.getByRole('dialog', { name: 'Title' })).toBeVisible();
  await expect.element(page.getByTestId('overlay')).toHaveAttribute('data-dialog-backdrop');
});

test('Image.Group finds a viewer handed over already rendered to its client root', async () => {
  const Viewer = asServerComponentHandsItOver(ImageViewer);
  const lake = `data:image/svg+xml;base64,${btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30"/></svg>',
  )}`;
  render(
    <IdsProvider>
      <Image.Group aria-label="Photos">
        <Image src={lake} alt="Lake" />
        <Viewer aria-label="Photo viewer" />
      </Image.Group>
    </IdsProvider>,
  );

  await expect.element(page.getByRole('listitem')).toHaveLength(1);
  await userEvent.click(page.getByRole('button', { name: 'Lake 크게 보기' }));
  await expect.element(page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible();
});
