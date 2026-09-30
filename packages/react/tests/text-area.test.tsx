import { Fragment, useEffect, useState, type ComponentProps } from 'react';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, IconButton, Resizable, TextArea } from '../src';
import { skipWithoutCdp } from './engines';
import { arcOf, expectTheArcToHug, middleOfTheArc, pointsAlong, type Point } from './resize-grip';
import { clearOfCurve } from '../src/components/layout/scroll-area/geometry';
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
const FIELD_RADIUS = 10;
const BAND_INSIDE = 2;
const BAND_OUTSIDE = 22;
const MODES = ['vertical', 'horizontal', 'both'] as const;
const SIZES = ['standard', 'tiny'] as const;

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

const twelveLines = Array.from({ length: 12 }, (_, line) => `줄 ${line + 1}`).join('\n');

const shellOf = (element: Element) => element.closest<HTMLElement>('[data-text-area]')!;

const handleIn = (root: Element) =>
  root.querySelector<HTMLElement>(':scope > [data-resize-edge], :scope > [data-resize-grip]')!;

const centerOf = (element: Element): Point => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

const hits = (element: Element, { x, y }: Point) =>
  element.contains(document.elementFromPoint(x, y));

test('each resize mode draws the handle Resizable draws for that direction, as the last part of the field; none draws nothing', async () => {
  const screen = await render(resizable('vertical'));
  const textarea = () => screen.getByRole('textbox', { name: '메모' }).element() as HTMLElement;
  const shell = () => shellOf(textarea());

  const height = screen.getByRole('separator', { name: '높이' });
  await expect.element(height).toHaveAttribute('aria-controls', textarea().id);
  await expect.element(height).toHaveAttribute('aria-orientation', 'horizontal');
  await expect.element(height).toHaveAttribute('aria-valuenow', String(textarea().offsetHeight));
  expect(shell().lastElementChild).toBe(height.element());
  expect(screen.container.querySelector('[data-scroll-area-corner]')).toBeNull();
  expect(getComputedStyle(textarea()).resize).toBe('none');

  await screen.rerender(resizable('horizontal'));
  const width = screen.getByRole('separator', { name: '너비' });
  await expect.element(width).toHaveAttribute('aria-controls', shell().id);
  await expect.element(width).toHaveAttribute('aria-orientation', 'vertical');
  await expect.element(width).toHaveAttribute('aria-valuenow', '288');
  expect(shell().lastElementChild).toBe(width.element());

  await screen.rerender(resizable('both'));
  const group = screen.getByRole('group', { name: '크기 조절' });
  await expect.element(group).toBeVisible();
  expect(group.element().querySelectorAll('[role="separator"]')).toHaveLength(2);
  expect(shell().lastElementChild).toBe(group.element());

  await screen.rerender(resizable('none'));
  expect(screen.container.querySelector('[data-resize-handle]')).toBeNull();
});

test.each(['ltr', 'rtl'] as const)(
  '%s: each resize mode draws its handle where Resizable draws it for the same direction',
  async (dir) => {
    const screen = await render(
      <div dir={dir} className="flex flex-col items-start gap-12 p-8">
        {MODES.map((mode) => (
          <Fragment key={mode}>
            <TextArea autoResize={false} resize={mode} aria-label={mode} className="w-72">
              <TextArea.Input style={{ height: 80 }} />
            </TextArea>
            <Resizable
              direction={mode}
              defaultWidth={288}
              defaultHeight={80}
              data-testid={mode}
              className="rounded-standard inset-ring-1 inset-ring-(--ids-color-border)"
            >
              내용
            </Resizable>
          </Fragment>
        ))}
      </div>,
    );
    const relative = (root: Element, { x, y }: Point) => {
      const box = root.getBoundingClientRect();
      return { x: x - box.left, y: y - box.top };
    };
    const placement = (root: Element) => {
      const handle = handleIn(root).getBoundingClientRect();
      return { ...relative(root, handle), width: handle.width, height: handle.height };
    };
    const pill = (root: Element) => {
      const drawn = getComputedStyle(handleIn(root), '::before');
      return [
        drawn.width,
        drawn.height,
        drawn.top,
        drawn.left,
        drawn.transform,
        drawn.backgroundColor,
      ];
    };
    const arc = (root: Element) =>
      pointsAlong(arcOf(handleIn(root))!, 16).map((point) => relative(root, point));

    for (const mode of MODES) {
      const field = shellOf(screen.getByRole('textbox', { name: mode }).element());
      const box = screen.getByTestId(mode).element();
      expect([field.offsetWidth, field.offsetHeight]).toEqual([288, 80]);
      expect(placement(field), mode).toEqual(placement(box));

      if (mode !== 'both') {
        expect(pill(field), mode).toEqual(pill(box));
        continue;
      }

      await expect.poll(() => arcOf(handleIn(field))).not.toBeNull();
      await expect.poll(() => arcOf(handleIn(box))).not.toBeNull();
      const theirs = arc(box);
      arc(field).forEach((point, index) => {
        expect(point.x).toBeCloseTo(theirs[index]!.x, 1);
        expect(point.y).toBeCloseTo(theirs[index]!.y, 1);
      });
      expect(
        getComputedStyle(arcOf(handleIn(field))!).strokeWidth,
        'as thick as the arc of Resizable',
      ).toBe(getComputedStyle(arcOf(handleIn(box))!).strokeWidth);
    }

    const corner = shellOf(screen.getByRole('textbox', { name: 'both' }).element());
    const outer = corner.getBoundingClientRect();
    expectTheArcToHug(handleIn(corner), {
      side: dir === 'rtl' ? 'left' : 'right',
      runX: dir === 'rtl' ? outer.left : outer.right,
      runY: outer.bottom,
      radius: FIELD_RADIUS,
    });
  },
);

