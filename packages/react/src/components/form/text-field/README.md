# TextField

- 한 줄 입력과 그 앞뒤의 아이콘, 텍스트, 버튼을 담는 컨테이너
- sentinel `TextField.Input` 합성: Input 앞 자식은 leading, 뒤 자식은 trailing
- `outline` / `soft` / `ghost`, 크기는 `Field`를 따른다
- `Field`, react-hook-form과 연결된다

```tsx
import { Field, TextField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>이메일</Field.Label>
  <TextField type="email" placeholder="you@gm.gist.ac.kr" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>;
```

## 합성

```tsx
import { IconButton, TextField } from '@gsainfoteam/ids-react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

<TextField aria-label="검색" value={query} onChange={(e) => setQuery(e.target.value)}>
  <MagnifyingGlassIcon />             {/* Input 앞 = leading */}
  <TextField.Input />
  {/* Input 뒤 = trailing. 조건부로 사라지면 감싼 span까지 접혀 gap이 남지 않는다 */}
  {query !== '' && (
    <IconButton aria-label="지우기" icon={<XMarkIcon />} onClick={() => setQuery('')} />
  )}
</TextField>

<TextField aria-label="금액" defaultValue="0.00">
  <span>$</span>                      {/* Input을 생략하면 자식 뒤에 자동으로 들어간다 */}
</TextField>

<TextField aria-label="금액">
  <>
    <span>$</span>
    <TextField.Input />               {/* Fragment 안의 Input도 찾는다. 다른 컴포넌트 안은 찾지 않는다 */}
    <span>USD</span>
  </>
</TextField>
```

- leading/trailing 자식은 각각 span으로 감싼다
- 버튼이 없으면 muted 색, 크기에 맞는 글자와 아이콘 크기가 적용된다
- 버튼이 있으면 버튼의 패딩과 고정 크기만 없앤다

## 속성 우선순위

```tsx
<TextField id="q" name="a" onChange={root}>
  <TextField.Input name="b" onChange={input} />
</TextField>
// id="q", name="b": 값은 Input > root > asChild 자식
// onChange: child, root, input 순서로 모두 실행 (Field, RHF가 root에 건 핸들러 유지)
// ref는 root에 줘도 실제 input을 가리킨다
```

## asChild

```tsx
<TextField name="q">
  <TextField.Input asChild>
    <MyInput />                       {/* props와 ref를 native input에 전달해야 한다 */}
  </TextField.Input>
</TextField>
```

## 크기와 variant

```tsx
<TextField variant="soft" />          // outline(기본) / soft / ghost
<TextField size="tiny" />             // standard(36px, body-b3) / tiny(32px, caption-c1)

<Field size="tiny">
  <Field.Label>이름</Field.Label>
  <TextField />                       {/* size를 생략하면 Field를 따른다 */}
</Field>
```

## 속성

| 속성                  | 기본 / 동작                                           |
| --------------------- | ----------------------------------------------------- |
| `variant`             | `outline`(기본) / `soft` / `ghost`              |
| `size`                | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard` |
| `disabled`            | 컨테이너와 input에 함께 적용. Input의 값이 우선       |
| `className` / `style` | 컨테이너로 간다. Input에 주면 input으로 간다          |
| 그 외 native 속성     | 실제 input으로 간다                                   |

## 알아둘 것

- HTML `size` 속성은 IDS `size`가 차지하므로 쓸 수 없다. 폭은 `className`으로 정한다.
- 컨테이너의 빈 곳을 누르면 input에 포커스가 간다. 버튼, 링크, 라벨, 다른 입력을 누를 때는 옮기지 않는다.
- `value`를 주고 `onChange`나 `readOnly`가 없으면 에러가 난다.
- `TextField.Input`을 둘 이상 두거나, Input에 children을 주거나, `asChild` 자식이 input이 아니면 에러가 난다.
- 지우기 버튼 같은 전용 파트는 없다. trailing에 `IconButton`을 두고 자기 state를 비운다.
