# Select

- 목록에서 하나 또는 여러 옵션을 고르는 버튼형 필드
- 값은 `string | null`, `multiple`이면 `string[]`
- `SearchField`로 옵션 검색, `Group`으로 묶기
- `mobileVariant="drawer"`면 640px 미만에서 하단 팝업으로 연다

```tsx
import { Field, Select } from '@gsainfoteam/ids-react';

const [fruit, setFruit] = useState<string | null>(null);

<Field>
  <Field.Label>과일</Field.Label>
  <Select value={fruit} onChange={setFruit} placeholder="과일을 고르세요">
    <Select.Item value="apple">사과</Select.Item>
    <Select.Item value="cherry">체리</Select.Item>
  </Select>
</Field>;
```

## 다중 선택과 검색

```tsx
const [skills, setSkills] = useState<string[]>([]);

<Select selectionMode="multiple" value={skills} onChange={setSkills}>
  <Select.SearchField />               {/* 팝업 맨 위. 열리면 포커스가 여기로 간다 */}
  <Select.Group heading="개발">
    <Select.Item value="react">React</Select.Item>
    <Select.Item value="flutter" searchValue="Flutter Dart">Flutter</Select.Item> {/* 검색과 표시 라벨 */}
    <Select.Item value="cobol" disabled>COBOL</Select.Item> {/* 키보드 이동에서 건너뛴다 */}
  </Select.Group>
  <Select.Empty>검색 결과 없음</Select.Empty>
</Select>
// multiple: 팝업을 연 채로 토글한다. 트리거에는 "React, Flutter, +1"처럼 두 개까지 표시
// single: 선택하면 닫고 트리거로 포커스를 돌린다
```

## 합성

```tsx
<Select value={fruit} onChange={setFruit}>
  <Select.Trigger>                     {/* 생략하면 Value + chevron으로 자동 생성 */}
    <Select.Value placeholder="없음" />
  </Select.Trigger>
  <Select.Content className="max-h-60"> {/* 생략하면 나머지 자식을 감싸 자동 생성 */}
    <Select.Item value="apple">사과</Select.Item>
  </Select.Content>
</Select>
// Item/Group은 Content나 루트의 직접 자식, 또는 Fragment 안만 인식한다
// Trigger, Content는 각각 최대 한 개
```

## asChild

```tsx
<Select value={fruit} onChange={setFruit}>
  <Select.Trigger asChild>
    <MyButton />                       {/* props와 ref를 button에 전달해야 한다 */}
  </Select.Trigger>
  <Select.Content asChild>
    <section>
      <Select.Item value="apple">사과</Select.Item>
    </section>
  </Select.Content>
</Select>
// Trigger, Value, Content, SearchField, Item, Group, Empty 모두 asChild를 받는다
```

## 키보드

```text
Enter  Space  ↓   닫혀 있으면 연다
↑ ↓  Home  End    활성 옵션 이동 (검색창에서는 Home/End가 텍스트 편집)
Enter  Space      활성 옵션 선택 (검색창에서는 Space가 입력)
글자 입력          검색창이 없을 때 라벨 접두어로 이동
Esc               닫고 트리거로 포커스. 이미 확정한 값은 되돌리지 않는다
Tab               닫고 다음 요소로
```

## React Hook Form

```tsx
import { Select } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { fruit: null, skills: [] } }); // 단일 null, 다중 []

<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(save)}>
    <Field name="fruit" controlMode="value" registerOptions={{ required: '선택하세요' }}>
      <Field.Label>과일</Field.Label>
      <Select>{options}</Select>
      <Field.Error />                  {/* 오류 시 트리거로 포커스 */}
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                     | 기본 / 동작                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `selectionMode`          | `single`(기본): `string \| null` / `multiple`: `string[]`             |
| `value` / `defaultValue` | 생략하면 uncontrolled. 기본 `null` / `[]`                             |
| `onChange`               | 값 콜백                                                               |
| `placeholder`            | `선택하세요`                                                          |
| `variant`                | `outline`(기본) / `filled` / `unstyled`                               |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`                   |
| `mobileVariant`          | `popover`(기본) / `drawer`: 640px 미만에서 하단 팝업                  |
| `invalid`                | 오류 표시. 명시한 `aria-invalid`(Field 포함)가 우선                   |
| `disabled` / `readOnly`  | 열기와 선택을 막는다                                                  |
| `name` / `form`          | 선택값마다 hidden input. 빈 선택은 제출 항목 없음, `disabled`면 제외  |
| `required`               | ARIA 힌트만. 검증은 RHF나 앱이 한다                                   |
| 그 외 native 속성, `ref` | 트리거 button으로 간다                                                |

## 알아둘 것

- 옵션 사이를 이동하는 것만으로는 값이 바뀌지 않는다. 외부에서 `value`를 바꿔도 `onChange`는 발생하지 않는다.
- `onBlur`는 포커스가 트리거와 팝업을 모두 벗어날 때만 발생한다.
- 팝업은 비모달이다. 바깥을 클릭하거나 포커스가 나가면 닫히고 배경 스크롤을 잠그지 않는다.
- 키보드로 이동해도 팝업 안만 스크롤하고 문서는 스크롤하지 않는다.
- `form.reset()`은 uncontrolled 값을 `defaultValue`로 되돌리고 팝업을 닫는다.
- `Item`의 `value`는 필수이고 고유해야 한다. 빈 문자열도 값으로 쓸 수 있다.
