import { Link } from '../../link';
import { isAllowedLinkHref } from '../schema/image-source';

import type { DocumentMarkProps } from './types';

export function LinkMark({ mark, children }: DocumentMarkProps) {
  if (!isAllowedLinkHref(mark.attrs.href)) return <>{children}</>;
  return <Link href={mark.attrs.href}>{children}</Link>;
}
