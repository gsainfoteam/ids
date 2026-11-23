# Divider

내용을 나누는 1px 선입니다. 가로와 세로를 모두 그리고, 가운데에 "또는" 같은 글자를 둘 수 있습니다.

- **글자가 이름이 됩니다.** separator 안의 글자는 스크린 리더가 내용으로 읽지 않으므로, 가운데 글자를 `aria-labelledby` 로 연결해 "또는, 구분선" 으로 읽히게 합니다.
- **중립색.** 선은 `--ids-color-border-neutral`, 글자는 `--ids-color-text-neutral` 입니다. 테마 색을 쓰지 않습니다.
- **쓰는 방향을 따릅니다.** `align="start"` 는 왼쪽에서 오른쪽 글에서는 왼쪽, 오른쪽에서 왼쪽 글에서는 오른쪽입니다.
- **포커스를 받지 않습니다.** 크기 조절 핸들이 아니라 구분선입니다.

```tsx
import { Divider } from '@gsainfoteam/ids-react';

<Divider />
<Divider>또는</Divider>
```

## 크기

- 가로 구분선은 부모 폭을 채웁니다.
- 세로 구분선은 flex 행의 높이까지 늘어나고, 행 밖에서도 한 줄 높이는 지킵니다.
- 행보다 짧은 세로선은 감싸는 요소의 높이로 정합니다: `<div className="flex h-5"><Divider orientation="vertical" /></div>`. 한 줄 높이보다 짧아지지는 않습니다.
- 바깥 여백이 없습니다. 위아래 간격은 부모의 `gap` 으로 둡니다.

## 방향

```tsx
<Divider />                                   // 가로(기본). 부모 폭만큼

<div className="flex h-8 items-center gap-3">
  <span>계정</span>
  <Divider orientation="vertical" />          {/* 행 높이만큼 */}
  <span>설정</span>
</div>
```

## 가운데 글자

```tsx
<Divider>또는</Divider>                        // 양쪽 선 사이에
<Divider align="start">최근 항목</Divider>      // 글자를 시작 쪽에, 선은 끝 쪽으로
<Divider align="end">더 보기</Divider>

<Divider orientation="vertical">또는</Divider> // 세로선 가운데에
```

- 글자가 길면 줄바꿈되고 선은 짧아집니다. 선은 양쪽에 최소 16px 남습니다.
- `aria-label` 을 넘기면 글자 대신 그 이름을 씁니다.

## 장식용 선

```tsx
<Divider orientation="vertical" aria-hidden />
```

- 의미 없이 모양만 나누는 선은 `aria-hidden` 으로 접근성 트리에서 뺍니다. 이때는 `role` 과 이름을 두지 않고, 주지 않으면 `role="separator"` 와 이름을 둡니다. 버튼 묶음 사이의 선처럼 앞뒤 요소가 이미 구분될 때 씁니다.

## 다른 요소로 그리기

```tsx
<ul>
  <li>…</li>
  <Divider asChild aria-hidden>
    <li />
  </Divider>
  <li>…</li>
</ul>
```

- `asChild` 면 자식 요소 하나가 선이 됩니다. 목록 안에서는 `li`, 문서의 주제 전환에는 `hr` 을 넘깁니다.
- 이때는 가운데 글자를 넣을 수 없습니다.

## 상태

- 방향, 정렬, 글자, `aria-hidden` 은 모두 앱이 넘긴 속성이라 앱이 이미 압니다.
- `className` 과 `style` 에 함수를 주면 아래 상태를 받습니다. 새 디자인을 입힐 때만 씁니다.

| 상태          | 뜻                 |
| ------------- | ------------------ |
| `orientation` | 넘긴 방향          |
| `labelled`    | 가운데 글자가 있다 |
| `align`       | 넘긴 정렬          |
| `decorative`  | `aria-hidden` 이다 |

## 속성

| 속성                  | 기본 / 동작                                      |
| --------------------- | ------------------------------------------------ |
| `orientation`         | `horizontal`(기본) / `vertical`                  |
| `children`            | 가운데 글자                                      |
| `align`               | `center`(기본) / `start` / `end`. 글자가 있을 때 |
| `aria-hidden`         | 주면 장식용 선. `role` 과 이름 없이 접근성 트리에서 뺀다 |
| `asChild`             | 자식 요소 하나를 선으로 그린다. 글자는 넣지 않는다 |
| `className` / `style` | 상태를 받는 함수도 된다. 새 디자인에만 쓴다      |
| 그 외 속성            | 선(`hr`)으로 간다. 글자가 있으면 `div`           |
