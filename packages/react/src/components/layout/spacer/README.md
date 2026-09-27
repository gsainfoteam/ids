# Spacer

flex 컨테이너 안에서 남는 공간을 채우는 빈 요소입니다. 자식 일부만 반대쪽 끝으로 밀 때 씁니다.

- **방향을 따로 정하지 않습니다.** 부모가 가로 flex면 가로로, 세로 flex면 세로로 늘어납니다.
- **비율로 나눕니다.** 여러 개를 두면 `flex` 비율대로 남는 공간을 나눕니다. Flutter의 `Spacer(flex:)` 와 같은 뜻입니다.
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

## 비율

```tsx
<div className="flex">
  <span>A</span>
  <Spacer /> {/* 남는 공간의 1/3 */}
  <span>B</span>
  <Spacer flex={2} /> {/* 남는 공간의 2/3 */}
  <span>C</span>
</div>
```

- `flex` 는 0보다 큰 유한한 수여야 합니다. 아니면 오류를 던집니다.

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
<Button variant="outline" className="w-72">
  검색
  <Spacer />
  <Kbd>⌘K</Kbd>
</Button>
```

## 상태

| 상태   | 뜻        |
| ------ | --------- |
| `flex` | 넘긴 비율 |

- 요소에는 `data-spacer` 가 붙습니다.

## 속성

| 속성                  | 기본 / 동작                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| `flex`                | `1`                                                                    |
| `className` / `style` | 상태를 받는 함수도 된다. `style` 의 `flexGrow` 가 `flex` 보다 우선한다 |
| `ref` / 그 외 속성    | span으로 간다                                                          |

## 알아둘 것

- 부모가 flex가 아니면 아무 공간도 차지하지 않습니다. 개발 모드에서는 경고가 나옵니다.
- 고정 간격은 Spacer 대신 부모의 `gap` 으로 둡니다. 부모에 `gap` 이 있으면 Spacer 양옆에도 한 번씩 붙어서, 공간이 모자랄 때 두 요소 사이는 `gap` 두 배만큼 벌어집니다.
