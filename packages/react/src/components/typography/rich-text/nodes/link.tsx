import { Link } from '../../link';
import { isAllowedLinkHref } from '../schema/url-rules';

import type { DocumentMarkProps } from './types';

export function LinkMark({ mark, children }: DocumentMarkProps) {
  if (!isAllowedLinkHref(mark.attrs.href)) return <>{children}</>;
  return (
    <Link colorScheme="neutral" href={mark.attrs.href}>
      {children}
    </Link>
  );
}
