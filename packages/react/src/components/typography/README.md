# Typography

컴포넌트가 아니라 `@gsainfoteam/ids-css`가 Tailwind `@theme`으로 내보내는 텍스트
유틸리티다. 별도 import 없이 className으로 쓴다.

```tsx
<h1 className="text-headline-h3-bold">공지사항</h1>
<p className="text-body-b2-regular text-(--ids-color-on-surface)">본문입니다.</p>
<span className="text-caption-c1-medium text-(--ids-color-on-muted)">2026-09-10</span>
```

클래스 이름은 `text-{역할}-{단계}-{굵기}` 꼴이고, 크기와 자간과 행간이 한 클래스에 함께
들어 있다. 굵기 축은 역할마다 다르다.

| 역할       | 단계 (px)                                | 굵기                            |
| ---------- | ---------------------------------------- | ------------------------------- |
| `headline` | h1 48, h2 40, h3 32, h4 28, h5 24, h6 20 | bold, semibold, medium          |
| `subtitle` | s1 18, s2 16                             | bold, semibold, medium          |
| `body`     | b1 18, b2 16, b3 14                      | bold, semibold, medium, regular |
| `caption`  | c1 12, c2 10                             | semibold, medium, regular       |
| `button`   | standard 18, tiny 12                     | 없음                            |

headline은 자간 -1%에 행간 1.2로 촘촘하고, subtitle과 caption은 자간 0에 행간 1.35다.
body는 크기가 작아질수록 행간이 넓어져 b1 1.333, b2 1.375, b3 1.429다. `text-button-*`은
행간이 1이라 control 안에서 세로 중앙에 맞으며 Button과 IconButton이 이미 쓰고 있으므로
직접 붙일 일은 거의 없다.

headline에 regular가, caption에 bold가 없는 것은 의도된 것이다. 없는 조합을 쓰면 클래스가
적용되지 않으므로, 표에 있는 굵기 안에서 고른다.

글자색은 이 클래스에 들어 있지 않다. `text-(--ids-color-on-surface)`처럼 색 토큰으로 따로
지정하며, 토큰이 값을 가지려면 ThemeProvider 안이어야 한다. 크기를 조금 바꾸고 싶다는
이유로 임의의 `text-[17px]`를 섞지 않는다. 표의 단계 중에서 고른다.
