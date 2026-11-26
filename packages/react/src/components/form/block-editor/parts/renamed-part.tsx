'use client';

import { type ComponentType } from 'react';

import { registerEditorPartAlias } from '../../editor/lib/part-alias';

export function renamedPart<P extends object>(Part: ComponentType<P>, displayName: string) {
  function Renamed(props: P) {
    return <Part {...props} />;
  }
  Renamed.displayName = displayName;
  registerEditorPartAlias(Renamed, Part);

  return Renamed;
}
