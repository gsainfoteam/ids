# Questionnaire

AI 가 사용자에게 고를 거리를 내미는 질문지입니다. 질문 여러 개를 한 번에 하나씩 묻고, 끝나면 답을 모아 `onComplete` 로 넘깁니다. 채팅 시작 화면의 추천 질문도 한 단계짜리 Questionnaire 로 그립니다.

- **IDS 부품으로 짓습니다.** 루트는 `<form>`, 질문은 `RadioGroup` 이나 `CheckboxGroup`(`<fieldset>` + `<legend>`), 보기는 `Item` 카드 안의 `Radio` 나 `Checkbox`(`appearance="toggle"` 이면 `ToggleGroup` 의 `Toggle`), 직접 입력은 `TextField`, 진행은 `Progress`, 이동 버튼은 `ButtonGroup` 과 `Button` 입니다.
- **한 번에 한 질문.** 모든 질문이 그려지고, 지금 질문 말고는 `hidden` 입니다. 서버 HTML 에도 질문이 다 들어 있고, 숨은 질문의 답도 FormData 에 남습니다.
- **필수와 건너뛰기.** 질문은 기본으로 필수라 답하기 전에는 다음 버튼이 꺼져 있습니다. `optional` 이면 건너뛰기 버튼이 붙습니다.
- **포커스가 따라갑니다.** 다음이나 이전으로 넘어가면 새 질문의 고른 보기, 없으면 첫 보기로 포커스가 갑니다.

```tsx
import { Questionnaire } from '@gsainfoteam/ids-react';

<Questionnaire onComplete={(answers) => send(answers)}>
  <Questionnaire.Question name="tone">
    어떤 말투로 쓸까요?
    <Questionnaire.Option value="formal">격식</Questionnaire.Option>
    <Questionnaire.Option value="casual">편하게</Questionnaire.Option>
    <Questionnaire.Other />
  </Questionnaire.Question>
  <Questionnaire.Question name="topics" selectionMode="multiple" optional>
    무엇을 넣을까요?
    <Questionnaire.Option value="summary">요약</Questionnaire.Option>
    <Questionnaire.Option value="todo">할 일</Questionnaire.Option>
  </Questionnaire.Question>
</Questionnaire>;
```

## 질문

```tsx
<Questionnaire.Question name="size">
  부스는 몇 칸을 쓸까요? {/* 첫 Option 앞 = <legend> */}
  <Questionnaire.Description>한 칸은 3미터예요.</Questionnaire.Description> {/* aria-describedby */}
  <Questionnaire.Option value="one" description="굿즈 판매만 해요">
    한 칸
  </Questionnaire.Option>
  <Questionnaire.Option value="two" disabled>
    두 칸
  </Questionnaire.Option>
</Questionnaire.Question>
```

- 첫 `Option`, `Other`, `Description` 앞에 쓴 내용이 질문 문장이 되어 `<legend>` 로 그려지고, 그룹의 이름이 됩니다.
- `selectionMode="single"`(기본)은 `RadioGroup`, `"multiple"` 은 `CheckboxGroup` 입니다.
- `Questionnaire.Question` 은 `Questionnaire` 의 바로 아래(또는 Fragment, 배열 안)에 둡니다. 루트가 자식을 읽어 질문 수와 순서를 정합니다.
- `orientation="horizontal"` 이면 보기가 가로로 줄을 바꿔 가며 놓입니다.

## 보기

- `value` 가 답이 되고, `children` 이 제목, `description` 이 둘째 줄입니다. `children` 이 없으면 `value` 를 보입니다.
- 보기 카드 전체가 `<label>` 이라 어디를 눌러도 고릅니다.
- 라디오나 체크박스는 카드 앞쪽, 제목 첫 줄 높이에 놓입니다. 고른 카드는 테두리가 primary 가 되고 바탕이 옅게 깔립니다.
- 보기 카드와 직접 입력은 높이와 radius(`standard`)가 같습니다. `description` 이 있는 카드만 두 줄만큼 높아집니다.
- 보기 카드는 컨테이너가 아니라 입력과 같은 컨트롤로 그립니다. 바탕과 테두리는 직접 입력과 같은 `internal/surfaces/field-surface` 의 `outline` 이고, 모서리는 `concentric-p-*` 대신 입력처럼 `rounded-standard` 와 가로 여백입니다. 카드 모서리에 10px 컨트롤이 없어 concentric 이 키운 radius 는 직접 입력과 어긋납니다.
- 고른 카드는 `bg-neutral-soft` 에 primary 테두리입니다. hover 와 누름은 다른 컨트롤처럼 state layer(`state-hover`, `state-press`)를 바탕 위에 얹고, 비활성 카드에는 얹지 않습니다.

