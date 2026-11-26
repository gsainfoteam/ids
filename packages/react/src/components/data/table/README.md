# Table

행과 열로 읽는 데이터(멤버 목록, 주문 내역, 통계)를 그리는 표입니다. 모양만 입힌 native `<table>` 파트이고, 정렬, 선택, 페이지 같은 데이터 처리는 하지 않습니다. 그런 표는 `DataTable` 을 씁니다.

- **native 시멘틱.** `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>` 그대로라 스크린 리더가 행과 열, 머리글을 스스로 읽습니다.
- **스크롤은 ScrollArea.** 표는 ScrollArea 안에 들어 있어 넓으면 가로로, 높이를 제한하면 세로로 스크롤하고, OS 막대 대신 IDS 막대를 그립니다.
- **상태.** 줄무늬는 `bg-block`, 올렸을 때는 글자색 층(`state-hover`)입니다. 선택되거나 현재인 행만 `bg-primary-soft` 로 칠합니다.
- **shadcn/ui 구성.** `Table.Header`, `Table.Body`, `Table.Footer`, `Table.Row`, `Table.Head`, `Table.Cell`, `Table.Caption` 입니다.

```tsx
import { Table } from '@gsainfoteam/ids-react';

<Table aria-label="멤버">
  <Table.Header>
    <Table.Row>
      <Table.Head>이름</Table.Head>
      <Table.Head>이메일</Table.Head>
      <Table.Head align="end">잔액</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {members.map((member) => (
      <Table.Row key={member.id}>
        <Table.Cell>{member.name}</Table.Cell>
        <Table.Cell>{member.email}</Table.Cell>
        <Table.Cell align="end">{won(member.balance)}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>;
```

## 속성이 가는 곳

```tsx
<div className="flex max-h-80 max-w-160 flex-col">  {/* 크기와 자리는 감싸는 요소가 정한다 */}
  <Table aria-label="멤버" />                      {/* 속성은 <table> 로 간다(id, aria-*, ref) */}
</div>
```

- **크기 계약: fill.** 표를 감싼 스크롤 상자는 부모 폭을 채우고, `flex-col` 부모 안에서는 남은 높이까지 줄어듭니다.
- 속성은 `<table>` 에 붙습니다. 새 디자인에서만 쓰는 `className` 과 `style` 은 스크롤 상자에 붙습니다. TextArea 가 상자와 textarea 를 나누는 것과 같습니다.
- 파트(`Table.Row`, `Table.Cell` 등)는 받은 속성을 모두 자기 요소에 붙입니다.

## variant와 크기

```tsx
<Table variant="outline" />  // 기본. 둥근 테두리 상자, 머리글 행은 `bg-block`
<Table variant="striped" />  // outline 상자에 짝수 몸통 행을 `bg-block` 으로
<Table variant="ghost" />    // 상자 없이 행 구분선만
<Table size="standard" />    // 기본. 셀 패딩 16px × 10px, 머리글 40px, body b3
<Table size="tiny" />        // 셀 패딩 12px × 6px, 머리글 32px, caption c1
```

- 상자 모서리는 `--table-radius`(기본 `rounded-container`, 16px) 입니다. 안쪽 여백이 없는 상자라 concentric 계산을 쓰지 않습니다.
- 스크롤 영역은 테두리 1px 를 뺀 `--table-radius - 1px` 로 깎습니다. 같은 값이면 채운 머리글 모서리와 테두리 사이로 바탕색이 비칩니다. 새 디자인에서 모서리를 바꾸려면 `className` 에 `rounded-*` 가 아니라 `[--table-radius:...]` 를 줍니다.
- 선은 모두 `--ids-color-border-neutral` 입니다. 마지막 행은 아래 선이 없고, `Table.Footer` 는 위 선으로 몸통과 나뉩니다.
- `outline` 의 머리글 행은 `bg-block` 으로 채우고 글자는 `text-neutral` 입니다. `ghost` 의 머리글은 채우지 않지만, 붙는 머리글이 아래 행을 가리도록 배경은 밑에 깔린 면의 색(`--ids-bg-current`)입니다.

