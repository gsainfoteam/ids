# ImageGroup

여러 [Image](../image/README.md) 를 가로, 세로, 격자로 늘어놓고, 누른 장부터 한 뷰어(`Image.Viewer`)로 넘겨 봅니다. Image 의 일부가 아니라 여러 Image 를 담는 그릇이라, `Image.Group` 이 아닌 별도 컴포넌트입니다.

- **시멘틱 구성.** `<ul role="list">` 이고 사진마다 `<li>` 로 감쌉니다. Safari가 목록 의미를 잃지 않습니다. `aria-label` 로 목록의 이름을 줍니다.
- **안의 사진은 누를 수 있습니다.** 묶음 안의 Image 는 `preview` 가 기본으로 켜져, 누르면 그 장부터 뷰어가 열립니다.
- **뷰어 하나.** 묶음이 뷰어를 하나 붙이고, 지금 보는 장, 열림, 확대 배율을 가집니다. 자식으로 `Image.Viewer` 를 적으면 그 뷰어를 씁니다.
- **서버 컴포넌트.** 서버 컴포넌트가 이미 그려 넘긴 `Image.Viewer` 도 자식 가운데에서 찾습니다.

```tsx
import { Image, ImageGroup } from '@gsainfoteam/ids-react';

<ImageGroup layout="grid" columns={3} aria-label="풍경 사진">
  {photos.map((photo) => (
    <Image key={photo.id} src={photo.thumb} previewSrc={photo.full} alt={photo.alt} ratio={1} />
  ))}
</ImageGroup>
```

## 늘어놓기

```tsx
<ImageGroup layout="grid" columns={3} aria-label="풍경 사진">
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
</ImageGroup>

<ImageGroup layout="row" />                     // 가로로 같은 폭씩(기본)
<ImageGroup layout="column" />                  // 세로로 쌓는다
<ImageGroup layout="grid" columns={4} />        // 격자. columns 기본 3
```

- `<ul role="list">` 이고 사진마다 `<li>` 로 감쌉니다. 직접 `<li>` 를 적으면 그대로 둡니다. `aria-label` 로 목록의 이름을 줍니다.
- 간격은 `gap-2`(8px)입니다. `className` 으로 바꿉니다.
- 사진은 컴포넌트 안에 감싸 둬도(`<figure>` 등) 문서 순서대로 번호가 매겨집니다.
- `preview={false}` 인 사진은 누를 수 없고 번호에서 빠집니다.

## 뷰어 상태

```tsx
const [index, setIndex] = useState(0);
<ImageGroup
  value={index}                                   // 지금 보는 장
  onValueChange={setIndex}
  open={open}                                     // 뷰어가 열렸는가
  onOpenChange={setOpen}
  loop                                            // 끝에서 처음으로
  zoom={zoom}                                     // 확대 배율(1 이 맞춘 크기)
  onZoomChange={setZoom}
>
  ...
</ImageGroup>
```

- 사진을 누르거나, Tab 으로 가서 `Enter` `Space` 를 누르면 그 장이 `value` 가 되고 `open` 이 `true` 가 됩니다. 열 때 배율은 1 로 돌아갑니다.
- `value` 는 문서 순서의 번호입니다. 사진의 순서가 바뀌면 번호도 따라갑니다.
- 묶음 안의 `Image.Viewer` 에 이 상태들을 주면 개발 모드에서 경고합니다. 묶음이 가진 상태이므로 ImageGroup 에 줍니다.
- 뷰어의 부품, 키보드, 포인터는 [Image 의 뷰어](../image/README.md#뷰어) 를 봅니다.

## 속성

| 속성                                       | 기본 / 동작                                  |
| ------------------------------------------ | -------------------------------------------- |
| `layout`                                   | `row`(기본) / `column` / `grid`              |
| `columns`                                  | `grid` 의 열 수. 기본 `3`                    |
| `value` / `defaultValue` / `onValueChange` | 지금 보는 장(0부터). 기본 `0`                |
| `open` / `defaultOpen` / `onOpenChange`    | 뷰어가 열렸는가. 기본 `false`                |
| `loop`                                     | 끝에서 처음으로 넘어가는가. 기본 `false`     |
| `zoom` / `onZoomChange`                    | 확대 배율. 기본 `1`                          |
| 그 외 속성                                 | `<ul>` 로 간다(`aria-label`, `className` 등) |

