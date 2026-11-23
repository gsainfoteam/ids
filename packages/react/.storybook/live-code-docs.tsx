import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ContextType,
  type ReactNode,
} from 'react';

import {
  Controls,
  Description,
  DocsContext,
  Primary,
  SourceContext,
  Stories,
  Subtitle,
  Title,
  useOf,
  useSourceProps,
} from '@storybook/addon-docs/blocks';
import idsTailwindSource from '@gsainfoteam/ids-css/no-fonts.css?raw';
import { GLOBALS_UPDATED, UPDATE_GLOBALS } from 'storybook/internal/core-events';

import { IdsStoryFrame, type Globals } from './ids-story-frame';
import { heroiconSets, idsEntries, liveImports, resolveLiveImport } from './live-imports';
import { liveModuleFrom } from './live-module';

type CodeEditorAddon = typeof import('storybook-addon-code-editor');
type Monaco = Parameters<
  NonNullable<Parameters<CodeEditorAddon['setupMonaco']>[0]['onMonacoLoad']>
>[0];

const idsDeclarations = import.meta.glob<string>('../dist/**/*.d.ts', {
  query: '?raw',
  import: 'default',
});

const heroiconDeclarations = (icons: object) =>
  [
    "import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';",
    "type Icon = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, 'ref'> & { title?: string; titleId?: string } & RefAttributes<SVGSVGElement>>;",
    ...Object.keys(icons).map((name) => `export declare const ${name}: Icon;`),
  ].join('\n');

const entryDeclaration = (module: string) => {
  const entry = module.replace('@gsainfoteam/ids-react', '') || '/index';
  return [
    `file:///node_modules/@gsainfoteam/ids-react${entry}.d.ts`,
    `export * from './dist${entry}';`,
  ];
};

const MODULES_TYPED_AS_ANY = ['recharts', '@internationalized/date'];

async function teachMonacoTheImports(monaco: Monaco) {
  const typescript = monaco.languages.typescript;
  const declarations = Object.entries(idsDeclarations);

  typescript.typescriptDefaults.setCompilerOptions({
    jsx: typescript.JsxEmit.ReactJSX,
    target: typescript.ScriptTarget.ES2020,
    module: typescript.ModuleKind.ESNext,
    moduleResolution: typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    strict: true,
  });
  typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: declarations.length === 0,
    noSyntaxValidation: false,
  });

  for (const [module, icons] of Object.entries(heroiconSets)) {
    typescript.typescriptDefaults.addExtraLib(
      heroiconDeclarations(icons),
      `file:///node_modules/${module}/index.d.ts`,
    );
  }
  typescript.typescriptDefaults.addExtraLib(
    MODULES_TYPED_AS_ANY.map((module) => `declare module '${module}';`).join('\n'),
    'file:///node_modules/@types/typed-as-any-in-the-editor/index.d.ts',
  );

  const files = await Promise.all(
    declarations.map(async ([path, load]) => [path.replace('../', ''), await load()] as const),
  );
  for (const [path, source] of files) {
    typescript.typescriptDefaults.addExtraLib(
      source,
      `file:///node_modules/@gsainfoteam/ids-react/${path}`,
    );
  }
  for (const module of Object.keys(idsEntries)) {
    const [path, source] = entryDeclaration(module);
    typescript.typescriptDefaults.addExtraLib(source!, path);
  }
}

let addonLoad: Promise<CodeEditorAddon> | undefined;

const loadTheAddon = () =>
  (addonLoad ??= import('storybook-addon-code-editor').then((addon) => {
    addon.setupMonaco({ onMonacoLoad: teachMonacoTheImports });
    return addon;
  }));

