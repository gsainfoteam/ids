# Breadcrumb

지금 페이지가 사이트 구조의 어디에 있는지 보여 주고, 상위 페이지로 돌아가는 길을 줍니다.

- **구조가 곧 접근성.** `nav` 랜드마크("이동 경로") 안의 `ol` 과 `li` 로 그립니다. `Breadcrumb.Page` 는 `aria-current="page"` 를 받습니다.
- **구분자 자동 삽입.** Item 사이에 chevron 이 들어가고, 스크린 리더는 읽지 않습니다. 오른쪽에서 왼쪽으로 쓰는 화면에서는 chevron 이 뒤집힙니다.
- **라우터는 `asChild`.** `Breadcrumb.Link` 는 `<a>` 를 그립니다. 라우터의 Link 를 감싸면 스타일과 속성이 그 Link 가 그리는 `<a>` 에 붙습니다.
- **긴 경로 접기.** `maxItems` 를 주면 가운데 항목을 `Breadcrumb.Ellipsis` 메뉴로 접습니다. 메뉴는 IDS `Menu` 라서 키보드와 포커스 복귀가 같습니다.

```tsx
import { Breadcrumb } from '@gsainfoteam/ids-react';

<Breadcrumb>
  <Breadcrumb.Item>
    <Breadcrumb.Link href="/">홈</Breadcrumb.Link>
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    <Breadcrumb.Link href="/products">상품</Breadcrumb.Link>
  </Breadcrumb.Item>
  <Breadcrumb.Item>
    <Breadcrumb.Page>노트북</Breadcrumb.Page>
  </Breadcrumb.Item>
</Breadcrumb>;
```

## 파트

| 파트                    | 그리는 요소                  | 역할                                                        |
| ----------------------- | ---------------------------- | ----------------------------------------------------------- |
| `Breadcrumb`            | `nav`                        | 랜드마크. `size`, `separator`, `maxItems` 를 받는다         |
| `Breadcrumb.List`       | `ol`                         | 생략하면 `Breadcrumb` 이 대신 그린다                        |
| `Breadcrumb.Item`       | `li`                         | 항목 하나. 안에 `Link` 나 `Page` 를 둔다                    |
| `Breadcrumb.Link`       | `a`                          | 상위 페이지 링크. `asChild` 로 라우터 Link 를 감싼다        |
| `Breadcrumb.Page`       | `span`                       | 현재 페이지. `aria-current="page"`, 링크가 아니다           |
| `Breadcrumb.Separator`  | `li aria-hidden`             | 구분자. 보통은 자동으로 들어간다                            |
| `Breadcrumb.Ellipsis`   | `li` 안의 `button` 과 `menu` | 접힌 항목. children 의 Item 이 메뉴 항목이 된다             |

## 라우터 Link

```tsx
import { Link } from 'react-router';

<Breadcrumb.Item>
  <Breadcrumb.Link asChild>
    <Link to="/products">상품</Link>
  </Breadcrumb.Link>
</Breadcrumb.Item>;
```

- 감싸는 컴포넌트는 받은 props 와 `ref` 를 `<a>` 에 넘겨야 합니다. Next.js `Link`, TanStack Router `Link`, React Router `Link` 는 모두 그렇게 합니다.
- IdsProvider 에 링크 컴포넌트를 등록하는 방식은 두지 않습니다. 라우터는 `asChild` 로만 붙입니다.
- 접힌 메뉴 안의 링크도 같습니다. 메뉴 항목을 고르면 라우터의 `onClick` 이 이동하고 메뉴가 닫힙니다.

## 구분자

```tsx
<Breadcrumb>                         {/* 기본 chevron */}
<Breadcrumb separator="/">           {/* 글자 */}
<Breadcrumb separator={<SlashIcon />}>  {/* 아이콘 */}
```

- 한 자리만 다르게 하려면 `Breadcrumb.List` 안에 `Breadcrumb.Separator` 를 직접 씁니다. 하나라도 직접 쓰면 자동 구분자는 모두 빠집니다.

```tsx
<Breadcrumb>
  <Breadcrumb.List>
    <Breadcrumb.Item>...</Breadcrumb.Item>
    <Breadcrumb.Separator>/</Breadcrumb.Separator>
    <Breadcrumb.Item>...</Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb>
```

- 자동 구분자는 `Breadcrumb` 이나 `Breadcrumb.List` 바로 아래(Fragment 안 포함)의 Item 만 셉니다. Item 을 다른 컴포넌트로 감쌌다면 구분자도 직접 씁니다.
- chevron 은 `rtl` 에서만 뒤집힙니다. 글자 구분자는 그대로 둡니다.

## 긴 경로 접기

```tsx
<Breadcrumb maxItems={3}>
  {/* 홈 / … / 내비게이션 / Breadcrumb */}
</Breadcrumb>

<Breadcrumb>
  <Breadcrumb.Item>...</Breadcrumb.Item>
  <Breadcrumb.Ellipsis>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/docs">문서</Breadcrumb.Link>
    </Breadcrumb.Item>
  </Breadcrumb.Ellipsis>
  <Breadcrumb.Item>...</Breadcrumb.Item>
</Breadcrumb>
```

- `maxItems` 는 첫 항목과 마지막 `maxItems - 1` 개를 남깁니다. 항목이 `maxItems` 이하면 접지 않습니다.
- `Breadcrumb.Ellipsis` 를 직접 쓰면 `maxItems` 는 무시합니다.
- 접기 버튼의 이름은 "숨은 경로 보기" 입니다. `aria-label` 로 바꿀 수 있고, `open` `defaultOpen` `onOpenChange` 로 메뉴를 제어합니다.

## 키보드

| 키                     | 동작                                     |
| ---------------------- | ---------------------------------------- |
| `Tab`                  | 다음 링크나 접기 버튼. 현재 페이지는 건너뛴다 |
| `Enter` / `Space` / `↓` | 접힌 메뉴 열기, 첫 항목으로               |
| `↑` / `↓`              | 메뉴 항목 이동                           |
| `Enter`                | 링크 열기                                |
| `Escape`               | 메뉴 닫고 접기 버튼으로                  |

## 크기

```tsx
<Breadcrumb size="standard" />  // body b3, 16px 아이콘
<Breadcrumb size="tiny" />      // caption c1, 14px 아이콘
```

## 이름

- 기본 이름은 "이동 경로" (`breadcrumb.label`) 입니다. 한 페이지에 둘 이상 두면 `aria-label` 로 이름을 나눕니다.
- 항목이 하나도 없으면 개발 모드에서 경고합니다.
