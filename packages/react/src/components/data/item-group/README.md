# ItemGroup

여러 [Item](../item/README.md) 을 목록으로 묶습니다. Item 의 일부가 아니라 여러 Item 을 담는 그릇이라, `Item.Group` 이 아닌 별도 컴포넌트입니다.

- **시멘틱 구성.** `role="list"` 인 `<ul>` 이고 각 행을 `<li>` 로 감쌉니다. Safari가 목록 의미를 잃지 않습니다. `ordered` 면 `<ol>` 입니다.
- **설정을 잇습니다.** `size` 는 안의 Item 으로, `separated` 는 Item 의 `outline` 으로 이어집니다. Item 에 직접 준 값이 이깁니다.
- **구분선과 간격.** `bordered`(기본)는 행 사이에 선을 긋고, `separated` 는 행마다 테두리 카드로 띄우고, `ghost` 는 아무것도 긋지 않습니다.

```tsx
import { Item, ItemGroup } from '@gsainfoteam/ids-react';

<ItemGroup aria-label="설정" size="tiny">
  {' '}
  {/* 안의 행이 size를 따른다 */}
  <Item>...</Item> {/* <li> 로 감싼다 */}
  <Item.Separator /> {/* 목록 항목으로 세지 않는 구분선 */}
  <Item>...</Item>
</ItemGroup>;
```

| Property  | Type                                   | Default    |
| --------- | -------------------------------------- | ---------- |
| `variant` | `'bordered' \| 'separated' \| 'ghost'` | `bordered` |
| `size`    | `'standard' \| 'tiny'`                 | -          |
| `ordered` | `boolean`                              | `false`    |

`<ul>`(`ordered` 면 `<ol>`) 의 나머지 속성은 루트로 갑니다. 루트에는 `data-item-group` 과 `data-variant` 가 붙습니다.

## 행 감싸기

- 이미 `<li>` 로 감싼 자식은 다시 감싸지 않습니다.
- `Item.Separator` 는 그룹 안에서 목록 항목으로 세지 않는 `<li>` 로 그립니다.

## 구분선과 간격

```tsx
<ItemGroup variant="bordered" />   // 기본. 행 사이 구분선. 행 모서리는 각지게 편다
<ItemGroup variant="ghost" />      // 구분선도 간격도 없다
<ItemGroup variant="separated" />  // 행마다 테두리 카드(Item outline), 8px 간격
```

- 구분선은 `--ids-color-border-neutral` 입니다. 목록 바깥 테두리는 그리지 않으니, 필요하면 `Card` 안에 둡니다.
- `bordered` 는 구분선을 스스로 긋습니다. `Item.Separator` 는 `ghost` 에서 쓰는 것입니다.
- `separated` 에서도 `Item` 에 `variant` 를 주면 그 값이 이깁니다.

## 순서 있는 목록

```tsx
<ItemGroup ordered aria-label="가입 절차">
  <Item>
    <Item.Media variant="soft" aria-hidden>
      1
    </Item.Media>
    <Item.Content>이메일 인증</Item.Content>
  </Item>
</ItemGroup>
```

- `<ol>` 로 그려 스크린 리더가 순서를 읽습니다. 번호는 그리지 않으니 보여야 하면 `Item.Media` 에 둡니다.

## 알아둘 것

- 목록은 grid 나 flex 부모를 따라 줄어듭니다. 잘린 제목의 전체 길이만큼 넓어지지 않습니다.
- 여러 행 중 하나를 고르는 목록(방향키, 폼 값)은 아직 없습니다. 페이지 안의 고르기는 `RadioGroup`, 팝업은 `Select` 를 씁니다.
