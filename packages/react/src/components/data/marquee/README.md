# Marquee

내용을 한 방향으로 끊김 없이 흘려보내는 띠입니다. 로고 띠("함께하는 단체"), 공지 티커, 숫자 띠에 씁니다.

- **Carousel 과 다릅니다.** Carousel 은 멈추는 자리와 "지금 몇 번째" 가 있고 사용자가 넘깁니다. Marquee 는 멈추는 자리 없이 계속 흐르고, 사용자는 멈추기만 합니다.
- **CSS 로 흐릅니다.** 내용을 한 벌 복제해 이어 붙이고 `translate` 애니메이션(`animate-marquee`)으로 이음매 없이 돌립니다. 서버 HTML 이 JS 없이 바로 흐릅니다.
- **멈출 수 있습니다.** 멈춤 버튼(`Marquee.Pause`)이 기본으로 그려집니다(WCAG 2.2.2). 포인터를 올리거나 키보드 포커스가 안에 있는 동안에도 잠시 멈춥니다.
- **한 번만 읽힙니다.** 복제본은 `aria-hidden` 과 `inert` 라 스크린 리더는 항목을 한 번 읽고, Tab 도 항목마다 한 번 멈춥니다.
- **동작 줄이기를 따릅니다.** `prefers-reduced-motion` 이면 흐르지 않고 항목을 줄바꿈해 모두 보여 줍니다.

```tsx
import { Marquee } from '@gsainfoteam/ids-react';

<Marquee aria-label="함께하는 단체" className="gap-12">
  {partners.map((partner) => (
    <img key={partner.id} src={partner.logo} alt={partner.name} className="h-8" />
  ))}
</Marquee>;
```

## 항목

```tsx
<Marquee aria-label="공지" speed="slow">
  <Marquee.Item>새 학기 수강신청 안내</Marquee.Item>   {/* 줄바꿈하지 않고 줄어들지 않는다 */}
  <Marquee.Item asChild>
    <a href="/notices/12">도서관 운영 시간 변경</a>      {/* 링크에 그대로 입힌다 */}
  </Marquee.Item>
</Marquee>
```

- `Marquee.Item` 은 선택입니다. 없으면 자식을 그대로 흘립니다.
- 간격은 루트의 `gap-*` 입니다. 기본은 `gap-8`(32px)이고, 항목 사이와 마지막 항목과 복제본의 첫 항목 사이가 같습니다.
- 내용이 띠보다 짧으면 항목 사이를 벌려 띠를 채웁니다. 복제본과 이어 붙여도 빈자리가 보이지 않습니다.

## 방향과 속도

```tsx
<Marquee aria-label="고객사" />                           // 가로. 글 읽는 방향으로 흐른다
<Marquee aria-label="고객사" reverse />                   // 반대로
<Marquee aria-label="통계" orientation="vertical" className="h-40" />  // 세로는 높이를 준다

<Marquee aria-label="고객사" speed="slow" />              // 초당 25px
<Marquee aria-label="고객사" />                           // normal, 초당 50px
<Marquee aria-label="고객사" speed="fast" />              // 초당 100px
<Marquee aria-label="고객사" speed={80} />                // 초당 px
```

- 가로 띠는 LTR 에서 왼쪽으로, `dir="rtl"` 에서 오른쪽으로 흐릅니다. 세로 띠는 위로 흐릅니다.
- 속도는 초당 px 이라 항목 수와 상관없이 같은 빠르기로 읽힙니다. 한 바퀴 시간은 ResizeObserver 로 잰 길이를 속도로 나눈 값이고, 루트의 `--ids-marquee-duration` 에 들어갑니다.
- 재기 전(서버 HTML, 첫 그림)에는 1000px 을 한 바퀴로 보고 흐릅니다. `normal` 이면 20초입니다.
- 세로 띠는 높이가 있어야 보입니다. 가로 띠는 부모의 폭을 채웁니다.

## 페이드

```tsx
<Marquee aria-label="고객사" />                                   // 양 끝을 흐리게(기본)
<Marquee aria-label="고객사" fade={false} />                      // 흐리지 않는다
<Marquee aria-label="고객사" className="[--marquee-fade:3rem]" /> // 흐린 폭
```

- `mask-image` 그라디언트라 배경색을 몰라도 어느 표면 위에서나 맞습니다.
- 기본 폭은 `min(15%, 5rem)` 입니다. 세로 띠는 위아래 끝이 흐려집니다.

## 멈춤

```tsx
<Marquee aria-label="고객사" />                                   // 멈춤 버튼. 포인터와 포커스에 잠시 멈춘다
<Marquee aria-label="고객사" defaultPlaying={false} />            // 멈춘 채 시작
<Marquee aria-label="고객사" playing={playing} onPlayingChange={setPlaying} />
<Marquee aria-label="고객사" pauseOnHover={false} pauseOnFocus={false} />
<Marquee aria-label="고객사" pauseControl={false} />              // 버튼 없음

<Marquee aria-label="고객사">
  ...
  <Marquee.Pause variant="outline" />                             {/* 버튼 바꾸기 */}
</Marquee>
```

- 멈춤 버튼은 `IconToggle` 입니다. 이름은 "일시 정지" 로 고정이고, 멈추면 `aria-pressed="true"` 가 되고 아이콘이 재생 모양으로 바뀝니다.
- 버튼으로 멈추면 다시 누를 때까지 멈춥니다. 포인터(`pauseOnHover`)와 키보드 포커스(`pauseOnFocus`)는 그동안만 멈추고 `playing` 을 바꾸지 않습니다.
- 터치에는 포인터 올리기가 없어서 보이는 버튼이 필요합니다. `pauseControl={false}` 는 내용이 5초 안에 멈추거나 장식일 때만 씁니다.
- 버튼은 띠의 끝(LTR 오른쪽)에 붙고, 띠는 그만큼 비워 둡니다. 크기는 `size` 로 `standard`(36px), `tiny`(32px) 입니다.
- `Marquee.Pause` 는 자식 가운데 어디에 적어도 한 번만 그려지고 복제되지 않습니다. `pressed` 와 `size` 는 루트가 정합니다.

