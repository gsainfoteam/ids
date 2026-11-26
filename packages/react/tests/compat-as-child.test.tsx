import { createRef, type ComponentProps, type ReactElement, type ReactNode, type Ref } from 'react';

import { PlusIcon } from '@heroicons/react/16/solid';
import {
  createLink,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { motion } from 'motion/react';
import { afterEach, beforeAll, describe, expect, test, vi, type Mock } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  Alert,
  Breadcrumb,
  Bubble,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  Drawer,
  FloatingButton,
  IconButton,
  IconToggle,
  IdsProvider,
  Item,
  Label,
  Link,
  Marker,
  Menu,
  Pagination,
  Popover,
  ScrollArea,
  Sidebar,
  Skeleton,
  Toggle,
  Tooltip,
} from '../src';
import { testTheme } from './theme';

import type { NextRouter } from 'next/dist/shared/lib/router/router';

Object.assign(globalThis, { process: { env: { NODE_ENV: 'test' } } });

const { default: NextLink } = await import('next/link');
const { RouterContext: NextRouterContext } =
  await import('next/dist/shared/lib/router-context.shared-runtime');

const DESKTOP = { width: 1024, height: 768 };
const PHONE = { width: 414, height: 896 };

function Anchor(props: ComponentProps<'a'>) {
  return <a {...props} />;
}

const TanStackLink = createLink(Anchor);

type LinkKind = 'next/link' | 'tanstack router' | 'motion.a';

const LINK_KINDS: LinkKind[] = ['next/link', 'tanstack router', 'motion.a'];

const HREF: Record<LinkKind, string> = {
  'next/link': '/next',
  'tanstack router': '/target',
  'motion.a': '/motion',
};

type ChildProps = {
  ref: Ref<HTMLAnchorElement>;
  onClick: Mock;
  className: string;
  'data-testid': string;
  'data-child': string;
  children?: ReactNode;
};

function linkChild(kind: LinkKind, props: ChildProps): ReactElement {
  if (kind === 'next/link') return <NextLink href={HREF[kind]} {...props} />;
  if (kind === 'tanstack router') return <TanStackLink to={HREF[kind]} {...props} />;
  return <motion.a href={HREF[kind]} {...props} />;
}

let followedHref: string | null = null;

beforeAll(() => {
  window.addEventListener('click', (event) => {
    const anchor = (event.target as Element).closest('a');
    if (!anchor) return;
    if (!event.defaultPrevented) followedHref = anchor.getAttribute('href');
    event.preventDefault();
  });
});

afterEach(async () => {
  followedHref = null;
  await page.viewport(PHONE.width, PHONE.height);
});

function nextRouter() {
  return {
    push: vi.fn((_href: string) => Promise.resolve(true)),
    replace: vi.fn(() => Promise.resolve(true)),
    prefetch: vi.fn(() => Promise.resolve()),
    beforePopState: vi.fn(),
    isLocaleDomain: false,
  };
}

async function mount(kind: LinkKind | 'none', ui: ReactNode) {
  if (kind === 'tanstack router') {
    const rootRoute = createRootRoute({
      component: () => (
        <>
          {ui}
          <Outlet />
        </>
      ),
    });
    const routeTree = rootRoute.addChildren([
      createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/target',
        component: () => <p>target page</p>,
      }),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    const screen = await render(
      <IdsProvider theme={testTheme}>
        <RouterProvider router={router} />
      </IdsProvider>,
    );
    return { screen, navigated: () => router.state.location.pathname };
  }

  if (kind === 'next/link') {
    const router = nextRouter();
    const screen = await render(
      <IdsProvider theme={testTheme}>
        <NextRouterContext value={router as unknown as NextRouter}>{ui}</NextRouterContext>
      </IdsProvider>,
    );
    return { screen, navigated: () => router.push.mock.calls.at(0)?.at(0) ?? null };
  }

  const screen = await render(<IdsProvider theme={testTheme}>{ui}</IdsProvider>);
  return { screen, navigated: () => followedHref };
}

type Wiring = { ref: Ref<HTMLElement>; onClick: Mock };

