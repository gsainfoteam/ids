# Table

행과 열로 읽는 데이터(멤버 목록, 주문 내역, 통계)를 그리는 표입니다. 모양만 입힌 native `<table>` 파트이고, 정렬, 선택, 페이지 같은 데이터 처리는 하지 않습니다. 그런 표는 `DataTable` 을 씁니다.

- **native 시멘틱.** `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>` 그대로라 스크린 리더가 행과 열, 머리글을 스스로 읽습니다.
- **스크롤은 ScrollArea.** 표는 ScrollArea 안에 들어 있어 넓으면 가로로, 높이를 제한하면 세로로 스크롤하고, OS 막대 대신 IDS 막대를 그립니다.
- **중립 상태.** 줄무늬, 올렸을 때, 선택된 행은 `muted` 사다리를 한 칸씩 오릅니다. 브랜드 색을 쓰지 않습니다.
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
<Table
  className="max-h-80"   // 바깥 상자(ScrollArea root). 크기와 자리를 정한다
  style={{ maxWidth: 640 }}
  aria-label="멤버"       // 나머지는 <table> 로 간다(id, aria-*, ref)
/>
```

- `className` 과 `style` 은 표를 감싼 스크롤 상자에, 나머지 속성은 `<table>` 에 붙습니다. TextArea 가 상자와 textarea 를 나누는 것과 같습니다.
- 파트(`Table.Row`, `Table.Cell` 등)는 받은 속성을 모두 자기 요소에 붙입니다.

## variant와 크기

```tsx
<Table variant="outline" />  // 기본. 둥근 테두리 상자, 머리글 행에 muted 배경
<Table variant="ghost" />    // 상자 없이 행 구분선만
<Table size="standard" />    // 기본. 셀 패딩 16px × 12px, 머리글 44px, body b3
<Table size="tiny" />        // 셀 패딩 12px × 8px, 머리글 36px, caption c1
```

- 상자 모서리는 `rounded-container`(16px) 입니다. 안쪽 여백이 없는 상자라 concentric 계산을 쓰지 않습니다.
- 선은 모두 `--ids-color-border` 입니다. 마지막 행은 아래 선이 없고, `Table.Footer` 는 위 선으로 몸통과 나뉩니다.

## 행 상태

```tsx
<Table striped />              // 짝수 행에 muted
<Table highlightOnHover />     // 몸통 행에 올리면 muted
<Table.Row selected />         // 선택된 행은 muted-hover
<Table.Row onClick={open} />   // 올리면 밝아지고 어디를 눌러도 된다(cursor-pointer)
```

| 행               | 평소          | 올렸을 때      |
| ---------------- | ------------- | -------------- |
| 기본             | 투명          | `muted`        |
| 줄무늬(짝수)     | `muted`       | `muted-hover`  |
| 선택             | `muted-hover` | `muted-active` |

- 올렸을 때 색은 `highlightOnHover` 나 `onClick` 이 있는 몸통 행에만 붙습니다. 머리글과 바닥글 행은 바뀌지 않습니다.
- `selected` 는 모양과 `data-selected` 만 바꿉니다. `aria-selected` 는 `grid` 역할에서만 뜻이 있어 붙이지 않습니다. 선택은 행 안의 체크박스나 `aria-pressed` 버튼이 알립니다.

## 누를 수 있는 행

```tsx
<Table.Row onClick={() => select(member.id)} selected={member.id === selectedId}>
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
- 열 머리글 글자는 `on-muted`, 행 머리글은 본문 색입니다.

## 정렬

```tsx
<Table.Head align="end">잔액</Table.Head>
<Table.Cell align="end">{won(balance)}</Table.Cell>   // start(기본) / center / end
```

- 숫자와 금액은 `end` 로 맞춥니다. `start` 와 `end` 는 논리 방향이라 RTL 문서에서 뒤집힙니다.

## 스크롤과 붙는 머리글

```tsx
<Table className="max-h-80" stickyHeader>...</Table>   // 세로로 스크롤하고 머리글 행이 위에 붙는다
<Table className="max-w-sm">...</Table>                // 넓은 표는 가로로 스크롤한다
```

- 높이는 바깥 상자(`className`)에 줍니다. 상자는 `flex flex-col` 이고 스크롤 영역이 남은 높이를 받습니다.
- `stickyHeader` 는 `<thead>` 를 `sticky top-0` 으로 붙입니다. 머리글 배경이 밑으로 지나가는 행을 가립니다.
- 넘치는데 안에 포커스 받을 요소가 없으면 스크롤 영역이 Tab 에 멈춰, 방향키로 표를 넘겨 볼 수 있습니다.
- 막대는 ScrollArea 의 `hover` 방식입니다. 크기는 표의 `size` 를 따릅니다.

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
- `DataTable` 은 이 행을 스스로 그립니다(`empty`).

## data 속성

| 속성                                                           | 붙는 곳         | 뜻                   |
| -------------------------------------------------------------- | --------------- | -------------------- |
| `data-table`, `data-variant`, `data-size`, `data-layout`       | 바깥 상자       | 넘긴 값              |
| `data-striped`, `data-sticky-header`                           | 바깥 상자       | 켜진 옵션            |
| `data-table-header`, `-body`, `-footer`, `-caption`            | 각 부분         | 파트                 |
| `data-table-row`, `data-selected`, `data-hoverable`            | `<tr>`          | 행, 선택, 올림 색    |
| `data-table-head`, `data-table-cell`, `data-align`             | `<th>`, `<td>`  | 셀과 정렬            |
| `data-overflow-x`, `data-overflow-y`                           | 바깥 상자       | 그 방향으로 넘친다   |

## 속성

| 속성               | 기본 / 동작                                           |
| ------------------ | ----------------------------------------------------- |
| `variant`          | `outline`(기본) / `ghost`                             |
| `size`             | `standard`(기본) / `tiny`                             |
| `layout`           | `auto`(기본) / `fixed`                                |
| `striped`          | 짝수 몸통 행에 `muted`                                |
| `highlightOnHover` | 몸통 행에 올리면 한 단계 진하게                       |
| `stickyHeader`     | 스크롤해도 머리글 행이 위에 붙는다                    |
| `className`, `style` | 바깥 스크롤 상자                                    |
| 그 외 속성         | `<table>`                                             |

| 파트            | 요소        | 속성                                   |
| --------------- | ----------- | -------------------------------------- |
| `Table.Header`  | `<thead>`   | 안의 `Head` 가 열 머리글이 된다        |
| `Table.Body`    | `<tbody>`   |                                        |
| `Table.Footer`  | `<tfoot>`   | muted 배경, 위 선                      |
| `Table.Row`     | `<tr>`      | `selected`, `onClick`                  |
| `Table.Head`    | `<th>`      | `align`, `scope`(자동)                 |
| `Table.Cell`    | `<td>`      | `align`, `colSpan`, `rowSpan`          |
| `Table.Caption` | `<caption>` | 표 아래, `on-muted` 글자               |

- 파트는 `<Table>` 안에서만 씁니다. 밖에 두면 오류입니다.
