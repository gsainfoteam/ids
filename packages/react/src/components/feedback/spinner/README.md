# Spinner

진행률을 모르는 짧은 대기를 보여 주는 회전 표시입니다. 진행률을 알면 `Progress` 를 씁니다.

- **주변 크기를 따릅니다.** 크기를 주지 않으면 Button, IconButton 안에서는 그 컨트롤의 아이콘 크기가 되고, `Field` 안에서는 Field의 `size` 를, 그 밖에서는 주변 글자 크기를 따릅니다.
- **주변 색을 따릅니다.** 색은 `currentColor` 라 solid 버튼 위에서도, 본문 옆에서도 따로 칠할 필요가 없습니다.
- **한 번만 알립니다.** 혼자 놓인 Spinner는 나타나고 잠시 뒤 `role="status"` 에 이름을 적어 스크린 리더가 "불러오는 중" 을 한 번 읽게 합니다. 금방 끝나는 로딩은 알리지 않습니다.
- **버튼 안에서는 조용합니다.** 버튼, 링크, 라벨처럼 내용이 이름이 되는 요소나 이미 알림 영역인 요소 안에서는 스스로 알림을 빼서 버튼 이름에 섞이지 않습니다.
- **모션 줄이기.** `prefers-reduced-motion` 이면 회전 대신 천천히 깜빡입니다. 멈춘 스피너는 고장 난 화면처럼 보이기 때문입니다.

```tsx
import { Button, Spinner } from '@gsainfoteam/ids-react';

<Spinner />

<Button disabled={saving}>
  {saving && <Spinner />}
  {saving ? '저장 중' : '저장'}
</Button>;
```

## 크기

```tsx
<p className="text-body-b1-regular">
  <Spinner /> 불러오는 중      {/* 글자 크기(1em) */}
</p>

<Button size="tiny">
  <Spinner />                 {/* tiny 버튼의 아이콘 크기 */}
  저장 중
</Button>

<Field size="tiny">
  …
  <Field.Hint><Spinner /> 확인하는 중</Field.Hint>   {/* Field의 tiny */}
</Field>

<Spinner size="standard" />   {/* 아이콘 standard 토큰. 어디서든 고정 */}
<Spinner size="tiny" />       {/* 아이콘 tiny 토큰 */}
<Spinner className="size-8" /> {/* 큰 로딩 표시 */}
```

- `size` 를 주면 컨트롤 안에서도 그 크기를 지킵니다. IconButton은 아이콘 칸을 늘 자기 크기로 맞추므로 예외입니다.

## 알림

```tsx
<Spinner />                                   // "불러오는 중" 을 한 번 읽는다
<Spinner aria-label="댓글을 불러오는 중" />      // 읽을 문장을 바꾼다

<p>
  <Spinner decorative /> 파일을 올리는 중입니다  // 옆 문장이 이미 설명한다
</p>

<Button disabled aria-busy>
  <Spinner />                                 // 버튼 안: 자동으로 조용하다
  저장 중
</Button>
```

- 알림은 나타나고 100ms 뒤에 적습니다. 스크린 리더는 이미 채워진 채로 나타난 알림 영역을 읽지 않기 때문입니다.
- `decorative` 를 주지 않으면 주변을 보고 알림 여부를 정합니다. `true` 는 항상 조용하고 `false` 는 버튼 안에서도 알립니다.

## 상태

| 상태        | 뜻                                                     |
| ----------- | ------------------------------------------------------ |
| `size`      | 적용된 크기. 주변 컨트롤이나 글자를 따르면 `undefined` |
| `announced` | 스크린 리더에 이름을 적었다                            |

```tsx
<Spinner className={(state) => (state.announced ? 'text-(--ids-color-accent)' : undefined)} />
```

- svg에는 `data-spinner` 와, 크기가 정해졌으면 `data-size` 가 붙습니다.

## 속성

| 속성               | 기본 / 동작                                                   |
| ------------------ | ------------------------------------------------------------- |
| `size`             | `standard` / `tiny`. 생략하면 Field → 주변 컨트롤 → 글자 크기 |
| `aria-label`       | 읽을 문장. 기본 `불러오는 중`                                 |
| `decorative`       | `true` 면 알리지 않고, `false` 면 버튼 안에서도 알린다        |
| `className`        | svg로 간다. 상태를 받는 함수도 된다                           |
| `ref` / 그 외 속성 | svg로 간다                                                    |

## 알아둘 것

- 렌더 결과는 `aria-hidden` svg와 화면에 보이지 않는 `role="status"` span 두 요소입니다. 알림이 필요 없으면 span은 사라집니다.
- 로딩을 알리는 버튼에는 `disabled` 와 함께 `aria-busy` 를 주세요. IDS는 `loading` prop 대신 이 합성을 씁니다.
- 한 화면에 Spinner를 여러 개 두면 각각 알립니다. 목록의 행마다 두는 경우라면 `decorative` 로 두고 목록 위에 하나만 알리세요.
