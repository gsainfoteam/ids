import { useEffect, useState, type ComponentProps } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, TextArea } from '../src';
import { skipWithoutCdp } from './engines';
import { arcOf, expectTheArcToHug, middleOfTheArc, type Point } from './resize-grip';
import { Field as RhfField } from '../src/react-hook-form';

const LINE_PX = 20;
const PADDING_PX = 8;

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

function pinRowMetrics(node: HTMLTextAreaElement | null) {
  if (!node) return;
  node.style.lineHeight = `${LINE_PX}px`;
  node.style.padding = `${PADDING_PX}px`;
  node.style.border = '1px solid';
  node.style.boxSizing = 'border-box';
}

function Own(props: ComponentProps<'textarea'>) {
  return <textarea {...props} data-own="" />;
}

test('SSR: Field labels/descriptions target the native textarea, not the surface', () => {
  const doc = parse(
    renderToString(
      <Field required invalid size="tiny">
        <Field.Label>Bio</Field.Label>
        <TextArea defaultValue="Initial" rows={5} />
        <Field.Error>Invalid</Field.Error>
      </Field>,
    ),
  );
  const textarea = doc.querySelector('textarea')!;
  expect(textarea.value).toBe('Initial');
  expect(textarea.rows).toBe(5);
  expect(doc.querySelector('label')!.htmlFor).toBe(textarea.id);
  expect(doc.getElementById(textarea.id)).toBe(textarea);
  expect(textarea.getAttribute('aria-invalid')).toBe('true');
  expect(textarea.required).toBe(true);
  expect(doc.querySelector<HTMLElement>('[data-text-area]')!.dataset.size).toBe('tiny');
  expect(doc.getElementById(textarea.getAttribute('aria-describedby')!)!.textContent).toBe(
    'Invalid',
  );
});

test('sentinel/Fragment order, root native props, asChild handlers and React 19 ref cleanup', async () => {
  let node: HTMLTextAreaElement | null = null;
  let cleaned = 0;
  const changes: string[] = [];
  const screen = await render(
    <TextArea
      id="root-control"
      name="bio"
      maxLength={200}
      onChange={() => changes.push('root')}
      ref={(value) => {
        node = value;
        return () => {
          cleaned++;
        };
      }}
    >
      <>
        <button type="button">Toolbar</button>
        <TextArea.Input asChild onChange={() => changes.push('input')}>
          <textarea id="child-id" onChange={() => changes.push('child')} />
        </TextArea.Input>
        <span>Counter</span>
      </>
    </TextArea>,
  );
  const textarea = screen.getByRole('textbox');
  expect(node).toBe(textarea.element());
  await expect.element(textarea).toHaveAttribute('id', 'root-control');
  await expect.element(textarea).toHaveAttribute('name', 'bio');
  await expect.element(textarea).toHaveAttribute('maxlength', '200');
  const shell = screen.container.querySelector<HTMLElement>('[data-text-area]')!;
  expect(
    Array.from(shell.children, (element) => {
      if (!(element instanceof HTMLElement)) return element.tagName;
      if ('textAreaTop' in element.dataset) return 'top';
      if ('scrollArea' in element.dataset) return element.firstElementChild!.tagName;
      return 'textAreaBottom' in element.dataset ? 'bottom' : element.tagName;
    }),
  ).toEqual(['top', 'TEXTAREA', 'bottom']);
  expect(shell.querySelector('[data-text-area-top]')!.textContent).toBe('Toolbar');
  expect(shell.querySelector('[data-text-area-bottom]')!.textContent).toBe('Counter');
  await userEvent.fill(textarea, '가나다');
  expect(changes).toEqual(['child', 'root', 'input']);
  await expect.element(textarea).toHaveValue('가나다');
  await screen.unmount();
  expect(cleaned).toBe(1);
});

