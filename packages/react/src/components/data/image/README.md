# Image

native `<img>` 에 불러오는 동안의 자리, 깨졌을 때 대신할 그림, 비율 상자를 더한 컴포넌트입니다. `Image.Group` 으로 여러 장을 가로, 세로, 격자로 늘어놓으면 누른 장부터 크게 봅니다.

- **서버에서도 그냥 `<img>`.** 서버 HTML 에 `src` 와 `alt` 가 든 `<img>` 가 그대로 있어서, JavaScript 가 오기 전에 그림을 불러옵니다.
- **불러오는 동안.** 그림 뒤에 [Skeleton](../../feedback/skeleton/README.md)(`Image.Placeholder`)이 사진 상자를 채워 깜빡이고, 다 불러오면 사라집니다. 그림을 가리지 않으므로 서버 HTML 의 그림은 hydration 을 기다리지 않고 보입니다.
- **깨지면.** 깨진 `<img>` 는 DOM 에서 빠지고 그림 아이콘(`Image.Fallback`)이 자리를 채웁니다. 스크린 리더는 `alt` 를 그림의 이름으로 계속 읽습니다.
- **비율.** `ratio` 를 주면 [AspectRatio](../../layout/aspect-ratio/README.md) 가 폭에 맞춘 높이를 정하고, 그림은 칸을 채우고 넘치는 부분은 잘립니다.
- **크게 보기.** `preview` 를 준 그림과 `Image.Group` 안의 그림은 버튼이 되어, 누르면 그 장부터 화면을 덮는 뷰어(`Image.Viewer`)를 엽니다. 넘기기, 확대, 쓸어 닫기가 됩니다.
- **뷰어는 따로 불러옵니다.** 뷰어 코드(Embla, 확대 엔진)는 처음 열 때 받습니다. 사진에 마우스를 올리거나 포커스하면 미리 받기 시작합니다.

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
    <Spinner />                                  {/* Skeleton 대신 */}
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
- `value` 는 문서 순서의 번호입니다. 사진의 순서가 바뀌면 번호도 따라갑니다.
- 뷰어가 열리면 사진이 썸네일 자리에서 커지고, 닫으면 지금 보는 장의 썸네일로 줄어듭니다. 동작 줄이기를 켠 사용자에게는 나타나고 사라지기만 합니다.

## 뷰어

```tsx
<Image.Group aria-label="풍경 사진">
  {photos.map((photo) => <Image key={photo.id} ... />)}
</Image.Group>                                     // Image.Viewer 를 적지 않아도 기본 뷰어가 붙는다

<Image.Group aria-label="풍경 사진">
  {photos.map((photo) => <Image key={photo.id} ... />)}
  <Image.Viewer aria-label="풍경 사진 보기">          {/* 적은 부품만 그린다 */}
    <Image.Viewer.Toolbar>
      <Image.Viewer.Counter />
      <Image.Viewer.ZoomIn />
      <Image.Viewer.ZoomOut />
      <Image.Viewer.Share />
      <Image.Viewer.Download />
      <Image.Viewer.Close />
    </Image.Viewer.Toolbar>
    <Image.Viewer.Prev />
    <Image.Viewer.Next />
    <Image.Viewer.Caption />
    <Image.Viewer.Thumbnails />
  </Image.Viewer>
</Image.Group>
```

- 기본 뷰어는 도구 막대(번호, 확대, 축소, 내려받기, 닫기), 이전과 다음 버튼, 설명, 아래 썸네일 줄입니다.
- 뷰어 부품은 `Image.Viewer` 아래에 있습니다(`Image.Viewer.Close`). 모두 뷰어의 상태를 읽으므로 `Image.Viewer` 안이면 도구 막대 밖에 두어도 됩니다.
- `Image.Viewer` 에 자식을 주면 그 부품만 그립니다. `Image.Viewer.Toolbar` 에 자식을 주지 않으면 기본 도구 막대입니다.
- 한 장뿐이면 번호, 이전과 다음, 썸네일은 그리지 않습니다.
- 이전과 다음은 끝에서 `aria-disabled` 가 되고, `loop` 이면 넘어갑니다. 확대와 축소도 끝에서 `aria-disabled` 입니다.
- 넘기면 배율이 1 로 돌아갑니다.
- `Image.Viewer.Share` 는 브라우저에 `navigator.share` 가 있을 때만 보이고, 지금 장의 주소와 `alt` 를 공유합니다.
- `Image.Viewer.Download` 는 지금 장의 `src`(`previewSrc`) 로 가는 `<a download>` 입니다.

