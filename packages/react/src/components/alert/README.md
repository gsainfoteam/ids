# Alert

```tsx
import { Alert } from '@gsainfoteam/ids-react';

<Alert variant="success">
  <Alert.Title>저장 완료</Alert.Title>
  <Alert.Description>변경 사항이 저장되었습니다.</Alert.Description>
</Alert>;
```

페이지 흐름 안에 정적으로 놓이는 알림 박스다. 시간이 지나면 사라지는 floating 알림은
`Toast`를 쓴다.

`variant`는 `info`(기본) `success` `warning` `danger` `neutral`. 서브컴포넌트
`Alert.Icon` `Alert.Title` `Alert.Description` `Alert.Actions` `Alert.Close`는 모두 선택이고,
`Icon`과 `Close`는 어디에 적든 각각 좌측과 우측으로 간다.

## 색과 대비

**variant는 배경 틴트, 테두리, 아이콘 색으로만 드러난다.** 제목과 본문은 항상
`--ids-color-on-surface`다. status 색을 글자에 쓰면 warning 노랑이 어떤 배경에서도
WCAG AA(4.5:1)를 못 넘기기 때문이다.

`Alert.Icon`은 `aria-hidden`이다. 의미는 `role`/`aria-live`와 제목 텍스트가 지고 있어서
아이콘은 장식으로만 둔다. 기본 아이콘은 없다 — 필요하면 직접 넘긴다.

```tsx
<Alert variant="info">
  <Alert.Icon>
    <SparklesIcon />
  </Alert.Icon>
  <Alert.Title>새 기능 출시</Alert.Title>
</Alert>
```

## 접근성

`warning`과 `danger`는 `role="alert"` + `aria-live="assertive"`로, 나머지는
`role="status"` + `aria-live="polite"`로 읽힌다. 앞의 둘은 진행 중인 작업을 끊어서라도
전달돼야 하는 내용이기 때문이다.

## 닫기

`Alert.Close`를 넣으면 우상단에 닫기 버튼이 붙는다. Alert 안쪽에 포커스가 있을 때 `Escape`로도
같은 버튼이 눌린다. 실제 제거는 부모의 몫이다 — Alert가 스스로 사라지지 않는다.

```tsx
{
  shown && (
    <Alert variant="warning">
      <Alert.Title>세션 만료 임박</Alert.Title>
      <Alert.Close onClose={() => setShown(false)}>
        <XMarkIcon />
      </Alert.Close>
    </Alert>
  );
}
```

`children`은 필수다. IDS는 아이콘 세트를 들고 다니지 않는다 — `IconButton`이 `icon`을
요구하는 것과 같다. 빠뜨리면 `IdsError`를 던진다.