type LinkTarget = {
  name: string;
  marker: string;
  idsClass: string;
  forwardsRef: boolean;
  content?: ReactNode;
  viewport?: { width: number; height: number };
  render: (child: ReactElement, ids: Wiring) => ReactNode;
  afterClick?: (subject: HTMLElement) => void;
};

const LINK_TARGETS: LinkTarget[] = [
  {
    name: 'Button',
    marker: 'data-variant',
    idsClass: 'state-layer',
    forwardsRef: true,
    render: (child, ids) => (
      <Button
        asChild
        variant="outline"
        ref={ids.ref as Ref<HTMLButtonElement>}
        onClick={ids.onClick}
      >
        {child}
      </Button>
    ),
  },
  {
    name: 'IconButton',
    marker: 'data-variant',
    idsClass: 'state-layer',
    forwardsRef: true,
    content: <PlusIcon />,
    render: (child, ids) => (
      <IconButton
        asChild
        aria-label="Add"
        ref={ids.ref as Ref<HTMLButtonElement>}
        onClick={ids.onClick}
      >
        {child}
      </IconButton>
    ),
  },
  {
    name: 'FloatingButton',
    marker: 'data-variant',
    idsClass: 'state-layer',
    forwardsRef: true,
    content: <PlusIcon />,
    render: (child, ids) => (
      <FloatingButton asChild aria-label="Write" ref={ids.ref} onClick={ids.onClick}>
        {child}
      </FloatingButton>
    ),
  },
  {
    name: 'Link',
    marker: 'data-link',
    idsClass: 'underline',
    forwardsRef: true,
    render: (child, ids) => (
      <Link asChild ref={ids.ref as Ref<HTMLAnchorElement>} onClick={ids.onClick}>
        {child}
      </Link>
    ),
  },
  {
    name: 'Card',
    marker: 'data-card',
    idsClass: 'concentric-p-4',
    forwardsRef: true,
    render: (child, ids) => (
      <Card asChild ref={ids.ref as Ref<HTMLDivElement>} onClick={ids.onClick}>
        {child}
      </Card>
    ),
  },
  {
    name: 'Item',
    marker: 'data-item',
    idsClass: 'state-layer',
    forwardsRef: true,
    render: (child, ids) => (
      <Item asChild ref={ids.ref as Ref<HTMLDivElement>} onClick={ids.onClick}>
        {child}
      </Item>
    ),
  },
  {
    name: 'Chip',
    marker: 'data-chip',
    idsClass: 'rounded-full',
    forwardsRef: false,
    render: (child, ids) => (
      <Chip asChild onClick={ids.onClick}>
        {child}
      </Chip>
    ),
  },
  {
    name: 'Marker',
    marker: 'data-marker',
    idsClass: 'text-neutral',
    forwardsRef: true,
    render: (child, ids) => (
      <Marker asChild ref={ids.ref} onClick={ids.onClick}>
        {child}
      </Marker>
    ),
  },
  {
    name: 'Breadcrumb.Link',
    marker: 'data-breadcrumb-link',
    idsClass: 'focus-ring',
    forwardsRef: true,
    render: (child, ids) => (
      <Breadcrumb aria-label="이동 경로">
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild ref={ids.ref as Ref<HTMLAnchorElement>} onClick={ids.onClick}>
            {child}
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Here</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb>
    ),
  },
  {
    name: 'Pagination.Link',
    marker: 'data-pagination-page',
    idsClass: 'state-layer',
    forwardsRef: true,
    render: (child, ids) => (
      <Pagination aria-label="페이지 탐색" pageCount={5} defaultPage={1}>
        <Pagination.Link
          page={2}
          asChild
          ref={ids.ref as Ref<HTMLButtonElement>}
          onClick={ids.onClick}
        >
          {child}
        </Pagination.Link>
      </Pagination>
    ),
    afterClick: (subject) => expect(subject).toHaveAttribute('aria-current', 'page'),
  },
  {
    name: 'Menu.Item',
    marker: 'data-menu-item',
    idsClass: 'rounded-standard',
    forwardsRef: true,
    render: (child, ids) => (
      <Menu defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item asChild ref={ids.ref as Ref<HTMLDivElement>} onSelect={ids.onClick}>
            {child}
          </Menu.Item>
        </Menu.Content>
      </Menu>
    ),
  },
  {
    name: 'Sidebar.Item',
    marker: 'data-sidebar-item',
    idsClass: 'state-layer',
    forwardsRef: false,
    viewport: DESKTOP,
    render: (child, ids) => (
      <Sidebar aria-label="사이드바" value="/here">
        <Sidebar.Item value="/here" asChild onClick={ids.onClick}>
          {child}
        </Sidebar.Item>
      </Sidebar>
    ),
    afterClick: (subject) => expect(subject).toHaveAttribute('aria-current', 'page'),
  },
];

