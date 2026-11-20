import { Chip } from '../../../data/chip';
import { Link } from '../../link';
import { isAllowedLinkHref } from '../schema/image-source';
import { richTextStyle } from '../style';

import type { DocumentNodeProps } from './types';

const styles = richTextStyle();

export const mentionNode =
  (mentionHref: ((id: string) => string) | undefined) =>
  ({ node }: DocumentNodeProps) => {
    const { id, label } = node.attrs;
    const text = `@${label ?? id}`;
    const href = mentionHref && id ? mentionHref(id) : undefined;

    if (href && isAllowedLinkHref(href)) return <Link href={href}>{text}</Link>;

    return (
      <Chip variant="soft" size="tiny" className={styles.mention()}>
        {text}
      </Chip>
    );
  };