test.each(['ltr', 'rtl'] as const)(
  '%s: the hit band runs 24px outward from the inner edge of the drawn line',
  async (dir) => {
    const screen = await render(
      <div dir={dir} className="flex flex-col items-start gap-16 p-8">
        {MODES.map((mode) => (
          <TextArea key={mode} autoResize={false} resize={mode} aria-label={mode} className="w-72">
            <TextArea.Input style={{ height: 80 }} />
          </TextArea>
        ))}
      </div>,
    );
    const field = (mode: string) => shellOf(screen.getByRole('textbox', { name: mode }).element());
    await expect.poll(() => arcOf(handleIn(field('both')))).not.toBeNull();
    const outward = dir === 'rtl' ? -1 : 1;

    const across = (mode: string, at: (inward: number) => Point) => {
      const handle = handleIn(field(mode));
      return [
        hits(handle, at(BAND_INSIDE - 1)),
        hits(handle, at(BAND_INSIDE + 1)),
        hits(handle, at(-(BAND_OUTSIDE - 1))),
        hits(handle, at(-(BAND_OUTSIDE + 1))),
      ];
    };
    const band = [true, false, true, false];

    const bottom = field('vertical').getBoundingClientRect();
    expect(
      across('vertical', (inward) => ({ x: bottom.left + 40, y: bottom.bottom - inward })),
      'the bottom pill, away from its middle',
    ).toEqual(band);

    const side = field('horizontal').getBoundingClientRect();
    const endEdge = dir === 'rtl' ? side.left : side.right;
    expect(
      across('horizontal', (inward) => ({ x: endEdge - outward * inward, y: side.top + 20 })),
      'the end pill, away from its middle',
    ).toEqual(band);

    const corner = field('both').getBoundingClientRect();
    const center = {
      x: (dir === 'rtl' ? corner.left : corner.right) - outward * FIELD_RADIUS,
      y: corner.bottom - FIELD_RADIUS,
    };
    const middle = middleOfTheArc(handleIn(field('both')));
    const inwardOf = {
      x: (center.x - middle.x) / FIELD_RADIUS,
      y: (center.y - middle.y) / FIELD_RADIUS,
    };
    expect(
      across('both', (inward) => ({
        x: middle.x + inwardOf.x * inward,
        y: middle.y + inwardOf.y * inward,
      })),
      'the corner arc',
    ).toEqual(band);
  },
);