test('native form data, composition events, readOnly/disabled and the resize grip', async () => {
  const events: string[] = [];
  const screen = await render(
    <form>
      <TextArea
        name="message"
        defaultValue="안녕"
        autoResize={false}
        resize="both"
        readOnly
        onCompositionStart={() => events.push('start')}
        onCompositionEnd={() => events.push('end')}
      />
    </form>,
  );
  const textarea = screen.getByRole('textbox');
  const shell = () => screen.container.querySelector<HTMLElement>('[data-text-area]')!;
  const grip = () => screen.container.querySelector<HTMLElement>('[data-resize-grip]');
  await expect.element(screen.getByRole('group', { name: '크기 조절' })).toBeVisible();
  expect(grip()).not.toHaveAttribute('data-disabled');
  expect(getComputedStyle(shell()).resize).toBe('none');
  await expect.element(textarea).toHaveAttribute('readonly');
  expect(new FormData(screen.container.querySelector('form')!).get('message')).toBe('안녕');
  textarea.element().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  textarea
    .element()
    .dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '녕' }));
  expect(events).toEqual(['start', 'end']);
  await screen.rerender(
    <Field disabled aria-label="Message">
      <TextArea />
    </Field>,
  );
  await expect.element(textarea).toHaveAttribute('disabled');
  expect(grip()).toBeNull();
  await screen.rerender(
    <Field invalid={false} aria-label="Message">
      <TextArea invalid />
    </Field>,
  );
  await expect.element(textarea).toHaveAttribute('aria-invalid', 'false');
  await expect.element(shell()).not.toHaveAttribute('data-invalid');
  await screen.rerender(<TextArea invalid />);
  await expect.element(textarea).toHaveAttribute('aria-invalid', 'true');
  await expect.element(shell()).toHaveAttribute('data-invalid', '');
});

