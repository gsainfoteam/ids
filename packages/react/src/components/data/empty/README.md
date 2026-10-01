# Empty

검색 결과 없음, 아직 만든 항목 없음처럼 보여 줄 것이 없는 자리를 안내합니다. 콘텐츠 행은 `Item`, 페이지의 공지나 상태 알림은 `Alert` 를 씁니다.

- **shadcn/ui 구성.** `Empty.Media`, `Empty.Title`, `Empty.Description`, `Empty.Actions` 입니다. 전부 선택이고 선언한 순서대로 위에서 아래로 쌓입니다.
- **미디어는 기본으로 있습니다.** `Empty.Media` 를 쓰지 않으면 inbox 아이콘을 옅은 칸에 그립니다. 빼려면 `<Empty.Media hidden />` 입니다.
- **알림이 아닙니다.** 루트는 역할이 없는 평범한 `div` 입니다. 빈 상태는 화면 내용의 일부라 `role="status"` 나 live region 을 붙이지 않습니다.
- **제목은 heading 으로.** `Empty.Title` 은 `div` 이고, `asChild` 로 페이지 구조에 맞는 `h2`, `h3` 를 줍니다.
- **동작은 버튼이 맡습니다.** Empty 자신은 누를 수 없고, 다음 단계는 `Empty.Actions` 안의 `Button` 이나 링크입니다.

```tsx
import { Button, Empty } from '@gsainfoteam/ids-react';

<Empty>
  <Empty.Media>
    <FolderOpenIcon />
  </Empty.Media>
  <Empty.Title asChild>
    <h2>아직 프로젝트가 없습니다</h2>
  </Empty.Title>
  <Empty.Description>첫 프로젝트를 만들어 팀원과 함께 시작해 보세요.</Empty.Description>
  <Empty.Actions>
    <Button>프로젝트 만들기</Button>
    <Button variant="outline">가져오기</Button>
  </Empty.Actions>
</Empty>;
```

## 미디어

```tsx
<Empty.Media>                      {/* soft(기본): 옅은 칸 안의 아이콘 */}
  <MagnifyingGlassIcon />
</Empty.Media>

<Empty.Media variant="outline">    {/* 테두리 칸 */}
  <UserGroupIcon />
</Empty.Media>

<Empty.Media variant="ghost">      {/* 칸 없이 그대로. 일러스트에 */}
  <img src="/illustrations/empty-folder.svg" alt="" />
</Empty.Media>

<Empty.Media hidden />             {/* 기본 아이콘도 그리지 않는다 */}
```

- 칸은 standard 48px(아이콘 24px), tiny 40px(아이콘 20px) 입니다.
- `ghost` 의 아이콘은 크기 클래스가 없으면 standard 48px, tiny 40px 로 그립니다.
- 기본 아이콘은 `aria-hidden` 입니다. 뜻이 있는 일러스트는 `alt` 로 설명하고, 장식이면 `alt=""` 를 줍니다.

## 자리별 사용

```tsx
<Card>                                          {/* 카드 안 */}
  <Card.Content>
    <Empty variant="soft" size="tiny">...</Empty>
  </Card.Content>
</Card>

<tbody>                                         {/* 표의 빈 본문 */}
  <tr>
    <td colSpan={columns.length}>
      <Empty size="tiny">...</Empty>
    </td>
  </tr>
</tbody>

{items.length > 0 ? <Item.Group>...</Item.Group> : <Empty size="tiny">...</Empty>}
```

- 좁은 자리(목록, 표, 카드 안)는 `size="tiny"` 가 맞습니다. Notion 스펙의 `compact` 가 이것입니다.

## variant, 크기, 정렬

```tsx
<Empty variant="ghost" />    // 기본. 배경과 테두리 없음
<Empty variant="soft" />     // 옅은 배경
<Empty variant="outline" />  // 점선 테두리. 끌어다 놓는 자리나 빈 영역 표시
<Empty size="tiny" />        // standard(패딩 32px, 기본) / tiny(16px)
<Empty align="start" />      // center(기본) / start
```

- 패딩은 `concentric-p-8`, `concentric-p-4` 라 모서리가 `container`(16px) 까지 따라 둥글어집니다.
- 테두리와 배경은 중립색(`--ids-color-border`, `--ids-color-muted`)입니다.

## data 속성

| 속성                                                      | 뜻        |
| --------------------------------------------------------- | --------- |
| `data-empty`, `data-variant`, `data-size`, `data-align`   | 루트      |
| `data-empty-media` + `data-variant`                       | 미디어    |
| `data-empty-title`, `-description`, `-actions`            | 각 부분   |

## 속성

| 속성             | 기본 / 동작                                       |
| ---------------- | ------------------------------------------------- |
| `variant`        | `ghost`(기본) / `soft` / `outline`                |
| `size`           | `standard`(기본) / `tiny`                         |
| `align`          | `center`(기본) / `start`                          |
| `Media.variant`  | `soft`(기본) / `outline` / `ghost`                |
| `Media.hidden`   | 기본 아이콘까지 빼고 아무것도 그리지 않는다       |
| 각 부분          | `asChild` 와 `div` 의 native 속성                 |

## 알아둘 것

- `Empty.Title` 이 없으면 개발 모드에서 `[IDS] Empty: give it an Empty.Title.` 를 경고합니다.
- 빈 상태가 사용자의 동작에 대한 결과라서 바로 알려야 한다면(검색어를 치는 동안 결과가 비는 경우 등), Empty 는 그대로 두고 앱이 별도의 live region 으로 결과 수를 알립니다.
