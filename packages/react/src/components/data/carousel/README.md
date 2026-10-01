# Carousel

여러 장(슬라이드)을 한 줄에 놓고 한 장씩 넘겨 봅니다. 사진 넘기기, 온보딩, 카드 슬라이드, 배너에 씁니다.

- **`Carousel.Slide` 만 넣어도 동작.** 잘라 보이는 영역, 이전과 다음 버튼, 위치 점을 기본으로 그립니다.
- **끌어서 넘기기.** 드래그, 관성, 스냅은 [Embla Carousel](https://www.embla-carousel.com/) 이 합니다. 두 번째 손가락이 닿으면 끌기를 놓습니다.
- **자동 넘김.** `autoplay` 는 한 장씩 넘기고 `autoScroll` 은 멈추지 않고 흐릅니다. 멈춤 버튼(`Carousel.Pause`)이 함께 그려집니다(WCAG 2.2.2).
- **보이는 것만 읽고 누른다.** 화면 밖 슬라이드는 `inert` 라서 Tab 과 스크린 리더가 들르지 않습니다. 넘기면 "5장 중 2번째" 를 알립니다.
- **서버 렌더링.** 서버 HTML 은 CSS 만으로 슬라이드를 줄 세웁니다. `defaultValue` 의 자리도 CSS 변수로 미리 그려서 엔진이 붙을 때 흔들리지 않습니다.

```tsx
import { Carousel } from '@gsainfoteam/ids-react';

<Carousel aria-label="행사 사진">
  {photos.map((photo) => (
    <Carousel.Slide key={photo.id}>
      <img src={photo.url} alt={photo.alt} />
    </Carousel.Slide>
  ))}
</Carousel>;
```

## 값

```tsx
<Carousel aria-label="사진" defaultValue={2} />                     // 비제어
<Carousel aria-label="사진" value={index} onValueChange={setIndex} /> // 제어
```

- 값은 멈추는 자리(스냅)의 번호이고 0부터 셉니다. 한 장씩 넘기면 슬라이드 번호와 같습니다.
- 끌기, 버튼, 점, 키, 자동 넘김이 모두 `onValueChange` 로 알립니다. 같은 자리로 옮기면 알리지 않습니다.
- 제어일 때 부모가 값을 바꾸지 않으면 트랙은 그 자리로 돌아갑니다.
- 범위 밖의 값은 가까운 끝으로 맞춰 그립니다.

## 여러 장 보기

```tsx
<Carousel aria-label="추천 상품" slidesPerView={3} slidesToScroll="auto">
  <Carousel.Content className="gap-4">
    {products.map((product) => (
      <Carousel.Slide key={product.id}>
        <Card>...</Card>
      </Carousel.Slide>
    ))}
  </Carousel.Content>
</Carousel>
```

- `slidesPerView`(기본 1)는 한 번에 보이는 장 수입니다. `1.5` 처럼 소수를 주면 다음 장이 조금 보입니다.
- `slidesToScroll`(기본 1)은 한 번에 넘기는 장 수입니다. `'auto'` 면 보이는 만큼 넘깁니다.
- 점은 멈추는 자리마다 하나입니다. 세 장씩 넘기면 점 하나가 세 장을 맡고, 이름은 그 첫 장("4번째 슬라이드로")입니다.
- 간격은 `Carousel.Content` 의 `gap-*` 으로 줍니다. 장의 폭은 간격을 빼고 나눕니다.
- `align` 은 멈춘 장을 어디에 맞출지입니다. `start`(기본), `center`, `end`.
- `dragFree` 면 끈 만큼 미끄러지고 스냅에 맞추지 않습니다.
- `loop` 면 끝과 처음이 이어지고 이전, 다음 버튼이 비활성이 되지 않습니다. 슬라이드가 너무 적어 이어 붙일 수 없으면 엔진이 `loop` 없이 동작합니다.

## 자동 넘김

```tsx
<Carousel aria-label="공지 배너" loop autoplay={{ delay: 5000 }}>...</Carousel>
<Carousel aria-label="후원 단체" loop autoScroll={{ speed: 1 }} slidesPerView={4}>...</Carousel>
<Carousel aria-label="배너" autoplay playing={playing} onPlayingChange={setPlaying} />
```

- `autoplay` 는 `delay`(기본 4000ms)마다 다음 자리로 넘깁니다. 끝에서는 처음으로 돌아갑니다.
- `autoScroll` 은 `speed`(한 프레임에 움직이는 px, 기본 2)로 `direction`(`forward` 기본, `backward`) 쪽으로 흐릅니다. 시작 전에 1초 기다립니다.
- 둘은 함께 쓰지 않습니다. 둘 다 주면 `autoplay` 가 돌고 개발 모드에서 콘솔에 경고합니다.
- 어느 쪽이든 `Carousel.Pause` 를 기본으로 그립니다. 5초 넘게 움직이는 내용은 멈출 방법이 보여야 합니다(WCAG 2.2.2).

| 멈추는 때                           | 얼마나                                      |
| ----------------------------------- | ------------------------------------------- |
| 포인터를 슬라이드 위에 올린 동안    | 떼면 다시 넘긴다                            |
| 키보드 포커스가 안에 있는 동안      | 나가면 다시 넘긴다. 멈춤 버튼 자신은 빼고   |
| 누르거나 끄는 동안                  | 놓으면 다시 넘긴다                          |
| 멈춤 버튼을 누른 뒤                 | 다시 누를 때까지                            |
| `prefers-reduced-motion` 인 사용자  | 멈춘 채 시작한다. 누르면 넘기기 시작한다     |

- `playing` / `defaultPlaying` / `onPlayingChange` 는 사용자가 고른 상태(멈춤 버튼)입니다. 잠깐 멈춘 것은 바꾸지 않습니다.
- `loop` 없는 `autoScroll` 이 끝에 닿으면 멈춤 상태가 됩니다. 다시 누르면 처음부터 흐릅니다.
- 자동으로 넘기는 동안 알림 영역은 `aria-live="off"` 이고, 멈추면 `polite` 가 되어 손으로 넘긴 장을 알립니다.

## 파트 배치

```tsx
<Carousel aria-labelledby={titleId} slidesPerView={3} loop>
  <div className="flex items-center justify-between">
    <h2 id={titleId}>추천 상품</h2>
    <div className="flex gap-2">
      <Carousel.Prev variant="ghost" />
      <Carousel.Next variant="ghost" />
    </div>
  </div>
  <Carousel.Content className="gap-4">...</Carousel.Content>
  <Carousel.Indicators className="justify-center" />
</Carousel>
```

- 파트는 모두 선택입니다. 빼면 기본값을 그립니다.
  - `Carousel.Content` 가 없으면 `Carousel.Slide` 들을 기본 Content 로 감쌉니다.
  - `Carousel.Prev`, `Carousel.Next`, `Carousel.Indicators`, `Carousel.Indicator` 가 하나도 없으면 이전, 다음 버튼을 Content 의 양 끝에, 점을 아래에 그립니다. 하나라도 두면 둔 것만 그립니다. 점 없이 버튼만, 버튼 없이 점만 둘 수 있습니다.
  - `Carousel.Pause` 는 자동 넘김이 켜져 있고 직접 두지 않았으면 아래 줄 끝에 그립니다. 자동 넘김이 없으면 그리지 않습니다.
- 멈출 자리가 하나뿐이면(슬라이드 한 장) 기본 버튼과 점을 그리지 않습니다.
- 파트는 JSX 어디에 두어도 됩니다. 캐러셀 밖(자기 컴포넌트 안)에서 그리는 파트는 찾지 못해 기본값이 함께 그려집니다.

```tsx
<Carousel.Indicators>
  {(index) => <Carousel.Indicator index={index}>{index + 1}</Carousel.Indicator>}
</Carousel.Indicators>

<Carousel.Prev icon={<ArrowLeftIcon />} />
<Carousel.Pause variant="ghost" />
```

- `Carousel.Indicators` 의 자식이 함수면 자리마다 불러 그립니다. 노드를 주면 그대로 그립니다.
- `Carousel.Indicator` 의 자식은 점을 대신합니다. 누르는 영역은 24px 이상으로 둡니다(WCAG 2.5.8).
- `Carousel.Prev`, `Carousel.Next` 는 `IconButton` 의 `variant`(기본 `outline`), `colorScheme`, `size`, `icon` 을 받습니다. `Carousel.Pause` 는 `IconToggle` 의 속성을 받습니다.

```tsx
<Carousel.Content asChild>
  <section className="rounded-container">{slides}</section>
</Carousel.Content>
<Carousel.Slide asChild>
  <article>...</article>
</Carousel.Slide>
```

- `Carousel.Content` 와 `Carousel.Slide` 는 `asChild` 로 요소를 바꿉니다. Content 의 자식 요소 안이 슬라이드입니다.
- Content 의 자식은 모두 한 장씩입니다. 슬라이드를 자기 컴포넌트로 감싸도 되지만, 그 컴포넌트는 `Carousel.Slide` 를 하나 그려야 합니다.

## 방향

```tsx
<Carousel aria-label="공지" orientation="vertical">
  <Carousel.Content className="h-40">...</Carousel.Content>
</Carousel>

<div dir="rtl">
  <Carousel aria-label="사진">...</Carousel>
</div>
```

- 세로는 `Carousel.Content` 에 높이를 줍니다. 높이가 없으면 모든 장이 늘어서 보입니다.
- 오른쪽에서 왼쪽으로 쓰는 화면에서는 첫 장이 오른쪽이고 `←` 가 다음 장입니다. 버튼의 화살표도 뒤집힙니다. 방향은 캐러셀이 놓인 곳의 CSS `direction` 에서 읽습니다.

## 키보드

| 키                     | 동작                                           |
| ---------------------- | ---------------------------------------------- |
| `Tab`                  | 버튼, 보이는 슬라이드 안의 요소, 점, 멈춤 순서 |
| `←` `→` (세로 `↑` `↓`) | 이전, 다음 자리로                              |
| `Home` `End`           | 처음, 끝 자리로                                |
| `Enter` `Space`        | 버튼과 점을 누른다                             |

- 방향키와 `Home` `End` 는 포커스가 캐러셀 안에 있을 때 받습니다. 끝에 닿았거나 수식 키를 함께 누르면 가로채지 않습니다.
- 슬라이드 안의 입력 칸, 선택 상자, 편집 영역에서는 방향키를 그 요소에 남깁니다.
- 점에서 누르면 포커스가 새 현재 점을 따라갑니다. 이전, 다음 버튼에서 누르면 그 버튼에 남습니다.
- 슬라이드 안에서 누르면 포커스가 새 슬라이드로 옮겨 갑니다. 떠난 슬라이드가 `inert` 가 되며 포커스를 잃지 않게 하려는 것입니다. 이때 Content 에 포커스 링이 그려집니다.
- 화면 밖 슬라이드는 `inert` 라서 Tab 이 건너뜁니다. 반쯤 보이는 슬라이드에 Tab 으로 들어가면 그 슬라이드가 보이도록 넘깁니다.

## 모양

```tsx
<Carousel aria-label="사진" size="tiny" />          // 버튼과 점의 크기. standard(기본) / tiny
<Carousel.Slide className="basis-2/3" />           // 장마다 폭을 따로 줄 때
```

- `size` 는 이전, 다음, 멈춤 버튼과 점의 크기입니다. 슬라이드 크기는 `slidesPerView` 나 슬라이드의 `className` 이 정합니다.
- 점은 8px(tiny 6px)이고 누르는 영역은 24px 입니다. 현재 점은 `primary` 색으로 길어지고, 나머지는 `handle` 에서 hover `handle-hover`, 누름 `handle-active` 로 한 단계씩 진해집니다.
- 기본 버튼은 Content 위에 겹쳐 그립니다. `outline` 이라 사진 위에서도 보입니다.

## 상태

| 속성            | 붙는 곳            | 뜻                                        |
| --------------- | ------------------ | ----------------------------------------- |
| `data-carousel` | 루트               |                                           |
| `data-orientation` | 루트            | `horizontal` / `vertical`                 |
| `data-playing`  | 루트               | 지금 자동으로 넘기는 중(잠깐 멈추면 빠짐) |
| `data-dragging` | 루트               | 누르거나 끄는 중                          |
| `data-selected` | 슬라이드           | 지금 자리의 장                            |
| `data-in-view`  | 슬라이드           | 화면에 보이는 장. 없으면 `inert`          |
| `data-current`  | 점(버튼과 안의 점) | 지금 자리의 점. `aria-current="true"`     |

- 루트의 `className`, `style` 은 `{ value, orientation, playing, dragging }` 을 받는 함수일 수 있습니다. `Carousel.Slide` 는 `{ index, selected, inView }`, `Carousel.Indicator` 는 `{ index, current }` 와 hover 같은 상호작용 상태를 받습니다.

## 속성

| 속성                                  | 기본 / 동작                                                |
| ------------------------------------- | ---------------------------------------------------------- |
| `aria-label` / `aria-labelledby`      | 필수. 캐러셀의 이름                                        |
| `value` / `defaultValue`              | 멈춘 자리의 번호. 기본 `0`                                 |
| `onValueChange`                       | `(value: number) => void`                                  |
| `orientation`                         | `horizontal`(기본) / `vertical`                            |
| `slidesPerView`                       | `1`. 한 번에 보이는 장 수                                  |
| `slidesToScroll`                      | `1`. 한 번에 넘기는 장 수, 또는 `'auto'`                   |
| `align`                               | `start`(기본) / `center` / `end`                           |
| `loop`, `dragFree`                    | `false`                                                    |
| `autoplay`                            | `false`. `true` 면 4초, `{ delay }`                         |
| `autoScroll`                          | `false`. `true` 면 속도 2, `{ speed, direction }`           |
| `playing` / `defaultPlaying`          | 자동 넘김을 켰는지. 기본 `true`, 줄인 동작이면 `false`      |
| `onPlayingChange`                     | `(playing: boolean) => void`. 멈춤 버튼을 누를 때           |
| `size`                                | `standard`(기본) / `tiny`. 버튼과 점                        |
| `Carousel.Content`                    | 잘라 보이는 영역과 트랙. `asChild`, `gap-*`                 |
| `Carousel.Slide`                      | 한 장. `asChild`, `aria-label` 로 이름을 바꿀 수 있다       |
| `Carousel.Prev` / `Carousel.Next`     | `IconButton` 속성. 이름 "이전 슬라이드" / "다음 슬라이드"   |
| `Carousel.Indicators`                 | 점의 줄. 자식은 노드 또는 `(index) => ReactNode`            |
| `Carousel.Indicator`                  | `index` 필수. 이름 "N번째 슬라이드로"                       |
| `Carousel.Pause`                      | `IconToggle` 속성. 이름 "자동 넘김 멈춤", 눌림이 멈춤       |

## 알아둘 것

- 이름이 없거나, `Carousel.Slide` 가 `Carousel.Content` 밖에 있거나, `autoplay` 와 `autoScroll` 을 함께 주면 개발 모드에서 콘솔에 경고합니다.
- 문구("캐러셀", "슬라이드", "5장 중 2번째", "이전 슬라이드" 등)는 `IdsProvider translate` 의 `carousel.*`, `slides.*` 키로 바꿉니다.
- 서버 HTML 에는 `gap` 값이 없어서, 간격을 두고 여러 장을 보이는 캐러셀은 엔진이 붙을 때 장의 폭이 간격만큼 한 번 줄어듭니다.
- `loop` 에서 `align="center"` 인 첫 자리는 엔진이 붙기 전까지 앞쪽 장을 끌어오지 못해 왼쪽에 붙어 보입니다.
- 버튼으로 넘기는 움직임은 약 270ms 에 자리를 잡습니다(`--ids-motion-normal` 에 가장 가까운 Embla 값). 끌기는 손을 뗀 속도를 따릅니다. `prefers-reduced-motion` 이면 버튼, 점, 키는 움직임 없이 바로 넘깁니다.