## 모양

```tsx
<Questionnaire.Question
  name="goods"
  selectionMode="multiple"
  appearance="toggle"
  orientation="horizontal"
>
  어떤 굿즈를 팔까요?
  <Questionnaire.Option value="sticker">스티커</Questionnaire.Option>
  <Questionnaire.Option value="keyring">키링</Questionnaire.Option>
</Questionnaire.Question>
```

| `appearance`  | 보기                                                              |
| ------------- | ----------------------------------------------------------------- |
| `card` (기본) | `Item` 카드 안의 `Radio` / `Checkbox`. `description` 을 보인다    |
| `toggle`      | `ToggleGroup` 안의 `Toggle`. 라디오도 체크박스도 없고 글자 폭만큼 |

- `toggle` 은 짧은 답을 한 줄에 늘어놓을 때 씁니다. `description` 은 그리지 않습니다.
- `Other` 는 두 모양 모두 보기 아래 한 줄을 차지합니다.

## 직접 입력

```tsx
<Questionnaire.Other placeholder="예: 반말로 짧게" />
```

- 보기에 없는 답을 적는 `TextField` 입니다. 이름은 `직접 입력`, placeholder 는 `다른 답을 적어 주세요` 이고 둘 다 바꿀 수 있습니다.
- 하나만 고르는 질문에서는 적기 시작하면 고른 보기가 풀리고, 보기를 고르면 적은 글이 지워집니다.
- 여럿 고르는 질문에서는 고른 보기 뒤에 적은 글이 붙습니다(`['sticker', '엽서']`).
- 글이 있을 때만 질문의 `name` 으로 FormData 에 들어갑니다.

## 답

```tsx
<Questionnaire
  defaultValue={{ tone: 'casual', topics: ['summary', '회의 일정'] }} // 보기에 없는 값은 Other 로 간다
  onComplete={(answers) => {}} // { tone: 'casual', topics: [...] }
/>
```

- 하나만 고르는 질문의 답은 `string`, 여럿 고르는 질문은 `string[]` 입니다.
- 건너뛰거나 답하지 않은 optional 질문은 `answers` 에 없습니다.
- `onComplete` 는 마지막 질문에서 보낼 때 한 번 불립니다. 그 뒤 `onSubmit` 이 불리고, `action` 이 없으면 페이지가 다시 읽히지 않게 막습니다.
- form 의 reset 은 답을 `defaultValue` 로 되돌리고 첫 질문으로 갑니다. `onComplete` 는 불리지 않습니다.

## 진행과 이동

| 부분     | 보일 때                                                                    |
| -------- | -------------------------------------------------------------------------- |
| Progress | 질문이 둘 이상. 맨 위에 작은 글자 `질문 1 / 3` 과 짧은 막대. `aria-valuetext` 도 같다 |
| 이전     | 첫 질문이 아닐 때                                                          |
| 건너뛰기 | 지금 질문이 `optional`                                                     |
| 다음     | 마지막 질문이 아닐 때. 답하지 않은 필수 질문에서는 꺼진다(포커스는 받는다) |
| 보내기   | 마지막 질문. 글자는 `submitLabel` 로 바꾼다                                |

- 다음과 보내기는 같은 submit 버튼입니다. 질문 안에서 form 이 제출되면 마지막이 아닐 때는 다음 질문으로 넘어갑니다.
- 이동 버튼은 `ButtonGroup attached={false}` 로 묶여 `aria-label="질문 이동"` 이 붙습니다.

## 고르면 바로 넘어가기

```tsx
<Questionnaire advanceOnSelect size="tiny" onComplete={({ prompt }) => send(prompt)}>
  <Questionnaire.Question name="prompt" appearance="toggle" orientation="horizontal">
    이런 걸 물어볼 수 있어요
    <Questionnaire.Option value="오늘 학식 메뉴 알려 줘">오늘 학식</Questionnaire.Option>
    <Questionnaire.Option value="다음 셔틀은 언제 와?">셔틀 시간표</Questionnaire.Option>
  </Questionnaire.Question>
</Questionnaire>
```

