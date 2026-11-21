import { Avatar } from '../../../data/avatar';
import { Link } from '../../link';
import { isAllowedLinkHref } from '../schema/url-rules';
import { mentionStyle } from '../style';

import type { DocumentNodeProps } from './types';

const styles = mentionStyle();

export type MentionChipProps = { label: string; avatar?: string | null; href?: string };

export function MentionChip({ label, avatar, href }: MentionChipProps) {
  const face = (
    <Avatar size="tiny" src={avatar ?? undefined} name={label} alt="" className={styles.avatar()} />
  );

  if (href)
    return (
      <Link href={href} className={styles.root({ className: styles.link() })}>
        {face}
        <span>{label}</span>
      </Link>
    );

  return (
    <span className={styles.root()}>
      {face}
      <span>{label}</span>
    </span>
  );
}

export const mentionNode =
  (mentionHref: ((id: string) => string) | undefined) =>
  ({ node }: DocumentNodeProps) => {
    const { id, label, avatar } = node.attrs as { id?: string; label?: string; avatar?: string };
    const href = mentionHref && id ? mentionHref(id) : undefined;

    return (
      <MentionChip
        label={label ?? id ?? ''}
        avatar={avatar}
        href={href && isAllowedLinkHref(href) ? href : undefined}
      />
    );
  };
