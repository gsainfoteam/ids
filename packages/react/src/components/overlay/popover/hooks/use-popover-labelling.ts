'use client';

import { useState } from 'react';

export function useInternalPopoverLabelling() {
  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  return { titled, setTitled, described, setDescribed };
}