test('the bar controls and the count next to the handle stay pressable in every mode and size', async () => {
  const onSend = vi.fn();
  const field = (resize: TextArea.Resize, size: (typeof SIZES)[number]) => (
    <div key={`${resize}-${size}`} className="flex flex-col items-start gap-16 p-8">
      <TextArea
        autoResize={false}
        resize={resize}
        size={size}
        rows={2}
        aria-label="보낼 글"
        className="w-72"
      >
        <TextArea.Input />
        <TextArea.Count />
        <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} onClick={onSend} />
      </TextArea>
      <TextArea
        autoResize={false}
        resize={resize}
        size={size}
        rows={2}
        maxLength={100}
        aria-label="센 글"
        className="w-72"
      >
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>
    </div>
  );
  const screen = await render(field('vertical', 'standard'));

  for (const resize of MODES)
    for (const size of SIZES) {
      await screen.rerender(field(resize, size));
      const label = `${resize} ${size}`;
      const send = screen.getByRole('button', { name: '보내기' });
      const button = send.element().getBoundingClientRect();
      const nearTheBottom = { x: button.left + button.width / 2, y: button.bottom - 1 };
      const nearTheEnd = { x: button.right - 1, y: button.top + button.height / 2 };
      expect(hits(send.element(), nearTheBottom), label).toBe(true);
      expect(hits(send.element(), nearTheEnd), label).toBe(true);

      const counted = shellOf(screen.getByRole('textbox', { name: '센 글' }).element());
      const count = counted.querySelector('[data-text-area-count]')!;
      const counter = count.getBoundingClientRect();
      expect(hits(count, { x: counter.right - 1, y: counter.bottom - 1 }), label).toBe(true);

      onSend.mockClear();
      await userEvent.click(send, { position: { x: button.width / 2, y: button.height - 1 } });
      await userEvent.click(send, { position: { x: button.width - 1, y: button.height / 2 } });
      expect(onSend, label).toHaveBeenCalledTimes(2);
    }
});

test('the scrollbar runs to the rounded corner and stays pressable next to the handle in every mode', async () => {
  const field = (resize: TextArea.Resize) => (
    <div className="flex flex-col items-start gap-8 p-8">
      <button type="button">밖</button>
      <TextArea
        key={resize}
        autoResize={false}
        resize={resize}
        rows={3}
        aria-label="메모"
        className="w-72"
        defaultValue={twelveLines}
      >
        <TextArea.Input ref={pinRowMetrics} />
      </TextArea>
    </div>
  );
  const screen = await render(field('vertical'));

  for (const resize of MODES) {
    await screen.rerender(field(resize));
    const textbox = screen.getByRole('textbox', { name: '메모' });
    const textarea = textbox.element() as HTMLTextAreaElement;
    const area = textarea.closest<HTMLElement>('[data-scroll-area]')!;
    const bar = () => area.querySelector<HTMLElement>('[data-scroll-area-scrollbar]')!;
    await expect.element(area).toHaveAttribute('data-overflow-y');
    await userEvent.hover(screen.getByRole('button', { name: '밖' }));
    await userEvent.hover(textbox);
    await expect.element(bar()).toHaveAttribute('data-visible');

    const track = bar().getBoundingClientRect();
    expect(area.getBoundingClientRect().bottom - track.bottom, resize).toBeCloseTo(
      clearOfCurve(FIELD_RADIUS, GAP),
      1,
    );
    expect(hits(bar(), { x: track.right - 1, y: track.top + track.height / 2 }), resize).toBe(true);
    expect(hits(bar(), { x: track.left + track.width / 2, y: track.bottom - 1 }), resize).toBe(
      true,
    );
    expect(hits(bar(), { x: track.right - 1, y: track.bottom - 3 }), resize).toBe(true);

    const size = [shellOf(textarea).offsetWidth, textarea.offsetHeight];
    textarea.scrollTop = 0;
    await userEvent.click(bar(), { position: { x: track.width - 1, y: track.height - 2 } });
    await expect.poll(() => textarea.scrollTop, { message: resize }).toBeGreaterThan(0);
    expect([shellOf(textarea).offsetWidth, textarea.offsetHeight], resize).toEqual(size);
  }
});

