'use client';

import { useState } from 'react';

export function useInternalDialogLabelling() {
  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  return { titled, setTitled, described, setDescribed };
}