## 행 상태

```tsx
<Table variant="striped" />            // 짝수 몸통 행에 `bg-block`
<Table.Row aria-selected />            // 선택된 행은 `bg-primary-soft`, 글자 `text-on-primary-soft`
<Table.Row aria-current="date" />      // 오늘, 다음 차례 같은 현재 행도 같은 색
<Table.Row onClick={open} />           // 올리면 층이 깔리고 어디를 눌러도 된다(cursor-pointer)
```

| 행           | 평소              | 올렸을 때                           |
| ------------ | ----------------- | ----------------------------------- |
| 기본         | 투명              | `onClick` 이 있으면 `state-hover`   |
| 줄무늬(짝수) | `bg-block`        | `bg-block` 위 `state-hover`         |
| 선택         | `bg-primary-soft` | `bg-primary-soft` 위 primary 층(8%) |

- 층은 글자색(`text-neutral-strong`)을 6% 얹은 것이라 줄무늬, 머리글 띠 어느 바탕에서나 보입니다.
- 선택된 행은 `scheme-primary` 와 `state-scheme` 를 얹어, 올렸을 때 층이 primary 채움색으로 짙어집니다.
- 올렸을 때 층은 `onClick` 이 있는 몸통 행에만 붙습니다. 누를 수 없는 행이 밝아지면 눌러도 되는 것처럼 읽히기 때문입니다. 머리글과 바닥글 행은 바뀌지 않습니다.
- 선택은 줄무늬보다 앞섭니다. 짝수 행을 골라도 `bg-primary-soft` 입니다.
- 칠하는 기준은 행의 `aria-selected` 와 `aria-current` 입니다. 모양만 바꾸는 속성을 따로 두지 않습니다. `aria-selected` 는 `grid` 밖에서는 스크린 리더가 읽지 않을 수 있어, 선택은 행 안의 체크박스나 `aria-pressed` 버튼도 함께 알립니다.

## 누를 수 있는 행

```tsx
<Table.Row onClick={() => select(member.id)} aria-selected={member.id === selectedId}>
  <Table.Head>
    <button type="button" aria-pressed={member.id === selectedId}>{member.name}</button>
  </Table.Head>
  <Table.Cell>{member.email}</Table.Cell>
</Table.Row>
```

- 행은 `role="button"` 이 되지 않습니다. 행이 버튼이 되면 표의 행과 열 구조가 사라집니다.
- 키보드와 스크린 리더는 행 안의 버튼이나 링크로 같은 동작에 닿습니다. 그 버튼을 눌러도 이벤트가 행으로 올라가 한 번만 실행됩니다.

## 머리글

```tsx
<Table.Header>
  <Table.Row>
    <Table.Head>이름</Table.Head>          {/* scope="col" */}
  </Table.Row>
</Table.Header>
<Table.Body>
  <Table.Row>
    <Table.Head>매출</Table.Head>          {/* scope="row". 행 머리글 */}
    <Table.Cell>1,200</Table.Cell>
  </Table.Row>
</Table.Body>
```

- `Table.Head` 는 `Table.Header` 안에서 열 머리글(`scope="col"`), 몸통과 바닥글에서 행 머리글(`scope="row"`)입니다. `scope` 를 주면 그 값을 씁니다.
- 열 머리글 글자는 `text-neutral`, 행 머리글은 본문 색입니다.

## 정렬

```tsx
<Table.Head align="end">잔액</Table.Head>
<Table.Cell align="end">{won(balance)}</Table.Cell>   // start(기본) / center / end
```

- 숫자와 금액은 `end` 로 맞춥니다. `start` 와 `end` 는 논리 방향이라 RTL 문서에서 뒤집힙니다.

## 스크롤과 붙는 머리글

