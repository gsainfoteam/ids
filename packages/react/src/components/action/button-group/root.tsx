'use client';

import { Group, useInternalGroupNameWarning } from '../../utility/group';

import type { ButtonGroup } from '.';

export function ButtonGroupRoot(props: ButtonGroup.Props) {
  useInternalGroupNameWarning('ButtonGroup', props);
  return <Group {...props} />;
}