describe.each(LINK_TARGETS)('$name asChild around a router link', (target) => {
  test.each(LINK_KINDS)('%s', async (kind) => {
    if (target.viewport) await page.viewport(target.viewport.width, target.viewport.height);
    const idsRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLAnchorElement>();
    const ids: Wiring = { ref: idsRef, onClick: vi.fn() };
    const childClick = vi.fn();
    const child = linkChild(kind, {
      ref: childRef,
      onClick: childClick,
      className: 'child-class',
      'data-testid': 'subject',
      'data-child': '',
      children: target.content ?? 'Go',
    });
    const { screen, navigated } = await mount(kind, target.render(child, ids));
    const subject = screen.getByTestId('subject');

    await expect.element(subject).toBeInTheDocument();
    const element = subject.element() as HTMLElement;
    expect(element.tagName).toBe('A');
    expect(element.getAttribute('href')).toBe(HREF[kind]);
    expect(element.hasAttribute(target.marker), target.marker).toBe(true);
    expect(element).toHaveClass('child-class');
    expect(element).toHaveClass(target.idsClass);
    expect(element).toHaveAttribute('data-child', '');
    expect(childRef.current).toBe(element);
    if (target.forwardsRef) expect(idsRef.current).toBe(element);

    await userEvent.click(subject);

    expect(childClick).toHaveBeenCalledOnce();
    expect(ids.onClick).toHaveBeenCalledOnce();
    await expect.poll(navigated).toBe(HREF[kind]);
    target.afterClick?.(element);
  });
});

type Pressable = 'pressable' | `not pressable: ${string}`;

type SurfaceCase = {
  child: string;
  build: (props: { 'data-testid': string; children: ReactNode }) => ReactElement;
  kind: LinkKind | 'none';
  card: Pressable;
  item: Pressable;
};


const SURFACE_CASES: SurfaceCase[] = [
  {
    child: 'next/link',
    kind: 'next/link',
    build: (props) => <NextLink href={HREF['next/link']} {...props} />,
    card: 'pressable',
    item: 'pressable',
  },
  {
    child: 'tanstack router',
    kind: 'tanstack router',
    build: (props) => <TanStackLink to={HREF['tanstack router']} {...props} />,
    card: 'pressable',
    item: 'pressable',
  },
  {
    child: 'motion.a',
    kind: 'motion.a',
    build: (props) => <motion.a href={HREF['motion.a']} {...props} />,
    card: 'pressable',
    item: 'pressable',
  },
  {
    child: 'motion.button',
    kind: 'none',
    build: (props) => <motion.button type="button" {...props} />,
    card: 'pressable',
    item: 'pressable',
  },
];

const SURFACES = [
  {
    name: 'Card',
    today: (row: SurfaceCase) => row.card,
    render: (child: ReactElement) => <Card asChild>{child}</Card>,
  },
  {
    name: 'Item',
    today: (row: SurfaceCase) => row.item,
    render: (child: ReactElement) => <Item asChild>{child}</Item>,
  },
];

async function expectPressableSurface(
  subject: ReturnType<Awaited<ReturnType<typeof mount>>['screen']['getByTestId']>,
) {
  await expect.element(subject).toHaveAttribute('data-interactive', '');
  await userEvent.hover(subject);
  await expect.element(subject).toHaveAttribute('data-hovered', '');
}

