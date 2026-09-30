# Splitter

패널을 옆으로(`horizontal`) 또는 위아래로(`vertical`) 놓고, 패널 사이의 핸들을 끌어 크기를 나누는 레이아웃입니다. IDE 의 사이드바, 코드와 미리보기, 목록과 대화 화면에 씁니다. 요소 하나의 크기를 바꾸는 것은 `Resizable` 입니다.

- **크기는 퍼센트.** 값은 패널마다 하나씩, 합이 100 인 배열입니다. Slider 의 범위 값처럼 `defaultValue`, `value`, `onValueChange` 로 다룹니다.
- **서버 HTML 에 크기가 들어 있습니다.** 기본 크기가 `flex-grow` 로 그려져서 불러온 뒤에 패널이 움직이지 않습니다.
- **핸들은 저절로.** 패널 사이에 `Splitter.Handle` 을 적지 않으면 기본 핸들이 들어갑니다.
- **키보드.** 핸들에 포커스를 두고 방향키로 16px, `Shift` 와 함께 64px 씩 옮깁니다. 오른쪽에서 왼쪽 문서에서는 가로 방향키가 뒤집힙니다.
- **포인터.** 선은 1px 이지만 잡는 영역은 24px 입니다. 핸들을 두 번 누르면 기본 크기로 돌아갑니다.
- **값을 두 번 알림.** 움직이는 동안은 `onValueChange`, 손을 떼거나 키를 놓으면 `onValueCommit` 이 한 번 불립니다. 저장은 commit 에 겁니다.

```tsx
import { Splitter } from '@gsainfoteam/ids-react';

<div className="h-screen">
  <Splitter>
    <Splitter.Panel defaultSize={25} minSize={15}>
      <FileTree />
    </Splitter.Panel>
    <Splitter.Panel>
      <Editor />
    </Splitter.Panel>
  </Splitter>
</div>;
```

## 크기

```tsx
<Splitter defaultValue={[20, 50, 30]}>...</Splitter>    // 루트에서 한 번에
<Splitter.Panel defaultSize={30} />                      // 패널마다. 적지 않은 패널은 남은 크기를 똑같이 나눈다
<Splitter value={layout} onValueChange={setLayout} />    // 제어
<Splitter onValueCommit={save} />                        // 끌기, 키, 버튼이 끝날 때 한 번
```

- 루트의 `defaultValue` 가 패널의 `defaultSize` 보다 먼저입니다.
- 합이 100 이 아니면 비율대로 맞춥니다. 기본 크기의 합이 100 을 넘으면 개발 빌드에서 경고합니다.
- `defaultValue` 는 처음 그릴 때와 패널 수가 바뀔 때만 읽습니다. 패널을 넣고 빼면 레이아웃을 기본 크기로 다시 나눕니다.
- 두 콜백은 사용자가 바꿀 때만 불립니다. 처음 그릴 때와 창 크기가 바뀔 때는 부르지 않습니다.

## 한계

```tsx
<Splitter.Panel minSize={15} maxSize={40} />      // 퍼센트. 기본 0 과 100
<Splitter.Panel collapsible minSize={20} />       // 최소 크기의 절반 아래로 끌면 접힌다
<Splitter.Panel collapsible collapsedSize={4} />  // 접힌 크기. 기본 0
```

- 옆 패널이 최소 크기에 닿아도 계속 끌면 그다음 패널까지 밀어 냅니다. 같은 끌기 안에서 되돌리면 밀린 패널도 돌아옵니다.
- 접힌 패널에는 `data-collapsed` 가 붙습니다. 크기가 0 인 패널은 `inert` 라서 안의 요소가 Tab 에 걸리지 않습니다.

## 접기와 펼치기

