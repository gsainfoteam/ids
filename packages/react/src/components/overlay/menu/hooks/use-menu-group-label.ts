'use client';

import { useId, useState } from 'react';

export function useInternalMenuGroupLabel() {
  const labelId = useId();
  const [labelled, setLabelled] = useState(false);

  return { labelId, labelled, setLabelled };
}