function useCodeEditorAddon() {
  const [addon, setAddon] = useState<CodeEditorAddon>();

  useEffect(() => {
    let mounted = true;
    void loadTheAddon().then((loaded) => {
      if (mounted) setAddon(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return addon;
}

const TAILWIND_IN_THE_BROWSER = [
  '@import "tailwindcss/theme.css" layer(theme);',
  '@import "tailwindcss/utilities.css" layer(utilities);',
  idsTailwindSource,
].join('\n');

function startTailwindInTheBrowser() {
  if (document.querySelector('style[data-live-code-tailwind]')) return;

  const source = document.createElement('style');
  source.type = 'text/tailwindcss';
  source.dataset['liveCodeTailwind'] = '';
  source.textContent = TAILWIND_IN_THE_BROWSER;
  document.head.append(source);
  // @ts-expect-error @tailwindcss/browser ships a global script without types.
  void import('@tailwindcss/browser');
}

type Frame = { globals: Globals; updateGlobals: (globals: Globals) => void };

const FrameContext = createContext<Frame>({ globals: {}, updateGlobals: () => {} });

function PreviewAboveTheEditor({ editor, preview }: { editor: ReactNode; preview: ReactNode }) {
  const frame = use(FrameContext);

  return (
    <div
      className="sb-unstyled"
      style={{ border: '1px solid #e5e5e5', borderRadius: 4, margin: '24px 0', overflow: 'hidden' }}
    >
      <IdsStoryFrame {...frame} placement="docs">
        {preview}
      </IdsStoryFrame>
      <div style={{ borderTop: '1px solid #e5e5e5', height: 320 }}>{editor}</div>
    </div>
  );
}

type DocsContextValue = NonNullable<ContextType<typeof DocsContext>>;
type PreparedStory = ReturnType<DocsContextValue['componentStoriesFromCSFFile']>[number];

function useDocsGlobals(docs: DocsContextValue, story: PreparedStory): Frame {
  const [globals, setGlobals] = useState<Globals>(() => docs.getStoryContext(story).globals);

  useEffect(() => {
    const follow = ({ globals: next }: { globals: Globals }) => setGlobals(next);
    docs.channel.on(GLOBALS_UPDATED, follow);
    return () => docs.channel.off(GLOBALS_UPDATED, follow);
  }, [docs]);

  return {
    globals,
    updateGlobals: (next) => docs.channel.emit(UPDATE_GLOBALS, { globals: next }),
  };
}

const STARTER_STORY = 'Usage';

const originalSourceOf = (story: PreparedStory): string | undefined =>
  story.parameters['docs']?.source?.originalSource;

const showCodeWaitsForTheRender = (story: PreparedStory, code: string | undefined) =>
  story.parameters['__isArgsStory'] === true && (!code || code === originalSourceOf(story));

const isExample = (story: PreparedStory) =>
  !story.tags.includes('verification') && story.name !== STARTER_STORY;

function useStarterModule(docs: DocsContextValue, stories: PreparedStory[]) {
  const sources = use(SourceContext);
  const primary = stories[0]!;
  const usage = stories.find((story) => story.name === STARTER_STORY) ?? primary;
  const usageCode = useSourceProps({ of: usage.moduleExport }, docs, sources).code;
  const primaryCode = useSourceProps({ of: primary.moduleExport }, docs, sources).code;
  const examplesMayStart = !showCodeWaitsForTheRender(primary, primaryCode);

  const candidate = useMemo(() => {
    const examples = examplesMayStart ? stories.filter(isExample).map(originalSourceOf) : [];
    return [usageCode, primaryCode, ...examples]
      .map((code) => (code ? liveModuleFrom(code, resolveLiveImport) : undefined))
      .find(Boolean);
  }, [usageCode, primaryCode, examplesMayStart, stories]);
  const [starter, setStarter] = useState<string>();

  useEffect(() => {
    if (!starter && candidate) setStarter(candidate);
  }, [starter, candidate]);

  return starter;
}

function LiveCode({ id, stories }: { id: string; stories: PreparedStory[] }) {
  const docs = use(DocsContext)!;
  const addon = useCodeEditorAddon();
  const frame = useDocsGlobals(docs, stories[0]!);
  const starter = useStarterModule(docs, stories);

  useEffect(startTailwindInTheBrowser, []);

  if (!addon || !starter) return null;
  return (
    <FrameContext value={frame}>
      <addon.Playground
        id={id}
        code={starter}
        availableImports={liveImports}
        Container={PreviewAboveTheEditor}
      />
    </FrameContext>
  );
}

export default function LiveCodeDocsPage() {
  const docs = use(DocsContext)!;
  const resolved = useOf('meta');
  if (resolved.type !== 'meta') return null;
  const { csfFile } = resolved;
  const stories = docs.componentStoriesFromCSFFile(csfFile);

  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      {stories.length > 0 && (
        <LiveCode key={csfFile.meta.id} id={`live-${csfFile.meta.id}`} stories={stories} />
      )}
      <Primary />
      <Controls />
      <Stories />
    </>
  );
}
