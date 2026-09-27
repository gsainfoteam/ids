# Card

```tsx
import { Card, Button } from '@gsainfoteam/ids-react';

<Card>
  <Card.Header>
    <Card.Title>새 프로젝트 만들기</Card.Title>
    <Card.Description>프로젝트 정보를 입력해주세요.</Card.Description>
  </Card.Header>
  <Card.Content>...</Card.Content>
  <Card.Footer>
    <Button variant="ghost">취소</Button>
    <Button>만들기</Button>
  </Card.Footer>
</Card>;
```

세로 방향 콘텐츠 컨테이너다. 가로 row에 좌측 미디어가 붙는 형태는 `Item`을 쓴다.

`variant`는 `outline`(기본) `elevated` `filled` `ghost`. `Card.Header` `Card.Content`
`Card.Footer` `Card.Title` `Card.Description`은 전부 선택이고, **자식의 순서가 곧 시각적
순서**다. 상품 카드처럼 이미지를 위에 두려면 `Card.Content`를 `Card.Header`보다 앞에 쓴다.

이미지를 카드 가로폭에 꽉 채울 때는 `<Card.Content className="p-0">`으로 패딩을 없앤다.
전용 prop을 두지 않는다.

## 인터랙티브

`interactive`를 주거나 `onClick`만 넘겨도 hover/focus 효과가 켜진다. `div`로 그릴 때는
`role="button"`과 `tabIndex={0}`이 붙고, Enter/Space가 클릭으로 이어진다 — `role="button"`인
`div`는 브라우저가 키보드 활성화를 대신해주지 않기 때문이다.

```tsx
<Card onClick={() => navigate(`/posts/${post.id}`)}>...</Card>
```

링크로 만들 때는 `asChild`가 시맨틱상 더 정확하다. 이 경우 자식이 이미 포커스와 키보드를
처리하므로 `role`과 `tabIndex`를 덧씌우지 않는다.

```tsx
<Card interactive asChild>
  <a href={`/posts/${post.id}`}>...</a>
</Card>
```

서브컴포넌트도 모두 `asChild`를 받는다.
