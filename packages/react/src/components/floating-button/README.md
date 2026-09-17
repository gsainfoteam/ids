# FloatingButton

화면의 주 행동을 고정 위치에 표시합니다. `ThemeProvider` 아래에서 사용합니다.

```tsx
<FloatingButton aria-label="새 글 작성" onClick={openComposer}><PlusIcon /></FloatingButton>
<FloatingButton placement="bottom-left"><PlusIcon />새 글 작성</FloatingButton>
<FloatingButton asChild><a href="/compose"><PlusIcon />새 글 작성</a></FloatingButton>
```

- `placement`: `top-left / top-right / bottom-left / bottom-right`(기본).
- `variant`: `solid`(기본), `surface`. `tone`: `default / weak / contrast`.
- `size`: `standard`(56px), `tiny`(44px). 아이콘만 있으면 원형, 텍스트가 있으면 확장형입니다.
- `iconOnly`: 자동 판별할 수 없는 커스텀 자식의 형태를 명시합니다.
- `disabled`: native 버튼 비활성화. `asChild` 링크는 href와 탭 정지점을 제거하고 양쪽 클릭·활성화 키 이벤트를 차단합니다.
- `ref`: 렌더링한 실제 button 또는 a. `asChild`의 자식도 props/ref를 해당 요소로 전달해야 합니다.
- 기본 `type="button"`. render props 및 `onInteractionChange`는 Button과 같은 계약입니다.

아이콘만 사용하는 경우 `aria-label`을 지정하세요. 명시된 아이콘의 `title` 또는 `aria-label`도 사용할 수 있습니다. 아이콘 컴포넌트 이름으로 행동 의미를 추정하지 않습니다. 이름 없는 아이콘 버튼과 같은 위치의 복수 버튼은 개발 모드에서 경고합니다.

viewport 기준 fixed 위치이며 가장자리 24px에 기기의 safe-area 여백을 더합니다. CSS transform이 있는 조상 내부에서는 그 조상이 fixed 기준이 되므로 앱 최상위에 배치하세요. z-index는 40이며 모달보다 아래에 배치하도록 앱의 레이어 체계를 맞추세요. 스크롤 숨김·로딩·비동기 작업은 앱에서 제어합니다.

```tsx
<FloatingButton disabled={pending} aria-label={pending ? '저장 중' : '저장'}>
  {pending ? <Spinner decorative /> : <CheckIcon />}
</FloatingButton>
```

포인터 누름 피드백과 그림자 변화는 150ms, 키보드 포커스는 즉시 표시합니다. reduced-motion에서는 전환·축소를 제거합니다.