- `advanceOnSelect` 면 하나만 고르는 질문은 보기를 누르는 순간 다음 질문으로 가고, 마지막 질문이면 바로 `onComplete` 가 불립니다.
- 이런 질문에는 다음 버튼이 없습니다. `Other` 가 있는 질문과 여럿 고르는 질문은 다음 버튼을 그대로 둡니다.
- 화살표 키와 `Home` `End` 로 옮겨 다니는 동안은 넘어가지 않습니다. `Space` 나 `Enter` 로 고르면 넘어갑니다.
- `toggle` 모양에서 이미 고른 보기를 다시 누르면 풀리지 않고 그 답으로 넘어갑니다.
- 채팅 시작 화면의 추천 질문은 이렇게 질문 하나짜리 `toggle` Questionnaire 입니다. 라디오도, 진행 막대도, 버튼도 없습니다.

## 키보드

| 키              | 동작                                                  |
| --------------- | ----------------------------------------------------- |
| `Tab`           | 보기, 직접 입력, 이동 버튼 사이를 옮긴다              |
| `↑` `↓` `←` `→` | 라디오를 옮기면서 고른다                              |
| `Space`         | 라디오를 고르고, 체크박스와 토글을 켜고 끈다          |
| `Enter`         | 보기나 직접 입력에서 다음 질문으로, 마지막이면 보낸다 |

- 답하지 않은 필수 질문에서 `Enter` 는 아무것도 하지 않습니다.
- `toggle` 모양에서는 `ToggleGroup` 의 키를 따릅니다. 화살표가 하나만 고르는 질문에서는 옮기면서 고르고, 여럿 고르는 질문에서는 포커스만 옮깁니다. `Enter` 는 토글을 누릅니다.
- 질문 루트에 준 `onKeyDown` 이 먼저 불리고, `preventDefault()` 하면 `Enter` 를 Questionnaire 가 처리하지 않습니다.

## 크기

```tsx
<Questionnaire size="tiny" /> // 보기, 직접 입력, 버튼, 진행 막대가 tiny. 질문 문장도 한 단계 작다
```

- 보기 카드의 가로 여백은 `standard` 12px, `tiny` 10px 로 직접 입력과 같아, 라디오와 입력 글자의 시작이 맞습니다.
- 이동 버튼은 크기와 상관없이 `tiny` 입니다. 보기보다 눈에 띄지 않게 둡니다.

## 속성

| 속성                     | 기본 / 동작                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `defaultValue`           | `Record<string, string \| string[]>`, 기본 `{}`                         |
| `onComplete`             | 마지막 질문에서 보낼 때 답을 받는다                                     |
| `advanceOnSelect`        | `false`. 하나만 고르는 질문을 고르면 바로 넘어간다                      |
| `submitLabel`            | 마지막 버튼 글자. 기본 `보내기`                                         |
| `size`                   | `standard`(기본) / `tiny`                                               |
| 그 외 속성               | `<form>` 으로 간다 (`id`, `aria-label`, `className` 등)                 |
| Question `name`          | 답의 키이자 FormData 이름                                               |
| Question `selectionMode` | `single`(기본) / `multiple`                                             |
| Question `optional`      | `false`. 켜면 건너뛰기 버튼                                             |
| Question `orientation`   | `vertical`(기본) / `horizontal`                                         |
| Question `appearance`    | `card`(기본) / `toggle`                                                 |
| Option `value`           | 답이 되는 값                                                            |
| Option `description`     | 보기 둘째 줄                                                            |
| Option `disabled`        | 그 보기만 끈다                                                          |
| Other                    | `TextField` 의 속성. `value`, `name`, `size` 는 Questionnaire 가 정한다 |

## 상태 속성

| 속성                                         | 붙는 곳                         |
| -------------------------------------------- | ------------------------------- |
| `data-questionnaire`, `data-step`            | `<form>`. `data-step` 은 0부터  |
| `data-questionnaire-question`, `data-active` | 질문 `<fieldset>`               |
| `data-questionnaire-option`                  | 보기 `<label>`, 토글 `<button>` |

## 알아둘 것

- 엔진은 IDS 의 것입니다. `@shadcn/react` 의 questionnaire 는 MIT 이고 의존성이 없지만, 보기 `<input>` 을 자기가 그리고 체크 상태도 따로 들고 있어서 `Radio` 와 `Checkbox` 를 쓰면 상태가 두 군데에 생깁니다. 질문 순서, 다음 버튼, 건너뛰기, Enter 로 넘어가기, 숨은 질문을 그려 두는 방식은 그 동작을 따랐습니다.
- 같은 Questionnaire 안에서 질문 `name` 이 겹치면 안 됩니다.
- `onComplete` 뒤에 Questionnaire 를 그대로 둘지, 답 요약으로 바꿀지는 앱이 정합니다(Blocks 의 Agent Ask).
