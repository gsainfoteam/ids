'use client';

import { useEffect, useState } from 'react';

const TYPING_PAUSE = 600;

export function useInternalTextAreaCountAnnouncement(message: string, delay = TYPING_PAUSE) {
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setSpoken(message), message ? delay : 0);
    return () => window.clearTimeout(timer);
  }, [message, delay]);
  return spoken;
}
