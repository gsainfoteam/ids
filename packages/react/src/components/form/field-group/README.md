# FieldGroup

여러 [Field](../field/README.md) 를 쌓습니다. Field 의 일부가 아니라 여러 Field 를 담는 그릇이라, `Field.Group` 이 아닌 별도 컴포넌트입니다.

- **라벨 열을 맞춥니다.** `orientation="horizontal"` 이면 가장 긴 라벨에 맞춘 열 하나를 모든 Field 가 subgrid 로 나눠 써서, 입력칸의 시작이 줄마다 같습니다.
- **방향을 잇습니다.** 안의 Field 는 그룹의 `orientation` 을 따릅니다. Field 에 직접 준 값이 이깁니다.
- **시멘틱 구성.** `<div>` 하나입니다. 폼의 한 묶음에 이름을 붙이려면 `<fieldset>` 과 `<legend>` 로 감쌉니다.

```tsx
import { Field, FieldGroup, TextField } from '@gsainfoteam/ids-react';

<FieldGroup orientation="horizontal">    {/* 안의 Field 가 라벨 열 하나를 나눠 쓴다 */}
  <Field>
    <Field.Label>이름</Field.Label>
    <TextField />
  </Field>
  <Field>
    <Field.Label>GIST 메일</Field.Label>
    <TextField />
  </Field>
</FieldGroup>
```

| Property      | Type                         | Default    |
| ------------- | ---------------------------- | ---------- |
| `orientation` | `'vertical' \| 'horizontal'` | `vertical` |

`<div>` 의 나머지 속성은 루트로 갑니다.

## 간격

- 세로 그룹은 Field 사이를 20px 띄웁니다. 가로 그룹은 행 사이 20px, 라벨과 입력칸 사이 12px 입니다.

## 알아둘 것

- 가로 그룹 안에서 `orientation="vertical"` 인 Field 와 Field 가 아닌 자식(감싼 `div` 등)은 두 열을 다 차지합니다.
- 감싼 `div` 안의 Field 는 그룹의 라벨 열을 나눠 쓰지 않습니다. 정렬할 Field 는 FieldGroup 의 바로 아래에 둡니다.
