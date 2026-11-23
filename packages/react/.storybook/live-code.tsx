import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';

import * as Solid16 from '@heroicons/react/16/solid';
import * as Solid20 from '@heroicons/react/20/solid';
import * as Outline24 from '@heroicons/react/24/outline';
import * as Solid24 from '@heroicons/react/24/solid';
import idsTailwindSource from '@gsainfoteam/ids-css/no-fonts.css?raw';

import * as Ids from '../src';

type CodeEditorAddon = typeof import('storybook-addon-code-editor');
type Monaco = Parameters<
  NonNullable<Parameters<CodeEditorAddon['setupMonaco']>[0]['onMonacoLoad']>
>[0];

const heroiconSets = {
  '@heroicons/react/16/solid': Solid16,
  '@heroicons/react/20/solid': Solid20,
  '@heroicons/react/24/outline': Outline24,
  '@heroicons/react/24/solid': Solid24,
};

export const liveImports = {
  '@gsainfoteam/ids-react': Ids,
  ...heroiconSets,
};

const idsDeclarations = import.meta.glob<string>('../dist/**/*.d.ts', {
  query: '?raw',
  import: 'default',
});

const heroiconDeclarations = (icons: Record<string, unknown>) =>
  [
    "import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';",
    "type Icon = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, 'ref'> & { title?: string; titleId?: string } & RefAttributes<SVGSVGElement>>;",
    ...Object.keys(icons).map((name) => `export declare const ${name}: Icon;`),
  ].join('\n');

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

  const files = await Promise.all(
    declarations.map(async ([path, load]) => [path.replace('../', ''), await load()] as const),
  );
  for (const [path, source] of files) {
    typescript.typescriptDefaults.addExtraLib(
      source,
      `file:///node_modules/@gsainfoteam/ids-react/${path}`,
    );
  }
  typescript.typescriptDefaults.addExtraLib(
    "export * from './dist/index';",
    'file:///node_modules/@gsainfoteam/ids-react/index.d.ts',
  );
}

let addonLoad: Promise<CodeEditorAddon> | undefined;

const loadTheAddonOnTheClient = () =>
  (addonLoad ??= import('storybook-addon-code-editor').then((addon) => {
    addon.setupMonaco({ onMonacoLoad: teachMonacoTheImports });
    return addon;
  }));

function useCodeEditorAddon() {
  const [addon, setAddon] = useState<CodeEditorAddon>();

  useEffect(() => {
    let mounted = true;
    void loadTheAddonOnTheClient().then((loaded) => {
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

type LiveCode = { id: string; code: string };
type LiveStory = { render?: (args: object) => ReactNode };

const seededStories = new Map<string, LiveStory>();

function seedTheSharedCode(addon: CodeEditorAddon, { id, code }: LiveCode) {
  const seeded = seededStories.get(id);
  if (seeded) return seeded;

  const story: LiveStory = {};
  addon.makeLiveEditStory(story, { id, code, availableImports: liveImports });
  seededStories.set(id, story);
  return story;
}

function LiveCodePreview(live: LiveCode) {
  const addon = useCodeEditorAddon();

  useEffect(startTailwindInTheBrowser, []);

  if (!addon) return null;
  return seedTheSharedCode(addon, live).render?.({}) ?? null;
}

const runsInABrowser = typeof window !== 'undefined';

export function liveCodeStory({ id, code, description }: LiveCode & { description: string }) {
  if (runsInABrowser)
    void loadTheAddonOnTheClient().then((addon) => seedTheSharedCode(addon, { id, code }));

  return {
    tags: ['!autodocs'],
    render: () => <LiveCodePreview id={id} code={code} />,
    parameters: {
      liveCodeEditor: { disable: false, id },
      docs: {
        source: { code, language: 'tsx' },
        description: { story: description },
      },
    },
  };
}

function EditorFrame({ editor }: { editor: ReactNode }) {
  return (
    <div className="sb-unstyled h-80 overflow-hidden" style={{ border: '1px solid #e5e5e5' }}>
      {editor}
    </div>
  );
}

function LiveCodeEditor({ id, code }: LiveCode) {
  const addon = useCodeEditorAddon();

  if (!addon) return <div className="h-80" />;
  return <addon.Playground id={id} code={code} Container={EditorFrame} />;
}

const DocsBlocks = lazy(() => import('./live-code-docs'));

export function LiveCodeDocsPage({ of, id, code }: LiveCode & { of: object }) {
  return (
    <Suspense fallback={null}>
      <DocsBlocks of={of} editor={<LiveCodeEditor id={id} code={code} />} />
    </Suspense>
  );
}
