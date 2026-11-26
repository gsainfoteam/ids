import { Badge, Button } from '@gsainfoteam/ids-react';

export function StaticBadge() {
  return (
    <Badge>
      <Button variant="outline">정적 버튼</Button>
      <Badge.Indicator count={3} />
    </Badge>
  );
}
