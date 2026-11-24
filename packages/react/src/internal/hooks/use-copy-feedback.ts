'use client';

import { useEffect, useState } from 'react';

const COPIED_FOR = 1500;

export function useInternalCopyFeedback(read: () => string) {
  const [copyRun, setCopyRun] = useState(0);

  useEffect(() => {
    if (copyRun === 0) return;
    const timer = setTimeout(() => setCopyRun(0), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copyRun]);

  const copy = async () => {
    const written = await navigator.clipboard.writeText(read()).then(
      () => true,
      () => false,
    );
    if (!written) return;
    setCopyRun((run) => run + 1);
  };

  return { copied: copyRun > 0, copy };
}