- 접을 수 있는 패널 옆 핸들에는 접기 버튼이 붙습니다. 끌지 않고 한 번 눌러 접고 펼치는 길입니다(WCAG 2.5.7).
- 버튼은 선의 시작 쪽 끝(가로 분할은 위, 세로 분할은 시작 쪽)에 있어서 가운데를 잡고 끄는 데 걸리지 않습니다. 패널이 접히면 열린 패널 쪽으로 비켜 섭니다.
- 키보드는 핸들의 `Enter` 가 같은 일을 하므로 버튼은 Tab 순서에 없습니다.
- 핸들 앞 패널이 접을 수 있으면 그 패널을, 아니면 뒤 패널을 접습니다.
- 펼치면 버튼이나 `Enter` 로 접기 전의 크기로, 끌어서 접었으면 최소 크기로 돌아갑니다.
- 앱에 따로 접기 버튼이 있으면 `className="[&_[data-splitter-toggle]]:hidden"` 으로 숨깁니다.

## 키보드

| 키                          | 동작                                                 |
| --------------------------- | ---------------------------------------------------- |
| `←` `→` (세로 분할은 `↑` `↓`) | 16px 옮긴다                                          |
| `Shift` + 방향키            | 64px 옮긴다                                          |
| `Home`                      | 앞 패널을 가장 작게. 접을 수 있으면 접는다           |
| `End`                       | 앞 패널을 가장 크게                                  |
| `Enter`                     | 접을 수 있는 패널을 접고 펼친다                      |
| RTL 가로 분할               | `←` 가 선을 왼쪽으로 옮겨 오른쪽의 앞 패널을 키운다 |

- 걸음은 패널들이 나눠 쓰는 길이에서 16px 을 퍼센트로 바꾼 값이라 화면이 넓어도 같은 거리를 움직입니다.
- 최소 크기에 있는 접을 수 있는 패널은 한 걸음 더 줄이면 접히고, 접힌 패널은 한 걸음에 최소 크기로 열립니다.
- 처리한 키는 페이지를 스크롤하지 않습니다. 다른 축의 방향키, `Ctrl` `Alt` 를 함께 누른 방향키는 브라우저에 남깁니다.

## 레이아웃 저장

```tsx
// app/page.tsx (Next.js App Router)
import { cookies } from 'next/headers';

export default async function Page() {
  const saved = (await cookies()).get('ide-layout')?.value;
  return <Workspace layout={saved ? JSON.parse(decodeURIComponent(saved)) : undefined} />;
}

// workspace.tsx
'use client';

export function Workspace({ layout }: { layout?: number[] }) {
  return (
    <Splitter
      defaultValue={layout ?? [25, 75]}
      onValueCommit={(next) => {
        document.cookie = `ide-layout=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=31536000`;
      }}
    >
      ...
    </Splitter>
  );
}
```

- 서버가 쿠키를 읽어 `defaultValue` 로 넘기므로 첫 HTML 부터 저장한 크기로 그려집니다.
- `localStorage` 는 브라우저에서만 읽혀서 첫 화면을 그린 뒤에 복원됩니다. 그 사이 레이아웃이 한 번 움직입니다.
- `onValueCommit` 은 함수라 Server Component 가 넘길 수 없습니다. 저장하는 쪽은 `'use client'` 컴포넌트입니다.
- IDS 는 저장소를 두지 않습니다.

## 파트

```tsx
<Splitter>
  <Splitter.Panel asChild defaultSize={25}>
    <aside aria-label="파일">...</aside>    {/* 패널을 다른 요소로 */}
  </Splitter.Panel>
  <Splitter.Handle aria-label="파일 목록 너비" />
  <Splitter.Panel asChild>
    <main>...</main>
  </Splitter.Panel>
</Splitter>

<Splitter.Handle className="w-1 bg-(--ids-color-muted)" />   {/* 모양은 className 으로 */}

<Splitter.Handle asChild>
  <hr />                                                    {/* 자식 요소 하나가 핸들이 된다 */}
</Splitter.Handle>
```

- 모양을 바꾸는 클래스는 `Splitter.Handle` 의 `className` 에 줍니다. `asChild` 자식의 클래스는 기본 클래스와 겹치면 집니다.
- `Splitter.Handle` 은 두 패널 사이에 하나만 둡니다. 처음이나 끝, 같은 사이의 두 번째 핸들은 그리지 않고 개발 빌드에서 경고합니다.
- 패널과 핸들은 `Splitter` 의 바로 아래 자식입니다. Fragment 는 괜찮지만 다른 컴포넌트로 감싸면 찾지 못하고 오류가 납니다.
- 패널이 하나뿐이면 개발 빌드에서 경고합니다.

