'use client';

import { IdsProviderRoot, type IdsProviderRootProps } from '../root';

export type IdsProviderScopeProps<Language extends string = string> =
  IdsProviderRootProps<Language>;

export function IdsProviderScope<const Language extends string = string>(
  props: IdsProviderScopeProps<Language>,
) {
  return <IdsProviderRoot {...props} />;
}

IdsProviderScope.displayName = 'IdsProvider.Scope';
