# ChipField

- 검색해서 여러 옵션을 고르고 칩으로 보여주는 필드
- 값은 `string[]`. `creatable`이면 검색어로 새 항목을 만든다
- `TextField`와 같은 sentinel 합성: 앞뒤에 아이콘이나 버튼을 붙인다
- `Field`, react-hook-form(`controlMode="value"`)과 연결된다

```tsx
import { ChipField, Field } from '@gsainfoteam/ids-react';

const [tags, setTags] = useState<string[]>([]);

<Field>
  <Field.Label>기술 태그</Field.Label>
  <ChipField value={tags} onChange={setTags} placeholder="검색하거나 새 태그 입력">
    <ChipField.Item value="react">React</ChipField.Item>
    <ChipField.Item value="ts">TypeScript</ChipField.Item>
  </ChipField>
</Field>;
```

## 합성

```tsx
<ChipField value={tags} onChange={setTags}>
  <TagIcon />                          {/* Input 앞 = leading, 칩보다 앞 */}
  <ChipField.Input placeholder="분야 검색" /> {/* 칩은 Input 바로 앞에 자동으로 붙는다 */}
  <ClearButton />                      {/* Input 뒤 = trailing, chevron 앞 */}
  <ChipField.Item value="react">React</ChipField.Item> {/* 옵션 part는 위치와 무관하게 팝업으로 */}
</ChipField>
// 렌더 순서: leading, 칩, Input, trailing, chevron

<ChipField value={tags} onChange={setTags}>
  <TagIcon />                          {/* Input을 생략하면 자식 뒤에 자동으로 들어간다 */}
  <ChipField.Item value="react">React</ChipField.Item>
</ChipField>
// Input은 최대 한 개. Fragment 안은 찾지만 사용자 컴포넌트 내부는 찾지 않는다
```

## 옵션

```tsx
<ChipField value={tags} onChange={setTags}>
  <ChipField.Group heading="프론트엔드">
    <ChipField.Item value="react">React</ChipField.Item>
    <ChipField.Item value="vue" searchValue="Vue.js">Vue</ChipField.Item> {/* 검색과 칩 라벨 */}
  </ChipField.Group>
  <ChipField.Item value="legacy" disabled>jQuery</ChipField.Item>       {/* 선택도 삭제도 불가 */}
  <ChipField.Empty>일치하는 태그가 없습니다.</ChipField.Empty>
</ChipField>

<ChipField value={tags} onChange={setTags}>
  <ChipField.Content className="max-h-60"> {/* 목록 컨테이너에 props를 줄 때 */}
    <ChipField.Item value="react">React</ChipField.Item>
  </ChipField.Content>
  {/* Content를 쓰면 옵션을 루트에 직접 둘 수 없다 */}
</ChipField>
```

## 새 항목 만들기

```tsx
<ChipField
  value={tags}
  onChange={setTags}
  creatable
  onCreate={(tag) => saveTag(tag)}     // creatable이면 필수. 앞뒤 공백을 뺀 문자열로 호출된 뒤 선택에 추가
  maxCount={5}                         // 새 선택과 생성만 막는다. 외부 value는 자르지 않는다
>
  <ChipField.Item value="react">React</ChipField.Item>
  <ChipField.Create>새 태그 추가</ChipField.Create> {/* 기본 문구는 검색어 + " 추가" */}
</ChipField>
// 옵션 value/라벨이나 이미 고른 값과 대소문자 무시로 같으면 생성 행이 나오지 않는다
// 부모가 Item을 추가하기 전까지 새 칩은 값 자체를 라벨로 보여준다
```

## 키보드

```text
입력          검색어로 필터링하고 팝업을 연다
↑ ↓           옵션과 생성 행 사이 이동 (닫혀 있으면 연다)
Space         검색어가 비고 닫혀 있으면 연다
Enter         활성 항목 토글 또는 생성. IME 조합 중에는 무시
Backspace     검색어가 비었으면 마지막 칩 삭제
Esc           닫고 Input으로 포커스
Tab           닫고 다음 요소로
```

## 속성 우선순위

```tsx
<ChipField id="a" placeholder="root" onKeyDown={root} onChange={setTags}>
  <ChipField.Input placeholder="input" onKeyDown={input} onChange={onQuery} />
</ChipField>
// placeholder="input": 값은 Input > root
// onKeyDown: root, input 순서로 모두 실행한 뒤 내장 키보드 처리. preventDefault()하면 내장 처리를 건너뛴다
// root onChange는 선택값(string[]), Input onChange는 검색어 입력 이벤트
// role, value, aria-expanded 같은 combobox 속성은 덮어쓸 수 없다
```

## asChild

```tsx
<ChipField value={tags} onChange={setTags}>
  <ChipField.Input asChild>
    <MyInput />                        {/* input 하나, 또는 props와 ref를 input에 전달하는 컴포넌트 */}
  </ChipField.Input>
</ChipField>
// Content, Item, Group, Create, Empty도 asChild를 받는다
```

## React Hook Form

```tsx
import { ChipField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { tags: [] as string[] } });

<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(save)}>
    <Field
      name="tags"
      controlMode="value"
      registerOptions={{ validate: (v) => v.length > 0 || '태그를 하나 이상 고르세요.' }}
    >
      <Field.Label>태그</Field.Label>
      <ChipField>{options}</ChipField>
      <Field.Error />                  {/* 오류 시 Input으로 포커스 */}
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                     | 기본 / 동작                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `value` / `defaultValue` | 중복 없는 `string[]` / `[]`                                   |
| `onChange`               | 선택값 `string[]` 콜백                                        |
| `creatable` / `onCreate` | `false`. `creatable`이면 `onCreate` 필수                      |
| `maxCount`               | 0 이상 정수. 새 선택만 제한                                   |
| `variant`                | `outline`(기본) / `filled` / `unstyled`                       |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`           |
| `mobileVariant`          | `drawer`(기본): 640px 미만에서 하단 팝업 / `popover`          |
| `invalid`                | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선           |
| `disabled` / `readOnly`  | 선택, 생성, 삭제를 막는다                                     |
| `name` / `form`          | 선택값마다 hidden input 하나. `disabled`면 제외               |
| `required`               | ARIA 힌트만. 배열 검증은 앱이 한다                            |
| `className` / `style`    | 컨테이너로 간다                                               |
| 그 외 native 속성, `ref` | 검색 input으로 간다. 기본 `placeholder="항목 추가…"`          |

## 알아둘 것

- 버튼, 링크, 입력이 아닌 컨테이너 영역을 클릭하면 Input에 포커스하고 팝업을 연다.
- 드로어와 팝오버 모두 비모달이다. 배경 스크롤을 잠그거나 포커스를 가두지 않는다.
- 키보드로 이동해도 팝업 안만 스크롤하고 문서는 스크롤하지 않는다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로, 검색어를 빈 값으로 되돌린다. controlled 값은 부모가 reset한다.
- 새로 만든 값의 서버 저장이나 ID 변환은 앱이 맡는다.