test('focus: the edge handle rings like Resizable edge handle, the field keeps its ring off, the corner grip draws along its arc; the handle is the last tab stop', async () => {
  const screen = await render(
    <div className="flex flex-col items-start gap-12 p-8">
      <TextArea autoResize={false} resize="vertical" aria-label="세로" className="w-72">
        <TextArea.Input />
        <IconButton aria-label="보내기" icon={<PaperAirplaneIcon />} />
      </TextArea>
      <Resizable direction="vertical" defaultWidth={288} defaultHeight={80} data-testid="box">
        내용
      </Resizable>
      <TextArea autoResize={false} resize="both" aria-label="양쪽" className="w-72" />
    </div>,
  );
  const vertical = shellOf(screen.getByRole('textbox', { name: '세로' }).element());
  const edge = handleIn(vertical);
  const resizableEdge = handleIn(screen.getByTestId('box').element());
  const grip = handleIn(shellOf(screen.getByRole('textbox', { name: '양쪽' }).element()));
  const ringAtRest = getComputedStyle(vertical).boxShadow;
  await expect.poll(() => grip.querySelector('[data-resize-grip-halo]')).not.toBeNull();
  const halo = () => grip.querySelector('[data-resize-grip-halo]')!;

  await userEvent.click(screen.getByRole('textbox', { name: '세로' }));
  expect(getComputedStyle(vertical).boxShadow).not.toBe(ringAtRest);
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '보내기' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(edge).toHaveFocus();

  const focusRing = getComputedStyle(edge).boxShadow;
  expect(focusRing).not.toBe('none');
  expect(getComputedStyle(vertical).boxShadow, 'the field does not ring for its handle').toBe(
    ringAtRest,
  );

  await userEvent.keyboard('{Tab}');
  await expect.element(resizableEdge).toHaveFocus();
  expect(getComputedStyle(resizableEdge).boxShadow).toBe(focusRing);

  expect(getComputedStyle(halo()).opacity).toBe('0');
  await userEvent.keyboard('{Tab}{Tab}');
  await expect.element(grip.querySelector<HTMLElement>('[role="separator"]')).toHaveFocus();
  expect(getComputedStyle(halo()).opacity, 'the focus halo follows the arc').toBe('1');
  expect(getComputedStyle(grip).boxShadow, 'no rectangle around the corner').toBe('none');
});

test('keys resize the height on the textarea and the width on the whole field; Enter goes back', async () => {
  const screen = await render(resizable('both'));
  const textarea = () => screen.getByRole('textbox', { name: '메모' }).element() as HTMLElement;
  const shell = () => shellOf(textarea());
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

test('dragging a handle resizes the field; Escape during a drag restores it and a double click resets', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(<div key="vertical">{resizable('vertical')}</div>);
  const textbox = () => screen.getByRole('textbox', { name: '메모' });
  const textarea = () => textbox().element() as HTMLElement;
  const shell = () => shellOf(textarea());
  const naturalHeight = textarea().offsetHeight;

  textarea().focus();
  let start = centerOf(handleIn(shell()));
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x, y: start.y + 30 });
  await mouse('mouseReleased', { x: start.x, y: start.y + 30 });
  await expect.poll(() => textarea().offsetHeight).toBe(naturalHeight + 30);
  await expect.element(textbox()).toHaveFocus();

  start = centerOf(handleIn(shell()));
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x, y: start.y + 20 });
  await expect.poll(() => textarea().offsetHeight).toBe(naturalHeight + 50);
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => textarea().offsetHeight).toBe(naturalHeight + 30);
  await mouse('mouseReleased', { x: start.x, y: start.y + 20 });

  await userEvent.dblClick(handleIn(shell()));
  await expect.poll(() => textarea().offsetHeight).toBe(naturalHeight);

  await screen.rerender(<div key="horizontal">{resizable('horizontal')}</div>);
  start = centerOf(handleIn(shell()));
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x - 40, y: start.y });
  await mouse('mouseReleased', { x: start.x - 40, y: start.y });
  await expect.poll(() => shell().offsetWidth).toBe(248);

  await screen.rerender(<div key="both">{resizable('both')}</div>);
  await expect.poll(() => arcOf(handleIn(shell()))).not.toBeNull();
  const heightBefore = textarea().offsetHeight;
  start = middleOfTheArc(handleIn(shell()));
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x + 20, y: start.y + 10 });
  await mouse('mouseReleased', { x: start.x + 20, y: start.y + 10 });
  await expect.poll(() => shell().offsetWidth).toBe(308);
  expect(textarea().offsetHeight).toBe(heightBefore + 10);
});

test('a disabled TextArea keeps its handle out of the tab order', async () => {
  const screen = await render(
    <TextArea autoResize={false} resize="vertical" disabled aria-label="메모" />,
  );
  const handle = screen.getByRole('separator', { name: '높이' });
  await expect.element(handle).toHaveAttribute('aria-disabled', 'true');
  await expect.element(handle).not.toHaveAttribute('tabindex');
});
