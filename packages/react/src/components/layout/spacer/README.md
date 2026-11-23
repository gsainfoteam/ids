# Spacer

flex 컨테이너 안에서 남는 공간을 채우는 빈 요소입니다. 자식 일부만 반대쪽 끝으로 밀 때 씁니다.

- **방향을 따로 정하지 않습니다.** 부모가 가로 flex면 가로로, 세로 flex면 세로로 늘어납니다.
- **똑같이 나눕니다.** 여러 개를 두면 남는 공간을 똑같이 나눕니다.
- **어디에나 둘 수 있습니다.** `<span>` 으로 그려져 Button, 링크, label 안에 두어도 올바른 HTML입니다.
- **보이지도 읽히지도 않습니다.** 내용이 없고 `aria-hidden` 이라 스크린 리더가 건너뜁니다.

```tsx
import { Spacer } from '@gsainfoteam/ids-react';

<div className="flex items-center">
  <Logo />
  <Spacer />
  <Button>로그인</Button>
</div>;
```

## 크기

- 부모 flex 의 주축에서 남는 공간을 채웁니다. 여러 개면 똑같이 나누고, 공간이 없으면 0 까지 줄어듭니다.

## 세로

```tsx
<div className="flex h-screen flex-col">
  <Header />
  <Spacer /> {/* 바닥글을 아래로 */}
  <Footer />
</div>
```

- 세로로 쓰려면 부모에 높이가 있어야 남는 공간이 생깁니다.

## 컨트롤 안에서

```tsx
<div className="flex w-72 flex-col">
  <Button variant="outline">
    검색
    <Spacer />
    <Kbd>⌘K</Kbd>
  </Button>
</div>
```

- 버튼은 세로 flex 부모의 폭(`w-72`)까지 늘어나고, Spacer 가 그 안에서 남는 폭을 채웁니다.

## 속성

| 속성               | 기본 / 동작   |
| ------------------ | ------------- |
| `ref` / 그 외 속성 | span으로 간다 |

## 알아둘 것

- 부모가 flex가 아니면 아무 공간도 차지하지 않습니다. 개발 모드에서는 경고가 나옵니다.
- 고정 간격은 Spacer 대신 부모의 `gap` 으로 둡니다. 부모에 `gap` 이 있으면 Spacer 양옆에도 한 번씩 붙어서, 공간이 모자랄 때 두 요소 사이는 `gap` 두 배만큼 벌어집니다.
