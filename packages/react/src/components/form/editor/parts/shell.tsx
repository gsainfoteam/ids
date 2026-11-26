'use client';

import { EditorBar } from './bar';
import { FormValue } from '../../../../internal/parts/form-value';
import { EditorContext } from '../context';
import { isTool } from '../lib/layout';

import type { EditorRoot } from '../hooks/use-editor-root';

function EditorFloating({ floating }: { floating: EditorRoot['floating'] }) {
  const { bubbles, loaded, setup } = floating;
  const mention = loaded?.features.mention;

  return (
    <>
      {bubbles}
      {loaded && setup && <loaded.engine.EditorSlashMenu store={setup.slashMenu} />}
      {loaded && setup?.blockHandle && (
        <loaded.engine.EditorBlockHandle store={setup.blockHandle} />
      )}
      {mention && setup?.mentionMenu && <mention.EditorMentionMenu store={setup.mentionMenu} />}
    </>
  );
}

export function EditorShell({ root }: { root: EditorRoot }) {
  const { context, rootProps, engine, floating, top, content, bottom, uploads, styles, t } = root;

  return (
    <EditorContext value={{ ...context, floating: <EditorFloating floating={floating} /> }}>
      <div {...rootProps}>
        {engine && (
          <engine.loaded.engine.EditorEngine options={engine.options} onEditor={engine.setEditor} />
        )}
        {top.length > 0 && (
          <EditorBar toolbar scrolls className={styles.bar()}>
            {top}
          </EditorBar>
        )}
        {content}
        {bottom.length > 0 && (
          <EditorBar toolbar={bottom.some(isTool)} scrolls className={styles.bar()}>
            {bottom}
          </EditorBar>
        )}
        {uploads && (
          <span role="status" className="sr-only">
            {uploads.pending > 0 ? t('editor.imageUploading') : ''}
          </span>
        )}
        <FormValue {...root.formValue} />
      </div>
    </EditorContext>
  );
}
