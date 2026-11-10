# Marker

대화 속에 끼는 짧은 줄입니다. "웹 검색 3건" 같은 상태 줄, "대화를 정리했어요" 같은 시스템 메모, 날짜 구분선을 맡습니다.

- **흐린 한 줄.** 글자는 `--ids-color-on-muted` 이고, 앞 아이콘은 크기에 맞는 아이콘 토큰으로 맞춰집니다.
- **진행 중.** `pending` 이면 아이콘 자리에 Spinner 가 서고, 글자에 `shimmer` 가 지나가고, 줄이 `role="status"` 가 됩니다.
- **구분선 모양.** `variant="separator"` 는 글자 양쪽에 장식용 Divider 를 긋습니다. 스크린 리더는 글자만 읽습니다.
- **링크와 버튼.** `asChild` 면 자식 요소가 줄이 됩니다.

```tsx
import { Marker } from '@gsainfoteam/ids-react';

<Marker>
  <GlobeAltIcon />웹 검색 3건
</Marker>
<Marker pending>생각하는 중</Marker>
<Marker variant="separator">
  <time dateTime="2026-10-27">10월 27일</time>
</Marker>
```

## 모양

```tsx
<Marker>파일 4개를 읽었어요</Marker>                       // default
<Marker variant="underline">구현 메모를 열었어요</Marker>  // 아래에 장식용 Divider
<Marker variant="separator">오늘</Marker>                  // 양쪽에 선

<Marker size="tiny">웹 검색 3건</Marker>                   // caption 글자, 14px 아이콘
```

- 앞 아이콘은 자식으로 넣습니다. `icon` prop 은 없습니다. `size-*` 클래스를 준 아이콘은 그 크기를 지킵니다.
- separator 의 선은 양쪽에 최소 16px 남고, 글자가 길면 줄바꿈됩니다.

## 진행 중

```tsx
<Marker pending>생각하는 중</Marker>
<Marker pending variant="separator">대화를 정리하는 중</Marker>
```

- 줄이 `role="status"` 라서 글자가 바뀌면 스크린 리더가 읽습니다. Spinner 는 장식이라 따로 읽히지 않습니다.
- 반짝임은 글자 위로만 지나갑니다. 움직임 줄이기 설정이면 멈춥니다. 반짝임만 쓰려면 `@gsainfoteam/ids-css` 의 `shimmer` 클래스를 씁니다.

## 링크와 버튼

```tsx
<Marker asChild>
  <a href="/pull/12">풀 리퀘스트 보기</a>
</Marker>

<Marker asChild>
  <button type="button" onClick={revert}>
    <ArrowUturnLeftIcon />이 변경 되돌리기
  </button>
</Marker>
```

- 링크는 밑줄이 붙고, 링크와 버튼은 올리면 글자가 진해지고 포커스 링을 받습니다.
- `asChild` 면 역할은 자식이 정합니다. `pending` 이어도 링크는 링크로 남고, 알림이 필요하면 `role` 을 직접 줍니다.
- 글 안의 링크도 밑줄이 붙습니다: `<Marker><span><a href="#">구현 메모</a>를 열었어요</span></Marker>`.

## 접히는 줄

Marker 는 접지 않습니다. 추론이나 도구 호출처럼 펼쳐 보는 줄은 `Accordion.Trigger` 안에 넣습니다.

```tsx
<Accordion type="multiple">
  <Accordion.Item value="reasoning">
    <Accordion.Trigger>
      <Marker asChild>
        <span>
          <SparklesIcon />
          12초 동안 생각했어요
        </span>
      </Marker>
    </Accordion.Trigger>
    <Accordion.Content>…</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

- 버튼 안에는 문단을 둘 수 없으므로 `asChild` 로 `span` 을 넘깁니다.

## 상태

| 상태      | 뜻             |
| --------- | -------------- |
| `variant` | 넘긴 모양      |
| `size`    | 넘긴 크기      |
| `pending` | 진행 중이다    |

- 요소에는 `data-marker`, `data-variant`, `data-size`, 진행 중이면 `data-pending` 이 붙습니다.

## 속성

| 속성                  | 기본 / 동작                                          |
| --------------------- | ---------------------------------------------------- |
| `variant`             | `default`(기본) / `underline` / `separator`          |
| `size`                | `standard`(기본) / `tiny`                            |
| `pending`             | `false`. Spinner, 반짝임, `role="status"`            |
| `asChild`             | 자식 요소 하나를 줄로 그린다                         |
| `className` / `style` | 상태를 받는 함수도 된다                              |
| 그 외 속성            | 줄(`p`)로 간다                                       |

## 알아둘 것

- 줄은 부모 폭만큼 늘어나고 바깥 여백이 없습니다. 위아래 간격은 부모의 `gap` 으로 둡니다.
- separator 는 `role="separator"` 가 아닙니다. 이름 붙은 separator 는 안의 글자와 링크를 스크린 리더에서 가리기 때문에, 글자는 문단으로 두고 선만 장식으로 긋습니다.
