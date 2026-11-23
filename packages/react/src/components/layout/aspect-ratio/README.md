# AspectRatio

폭에 맞춰 높이를 정해진 비율로 잡는 상자입니다. 비율이 없는 Image, 영상, 지도, iframe 에 비율을 줄 때 감쌉니다.

- **CSS만으로.** 부모 폭이 바뀌면 브라우저가 높이를 다시 계산합니다. 크기를 재는 스크립트가 없습니다.
- **내용이 비율을 흔들지 않습니다.** 자식은 상자 안의 절대 위치 층에 놓여, 큰 그림이나 긴 글이 상자를 늘리지 않습니다.
- **채우고 자릅니다.** 자식은 상자를 가득 채우고, `img` 와 `video` 는 넘치는 부분을 잘라(`object-cover`) 찌그러지지 않습니다.
- **덮어쓰기 쉽습니다.** 위 기본값은 우선순위가 0이라 앱의 자식 요소에 준 크기나 `object-fit` 클래스가 항상 이깁니다.

```tsx
import { AspectRatio, Image } from '@gsainfoteam/ids-react';

<div className="w-80">
  <AspectRatio ratio={16 / 9}>
    <Image src="/cover.jpg" alt="표지" />
  </AspectRatio>
</div>;
```

## 크기

- 부모의 폭을 채우고(`w-full`), 높이는 `ratio` 로 정합니다. 폭은 부모가 정합니다.
- 자식은 상자를 가득 채웁니다.

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
<AspectRatio ratio={4 / 3}>
  <Image src={src} alt="..." />                     {/* 채우고 잘린다. 모서리는 Image 가 깎는다 */}
</AspectRatio>

<AspectRatio ratio={1}>
  <img src={src} alt="" className="object-contain" />  {/* 앱의 img. 잘리지 않게 */}
</AspectRatio>

<AspectRatio ratio={16 / 9}>
  <video src={videoUrl} controls />                  {/* 영상도 칸을 채운다 */}
</AspectRatio>

<AspectRatio ratio={16 / 9}>
  <iframe src={mapUrl} title="오시는 길" />          {/* iframe 도 칸을 채운다 */}
</AspectRatio>
```

- Image 는 스스로 모서리를 깎고 넘치는 부분을 자릅니다.
- Chart 는 AspectRatio 를 안에 두고 `ratio` 를 직접 받습니다. 감싸지 않습니다.
- 칸보다 큰 내용은 넘쳐 보입니다. 자르려면 자식(앱의 요소)에 `overflow-hidden` 을 줍니다. 이때 안에 둔 버튼의 포커스 링도 잘릴 수 있습니다.

## 상태

- 상태는 넘긴 `ratio` 하나입니다.
- `className` 과 `style` 은 `{ ratio }` 를 받는 함수도 됩니다. IDS 밖의 디자인에만 씁니다.

## 속성

| 속성                  | 기본 / 동작                               |
| --------------------- | ----------------------------------------- |
| `ratio`               | `1`                                       |
| `className` / `style` | 바깥 상자로 간다. 상태를 받는 함수도 된다 |
| `ref` / 그 외 속성    | 바깥 상자 div로 간다                      |

## 알아둘 것

- `style` 에 `aspectRatio` 나 고정 `height` 를 주면 비율보다 우선합니다.
