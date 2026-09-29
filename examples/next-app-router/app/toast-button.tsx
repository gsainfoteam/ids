'use client';

import { Button, toast } from '@gsainfoteam/ids-react';

export function ToastButton() {
  return (
    <Button variant="soft" onClick={() => toast.success('저장했습니다')}>
      토스트 띄우기
    </Button>
  );
}
