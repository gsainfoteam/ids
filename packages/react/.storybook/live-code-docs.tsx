import type { ReactNode } from 'react';

import {
  Canvas,
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks';

export default function LiveCodeDocsBlocks({ of, editor }: { of: object; editor: ReactNode }) {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Canvas of={of} sourceState="none" />
      {editor}
      <Primary />
      <Controls />
      <Stories />
    </>
  );
}
