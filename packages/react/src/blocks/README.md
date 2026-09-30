# Blocks

IDS 컴포넌트만으로 짠 화면 조각입니다. 패키지에서 내보내지 않습니다. Storybook 의 `Blocks/<Category>/<Variant>` 에서 보고, Code 탭의 코드를 복사해 앱에 맞게 고칩니다.

- **같은 화면, 여러 구현.** 로그인 하나에도 카드형, 분할형, 최소형, QR 형처럼 구현을 여럿 둡니다. shadcn/ui 의 blocks 와 같은 방식입니다.
- **Mobile 과 PC.** 구현마다 `Mobile`(414×896)과 `PC`(1280×1024) 스토리가 있습니다. 같은 코드를 두 화면 크기로 띄웁니다.
- **IDS 디자인 그대로.** 색, 선, 배경, 모서리, 그림자는 모두 IDS 컴포넌트에서 옵니다. 블록이 쓰는 className 은 배치와 IDS 글자 크기뿐입니다.

| 카테고리                  | 구현                     |
| ------------------------- | ------------------------ |
| [Login](login/README.md)  | Card, Minimal, QR, Split |
| [SignUp](sign-up/README.md) | Card, Split, Steps       |

## 파일

```
login/
  card.stories.tsx          Blocks/Login/Card 의 PC. 코드는 여기에만 있다
  card.mobile.stories.tsx   같은 title 의 Mobile. PC 스토리를 펼친다
  README.md                 카테고리의 구현들
```

- `<구현>.stories.tsx` 는 `globals: { viewport: { value: 'desktop' } }` 로 뜨는 `PC` 스토리 하나입니다. 화면은 다른 스토리처럼 `render` 에 통째로 적습니다.
- `<구현>.mobile.stories.tsx` 는 PC 파일의 meta 와 스토리를 펼쳐(`{ ...pc.PC }`) `mobile2` 로 띄웁니다. 펼친 스토리는 Code 탭에 PC 파일의 코드를 그대로 보여 줍니다.
  - `title` 과 `tags` 는 펼치지 않고 글자 그대로 다시 적습니다. Storybook 은 둘을 파일에서 정적으로 읽습니다.
  - 파일 이름 순서라 사이드바에는 Mobile 이 PC 보다 먼저 나옵니다.
- 스토리는 `tags: ['!autodocs']` 와 `parameters: { controls: { disable: true }, canvasPadding: false }` 로 Docs 페이지 없이 캔버스를 채웁니다.

## 규칙

- **className 은 배치와 글자 크기만.**
  - 배치: `flex`, `grid`, 간격, 여백, 너비와 높이, 정렬, `hidden md:flex` 같은 폭별 표시.
  - 글자: 제목과 문단의 IDS 글자 크기(`text-headline-h3-bold`, `text-body-b2-regular`), `text-center`, `break-keep`.
  - 색, 테두리, 배경, 모서리, 그림자, `style` 은 쓰지 않습니다. 선은 `Divider`, 면은 `Card` 와 `Item`, 흐린 글자는 각 컴포넌트의 `Description` 파트가 그립니다.
  - IDS 컴포넌트가 문서로 받는 className 은 씁니다: `Card.Header` 와 `Card.Footer` 의 `border-b`, `border-t`.
- **ghost 는 쓰지 않습니다.** 버튼은 `solid`, `outline`, `soft` 입니다.
- **링크는 `Button asChild`.** 글 속 링크 컴포넌트가 아직 없어서, 링크는 `<a>` 를 감싼 `outline` 이나 `soft` 버튼입니다.
- **폭.** 414px 부터 짭니다. 가장 바깥 요소의 `break-keep` 으로 한국어가 낱말 단위로 줄을 바꿉니다.
- **데이터는 모듈 위 상수.** 날짜와 숫자를 고정해 서버와 클라이언트 렌더가 같습니다.
- **없는 것은 컴포넌트 요청.** IDS 에 없는 모양이 필요하면 블록에서 그리지 않고 컴포넌트로 요청합니다.
- **테스트.** `tests/stories-blocks.test.tsx` 가 모든 블록을 라이트와 다크에서 그리고 axe 를 돌립니다. SSR, hydration, 영어 번역 검사도 다른 스토리처럼 받습니다.
