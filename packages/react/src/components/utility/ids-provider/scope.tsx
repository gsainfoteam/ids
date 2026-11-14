'use client';

import { IdsProviderRoot, type IdsProviderRootProps } from './root';

export type IdsProviderScopeProps = IdsProviderRootProps;

export function IdsProviderScope(props: IdsProviderScopeProps) {
  return <IdsProviderRoot {...props} />;
}

IdsProviderScope.displayName = 'IdsProvider.Scope';
