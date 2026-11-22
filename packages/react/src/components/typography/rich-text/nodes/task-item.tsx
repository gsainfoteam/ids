import { Checkbox } from '../../../form/checkbox';
import { richTextStyle } from '../style';

import type { DocumentNodeProps } from './types';

const styles = richTextStyle();

export function TaskItemNode({ node, children }: DocumentNodeProps) {
  const checked = Boolean(node.attrs.checked);

  return (
    <li data-checked={String(checked)}>
      <Checkbox
        checked={checked}
        readOnly
        aria-label={node.textContent}
        className={styles.taskBox()}
      />
      <div>{children}</div>
    </li>
  );
}
