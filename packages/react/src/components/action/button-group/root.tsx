'use client';

import { Group, useGroupNameWarning } from '../../utility/group';

import type { ButtonGroup } from '.';

export function ButtonGroupRoot(props: ButtonGroup.Props) {
  useGroupNameWarning('ButtonGroup', props);
  return <Group {...props} />;
}
