# Switch

```tsx
import { Switch, Label } from '@gsainfoteam/ids-react';

<Label className="inline-flex items-center gap-2">
  <Switch checked={enabled} onChange={setEnabled} />
  알림 받기
</Label>;
```

즉시 반영되는 on/off 토글이다. 시멘틱은 `Checkbox`와 같은 boolean이지만 UX가 다르다 —
스위치는 켜는 순간 적용되는 시스템 설정(다크 모드, 자동 저장)에, 체크박스는 폼 제출 후
반영되는 옵션(약관 동의)에 쓴다.

**라벨을 내장하지 않는다.** `Label`로 감싸거나 `htmlFor`로 연결한다.

`size`는 `standard`(기본) `tiny`.

## 상태

`checked`(controlled) / `defaultChecked`(uncontrolled) / `onChange`. `onChange`는
`(checked: boolean, event)`를 받는다. 둘을 같이 주면 `IdsError`를 던진다.

native `<input type="checkbox">`에 `role="switch"`를 얹은 것이라 `aria-checked`, `name`,
`value`, Space 토글, 폼 제출이 전부 브라우저 기본 동작이다.

`prefers-reduced-motion`이면 thumb이 미끄러지지 않고 즉시 이동한다. `disabled`이면 트랙과
thumb이 함께 흐려진다.

## 설정 행

라벨을 왼쪽에, 스위치를 오른쪽 끝에 두는 배치는 바깥에서 만든다.

```tsx
<div className="flex items-center justify-between">
  <Label htmlFor="dark-mode">다크 모드</Label>
  <Switch id="dark-mode" checked={dark} onChange={setDark} />
</div>
```

## 계획서와 다른 점

`Switch.Track` / `Switch.Thumb`을 공개 서브컴포넌트로 두지 않았다. 지금 바꿔 끼울 이유가
없어서 내부 슬롯으로 남겼고, 트랙 색 정도는 `className`으로 덮을 수 있다.