## 동작 줄이기

```tsx
<Marquee aria-label="고객사" />                         // 운영체제 설정(prefers-reduced-motion)을 따른다
<Marquee aria-label="고객사" reducedMotion />           // 항상 멈춘 모습
<Marquee aria-label="고객사" reducedMotion={false} />   // 설정과 상관없이 흐른다
```

- 동작 줄이기면 흐르지 않고 항목을 줄바꿈해 모두 보여 줍니다. 복제본과 멈춤 버튼은 그리지 않고, 루트에 준 높이도 풀어 줄바꿈한 항목이 모두 보입니다.
- 서버는 설정을 모르므로 CSS(`motion-reduce:`)가 첫 그림부터 멈춘 모습을 그리고, hydration 뒤에 복제본을 지웁니다.
- `reducedMotion` 은 앱에 자기 동작 줄이기 설정이 있을 때 그 값을 넘깁니다. 비워 두면 사용자의 운영체제 설정을 따릅니다.

## 접근성

```tsx
<Marquee aria-label="함께하는 단체">...</Marquee>        // role="group" 과 이름

<h2 id="partners-title">함께하는 단체</h2>
<Marquee aria-labelledby="partners-title">...</Marquee>
```

- 루트는 `role="group"` 이고 이름이 필요합니다. `aria-label` 이나 `aria-labelledby` 가 없으면 개발 모드에서 경고합니다.
- 흐름을 알리지 않습니다(live region 없음). 스크린 리더는 원본 항목을 차례로 한 번씩 읽습니다.
- 복제본은 `aria-hidden="true"` 와 `inert` 입니다. Tab 은 항목 안의 링크나 버튼마다 한 번 멈춥니다.
- 키보드 포커스를 받은 항목은 띠 가운데로 옮겨집니다. 띠 밖에 가려지거나 페이드에 걸린 항목도 포커스 링까지 또렷이 보입니다. 띠는 `overflow: clip` 이라 브라우저가 대신 스크롤하지 않습니다.
- 포인터가 복제본 위에 오면 원본과 복제본의 자리를 바꿔 원본이 포인터 아래에 옵니다. 보이는 모습은 그대로이고, 보이는 링크는 어느 것이든 누를 수 있습니다.

## 상태와 data 속성

| 속성                                      | 뜻                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `data-playing` / `data-paused`            | 흐르는지. 멈춤 버튼과 `playing` 이 정하고, 잠시 멈춤은 바꾸지 않는다 |
| `data-orientation`                        | `horizontal` / `vertical`                                            |
| `data-reverse`                            | `reverse` 일 때                                                      |
| `data-reduced-motion`                     | 멈춘 모습일 때(운영체제 설정이나 `reducedMotion`)                    |
| `data-marquee-viewport`                   | 보이는 창. 잘라 내고 페이드를 입힌다                                 |
| `data-marquee-track`                      | 움직이는 띠. `data-swapped` 면 원본과 복제본의 자리가 바뀌어 있다    |
| `data-marquee-content`                    | 원본과 복제본. 복제본에는 `data-marquee-copy` 가 더 붙는다           |
| `data-marquee-item`, `data-marquee-pause` | 항목, 멈춤 버튼                                                      |

## 속성

| 속성                             | 기본 / 동작                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| `aria-label`                     | 필수. 무엇이 흐르는지. `aria-labelledby` 로 대신할 수 있다               |
| `orientation`                    | `horizontal`(기본) / `vertical`                                          |
| `reverse`                        | 반대 방향. 기본 `false`                                                  |
| `speed`                          | `slow` / `normal`(기본) / `fast` / 초당 px                               |
| `playing` / `defaultPlaying`     | 흐르는지. 기본 `true`, 동작 줄이기면 `false`                             |
| `onPlayingChange`                | 멈춤 버튼을 누를 때                                                      |
| `pauseOnHover`, `pauseOnFocus`   | 포인터와 키보드 포커스가 있는 동안 멈춤. 기본 `true`                     |
| `pauseControl`                   | 멈춤 버튼. 기본 `true`                                                   |
| `fade`                           | 양 끝 페이드. 기본 `true`                                                |
| `size`                           | 멈춤 버튼 크기 `standard`(기본) / `tiny`                                 |
| `reducedMotion`                  | 없음: 운영체제 설정을 따름. `true`: 항상 멈춘 모습. `false`: 항상 흐름   |
| `Item.asChild`                   | 기본 `div` 대신 자식 요소에 속성을 합친다                                |
| `Pause`                          | `IconToggle` 의 속성. `icon` 으로 아이콘을 바꾼다                        |
| 그 외                            | 루트 `div` 의 native 속성                                                |

## 알아둘 것

- 자식은 두 번 그려집니다. 항목 안의 `id`, `ref`, 상태, effect 도 두 벌이 되므로 항목에 `id` 를 적지 않고, 한 번만 일어나야 하는 일(데이터 불러오기)은 Marquee 밖에서 합니다.
- 복제본은 `inert` 라 스크립트로도 포커스할 수 없습니다.
- 공지처럼 읽어야 하는 글은 `slow` 나 `normal` 로 둡니다. 빠르게 흐르는 글은 읽기 어렵습니다.
- 개발 모드에서 이름이 없을 때, `speed` 가 0 이하의 숫자일 때 경고합니다. 잘못된 `speed` 는 `normal` 로 흐릅니다.
