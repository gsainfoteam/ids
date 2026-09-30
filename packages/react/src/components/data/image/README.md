# Image

native `<img>` 에 불러오는 동안의 자리, 깨졌을 때 대신할 그림, 비율 상자를 더한 컴포넌트입니다. `Image.Group` 으로 여러 장을 가로, 세로, 격자로 늘어놓으면 누른 장부터 크게 봅니다.

- **서버에서도 그냥 `<img>`.** 서버 HTML 에 `src` 와 `alt` 가 든 `<img>` 가 그대로 있어서, JavaScript 가 오기 전에 그림을 불러옵니다.
- **불러오는 동안.** 그림 뒤에 옅은 회색 블록(`Image.Placeholder`)이 깜빡이고, 다 불러오면 사라집니다. 그림을 가리지 않으므로 서버 HTML 의 그림은 hydration 을 기다리지 않고 보입니다.
- **깨지면.** 깨진 `<img>` 는 DOM 에서 빠지고 그림 아이콘(`Image.Fallback`)이 자리를 채웁니다. 스크린 리더는 `alt` 를 그림의 이름으로 계속 읽습니다.
- **비율.** `ratio` 를 주면 [AspectRatio](../../layout/aspect-ratio/README.md) 가 폭에 맞춘 높이를 정하고, 그림은 칸을 채우고 넘치는 부분은 잘립니다.
- **크게 보기.** `preview` 를 준 그림과 `Image.Group` 안의 그림은 버튼이 되어, 누르면 그 장부터 뷰어를 엽니다. 뷰어(확대, 넘기기, 쓸어 닫기)는 다음 버전에서 나옵니다. 지금은 열림 상태와 지금 보는 장만 바뀝니다.

```tsx
import { Image } from '@gsainfoteam/ids-react';

<Image src="/photos/lake.jpg" alt="호수 위로 뜬 해" ratio={4 / 3} />;
```

## 크기와 비율

```tsx
<Image src={src} alt="..." />                        // 부모 폭을 채우고, 높이는 그림의 비율
<Image src={src} alt="..." ratio={1} />              // 정사각형. 그림은 칸을 채우고 잘린다
<Image src={src} alt="..." ratio={16 / 9} />
<Image src={src} alt="..." className="w-40" />       // 폭은 className 으로
<Image src={src} alt="..." width={640} height={480} />  // 불러오기 전에도 자리를 잡는다
```

- 폭은 부모를 가득 채웁니다(`w-full`). 크기는 부모의 폭과 `ratio` 가 정합니다.
- `ratio` 가 없으면 높이는 불러온 그림의 비율입니다. 불러오기 전에는 높이를 모르므로 자리가 0 입니다. 목록처럼 자리가 흔들리면 안 되는 곳에는 `ratio` 나 `width`, `height` 를 줍니다.
- 모서리는 `rounded-standard`(10px)입니다. `className="rounded-none"` 으로 바꿉니다.
- 그림 안의 위치는 `object-cover` 가 기본입니다. `className="[&_img]:object-top"` 처럼 바꿉니다.

## 불러오기와 실패

```tsx
<Image src={src} alt="..." onStatusChange={(status) => log(status)} />   // 'loading' | 'loaded' | 'error'

<Image src={src} alt="...">
  <Image.Placeholder>
    <Spinner />                                  {/* 깜빡이는 블록 대신 */}
  </Image.Placeholder>
</Image>

<Image src={maybeBroken} alt="...">
  <Image.Fallback>불러오지 못했습니다</Image.Fallback>  {/* 아이콘 대신 */}
</Image>

<Image alt="아직 올리지 않은 사진" />             {/* src 가 없으면 바로 Fallback */}
```

| `data-status` | 뜻                                                 |
| ------------- | -------------------------------------------------- |
| `loading`     | 불러오는 중. `Image.Placeholder` 가 보인다         |
| `loaded`      | 그림을 그렸다                                      |
| `error`       | 깨졌거나 `src` 가 없다. `Image.Fallback` 이 보인다 |

- 하이드레이션 전에 이미 불러온 그림, 캐시에서 바로 온 그림도 마운트 때 알아챕니다. 새 `src` 는 새 `<img>` 라서 앞 그림이 남지 않습니다.
- `ratio` 없이 깨진 그림은 `width`, `height` 의 비율(없으면 4:3)로 자리를 지킵니다.
- 이미지는 `loading="lazy"`, `decoding="async"` 가 기본입니다. 첫 화면의 큰 그림은 `loading="eager"` 와 `fetchPriority="high"` 를 줍니다.
- 상태는 Avatar 와 같은 로직(`internal/image-status`)입니다.

## 여러 장: Image.Group

```tsx
<Image.Group layout="grid" columns={3} aria-label="풍경 사진">
  {photos.map((photo) => (
    <Image
      key={photo.id}
      src={photo.thumb}
      previewSrc={photo.full}                    // 뷰어에서 보여 줄 큰 그림
      alt={photo.alt}
      caption={photo.caption}                    // 뷰어 아래에 보일 설명
      ratio={1}
    />
  ))}
</Image.Group>

<Image.Group layout="row" />                     // 가로로 같은 폭씩(기본)
<Image.Group layout="column" />                  // 세로로 쌓는다
<Image.Group layout="grid" columns={4} />        // 격자. columns 기본 3
```

