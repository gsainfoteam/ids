# Typography

글자 스타일은 컴포넌트가 아니라 `@gsainfoteam/ids-css` 가 Tailwind `@theme` 으로 내보내는 텍스트 유틸리티입니다. import 없이 className으로 씁니다.

- **한 클래스에 한 스타일.** 크기, 굵기, 행간, 자간이 한 클래스에 묶여 있어 섞어 쓸 일이 없습니다.
- **글자색은 따로.** 색은 `text-(--ids-color-on-surface)` 같은 색 토큰으로 지정합니다.

```tsx
<h1 className="text-headline-h3-bold">공지사항</h1>
<p className="text-body-b2-regular text-(--ids-color-on-surface)">본문입니다.</p>
<span className="text-caption-c1-medium text-(--ids-color-on-muted)">2026-09-10</span>
```

## 스케일

클래스 이름은 `text-{역할}-{단계}-{굵기}` 입니다.

| 역할       | 단계 (px)                                | 굵기                            | 행간                         | 자간  |
| ---------- | ---------------------------------------- | ------------------------------- | ---------------------------- | ----- |
| `headline` | h1 48, h2 40, h3 32, h4 28, h5 24, h6 20 | bold, semibold, medium          | 1.2                          | -2.5% |
| `subtitle` | s1 18, s2 16                             | bold, semibold, medium          | 1.35                         | 0     |
| `body`     | b1 18, b2 16, b3 14                      | bold, semibold, medium, regular | b1 1.333, b2 1.375, b3 1.429 | 0     |
| `caption`  | c1 12, c2 10                             | semibold, medium, regular       | 1.35                         | 0     |
| `button`   | standard 14, tiny 12                     | medium (이름에 없음)            | 1                            | 0     |

- 작은 body일수록 행간이 넓어 읽기 편합니다.
- `text-button-*` 은 행간이 1이라 컨트롤 안에서 세로 가운데에 맞습니다. Button이 이미 쓰므로 직접 붙일 일은 드뭅니다.
- 컨트롤 안의 글자(필드 값, 라벨)는 `text-body-b3-*`, 작은 크기에서는 `text-caption-c1-*` 입니다.

## 글꼴

- 본문은 Pretendard GOV Variable(`font-sans`, 기본), 코드와 값은 Monaspace Neon(`font-mono`)입니다.
- `font-mono` 는 같은 텍스트 스타일 안에서 x-height 를 95% 로 맞춥니다. 폭이 넓은 고정폭 글자가 본문 줄에서 튀지 않으니 따로 줄이지 않습니다.

```tsx
<p className="text-body-b2-regular">
  <code className="font-mono">maxRetries</code> 를 3으로 둡니다.
</p>
```

## 알아둘 것

- headline에 regular, caption에 bold는 없습니다. 없는 조합은 적용되지 않으니 표 안에서 고릅니다.
- 크기를 조금 바꾸려고 `text-[17px]` 같은 값을 섞지 않습니다. 표의 단계에서 고릅니다.
- Storybook `Foundations/Typography` 의 수치는 렌더된 글자에서 재므로 토큰과 어긋나지 않습니다.