## 중첩

```tsx
<Splitter>
  <Splitter.Panel defaultSize={25}>파일</Splitter.Panel>
  <Splitter.Panel>
    <Splitter orientation="vertical">
      <Splitter.Panel>편집기</Splitter.Panel>
      <Splitter.Panel>터미널</Splitter.Panel>
    </Splitter>
  </Splitter.Panel>
</Splitter>
```

- 안쪽 Splitter 가 패널을 채웁니다. Splitter 마다 자기 축만 움직입니다.
- 두 핸들이 만나는 자리를 잡아 두 방향으로 한 번에 끄는 기능은 없습니다.

## 이름과 값

- 핸들은 `role="separator"` 이고 Tab 에 멈춥니다. `aria-orientation` 은 선의 방향이라 옆으로 놓인 패널 사이는 `vertical` 입니다.
- `aria-valuenow` 는 앞 패널의 퍼센트, `aria-valuemin` `aria-valuemax` 는 다른 패널의 한계까지 셈한 범위입니다. 접을 수 있는 패널의 최솟값은 접힌 크기입니다.
- `aria-valuetext` 는 "30%", 접혔으면 "접힘" 입니다.
- `aria-controls` 는 앞 패널 하나를 가리킵니다(APG Window Splitter).
- 이름은 기본 "패널 크기 조절" 입니다. 무엇을 나누는지 `aria-label` 로 알려 줍니다.

## 상태와 스타일

| 속성                   | 붙는 곳              | 뜻                        |
| ---------------------- | -------------------- | ------------------------- |
| `data-orientation`     | 루트, 패널, 핸들     | `horizontal` / `vertical` |
| `data-dragging`        | 루트, 패널, 끄는 핸들 | 끄는 중                   |
| `data-collapsed`       | 패널                 | 접힘                      |
| `data-splitter`        | 루트                 | 선택자                    |
| `data-splitter-panel`  | 패널                 | 선택자                    |
| `data-splitter-handle` | 핸들                 | 선택자                    |
| `data-splitter-toggle` | 접기 버튼            | 선택자                    |

- 선은 `--ids-color-border`, 올리면 `--ids-color-handle-hover`, 끄는 동안 `--ids-color-handle-active` 입니다.
- 루트는 부모를 채웁니다(`size-full`). 가로 분할은 부모에 높이가 있어야 합니다.
- 패널은 `overflow: hidden` 입니다. 넘치는 내용은 패널 안에 `ScrollArea` 를 둡니다.
- 끄는 동안 패널이 포인터를 받지 않아서 iframe 위를 지나도 끌기가 끊기지 않습니다.

## 속성

| 속성                      | 기본 / 동작                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `orientation`             | `horizontal`(기본) / `vertical`                                       |
| `defaultValue`            | 패널마다 퍼센트. 없으면 패널의 `defaultSize`, 그것도 없으면 똑같이   |
| `value` / `onValueChange` | 제어                                                                  |
| `onValueCommit`           | 끌기, 키, 접기 버튼, 두 번 누르기가 끝날 때 한 번                     |
| `ref` / `id`              | 루트                                                                  |
| 그 외 속성                | 루트 div 로 간다                                                      |

| `Splitter.Panel`          | 기본 / 동작                  |
| ------------------------- | ---------------------------- |
| `defaultSize`             | 퍼센트                       |
| `minSize` / `maxSize`     | 퍼센트. `0` / `100`          |
| `collapsible`             | `false`                      |
| `collapsedSize`           | `0`                          |
| `asChild`                 | 자식 요소 하나를 패널로 쓴다 |

| `Splitter.Handle` | 기본 / 동작                  |
| ----------------- | ---------------------------- |
| `aria-label`      | "패널 크기 조절"             |
| `asChild`         | 자식 요소 하나를 핸들로 쓴다 |

## 알아둘 것

- 크기와 한계는 퍼센트만 받습니다. px 로 적는 최소 크기는 없습니다.
- 끌기는 핸들 요소에서만 시작합니다. 핸들 위에 떠 있는 Menu 나 Select 목록을 눌러도 크기가 바뀌지 않습니다.
