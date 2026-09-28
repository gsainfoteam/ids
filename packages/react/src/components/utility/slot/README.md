# Slot

IDS의 `asChild` 를 움직이는 부품입니다. 감싸는 요소를 하나 더 만드는 대신, 받은 속성을 자식 요소에 합쳐서 그 자식만 그립니다. 컴포넌트의 스타일과 동작은 그대로 두고 그려지는 태그만 바꿀 때 씁니다.

- **태그만 바꿉니다.** `<Alert.Title asChild><h3 /></Alert.Title>` 처럼 제목을 제목 태그로, 버튼 모양을 링크로 그릴 수 있습니다.
- **속성을 잃지 않습니다.** `className` 은 합치고, `style` 은 얕게 합치고, 이벤트 핸들러는 둘 다 실행하고, `ref` 는 양쪽이 같은 요소를 가리킵니다.
- **자식이 먼저.** 이벤트는 자식 핸들러가 먼저 받고, 자식이 `preventDefault()` 를 부르면 Slot 쪽 핸들러는 건너뜁니다.

```tsx
import { Slot } from '@gsainfoteam/ids-react';

<Slot className="rounded-standard px-4 py-2" onClick={track}>
  <a href="/dashboard">대시보드</a>
</Slot>;
```

## asChild 만들기

```tsx
function Tag({ asChild = false, className, ...props }: Tag.Props) {
  const Root = asChild ? Slot : 'span';
  return <Root {...props} className={cn('rounded-full px-2.5', className)} />;
}

<Tag>새 글</Tag>                    {/* <span class="rounded-full px-2.5"> */}
<Tag asChild>
  <a href="/new">새 글</a>          {/* <a href="/new" class="rounded-full px-2.5"> */}
</Tag>
```

- IDS에서 `asChild` 를 받는 파트(`Alert.Title`, `Progress.Label`, `IdsProvider` 등)는 모두 이 방식입니다.

## 합치는 규칙

| 속성         | 규칙                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| `className`  | 둘을 합친다. 같은 속성을 다투는 Tailwind 클래스는 Slot 쪽이 이긴다         |
| `style`      | 얕게 합친다. 겹치는 속성은 Slot 쪽이 이긴다                                |
| `on*` 핸들러 | 자식 → Slot 순서로 실행. 자식이 `preventDefault()` 하면 Slot 쪽은 건너뛴다 |
| `ref`        | 양쪽 ref가 모두 같은 요소를 받는다                                         |
| 그 외        | Slot 쪽 값이 이긴다. Slot 쪽이 `undefined` 면 자식 값을 둔다               |

```tsx
<Slot aria-label="Slot 이름">
  <button aria-label="자식 이름">…</button> {/* aria-label="Slot 이름" */}
</Slot>
```

## 알아둘 것

- 자식은 React 요소 하나여야 합니다. 글자나 여러 요소, Fragment를 넘기면 오류를 던집니다. Fragment에는 속성을 붙일 요소가 없기 때문입니다.
- 자식 컴포넌트는 받은 `className`, `style`, `ref`, 핸들러를 DOM 요소까지 전달해야 합니다. 전달하지 않으면 합친 속성이 사라집니다.
