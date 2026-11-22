# Typography

글자 스타일은 컴포넌트가 아니라 `@gsainfoteam/ids-css` 가 Tailwind `@theme` 으로 내보내는 텍스트 유틸리티입니다. import 없이 className으로 씁니다.

- **한 클래스에 한 스타일.** 크기, 굵기, 행간, 자간이 한 클래스에 묶여 있어 섞어 쓸 일이 없습니다.
- **글자색은 따로.** 색은 `text-neutral-strong` 같은 색 토큰으로 지정합니다.

```tsx
<h1 className="text-headline-h3-bold">공지사항</h1>
<p className="text-body-b2-regular text-neutral-strong">본문입니다.</p>
<span className="text-caption-c1-medium text-neutral">2026-09-10</span>
```

## 스케일

클래스 이름은 `text-{역할}-{단계}-{굵기}` 입니다.

| 역할       | 단계 (px)                                | 굵기                            | 행간 (px)                                  | 자간                             |
| ---------- | ---------------------------------------- | ------------------------------- | ------------------------------------------ | -------------------------------- |
| `headline` | h1 48, h2 40, h3 32, h4 28, h5 24, h6 20 | bold, semibold, medium          | h1 56, h2 48, h3 40, h4 36, h5 32, h6 28   | h1·h2 -2.5%, h3·h4 -1.5%, h5·h6 0 |
| `body`     | b1 18, b2 16, b3 14                      | bold, semibold, medium, regular | b1 28, b2 24, b3 20                        | 0                                |
| `caption`  | c1 12, c2 10                             | semibold, medium, regular       | c1 16, c2 14                               | 0                                |

- 행간은 배율이 아니라 정수 px 값이고, c2(14px)를 빼면 4px 격자에 맞습니다. 한 줄 높이가 늘 정수 px 이라 컨트롤과 목록의 높이가 반 픽셀로 어긋나지 않습니다.
- 행간은 `IdsProvider` 의 `scale` 을 따라 글자 크기와 함께 커집니다.
- 자간은 큰 글자일수록 좁힙니다. 24px 이하는 0 입니다.
- 컨트롤 안의 글자(버튼 라벨, 필드 값)는 `text-body-b3-*`, 작은 크기에서는 `text-caption-c1-*` 입니다. 버튼 전용 스타일은 따로 두지 않습니다.
- 카드, 목록, 대화상자의 소제목은 `text-body-b1-semibold`, `text-body-b2-semibold` 입니다. body 와 크기가 같은 subtitle 스타일은 따로 두지 않습니다.

## 긴 글

문서처럼 여러 문단을 읽는 글은 `leading-prose`(28px)를 b2 본문에 더합니다. Editor 의 본문이 이 조합입니다.

```tsx
<article className="text-neutral-strong">
  <h1 className="text-headline-h5-semibold">2학기 수강 신청 안내</h1>
  <p className="text-body-b2-regular leading-prose">수강 신청은 9월 1일에 열립니다.</p>
</article>
```

- `leading-prose` 는 글자 스타일 뒤에 씁니다. `cn` 은 크기 클래스 앞에 놓인 `leading-*` 를 지웁니다.
- 문서 제목은 페이지 제목보다 한 단계 작고 semibold 입니다: h1 `text-headline-h5-semibold`(24px), h2 `text-headline-h6-semibold`(20px), h3 `text-body-b1-semibold`(18px), h4 `text-body-b2-semibold`(16px).

## 글꼴

- 본문은 Pretendard GOV Variable(`font-sans`, 기본), 코드와 값은 Geist Mono(`font-mono`)입니다.
- `font-mono` 는 x-height 를 본문과 같게 맞춥니다. 고정폭 글자가 본문 줄에서 튀지 않으니 따로 줄이지 않습니다.
- 코드 안의 한글은 Pretendard 로 그립니다.

```tsx
<p className="text-body-b2-regular">
  <code className="font-mono">maxRetries</code> 를 3으로 둡니다.
</p>
```

## 알아둘 것

- headline에 regular, caption에 bold는 없습니다. 없는 조합은 적용되지 않으니 표 안에서 고릅니다.
- 크기를 조금 바꾸려고 `text-[17px]` 같은 값을 섞지 않습니다. 표의 단계에서 고릅니다.
- Storybook `Foundations/Typography` 의 수치는 렌더된 글자에서 재므로 토큰과 어긋나지 않습니다.
- Scales 스토리는 `semantic/typography.json` 의 스타일이 모두 그려졌는지 검사합니다. 스타일을 더하면 스토리의 표에도 클래스를 더합니다. Tailwind 는 소스에 글자 그대로 적힌 클래스만 만듭니다.
- Scales 스토리는 모든 스타일의 행간이 정수 px 인지도 검사합니다.
- Prose 스토리는 긴 글의 본문과 문서 제목을 보여 줍니다.
- Primitives 스토리는 `typography.json` 의 크기, 굵기, 행간, 자간, 글꼴 원시값을 `--ids-*` 변수에서 읽어 보여 줍니다. 행간 원시값은 크기 단계와 이름이 같습니다(`leading-b3` 는 20px).
