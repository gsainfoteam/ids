'use client';

import { useState } from 'react';

export function useInternalLabelling(surfaceIsTheButton: boolean) {
  const [titleId, setTitleId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();
  return {
    labelling: surfaceIsTheButton
      ? { 'aria-labelledby': titleId, 'aria-describedby': descriptionId }
      : {},
    descriptionId,
    register: { setTitleId, setDescriptionId },
  };
}
