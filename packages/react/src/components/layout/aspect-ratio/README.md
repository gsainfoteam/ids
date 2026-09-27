# AspectRatio

폭에 맞춰 높이를 정해진 비율로 잡는 상자입니다. 썸네일, 영상, 지도처럼 비율이 중요한 내용을 담습니다.

- **CSS만으로.** 부모 폭이 바뀌면 브라우저가 높이를 다시 계산합니다. 크기를 재는 스크립트가 없습니다.
- **내용이 비율을 흔들지 않습니다.** 자식은 상자 안의 절대 위치 층에 놓여, 큰 그림이나 긴 글이 상자를 늘리지 않습니다.
- **채우고 자릅니다.** 자식은 상자를 가득 채우고, `img` 와 `video` 는 넘치는 부분을 잘라(`object-cover`) 찌그러지지 않습니다.
- **덮어쓰기 쉽습니다.** 위 기본값은 우선순위가 0이라 자식에 준 크기나 `object-fit` 클래스가 항상 이깁니다.

```tsx
import { AspectRatio } from '@gsainfoteam/ids-react';

<div className="w-80">
  <AspectRatio ratio={16 / 9} className="rounded-standard overflow-hidden">
    <img src="/cover.jpg" alt="표지" />
  </AspectRatio>
</div>;
```

## 비율

```tsx
<AspectRatio />                    // 1:1 (기본)
<AspectRatio ratio={4 / 3} />
<AspectRatio ratio={16 / 9} />
<AspectRatio ratio={3 / 4} />      // 세로로 긴 상자
```

- `ratio` 는 가로 ÷ 세로이고, 0보다 큰 유한한 수여야 합니다. 아니면 오류를 던집니다.

## 내용

```tsx
<AspectRatio ratio={1}>
  <img src={src} alt="" />                          {/* 채우고 잘린다 */}
</AspectRatio>

<AspectRatio ratio={1}>
  <img src={src} alt="" className="object-contain" />  {/* 잘리지 않게 */}
</AspectRatio>

<AspectRatio ratio={16 / 9} className="overflow-hidden rounded-standard">
  <iframe src={videoUrl} title="소개 영상" />         {/* iframe도 칸을 채운다 */}
</AspectRatio>
```

- 칸보다 큰 내용은 넘쳐 보입니다. 자르려면 `overflow-hidden` 을 줍니다. 이때 안에 둔 버튼의 포커스 링도 잘릴 수 있습니다.

## 상태

| 상태    | 뜻        |
| ------- | --------- |
| `ratio` | 넘긴 비율 |

- 바깥 상자에 `data-aspect-ratio` 가 붙습니다.

## 속성

| 속성                  | 기본 / 동작                               |
| --------------------- | ----------------------------------------- |
| `ratio`               | `1`                                       |
| `className` / `style` | 바깥 상자로 간다. 상태를 받는 함수도 된다 |
| `ref` / 그 외 속성    | 바깥 상자 div로 간다                      |

## 알아둘 것

- 폭은 부모를 가득 채웁니다(`w-full`). 크기는 부모 폭으로 정합니다.
- `style` 에 `aspectRatio` 나 고정 `height` 를 주면 비율보다 우선합니다.