- `<ul role="list">` 이고 사진마다 `<li>` 로 감쌉니다. 직접 `<li>` 를 적으면 그대로 둡니다. `aria-label` 로 목록의 이름을 줍니다.
- 간격은 `gap-2`(8px)입니다. `className` 으로 바꿉니다.
- 사진은 컴포넌트 안에 감싸 둬도(`<figure>` 등) 문서 순서대로 번호가 매겨집니다.
- `preview={false}` 인 사진은 누를 수 없고 번호에서 빠집니다.

## 크게 보기

```tsx
<Image src={src} alt="..." preview />            // 한 장도 누르면 크게 본다

const [index, setIndex] = useState(0);
<Image.Group
  value={index}                                   // 지금 보는 장
  onValueChange={setIndex}
  open={open}                                     // 뷰어가 열렸는가
  onOpenChange={setOpen}
  loop                                            // 끝에서 처음으로
  zoom={zoom}                                     // 확대 배율(1 이 맞춘 크기)
  onZoomChange={setZoom}
>
  ...
</Image.Group>
```

- 사진을 누르거나, Tab 으로 가서 `Enter` `Space` 를 누르면 그 장이 `value` 가 되고 `open` 이 `true` 가 됩니다. 열 때 배율은 1 로 돌아갑니다.
- 누를 수 있는 사진은 이름이 "{alt} 크게 보기" 인 버튼(`aria-haspopup="dialog"`)입니다. 지금 열린 장의 버튼은 `aria-expanded="true"` 입니다.
- 마우스를 올리면 사진이 조금 어두워지고 커서가 돋보기가 됩니다. 키보드 포커스는 사진 상자에 링으로 보입니다.
- 뷰어는 다음 버전에서 나옵니다. 지금은 상태만 바뀝니다.

## 접근성

```tsx
<Image src={src} alt="호수 위로 뜬 해" />          // 그림의 이름
<Image src={src} alt="" />                        // 장식용. 바로 옆 글이 설명할 때
```

- `alt` 는 꼭 줍니다. 없으면 개발 모드에서 경고합니다. 장식용은 `alt=""` 입니다.
- 크게 볼 수 있는 사진에 `alt=""` 를 주면 버튼 이름이 "이미지 크게 보기" 가 되고 개발 모드에서 경고합니다.
- 깨진 그림을 대신하는 `Image.Fallback` 은 `role="img"` 와 `alt` 를 이름으로 가집니다. 안에 적은 글은 그림으로 읽히므로 버튼을 넣지 않습니다.
- `Image.Placeholder` 는 스크린 리더에게 숨깁니다.

## 상태와 data 속성

| 속성                              | 뜻                                        |
| --------------------------------- | ----------------------------------------- |
| `data-image`                      | 사진 상자                                 |
| `data-status`                     | `loading` / `loaded` / `error`            |
| `data-preview`                    | 누르면 크게 보는 사진                     |
| `data-image-group`, `data-layout` | 묶음과 그 배치(`row` / `column` / `grid`) |

- 함수로 받는 상태는 `{ status, preview }` 입니다. 루트의 `className`, `style` 이 받습니다.

## 속성

### Image

| 속성                  | 기본 / 동작                                                     |
| --------------------- | --------------------------------------------------------------- |
| `alt`                 | 필수. 장식용은 `""`                                             |
| `ratio`               | 없음(그림의 비율). 숫자면 AspectRatio                           |
| `preview`             | 혼자면 `false`, `Image.Group` 안이면 `true`                     |
| `previewSrc`          | 뷰어에서 보여 줄 그림. 기본 `src`                               |
| `caption`             | 뷰어에서 보여 줄 설명                                           |
| `onStatusChange`      | 불러오는 상태가 바뀔 때                                         |
| `className` / `style` | 사진 상자로 간다. 상태를 받는 함수도 된다                       |
| `ref` / 그 외 속성    | `<img>` 로 간다(`srcSet`, `sizes`, `loading`, `crossOrigin` 등) |

### Image.Group

| 속성                                       | 기본 / 동작                                  |
| ------------------------------------------ | -------------------------------------------- |
| `layout`                                   | `row`(기본) / `column` / `grid`              |
| `columns`                                  | `grid` 의 열 수. 기본 `3`                    |
| `value` / `defaultValue` / `onValueChange` | 지금 보는 장(0부터). 기본 `0`                |
| `open` / `defaultOpen` / `onOpenChange`    | 뷰어가 열렸는가. 기본 `false`                |
| `loop`                                     | 끝에서 처음으로 넘어가는가. 기본 `false`     |
| `zoom` / `onZoomChange`                    | 확대 배율. 기본 `1`                          |
| 그 외 속성                                 | `<ul>` 로 간다(`aria-label`, `className` 등) |

## 알아둘 것

- 기본 아이콘은 `@heroicons/react` 의 `PhotoIcon` 입니다. `Image.Fallback` 의 children 으로 바꿉니다.
- `Image.Placeholder`, `Image.Fallback` 이 아닌 자식은 사진 상자 안, 그림 다음에 그립니다. 그림 위에 겹치려면(배지 등) `absolute` 로 자리를 정합니다. 크게 보기 버튼 밖이므로 그 안에 버튼을 두어도 됩니다.
- `columns` 가 1 이상의 정수가 아니면 오류를 던집니다.