### 키보드

| 키              | 동작                                                            |
| --------------- | --------------------------------------------------------------- |
| `←` `→`         | 이전, 다음 장. 오른쪽에서 왼쪽으로 쓰는 문서에서는 반대         |
| `Home` `End`    | 처음, 끝 장                                                     |
| `+` `-` `0`     | 확대, 축소, 원래 크기(`=` 도 확대)                              |
| `←` `→` `↑` `↓` | 확대한 사진을 옮긴다                                            |
| `Tab`           | 도구 막대, 이전과 다음, 썸네일 사이. 뷰어 밖으로 나가지 않는다  |
| `Escape`        | 닫는다. 누른 사진(뷰어만 쓸 때는 연 버튼)으로 포커스가 돌아간다 |

### 포인터와 터치

| 입력                            | 동작                                                   |
| ------------------------------- | ------------------------------------------------------ |
| 옆으로 끌기, 쓸기               | 이전, 다음 장. 확대한 사진에서는 사진을 옮긴다         |
| 휠                              | 커서 자리를 중심으로 확대, 축소                        |
| 두 손가락 벌리기, 오므리기      | 두 손가락 사이를 중심으로 확대, 축소                   |
| 두 번 누르기                    | 그 자리로 확대하거나 원래 크기로                       |
| 원래 크기에서 아래로 쓸어내리기 | 뒤가 비쳐 보이다가, 충분히 내리거나 빠르게 쓸면 닫는다 |
| 사진 밖 빈 곳 누르기            | 닫는다                                                 |

- 확대한 사진을 끌다 놓으면 관성으로 조금 더 미끄러지고, 사진 가장자리에서 멈춥니다.
- 배율은 1 에서 4 까지입니다.

### 뷰어만 쓰기

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>앨범 열기</Button>
<Image.Viewer
  items={[{ src: '/photos/lake.jpg', alt: '호수 위로 뜬 해', caption: '아침의 호수', thumbnail: '/photos/lake-small.jpg' }]}
  open={open}
  onOpenChange={setOpen}
/>

