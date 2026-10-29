# Cover

Storybook 맨 앞의 표지입니다. IDS 로고 둘레에 실제 IDS 컴포넌트 카드를 빽빽하게 깔고, 곡선을 따라 라이트와 다크를 반씩 보여 줍니다.

- **그림이 아니라 렌더.** 카드는 모두 IDS 컴포넌트를 그대로 그린 것입니다. 컴포넌트가 바뀌면 표지도 바뀝니다.
- **카드마다 다른 테마.** 카드를 `IdsProvider color` 로 하나씩 감싸 17가지 색을 한 화면에 씁니다. Storybook 툴바의 색은 따르지 않습니다.
- **한 장면을 두 번.** 같은 장면을 `dark` 와 `light` 로 한 번씩 그리고, 위에 놓인 라이트 장면을 `clip-path: circle(71% at 0 0)` 로 잘라 곡선을 만듭니다. 반지름이 대각선의 절반이라 곡선이 늘 화면 가운데를 지납니다.
- **보기 전용.** 두 장면은 `inert` 와 `aria-hidden` 이라 누를 수도, 스크린 리더가 읽을 수도 없습니다. 읽히는 것은 숨은 제목(`IDS, GIST Infoteam Design System`) 하나입니다.

## 구조

```tsx
<section className="relative h-dvh">
  <h1 className="sr-only">IDS, GIST Infoteam Design System</h1>
  <IdsProvider mode="dark" inert aria-hidden className="absolute inset-0">
    <div className="absolute inset-0 flex items-center justify-center gap-4">
      <div className="flex w-[300px] shrink-0 flex-col gap-4 -translate-y-24">...</div>
      <div className="grid h-full w-[840px] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex items-end">...</div>
        <div>테마 카드, IDS, 코드 카드, 검색창</div>
        <div className="flex items-start">...</div>
      </div>
      <div className="flex w-[320px] shrink-0 flex-col gap-4 translate-y-8">...</div>
    </div>
  </IdsProvider>
  <IdsProvider mode="light" className="[clip-path:circle(71%_at_0_0)]">...</IdsProvider>
</section>
```

- `parameters: { canvasPadding: false }` 로 데코레이터의 `p-8` 을 빼고, `h-dvh` 로 화면을 채웁니다.
- 가운데 열은 세 칸 격자입니다. 위 칸의 카드는 아래로, 아래 칸의 카드는 위로 붙어 로고 줄에 닿고, 넘치는 쪽은 화면 밖으로 잘립니다. `minmax(0, 1fr)` 이라 칸이 카드 높이만큼 늘지 않고, 로고 줄이 늘 화면 세로 가운데에 옵니다.
- 좌우에 열을 세 개씩 둡니다. 열은 세로 가운데에 놓고 `translate-y` 로 조금씩 어긋나게 해 벽돌처럼 보이게 합니다.
- 열 높이는 옆 열이 약 1,900px, 가운데 위아래 칸이 각각 700px 이상입니다. 2560×1440 화면까지 빈 곳 없이 채웁니다.
- 다크 장면은 바탕을 `surface`, 카드를 `muted` 로 바꿔 카드가 바탕 위로 떠 보이게 합니다(`dark:` 변형).

## 알아둘 것

- 로고는 `font-[system-ui]` 입니다. 기본 글꼴 Pretendard GOV 는 대문자 I 에 세리프가 붙습니다.
- 로고는 `bg-clip-text` 로 칠합니다. 음수 자간이 글자 상자를 S 의 끝보다 좁게 만들어 S 가 잘리므로, `pe-[0.1em]` 으로 칠할 영역을 넓히고 `-me-[0.1em]` 으로 자리는 그대로 둡니다.
- 새 카드는 실제 IDS 컴포넌트로만 만듭니다. 팝업, 메뉴, 툴팁처럼 top layer 에 뜨는 것은 열린 채로 두지 않습니다.
- 로그인과 회원가입 칸에는 `data-1p-ignore` 와 `data-lpignore="true"` 를 붙입니다. 붙이지 않으면 비밀번호 관리자가 표지 위에 입력 제안을 띄웁니다.
- 스토리 검사(`tests/stories-overview.test.tsx`)가 라이트와 다크에서 axe 를 돌리고, hydration, SSR, 번역 검사도 다른 스토리처럼 이 표지를 그립니다.