```tsx
<div className="flex max-h-80 flex-col">   {/* 세로로 스크롤하고 머리글 행이 위에 붙는다 */}
  <Table>...</Table>
</div>

<div className="max-w-sm">                 {/* 넓은 표는 가로로 스크롤한다 */}
  <Table>...</Table>
</div>
```

- 높이는 감싸는 `flex-col` 요소에 줍니다. 표의 상자는 그 안에서 줄어들 수 있고(`min-h-0`), 스크롤 영역이 남은 높이를 받습니다.
- 머리글은 늘 `sticky top-0` 입니다. 표가 세로로 넘치지 않으면 아무 일도 하지 않고, 넘치면 머리글 배경이 밑으로 지나가는 행을 가립니다. DataTable 과 같습니다.
- 넘치는데 안에 포커스 받을 요소가 없으면 스크롤 영역이 Tab 에 멈춰, 방향키로 표를 넘겨 볼 수 있습니다.
- 막대는 ScrollArea 의 `hover` 방식입니다. 크기는 표의 `size` 를 따릅니다.
- 가로로 넘치면 왼쪽이나 오른쪽에 열이 더 남은 가장자리를 흐립니다([ScrollArea `fade="x"`](../../layout/scroll-area/README.md#가장자리-흐림), `standard` 24px, `tiny` 16px). RTL 에서는 좌우가 바뀝니다.
- 위아래는 흐리지 않습니다. 붙는 머리글이 같은 스크롤 영역 안에 있어서, 위를 흐리면 머리글이 흐려집니다.

## 고정 폭 열

```tsx
<Table layout="fixed">
  <colgroup>
    <col style={{ width: 200 }} />
    <col />
  </colgroup>
  ...
</Table>
```

- `layout="fixed"` 는 `table-layout: fixed` 입니다. 열 너비가 내용이 아니라 `<col>` 과 첫 행으로 정해집니다. DataTable 의 열 크기 조절이 이것을 씁니다.

## 빈 표

- 행이 없을 때의 안내는 앱이 그립니다. 한 칸짜리 행(`<Table.Cell colSpan={열 수}>`)에 넣거나, 표 대신 Empty 컴포넌트를 둡니다.
- `DataTable` 은 이 행을 스스로 그립니다(`DataTable.Empty`).

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

- 표는 스스로 정하는 상태가 없습니다. `variant`, `size`, `layout`, 행의 `aria-selected` 와 `aria-current`, 셀의 `align` 은 모두 앱이 넘긴 값입니다.
- 정렬, 선택, 페이지를 표가 갖게 하려면 `DataTable` 을 씁니다.
- 런타임으로 읽을 수 없는 상태: 표가 가로나 세로로 넘치는지.

## 속성

| 속성               | 기본 / 동작                                           |
| ------------------ | ----------------------------------------------------- |
| `variant`          | `outline`(기본) / `striped` / `ghost`                 |
| `size`             | `standard`(기본) / `tiny`                             |
| `layout`           | `auto`(기본) / `fixed`                                |
| `className`, `style` | 바깥 스크롤 상자. 새 디자인에서만 쓴다              |
| 그 외 속성         | `<table>`                                             |

| 파트            | 요소        | 속성                                   |
| --------------- | ----------- | -------------------------------------- |
| `Table.Header`  | `<thead>`   | 안의 `Head` 가 열 머리글이 된다        |
| `Table.Body`    | `<tbody>`   |                                        |
| `Table.Footer`  | `<tfoot>`   | `bg-neutral-soft` 배경, 위 선                      |
| `Table.Row`     | `<tr>`      | `aria-selected`, `aria-current`, `onClick` |
| `Table.Head`    | `<th>`      | `align`, `scope`(자동)                 |
| `Table.Cell`    | `<td>`      | `align`, `colSpan`, `rowSpan`          |
| `Table.Caption` | `<caption>` | 표 아래, `text-neutral` 글자               |

- 파트는 `<Table>` 안에서만 씁니다. 밖에 두면 오류입니다.