overlay.open(() => <Image.Viewer items={photos} defaultValue={2} />);   // open 없이 항목에 묶인다
```

- 썸네일 목록 없이 뷰어만 쓸 때는 `items` 를 줍니다. `open`, `value`, `loop`, `zoom` 과 그 콜백은 `Image.Group` 과 같습니다.
- `Image.Group` 안의 `Image.Viewer` 에 이 상태들을 주면 개발 모드에서 경고합니다. 묶음이 가진 상태이므로 `Image.Group` 에 줍니다.
- `overlay.open` 안에서는 `open` 없이 그 항목에 묶이고, 닫히는 애니메이션이 끝나면 항목이 사라집니다.

### 불러오기

- 지금 장과 양옆 장만 큰 그림을 받습니다.
- 큰 그림을 받는 동안 썸네일이 같은 자리에 깔립니다. 썸네일도 없으면 크기를 알 때까지 Spinner 가 돕니다.
- 큰 그림이 깨지면 썸네일이 대신하고, 썸네일도 없으면 "사진을 불러오지 못했습니다" 를 보입니다.
- 맞춘 크기는 사진의 원래 크기를 넘지 않습니다. `srcSet` 이 있으면 브라우저가 어느 그림을 고를지 모르므로 화면에 맞춥니다.
- 묶음 안 사진의 `sizes` 는 썸네일의 폭이라 뷰어로 넘기지 않습니다. 뷰어의 `<img>` 는 `sizes` 없이 화면 폭(`100vw`)으로 그림을 고릅니다.

## 접근성

```tsx
<Image src={src} alt="호수 위로 뜬 해" />          // 그림의 이름
<Image src={src} alt="" />                        // 장식용. 바로 옆 글이 설명할 때
```

- `alt` 는 꼭 줍니다. 없으면 개발 모드에서 경고합니다. 장식용은 `alt=""` 입니다.
- 크게 볼 수 있는 사진에 `alt=""` 를 주면 버튼 이름이 "이미지 크게 보기" 가 되고 개발 모드에서 경고합니다.
- 깨진 그림을 대신하는 `Image.Fallback` 은 `role="img"` 와 `alt` 를 이름으로 가집니다. 안에 적은 글은 그림으로 읽히므로 버튼을 넣지 않습니다.
- `Image.Placeholder` 는 스크린 리더에게 숨깁니다.
- 뷰어는 `role="dialog"`, `aria-modal="true"` 이고 이름은 "사진 보기" 입니다(`aria-label` 로 바꿉니다). 열린 동안 뒤 페이지는 `aria-hidden` 이고 스크롤이 잠깁니다.
- 사진들은 `aria-roledescription="캐러셀"` 인 영역 "사진" 안에 있고, 한 장은 `role="group"`, `aria-roledescription="슬라이드"`, 이름 "6장 중 2번째" 입니다. 넘기면 같은 문장을 `aria-live="polite"` 로 읽습니다.
- 도구 막대의 "2 / 6" 은 스크린 리더에게 숨깁니다. 위 알림이 같은 내용을 읽습니다.
- 썸네일 줄은 이름이 "사진 목록" 인 `role="group"` 이고, 지금 장의 썸네일은 `aria-current="true"` 입니다.
- 깨진 큰 그림의 알림에서 그림 아이콘은 `role="img"` 와 `alt` 를 이름으로 가집니다.

## 상태와 data 속성

| 속성                              | 뜻                                        |
| --------------------------------- | ----------------------------------------- |
| `data-image`                      | 사진 상자                                 |
| `data-status`                     | `loading` / `loaded` / `error`            |
| `data-preview`                    | 누르면 크게 보는 사진                     |
| `data-image-group`, `data-layout` | 묶음과 그 배치(`row` / `column` / `grid`) |

- 함수로 받는 상태는 `{ status, preview }` 입니다. 루트의 `className`, `style` 이 받습니다.

| 뷰어 속성                      | 붙는 곳                                  | 뜻                                        |
| ------------------------------ | ---------------------------------------- | ----------------------------------------- |
| `data-image-viewer`            | 대화상자                                 |                                           |
| `data-open`                    | 대화상자                                 | 열려 있다                                 |
| `data-ending-style`            | 대화상자, 뒤 배경                        | 닫히는 중                                 |
| `data-swiping`                 | 대화상자, 뒤 배경                        | 아래로 쓸어내리는 중                      |
| `--image-viewer-presence`      | 대화상자, 뒤 배경                        | 쓸어내리는 동안 1 에서 0 으로 줄어드는 값 |
| `data-image-viewer-backdrop`   | 뒤 배경                                  |                                           |
| `data-image-viewer-stage`      | 사진들이 넘어가는 영역                   |                                           |
| `data-slide`, `data-selected`  | 한 장, 지금 장                           |                                           |
| `data-image-viewer-box`        | 확대되는 사진 상자                       |                                           |
| `data-image-viewer-picture`    | 큰 그림 `<img>`                          |                                           |
| `data-image-viewer-notice`     | 깨진 큰 그림의 알림                      |                                           |
| `data-image-viewer-toolbar`    | `Image.Viewer.Toolbar`                   |                                           |
| `data-image-viewer-counter`    | `Image.Viewer.Counter`                   |                                           |
| `data-image-viewer-step`       | `Image.Viewer.Prev`, `Image.Viewer.Next` | `prev` / `next`                           |
| `data-image-viewer-caption`    | `Image.Viewer.Caption`                   |                                           |
| `data-image-viewer-thumbnails` | `Image.Viewer.Thumbnails`                |                                           |
| `data-current`                 | 썸네일                                   | 지금 장. `aria-current="true"`            |
| `data-image-viewer-download`   | `Image.Viewer.Download`                  |                                           |

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

### Image.Viewer

| 속성                                       | 기본 / 동작                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| `items`                                    | 뷰어만 쓸 때의 사진. 아래 표                              |
| `value` / `defaultValue` / `onValueChange` | 뷰어만 쓸 때. 지금 보는 장. 기본 `0`                      |
| `open` / `defaultOpen` / `onOpenChange`    | 뷰어만 쓸 때. 기본 `false`. `overlay.open` 안이면 그 항목 |
| `loop`, `zoom` / `onZoomChange`            | 뷰어만 쓸 때. `Image.Group` 과 같다                       |
| `aria-label`                               | 대화상자의 이름. 기본 "사진 보기"                         |
| `className` / `style`                      | 대화상자로 간다                                           |
| `children`                                 | 그릴 부품. 없으면 기본 부품 모두                          |

| `items` 의 한 장                | 뜻                                            |
| ------------------------------- | --------------------------------------------- |
| `src`, `alt`                    | 필수. 큰 그림과 그 이름                       |
| `caption`                       | `Image.Viewer.Caption` 이 보여 줄 설명        |
| `thumbnail`                     | 큰 그림을 받는 동안 깔 그림, 썸네일 줄의 그림 |
| `srcSet`, `sizes`               | 큰 그림 `<img>` 로 간다                       |
| `crossOrigin`, `referrerPolicy` | 큰 그림 `<img>` 로 간다                       |

### 뷰어 부품

| 부품                                           | 기본 / 동작                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `Image.Viewer.Toolbar`                         | 위 오른쪽의 막대. 자식이 없으면 Counter, ZoomIn, ZoomOut, Download, Close |
| `Image.Viewer.Counter`                         | "2 / 6". 스크린 리더에게 숨긴다                                           |
| `Image.Viewer.ZoomIn` / `Image.Viewer.ZoomOut` | `IconButton` 속성. 이름 "확대" / "축소"                                   |
| `Image.Viewer.Share`                           | `IconButton` 속성. 이름 "공유하기". `navigator.share` 가 있을 때만        |
| `Image.Viewer.Download`                        | `IconButton` 속성과 `<a>` 속성. 이름 "내려받기"                           |
| `Image.Viewer.Close`                           | `IconButton` 속성. 이름 "닫기"                                            |
| `Image.Viewer.Prev` / `Image.Viewer.Next`      | `IconButton` 속성. 이름 "이전 사진" / "다음 사진". 양옆 가운데            |
| `Image.Viewer.Caption`                         | 지금 장의 `caption`. 없으면 그리지 않는다                                 |
| `Image.Viewer.Thumbnails`                      | 아래 썸네일 줄. 넘치면 가로로 스크롤한다                                  |

## 알아둘 것

- 기본 아이콘은 `@heroicons/react` 의 `PhotoIcon` 입니다. `Image.Fallback` 의 children 으로 바꿉니다.
- `Image.Placeholder`, `Image.Fallback` 이 아닌 자식은 사진 상자 안, 그림 다음에 그립니다. 그림 위에 겹치려면(배지 등) `absolute` 로 자리를 정합니다. 크게 보기 버튼 밖이므로 그 안에 버튼을 두어도 됩니다.
- `columns` 가 1 이상의 정수가 아니면 오류를 던집니다.
- 뷰어 부품을 `Image.Viewer` 밖에 두면 오류를 던집니다.
- `<a download>` 는 같은 출처의 주소에서만 내려받습니다. 다른 출처의 사진은 브라우저가 열기만 합니다.
- 뷰어는 제자리에 그려지고 top layer 로 올라갑니다. 포털을 쓰지 않으므로 그 자리의 테마를 따릅니다.
