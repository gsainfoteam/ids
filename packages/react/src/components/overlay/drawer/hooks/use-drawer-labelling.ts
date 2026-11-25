'use client';

import { useState } from 'react';

export function useInternalDrawerLabelling() {
  const [titled, setTitled] = useState(false);
  const [described, setDescribed] = useState(false);

  return { titled, setTitled, described, setDescribed };
}