describe.each(SURFACES)('$name asChild without onClick is a pressable surface', (surface) => {
  for (const row of SURFACE_CASES) {
    const today = surface.today(row);
    const run = today === 'pressable' ? test : test.fails;

    run(`${row.child} (${today})`, async () => {
      const { screen } = await mount(
        row.kind,
        surface.render(row.build({ 'data-testid': 'subject', children: 'Open the post' })),
      );
      const subject = screen.getByTestId('subject');

      await expectPressableSurface(subject);
    });
  }
});

describe.each(['next/link', 'tanstack router', 'motion.a'] as const)(
  'Button asChild disabled around %s',
  (kind) => {
    test('blocks the press, leaves the Tab order and does not navigate', async () => {
      const childClick = vi.fn();
      const idsClick = vi.fn();
      const child = linkChild(kind, {
        ref: createRef(),
        onClick: childClick,
        className: 'child-class',
        'data-testid': 'subject',
        'data-child': '',
        children: 'Go',
      });
      const { screen, navigated } = await mount(
        kind,
        <Button asChild disabled onClick={idsClick}>
          {child}
        </Button>,
      );
      const subject = screen.getByTestId('subject');

      await expect.element(subject).toHaveAttribute('aria-disabled', 'true');
      await expect.element(subject).toHaveAttribute('tabindex', '-1');

      await userEvent.click(subject, { force: true });

      expect(idsClick).not.toHaveBeenCalled();
      expect(childClick).not.toHaveBeenCalled();
      expect(navigated()).not.toBe(HREF[kind]);
    });

    test.fails(
      'drops the href the way it does for a literal <a> (open: the link component needs its href or to)',
      async () => {
        const child = linkChild(kind, {
          ref: createRef(),
          onClick: vi.fn(),
          className: '',
          'data-testid': 'subject',
          'data-child': '',
          children: 'Go',
        });
        const { screen } = await mount(
          kind,
          <Button asChild disabled>
            {child}
          </Button>,
        );

        await expect.element(screen.getByTestId('subject')).not.toHaveAttribute('href');
      },
    );
  },
);

type Screen = Awaited<ReturnType<typeof mount>>['screen'];

type KeepsFormUnsubmitted = 'keeps the form unsubmitted' | `submits the form: ${string}`;

type ButtonTarget = {
  name: string;
  marker?: string;
  forwardsRef: boolean;
  literalButton: KeepsFormUnsubmitted;
  render: (child: ReactElement, ids: Wiring) => ReactNode;
  beforeClick?: (screen: Screen) => Promise<void>;
  afterClick?: (screen: Screen) => Promise<void>;
};

const COMPONENT_CHILD_SUBMITS: KeepsFormUnsubmitted =
  'submits the form: Button, IconButton, Toggle and IconToggle and the overlay triggers set type="button" only on a literal <button> child, so a component child that renders a <button> without its own type gets the native submit';

const expectExpanded = async (screen: Screen) => {
  await expect.element(screen.getByTestId('subject')).toHaveAttribute('aria-expanded', 'true');
};

