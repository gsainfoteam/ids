# Input

`Input`은 스키마의 `type`을 기존 필드에 연결하는 편의 컴포넌트입니다. `ThemeProvider` 안에서 사용합니다.

| type                            | 컴포넌트      | value / onChange                   |
| ------------------------------- | ------------- | ---------------------------------- |
| text (기본), email, url, search | TextField     | 네이티브 input props / ChangeEvent |
| number                          | NumberField   | number 또는 null                   |
| password                        | PasswordField | 네이티브 input props / ChangeEvent |
| tel                             | TelField      | string                             |

```tsx
<Field required>
  <Field.Label>이메일</Field.Label>
  <Input type="email" name="email" autoComplete="email" />
</Field>
<Input type="number" value={quantity} onChange={setQuantity} min={1} step={1} />
<Input type="search" name="query" aria-label="검색" />
```

타입별 props, 실제 input ref, disabled/readOnly, Field 크기와 ARIA 연결을 그대로 전달합니다. 텍스트 계열은 outline/filled/underline, 나머지는 해당 필드의 variant를 사용합니다. `invalid`는 텍스트 계열에서 `aria-invalid`로 변환됩니다. 명시한 `aria-invalid`가 우선합니다.

Search는 TextFieldGroup과 Heroicons 지우기 버튼을 조합합니다. 버튼 공간을 항상 확보하여 값 변경에도 너비와 탭 순서를 유지합니다. 지우기는 네이티브 input 이벤트로 전달되며 입력 위치에 포커스가 유지됩니다. disabled/readOnly이면 지울 수 없습니다. 네이티브 브라우저의 중복 검색 지우기 아이콘은 숨깁니다.

NumberField.Input, PasswordField.Input 등 전용 필드의 compound children을 해당 타입에 전달할 수 있습니다. Input 자체에는 별도의 compound 파트가 없습니다. TextFieldGroup의 구조적 자식에는 TextField를 직접 사용하세요.

## React Hook Form / Zod

`@gsainfoteam/ids-react/react-hook-form`의 Field와 FormProvider를 사용하세요.

```tsx
<RhfField name="email"><RhfField.Label>이메일</RhfField.Label><Input type="email" /><RhfField.Error /></RhfField>
<RhfField name="quantity" controlMode="value"><RhfField.Label>수량</RhfField.Label><Input type="number" min={1} /><RhfField.Error /></RhfField>
<RhfField name="phone" controlMode="value"><RhfField.Label>전화번호</RhfField.Label><Input type="tel" /><RhfField.Error /></RhfField>
```

number/tel은 `controlMode="value"`가 필요합니다. 기본값은 number에 null/숫자, tel에 문자열을 지정하세요. Zod 스키마도 각 값 타입과 일치시킵니다. 서로 다른 타입으로 동적으로 바꿀 때는 `key={type}`으로 값과 필드 상태를 초기화하거나 새 타입에 맞는 controlled 값을 함께 전달하세요.

OTP, file, color, date, time, datetime-local은 각각 전용 필드를 사용합니다. TypeScript에서는 미지원 type을 거부합니다. JavaScript 런타임에서 미지원 type이 전달되면 개발 모드 경고 후 text로 표시합니다.
