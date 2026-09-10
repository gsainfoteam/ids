# TextArea

Native `<textarea>`에 IDS 표면, 위·아래 도구 영역과 자동 높이를 제공합니다.
`ThemeProvider`, IDS CSS와 Tailwind 설정은 다른 IDS 입력과 같습니다.

```tsx
import { Field, TextArea } from '@gsainfoteam/ids-react';

<Field required size="standard">
  <Field.Label>자기소개</Field.Label>
  <TextArea
    autoResize
    minRows={2}
    maxRows={6}
    value={bio}
    onChange={(event) => setBio(event.target.value)}
  />
  <Field.Hint>간단히 소개해 주세요.</Field.Hint>
</Field>;
```

## 합성

```tsx
<TextArea
  autoResize
  minRows={2}
  maxRows={6}
  value={text}
  onChange={(event) => setText(event.target.value)}
>
  <div>{toolbar}</div>
  <TextArea.Input className="font-mono" />
  <output>{text.length}자</output>
</TextArea>;

<TextArea>
  <TextArea.Input asChild>
    <textarea spellCheck={false} />
  </TextArea.Input>
</TextArea>;
```

- 자식이 없으면 입력을 자동 생성합니다. 자식이 있으면 `TextArea.Input`을 정확히 하나 배치합니다.
- Input 앞/뒤의 형제가 top/bottom 영역입니다. Fragment는 펼치지만 임의의 DOM 또는 사용자 컴포넌트 내부를 탐색하지 않습니다.
- Input은 위치를 나타내는 선언입니다. TextArea 바깥에 단독으로 렌더하지 않습니다.
- `asChild`는 한 개의 textarea 또는 textarea에 props/ref를 전달하는 컴포넌트를 받습니다. 커스텀 컴포넌트도 실제 native textarea ref를 전달해야 합니다.
- 도구 영역의 버튼 비활성화는 소비 앱이 제어합니다. TextArea의 disabled는 native 입력을 비활성화합니다.

## Props와 전달 위치

| 속성                             | 기본값 / 동작                                                             |
| -------------------------------- | ------------------------------------------------------------------------- |
| `variant`                        | `outline`, `filled`, `unstyled`. unstyled도 키보드 포커스 표시 유지       |
| `size`                           | 명시 값 → Field 크기 → `standard`. `standard` / `tiny`                    |
| `autoResize`                     | false. true면 내용에 따라 높이 변경, resize는 none                        |
| `minRows`                        | 자동 높이의 최소 줄 수. 생략하면 native rows(기본 2)                      |
| `maxRows`                        | 자동 높이의 최대 줄 수. 생략하면 제한 없음                                |
| `resize`                         | `vertical`; `none`, `horizontal`, `both`도 native textarea에 적용         |
| `invalid`                        | standalone 오류 상태. 명시적인 `aria-invalid` 및 Field가 전달한 값이 우선 |
| `className`, `style`             | 바깥 표면 div. 실제 입력 스타일은 `TextArea.Input`에 지정                 |
| `id`, ARIA, name, 이벤트, ref 등 | 실제 textarea에 전달. ref 타입은 HTMLTextAreaElement                      |
| `TextArea.Input`                 | native textarea 속성 + `asChild`. children 대신 value/defaultValue 사용   |

`rows`는 일반 입력의 native 높이를 결정합니다. 자동 높이가 꺼져 있을 때 기본 최소 높이는
standard 80px / tiny 64px이며 더 큰 rows가 이를 늘립니다. 자동 높이를 켜면 줄 수 경계가 우선합니다.
명세의 sm/md/lg 대신 기존 공개 IdsSize와 타이포그래피 토큰을 유지합니다.
minRows/maxRows는 양의 정수이며, 둘 다 지정하면 minRows ≤ maxRows여야 합니다.
minRows 없이 maxRows만 지정하면 최소값도 그 상한 이하로 제한합니다.

Root의 native prop이 Input/asChild의 같은 속성보다 우선합니다. 이벤트와 ref는
asChild → Input → root 순으로 합성하며, 이벤트가 preventDefault되면 후속 핸들러는 실행하지 않습니다.
Field의 라벨·오류 상태는 Field에서 설정하고, name/value/onChange도 root에 두는 것을 권장합니다.

자동 높이는 입력·붙여넣기·IME, React commit, 컨테이너 너비 변경, 폰트 로드,
네이티브 form.reset 및 RHF reset 후 다시 계산합니다. 최대 높이에 도달하면 내부 스크롤을 사용합니다.
자동 높이가 활성화된 동안 입력의 height/minHeight/maxHeight/overflowY는 컴포넌트가 관리하고,
끄거나 unmount하면 기존 inline 값을 복원합니다. 정확한 줄 수를 위해 명시적인 line-height를 사용하세요.

렌더나 input 이벤트 없이 직접 `textarea.value = ...`만 바꾸는 외부 코드는 감지하지 않습니다.
이 경우 controlled value를 사용하거나 변경 후 native input 이벤트를 전달하세요. RHF의
렌더를 일으키지 않는 setValue도 동일하며, 외부 갱신이 잦으면 controlMode="value"를 사용하세요.

## React Hook Form / Zod

기본 export는 RHF에 의존하지 않습니다. 자동 등록에는 선택적 어댑터를 사용합니다.

```tsx
import { TextArea } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ description: z.string().trim().min(10, '10자 이상 작성하세요.') });
const methods = useForm({ resolver: zodResolver(schema), defaultValues: { description: '' } });

<FormProvider {...methods}>
  <form noValidate onSubmit={methods.handleSubmit(save)}>
    <Field name="description" required>
      <Field.Label>소개</Field.Label>
      <TextArea autoResize minRows={2} maxRows={5} />
      <Field.Hint>10자 이상</Field.Hint>
      <Field.Error />
    </Field>
    <button type="submit">제출</button>
    <button type="button" onClick={() => methods.reset()}>
      초기화
    </button>
  </form>
</FormProvider>;
```

Storybook의 Auto Resize와 Zod Form은 브라우저의 실제 높이, 오류 연결, 제출·초기화를 검증합니다.