const BUTTON_TARGETS: ButtonTarget[] = [
  {
    name: 'Button',
    marker: 'data-variant',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Button asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
        {child}
      </Button>
    ),
  },
  {
    name: 'IconButton',
    marker: 'data-variant',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <IconButton
        asChild
        aria-label="Add"
        ref={ids.ref as Ref<HTMLButtonElement>}
        onClick={ids.onClick}
      >
        {child}
      </IconButton>
    ),
  },
  {
    name: 'Toggle',
    marker: 'data-variant',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Toggle asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
        {child}
      </Toggle>
    ),
    afterClick: async (screen) => {
      await expect.element(screen.getByTestId('subject')).toHaveAttribute('aria-pressed', 'true');
    },
  },
  {
    name: 'IconToggle',
    marker: 'data-variant',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <IconToggle
        asChild
        aria-label="Bold"
        ref={ids.ref as Ref<HTMLButtonElement>}
        onClick={ids.onClick}
      >
        {child}
      </IconToggle>
    ),
    afterClick: async (screen) => {
      await expect.element(screen.getByTestId('subject')).toHaveAttribute('aria-pressed', 'true');
    },
  },
  {
    name: 'Dialog.Trigger',
    marker: 'aria-haspopup',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Dialog>
        <Dialog.Trigger asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
          {child}
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Rename</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    ),
    afterClick: async (screen) => {
      await expectExpanded(screen);
      await expect.element(screen.getByRole('dialog', { name: 'Rename' })).toBeVisible();
    },
  },
  {
    name: 'Drawer.Trigger',
    marker: 'aria-haspopup',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Drawer>
        <Drawer.Trigger asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
          {child}
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Content>
      </Drawer>
    ),
    afterClick: async (screen) => {
      await expectExpanded(screen);
      await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    },
  },
  {
    name: 'Popover.Trigger',
    marker: 'aria-haspopup',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Popover>
        <Popover.Trigger asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
          {child}
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Sharing</Popover.Title>
        </Popover.Content>
      </Popover>
    ),
    afterClick: expectExpanded,
  },
  {
    name: 'Menu.Trigger',
    marker: 'aria-haspopup',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Menu>
        <Menu.Trigger asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
          {child}
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Rename</Menu.Item>
        </Menu.Content>
      </Menu>
    ),
    afterClick: async (screen) => {
      await expectExpanded(screen);
      await expect.element(screen.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
    },
  },
  {
    name: 'Tooltip.Trigger',
    forwardsRef: true,
    literalButton: 'keeps the form unsubmitted',
    render: (child, ids) => (
      <Tooltip>
        <Tooltip.Trigger asChild ref={ids.ref as Ref<HTMLButtonElement>} onClick={ids.onClick}>
          {child}
        </Tooltip.Trigger>
        <Tooltip.Content>Copy to clipboard</Tooltip.Content>
      </Tooltip>
    ),
    beforeClick: async (screen) => {
      const subject = screen.getByTestId('subject');

      await userEvent.hover(subject);

      await expect.element(subject).toHaveAccessibleDescription('Copy to clipboard');
    },
  },
];

describe.each(BUTTON_TARGETS)('$name asChild around motion.button', (target) => {
  test('renders the button with both sides merged and both handlers firing', async () => {
    const idsRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();
    const ids: Wiring = { ref: idsRef, onClick: vi.fn() };
    const childClick = vi.fn();
    const { screen } = await mount(
      'none',
      target.render(
        <motion.button
          type="button"
          ref={childRef}
          onClick={childClick}
          className="child-class"
          data-testid="subject"
          data-child=""
          initial={{ opacity: 0.5 }}
        >
          Open
        </motion.button>,
        ids,
      ),
    );
    const subject = screen.getByTestId('subject');

    await expect.element(subject).toBeInTheDocument();
    const element = subject.element() as HTMLElement;
    expect(element.tagName).toBe('BUTTON');
    if (target.marker) expect(element.hasAttribute(target.marker), target.marker).toBe(true);
    expect(element).toHaveClass('child-class');
    expect(element).toHaveAttribute('data-child', '');
    expect(getComputedStyle(element).opacity).toBe('0.5');
    expect(childRef.current).toBe(element);
    if (target.forwardsRef) expect(idsRef.current).toBe(element);
    await target.beforeClick?.(screen);

    await userEvent.click(subject);

    expect(childClick).toHaveBeenCalledOnce();
    expect(ids.onClick).toHaveBeenCalledOnce();
    await target.afterClick?.(screen);
  });

  const untypedButtons = [
    {
      child: 'motion.button',
      today: COMPONENT_CHILD_SUBMITS,
      build: () => <motion.button data-testid="subject">Open</motion.button>,
    },
    {
      child: 'literal <button>',
      today: target.literalButton,
      build: () => <button data-testid="subject">Open</button>,
    },
  ];

  for (const untyped of untypedButtons) {
    const run = untyped.today === 'keeps the form unsubmitted' ? test : test.fails;

    run(`a ${untyped.child} without its own type inside a form (${untyped.today})`, async () => {
      const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const { screen } = await mount(
        'none',
        <form onSubmit={(event) => submit(event.nativeEvent as SubmitEvent)}>
          {target.render(untyped.build(), { ref: createRef(), onClick: vi.fn() })}
        </form>,
      );

      await userEvent.click(screen.getByTestId('subject'));

      expect(submit).not.toHaveBeenCalled();
    });
  }
});