test('invalid structures and row bounds fail clearly', () => {
  for (const node of [
    <TextArea>
      <TextArea.Input />
      <TextArea.Input />
    </TextArea>,
    <TextArea minRows={0} />,
    <TextArea minRows={5} maxRows={2} />,
    <TextArea resize="both" />,
    <TextArea>
      <TextArea.Input asChild>
        <input />
      </TextArea.Input>
    </TextArea>,
  ])
    expect(() => renderToString(node)).toThrow(/\[IDS\] `<TextArea/);
});

test('autoResize grows, caps at maxRows, shrinks, follows controlled changes and hands style back', async () => {
  const view = (value: string, autoResize = true) => (
    <TextArea autoResize={autoResize} minRows={2} maxRows={4} value={value} onChange={() => {}}>
      <TextArea.Input ref={pinRowMetrics} style={{ height: '99px', overflowY: 'scroll' }} />
    </TextArea>
  );
  const screen = await render(view('a'));
  const textarea = () => screen.getByRole('textbox').element() as HTMLTextAreaElement;
  await expect.poll(() => textarea().style.height).toBe('58px');
  await screen.rerender(view('a\nb\nc'));
  await expect.poll(() => textarea().style.height).toBe('78px');
  await screen.rerender(view('a\nb\nc\nd\ne\nf'));
  await expect.poll(() => textarea().style.height).toBe('98px');
  await screen.rerender(view('a'));
  await expect.poll(() => textarea().style.height).toBe('58px');
  await screen.rerender(view('a', false));
  expect(textarea().style.height).toBe('99px');
  expect(textarea().style.overflowY).toBe('scroll');
  await expect.element(screen.getByRole('separator', { name: '높이' })).toBeInTheDocument();
});

test('native form reset resizes after defaultValue is restored', async () => {
  const screen = await render(
    <form>
      <TextArea autoResize minRows={1} maxRows={5} defaultValue="initial">
        <TextArea.Input ref={pinRowMetrics} />
      </TextArea>
      <button type="reset">Reset</button>
    </form>,
  );
  const textarea = screen.getByRole('textbox');
  const height = () => (textarea.element() as HTMLTextAreaElement).style.height;
  await userEvent.fill(textarea, '1\n2\n3\n4');
  await expect.poll(height).toBe('98px');
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.element(textarea).toHaveValue('initial');
  await expect.poll(height).toBe('38px');
});

test('asChild with a component leaves the height to that component', async () => {
  const screen = await render(
    <TextArea minRows={1} maxRows={3}>
      <TextArea.Input asChild ref={pinRowMetrics}>
        <Own />
      </TextArea.Input>
    </TextArea>,
  );
  const textarea = screen.getByRole('textbox');
  const height = () => (textarea.element() as HTMLTextAreaElement).style.height;
  await userEvent.fill(textarea, '1\n2\n3\n4\n5');
  await expect.element(textarea).toHaveAttribute('data-own');
  expect(height()).toBe('');
  await screen.rerender(
    <TextArea minRows={1} maxRows={3}>
      <TextArea.Input asChild ref={pinRowMetrics}>
        <textarea />
      </TextArea.Input>
    </TextArea>,
  );
  await userEvent.fill(textarea, '1\n2\n3\n4\n5');
  await expect.poll(height).toBe('78px');
});

test('RHF native registration: required error/focus, value, disabled, reset resizes uncontrolled textarea', async () => {
  let methods!: UseFormReturn<{ bio: string }>;
  function App() {
    const form = useForm({ defaultValues: { bio: '' } });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <RhfField name="bio" registerOptions={{ required: 'Bio required' }}>
          <RhfField.Label>Bio</RhfField.Label>
          <TextArea autoResize minRows={1} maxRows={5}>
            <TextArea.Input ref={pinRowMetrics} />
          </TextArea>
          <RhfField.Error />
        </RhfField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const textarea = screen.getByRole('textbox', { name: 'Bio' });
  const height = () => (textarea.element() as HTMLTextAreaElement).style.height;
  await methods.trigger('bio', { shouldFocus: true });
  await expect.element(textarea).toHaveAttribute('aria-invalid', 'true');
  await expect.element(textarea).toHaveFocus();
  await userEvent.fill(textarea, '1\n2\n3\n4');
  expect(methods.getValues('bio')).toBe('1\n2\n3\n4');
  await expect.poll(height).toBe('98px');
  methods.reset();
  await expect.element(textarea).toHaveValue('');
  await expect.poll(height).toBe('38px');
});

test('state on the shell, the textarea marked for focus-ring, onValueChange next to onChange', async () => {
  const events: Array<[string, string]> = [];
  const screen = await render(
    <TextArea
      aria-label="Bio"
      onChange={(event) => events.push(['change', event.target.value])}
      onValueChange={(value) => events.push(['value', value])}
    />,
  );
  const textarea = screen.getByRole('textbox', { name: 'Bio' });
  const shell = () => screen.container.querySelector<HTMLElement>('[data-text-area]')!;
  await expect.element(textarea).toHaveAttribute('data-field-input');
  await expect.element(shell()).not.toHaveAttribute('data-filled');
  await userEvent.click(textarea);
  await expect.element(shell()).toHaveAttribute('data-focused');
  await userEvent.fill(textarea, 'hello');
  await expect.element(shell()).toHaveAttribute('data-filled');
  expect(events).toEqual([
    ['change', 'hello'],
    ['value', 'hello'],
  ]);
  await screen.rerender(<TextArea key="ro" aria-label="Bio" readOnly invalid />);
  await expect.element(shell()).toHaveAttribute('data-readonly');
  await expect.element(shell()).toHaveAttribute('data-invalid');
});

test('Count shows the length against maxLength and joins the textarea description', async () => {
  const screen = await render(
    <Field>
      <Field.Label>Bio</Field.Label>
      <Field.Description>About you</Field.Description>
      <TextArea maxLength={20}>
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>
    </Field>,
  );
  const textarea = screen.getByRole('textbox', { name: 'Bio' });
  const counter = screen.container.querySelector<HTMLElement>('[data-text-area-count]')!;
  const live = screen.getByRole('status');
  await expect.element(counter).toHaveTextContent('0 / 20');
  expect(
    textarea
      .element()
      .getAttribute('aria-describedby')!
      .split(' ')
      .map((id) => document.getElementById(id)!.textContent),
  ).toEqual(['About you', '0 / 20']);
  await userEvent.fill(textarea, '012345678');
  await expect.element(counter).toHaveTextContent('9 / 20');
  await expect.element(counter).not.toHaveAttribute('data-near-limit');
  await userEvent.fill(textarea, '01234567890123');
  await expect.element(counter).toHaveAttribute('data-near-limit');
  await expect.element(live).toBeEmptyDOMElement();
  await expect.element(live).toHaveTextContent('6자 남았습니다.');
  await userEvent.fill(textarea, '01234567890123456789');
  await expect.element(counter).toHaveAttribute('data-at-limit');
  await expect.element(live).toHaveTextContent('글자 수 제한에 도달했습니다.');
  await userEvent.fill(textarea, '0123');
  await expect.element(live).toBeEmptyDOMElement();
});

test('Count without maxLength, custom rendering, threshold and announcement', async () => {
  const screen = await render(
    <TextArea aria-label="Note">
      <TextArea.Input />
      <TextArea.Count />
    </TextArea>,
  );
  const textarea = screen.getByRole('textbox', { name: 'Note' });
  const counter = () => screen.container.querySelector<HTMLElement>('[data-text-area-count]')!;
  await userEvent.fill(textarea, 'abc');
  await expect.element(counter()).toHaveTextContent('3');
  await screen.rerender(
    <TextArea key="custom" aria-label="Note" maxLength={100}>
      <TextArea.Input />
      <TextArea.Count threshold={97} announce={(state) => `left ${state.remaining}`}>
        {(state) => `${state.count}자`}
      </TextArea.Count>
    </TextArea>,
  );
  await userEvent.fill(textarea, 'abc');
  await expect.element(counter()).toHaveTextContent('3자');
  await expect.element(counter()).toHaveAttribute('data-near-limit');
  await expect.element(screen.getByRole('status')).toHaveTextContent('left 97');
});

test('Count follows a value written by code (react-hook-form setValue)', async () => {
  let methods!: UseFormReturn<{ bio: string }>;
  function App() {
    const form = useForm({ defaultValues: { bio: '' } });
    useEffect(() => {
      methods = form;
    });
    return (
      <FormProvider {...form}>
        <RhfField name="bio" aria-label="Bio">
          <TextArea maxLength={50}>
            <TextArea.Input />
            <TextArea.Count />
          </TextArea>
        </RhfField>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const counter = () => screen.container.querySelector<HTMLElement>('[data-text-area-count]')!;
  methods.setValue('bio', 'written by code');
  await expect.element(counter()).toHaveTextContent('15 / 50');
  let setOuter!: (value: string) => void;
  function Controlled() {
    const [value, setValue] = useState('ab');
    useEffect(() => {
      setOuter = setValue;
    }, []);
    return (
      <TextArea aria-label="C" value={value} onValueChange={setValue}>
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>
    );
  }
  await screen.rerender(<Controlled key="controlled" />);
  await expect.element(counter()).toHaveTextContent('2');
  setOuter('abcd');
  await expect.element(counter()).toHaveTextContent('4');
});

const GAP = 2;

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    x: frame.left + point.x * scale,
    y: frame.top + point.y * scale,
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

const resizable = (resize: TextArea.Resize) => (
  <TextArea autoResize={false} resize={resize} rows={3} aria-label="메모" className="w-72">
    <TextArea.Input ref={pinRowMetrics} />
  </TextArea>
);

test('each resize mode draws an IDS grip in the corner of the input area, none draws nothing', async () => {
  const screen = await render(resizable('vertical'));
  const textarea = () => screen.getByRole('textbox', { name: '메모' }).element() as HTMLElement;
  const shell = () => screen.container.querySelector<HTMLElement>('[data-text-area]')!;
  const corner = () => screen.container.querySelector<HTMLElement>('[data-scroll-area-corner]');

  const height = screen.getByRole('separator', { name: '높이' });
  await expect.element(height).toHaveAttribute('aria-controls', textarea().id);
  await expect.element(height).toHaveAttribute('aria-orientation', 'horizontal');
  await expect.element(height).toHaveAttribute('aria-valuenow', String(textarea().offsetHeight));
  expect(corner()!.contains(height.element())).toBe(true);
  expect(corner()!.closest('[data-scroll-area]')!.contains(textarea())).toBe(true);
  expect(getComputedStyle(textarea()).resize).toBe('none');

  await screen.rerender(resizable('horizontal'));
  const width = screen.getByRole('separator', { name: '너비' });
  await expect.element(width).toHaveAttribute('aria-controls', shell().id);
  await expect.element(width).toHaveAttribute('aria-valuenow', '288');

  await screen.rerender(resizable('both'));
  const group = screen.getByRole('group', { name: '크기 조절' });
  await expect.element(group).toBeVisible();
  expect(group.element().querySelectorAll('[role="separator"]')).toHaveLength(2);

  await screen.rerender(resizable('none'));
  expect(corner()).toBeNull();
  expect(screen.container.querySelector('[data-resize-handle]')).toBeNull();
});

test('keys resize the height on the textarea and the width on the whole field; Enter goes back', async () => {
  const screen = await render(resizable('both'));
  const textarea = () => screen.getByRole('textbox', { name: '메모' }).element() as HTMLElement;
  const shell = () => screen.container.querySelector<HTMLElement>('[data-text-area]')!;
  const naturalHeight = textarea().offsetHeight;

  await userEvent.click(screen.getByRole('textbox', { name: '메모' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('separator', { name: '너비' })).toHaveFocus();

  await userEvent.keyboard('{ArrowDown}');
  await expect.element(screen.getByRole('separator', { name: '높이' })).toHaveFocus();
  await expect.poll(() => textarea().style.height).toBe(`${naturalHeight + 16}px`);
  expect(shell().style.height).toBe('');

  await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
  await expect.element(screen.getByRole('separator', { name: '너비' })).toHaveFocus();
  await expect.poll(() => shell().style.width).toBe('224px');
  expect(textarea().offsetWidth).toBe(224);

  await userEvent.keyboard('{Home}');
  await expect.poll(() => shell().offsetWidth, { message: 'min-w-24 floors the width' }).toBe(96);

  await userEvent.keyboard('{Enter}');
  await expect.poll(() => shell().style.width).toBe('');
  expect(textarea().style.height).toBe('');
  expect(textarea().offsetHeight).toBe(naturalHeight);
});

test('the height floor is one line and maxRows caps it', async () => {
  const screen = await render(
    <TextArea autoResize={false} resize="vertical" rows={3} maxRows={4} aria-label="메모">
      <TextArea.Input ref={pinRowMetrics} />
    </TextArea>,
  );
  const handle = screen.getByRole('separator', { name: '높이' });
  await expect.element(handle).toHaveAttribute('aria-valuemin', String(LINE_PX + PADDING_PX * 2));
  await expect
    .element(handle)
    .toHaveAttribute('aria-valuemax', String(LINE_PX * 4 + PADDING_PX * 2));

  handle.element().focus();
  await userEvent.keyboard('{Home}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', String(LINE_PX + PADDING_PX * 2));
  await userEvent.keyboard('{End}');
  await expect
    .element(handle)
    .toHaveAttribute('aria-valuenow', String(LINE_PX * 4 + PADDING_PX * 2));
});

test('dragging the grip resizes the input area; the scrollbar stops above the grip', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <TextArea
      autoResize={false}
      resize="vertical"
      rows={3}
      aria-label="메모"
      className="w-72"
      defaultValue={Array.from({ length: 12 }, (_, line) => `줄 ${line + 1}`).join('\n')}
    >
      <TextArea.Input ref={pinRowMetrics} />
    </TextArea>,
  );
  const textarea = () => screen.getByRole('textbox', { name: '메모' }).element() as HTMLElement;
  const grip = () => screen.getByRole('separator', { name: '높이' }).element();
  const area = () => textarea().closest<HTMLElement>('[data-scroll-area]')!;
  const bar = () => area().querySelector<HTMLElement>('[data-scroll-area-scrollbar]')!;
  const clearance = () => grip().getBoundingClientRect().top - bar().getBoundingClientRect().bottom;
  await expect.element(area()).toHaveAttribute('data-overflow-y');
  await expect.poll(clearance).toBeCloseTo(GAP, 0);
  const cornerOfTheArea = area().getBoundingClientRect();
  expect(grip().getBoundingClientRect().right).toBe(cornerOfTheArea.right);
  expect(grip().getBoundingClientRect().bottom).toBe(cornerOfTheArea.bottom);

  textarea().focus();
  const naturalHeight = textarea().offsetHeight;
  const start = middleOfTheArc(grip());
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x, y: start.y + 30 });
  await mouse('mouseReleased', { x: start.x, y: start.y + 30 });
  await expect.poll(() => textarea().offsetHeight).toBe(naturalHeight + 30);
  await expect.element(screen.getByRole('textbox', { name: '메모' })).toHaveFocus();
  await expect.poll(clearance).toBeCloseTo(GAP, 0);
});

test('every resize mode draws the arc 5px inside the input area, concentric with its corner, and a bottom bar squares it', async () => {
  const field = (resize: TextArea.Resize, bottomBar = false) => (
    <TextArea autoResize={false} resize={resize} rows={3} aria-label="메모" className="w-72">
      <TextArea.Input />
      {bottomBar && <span>아래</span>}
    </TextArea>
  );
  const screen = await render(field('vertical'));
  const grip = () => screen.container.querySelector<HTMLElement>('[data-resize-grip]')!;
  const area = () =>
    screen.getByRole('textbox', { name: '메모' }).element().closest('[data-scroll-area]')!;
  const hugs = (radius: number) => () => {
    const corner = area().getBoundingClientRect();
    expectTheArcToHug(grip(), {
      side: 'right',
      runX: corner.right - 5,
      runY: corner.bottom - 5,
      radius,
    });
    return true;
  };

  for (const resize of ['vertical', 'horizontal', 'both'] as const) {
    await screen.rerender(field(resize));
    await expect.poll(() => arcOf(grip())).not.toBeNull();
    await expect.poll(hugs(5), { message: resize }).toBe(true);
  }

  await screen.rerender(field('both', true));
  await expect
    .poll(hugs(2), { message: 'the bottom bar squares the corner, so the arc turns into an L' })
    .toBe(true);
});

test('right to left: the TextArea arc sits in the bottom-left corner of the input area', async () => {
  const screen = await render(
    <div dir="rtl">
      <TextArea autoResize={false} resize="both" rows={3} aria-label="메모" className="w-72" />
    </div>,
  );
  const grip = () => screen.getByRole('group', { name: '크기 조절' }).element();
  const area = () =>
    screen.getByRole('textbox', { name: '메모' }).element().closest('[data-scroll-area]')!;

  await expect.poll(() => arcOf(grip())).not.toBeNull();
  const corner = area().getBoundingClientRect();
  expect(grip().getBoundingClientRect().left).toBe(corner.left);
  expectTheArcToHug(grip(), {
    side: 'left',
    runX: corner.left + 5,
    runY: corner.bottom - 5,
    radius: 5,
  });
});

test('a one-axis grip draws its focus along the arc, not as a ring around its box', async () => {
  const screen = await render(
    <TextArea autoResize={false} resize="vertical" rows={3} aria-label="메모" className="w-72" />,
  );
  const handle = screen.getByRole('separator', { name: '높이' });
  const halo = () => handle.element().querySelector('[data-resize-grip-halo]')!;

  await expect.poll(() => handle.element().querySelector('[data-resize-grip-halo]')).not.toBeNull();
  expect(getComputedStyle(halo()).opacity).toBe('0');

  await userEvent.click(screen.getByRole('textbox', { name: '메모' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(handle).toHaveFocus();
  expect(getComputedStyle(halo()).opacity).toBe('1');
  expect(getComputedStyle(handle.element()).boxShadow).toBe('none');
});

test('a disabled TextArea keeps its grip out of the tab order', async () => {
  const screen = await render(
    <TextArea autoResize={false} resize="vertical" disabled aria-label="메모" />,
  );
  const handle = screen.getByRole('separator', { name: '높이' });
  await expect.element(handle).toHaveAttribute('aria-disabled', 'true');
  await expect.element(handle).not.toHaveAttribute('tabindex');
});