type StaticTarget = {
  name: string;
  marker: string;
  inertWhileLoading?: boolean;
  render: (child: (props: object) => ReactElement, ref: Ref<HTMLElement>) => ReactNode;
};

const STATIC_TARGETS: StaticTarget[] = [
  {
    name: 'Card',
    marker: 'data-card',
    render: (child, ref) => (
      <Card asChild ref={ref as Ref<HTMLDivElement>}>
        {child({})}
      </Card>
    ),
  },
  {
    name: 'Item',
    marker: 'data-item',
    render: (child, ref) => (
      <Item asChild ref={ref as Ref<HTMLDivElement>}>
        {child({})}
      </Item>
    ),
  },
  {
    name: 'Card.Title',
    marker: 'data-card-title',
    render: (child, ref) => (
      <Card>
        <Card.Header>
          <Card.Title asChild ref={ref as Ref<HTMLHeadingElement>}>
            {child({})}
          </Card.Title>
        </Card.Header>
      </Card>
    ),
  },
  {
    name: 'Alert.Title',
    marker: 'data-alert-title',
    render: (child, ref) => (
      <Alert>
        <Alert.Title asChild ref={ref as Ref<HTMLHeadingElement>}>
          {child({})}
        </Alert.Title>
      </Alert>
    ),
  },
  {
    name: 'Bubble',
    marker: 'data-bubble',
    render: (child, ref) => (
      <Bubble asChild ref={ref as Ref<HTMLDivElement>}>
        {child({})}
      </Bubble>
    ),
  },
  {
    name: 'Skeleton',
    marker: 'data-skeleton',
    inertWhileLoading: true,
    render: (child) => (
      <Skeleton asChild>
        {child({})}
      </Skeleton>
    ),
  },
  {
    name: 'Divider',
    marker: 'data-divider',
    render: (child, ref) => (
      <Divider asChild ref={ref}>
        {child({})}
      </Divider>
    ),
  },
  {
    name: 'ScrollArea',
    marker: 'data-scroll-area',
    render: (child, ref) => (
      <div className="flex h-40 flex-col">
        <ScrollArea asChild ref={ref as Ref<HTMLDivElement>}>
          {child({})}
        </ScrollArea>
      </div>
    ),
  },
  {
    name: 'Label',
    marker: 'data-label',
    render: (child, ref) => (
      <Label asChild ref={ref as Ref<HTMLLabelElement>}>
        {child({})}
      </Label>
    ),
  },
  {
    name: 'Marker',
    marker: 'data-marker',
    render: (child, ref) => (
      <Marker asChild ref={ref}>
        {child({})}
      </Marker>
    ),
  },
];

describe.each(STATIC_TARGETS)('$name asChild around motion.div', (target) => {
  test('keeps the motion element, its animation style, both classes and both refs', async () => {
    const idsRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLDivElement>();
    const childClick = vi.fn();
    const { screen } = await mount(
      'none',
      target.render(
        (props) => (
          <motion.div
            {...props}
            ref={childRef}
            onClick={childClick}
            className="child-class"
            data-testid="subject"
            data-child=""
            initial={{ opacity: 0.5 }}
          >
            Content
          </motion.div>
        ),
        idsRef,
      ),
    );
    const subject = screen.getByTestId('subject');

    await expect.element(subject).toBeInTheDocument();
    const element = subject.element() as HTMLElement;
    expect(element.tagName).toBe('DIV');
    expect(element.hasAttribute(target.marker), target.marker).toBe(true);
    expect(element).toHaveClass('child-class');
    expect(element.classList.length).toBeGreaterThan(1);
    expect(getComputedStyle(element).opacity).toBe('0.5');
    expect(childRef.current).toBe(element);
    if (idsRef.current !== null) expect(idsRef.current).toBe(element);
    if (target.inertWhileLoading) {
      expect(element.inert).toBe(true);
      return;
    }

    await userEvent.click(subject);

    expect(childClick).toHaveBeenCalledOnce();
  });
});
