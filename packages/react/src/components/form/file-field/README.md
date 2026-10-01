# FileField

파일을 고르거나, 끌어다 놓거나, 붙여넣어 첨부하는 필드입니다.

- **세 가지 입력.** 버튼으로 고르고, 필드에 끌어다 놓고, 포커스를 둔 채 붙여넣습니다. 스크린샷도 붙여넣기로 바로 들어갑니다.
- **미리보기.** 이미지는 썸네일로 보입니다. 파일을 지우거나 필드가 사라지면 썸네일 주소를 바로 해제합니다.
- **제한과 거부 사유.** `accept`, `maxSize`, `maxCount` 에 걸린 파일은 빼고 받은 뒤, 파일마다 이유를 알립니다. dropzone 에는 허용 형식과 크기가 미리 보입니다.
- **폼.** 지금 고른 `File` 이 그대로 FormData 에 들어갑니다. `required` 는 브라우저 검증이 막고, `<button type="reset">` 은 처음 값으로 되돌립니다.
- **dropzone.** `appearance="dropzone"` 은 파일을 끌어다 놓는 넓은 영역입니다. 파일을 끌어 올리면 색이 바뀝니다.

```tsx
import { Field, FileField } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>이력서</Field.Label>
  <FileField name="resume" accept=".pdf" />
</Field>;
```

## 값

```tsx
<FileField value={resume} onValueChange={setResume} />               // File | null

<FileField multiple value={files} onValueChange={setFiles} />         // File[]
```

- 하나만 받으면 새 파일이 이전 파일을 바꿉니다. 여러 개를 받으면 목록에 쌓이고, 이름과 크기와 수정 시각과 형식이 모두 같은 파일은 다시 넣지 않습니다.
- 같은 파일을 다시 고를 수 있습니다. 고르기를 취소하면 이전 값을 그대로 둡니다.

## 끌어다 놓기와 붙여넣기

```tsx
<FileField multiple appearance="dropzone" accept="image/*" />
```

- 파일을 끌어 올리는 동안 루트와 트리거에 `data-dragging` 이 붙습니다. 안쪽 요소 위를 지나가도 끊기지 않습니다.
- 글자나 링크를 끌어 오는 것은 받지 않습니다.
- 필드 안에 포커스가 있을 때 붙여넣으면 클립보드의 파일이 들어갑니다. 파일이 없는 붙여넣기는 건드리지 않습니다.
- `onDrop` 에서 `preventDefault()` 하면 기본 처리를 건너뜁니다.

## 제한과 거부

```tsx
<FileField
  multiple
  accept="image/*,.pdf" // MIME 은 File.type, 확장자는 이름 끝을 대소문자 무시로 본다
  maxSize={5 * 1024 * 1024} // 파일당 bytes
  maxCount={5} // 여러 개일 때 전체 개수
  onReject={(rejections) => {}} // [{ file, reason: 'type' | 'size' | 'count' }]
/>
```

- 걸린 파일만 빼고 나머지는 받습니다. 모두 걸리면 이전 값을 그대로 둡니다.
- 사유는 필드 아래 `role="alert"` 로 `big.pdf: 5 MB보다 큽니다.` 처럼 보이고, 트리거가 `aria-invalid` 가 됩니다. 다음에 제대로 고르거나 지우거나 초기화하면 사라집니다.
- dropzone 은 `PDF, 이미지 · 파일당 최대 5 MB · 최대 5개` 처럼 규칙을 먼저 보여 주고, 트리거의 `aria-describedby` 로 읽힙니다.
- 크기는 `512 B`, `1.5 KB`, `23 MB` 처럼 읽기 쉬운 단위로 적습니다.

## 구성

```tsx
<FileField multiple>
  <FileField.Trigger>
    {/* 생략하면 아이콘 + Value, dropzone 이면 안내 문구 */}
    <PaperClipIcon />
    <FileField.Value placeholder="첨부" />
  </FileField.Trigger>
  <FileField.Clear /> {/* 파일이나 거부 사유가 있을 때만 보인다 */}
  <FileField.List>
    {(files) =>
      files.map((file) => (
        <FileField.Item key={file.name} file={file}>
          {({ index }) => (
            <>
              <FileField.Preview file={file} /> {/* 이미지면 썸네일, 아니면 문서 아이콘 */}
              <Item.Content>
                <Item.Title truncate>{index + 1}. {file.name}</Item.Title>
              </Item.Content>
              <Item.Actions>
                <FileField.Remove file={file} />
              </Item.Actions>
            </>
          )}
        </FileField.Item>
      ))
    }
  </FileField.List>
</FileField>
```

- `Trigger` 는 꼭 하나 둡니다. `Clear`, `List`, `Item` 은 `Trigger` 안이 아니라 옆에 둡니다.
- `field` 모양에서는 `Trigger` 와 `Clear` 가 필드 테두리 안에 함께 들어갑니다.
- 기본 목록은 여러 개를 받거나 dropzone 일 때 나옵니다. 파일마다 미리보기, 이름, 크기, 삭제 버튼이 있고, 긴 이름은 한 줄에서 줄입니다.
- 목록은 `Item.Group`, 파일 한 줄은 `dense` 한 outline `Item` 입니다. `FileField.Item` 안에서 `Item.Content`, `Item.Title`, `Item.Description`, `Item.Actions` 를 그대로 씁니다.
- `Preview` 는 행 안에서는 `Item.Media` 타일이고, 하나만 받는 필드의 트리거 안에서는 글자 크기의 썸네일입니다.
- `Clear` 와 `Remove` 는 ghost `IconButton` 입니다. children 은 아이콘이고, `asChild` 면 넘긴 버튼이 같은 모양과 동작을 받습니다.
- 목록에서 파일을 지우면 포커스가 그 자리에 온 파일로, 마지막 파일이면 트리거로 갑니다.
- 모든 part 는 `asChild` 를 받습니다.

## 상태와 data 속성

| 요소   | 속성                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| 루트   | `data-appearance`, `data-dragging`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-empty` |
| 트리거 | `data-dragging`, `data-placeholder`                                                                                 |

- 루트와 `Trigger` 의 `className` 은 `FileField.State` 를 받는 함수도 됩니다.

## 폼

```tsx
<form onSubmit={submit}>
  {/* FormData: resume=File */}
  <FileField name="resume" accept=".pdf" required />
  <button type="reset">초기화</button>
</form>
```

- 제출할 때 form 의 `formdata` 이벤트로 지금 값의 `File` 을 넣습니다. 끌어다 놓은 파일, 지운 뒤의 목록, 제어 값도 그대로 제출되고, 같은 `name` 의 다른 필드 값은 그대로 둡니다.
- `required` 인데 비어 있으면 브라우저가 제출을 막고 트리거로 포커스를 보냅니다.
- `disabled` 면 제출되지 않고, `readOnly` 면 제출되지만 고르기, 놓기, 붙여넣기, 지우기를 막습니다.

## react-hook-form, TanStack Form

```tsx
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

<Field name="resume" controlMode="value" registerOptions={{ required: '파일을 첨부하세요' }}>
  <Field.Label>이력서</Field.Label>
  <FileField accept=".pdf" />
  <Field.Error />
</Field>;
```

- 오류가 나면 트리거로 포커스가 갑니다. TanStack Form 은 `value` 와 `onValueChange={field.handleChange}` 로 잇습니다.

## 모양, 크기, variant

```tsx
<FileField appearance="dropzone" />   // field(기본) / dropzone
<FileField variant="soft" />          // outline(기본) / soft / ghost. 두 모양 모두
<FileField size="tiny" />             // standard / tiny. 생략하면 Field 를 따른다
<FileField invalid />                 // danger 색
```

## 속성

| 속성                     | 기본 / 동작                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `multiple`               | `false`: `File \| null` / `true`: `File[]`                                              |
| `value` / `defaultValue` | 생략하면 비제어. 기본 `null` / `[]`                                                     |
| `onValueChange`          | 값이 바뀔 때                                                                            |
| `accept`                 | 쉼표로 구분한 MIME 또는 `.확장자`. 형식이 틀리면 오류                                   |
| `maxSize` / `maxCount`   | 파일당 bytes / 여러 개일 때 개수                                                        |
| `onReject`               | 거부 목록                                                                               |
| `appearance`             | `field`(기본) / `dropzone`                                                              |
| `variant`                | `outline`(기본) / `soft` / `ghost`                                                      |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기                                              |
| `placeholder`            | `파일 선택 또는 드래그`. dropzone 은 `파일을 끌어다 놓거나 눌러서 고르세요`             |
| `invalid`                | danger 색. 명시한 `aria-invalid` 가 우선하고, 거부가 있으면 늘 오류                     |
| `disabled` / `readOnly`  | 고르기, 놓기, 붙여넣기, 지우기를 막는다                                                 |
| `name` / `form`          | 지금 파일을 같은 이름으로 제출                                                          |
| `required`               | 브라우저 검증                                                                           |
| `className` / `style`    | 루트                                                                                    |
| `onDrop` / `onDragOver`  | 루트의 끌어다 놓기 이벤트                                                               |
| `ref`, `id`, `aria-*`    | 트리거 button (`autoFocus`, `tabIndex`, `onClick`, `onFocus`, `onBlur`, `onKeyDown` 도) |
| 그 외 input 속성         | 숨은 native picker (`capture` 등)                                                       |

## 알아둘 것

- `accept` 는 이름과 형식만 봅니다. 파일 내용은 검사하지 않으니 서버에서도 검증하세요. 바깥에서 준 `value` 는 거르지 않습니다.
- 업로드, 진행률, 서버 저장은 앱이 맡습니다.
- 여러 개와 하나를 오가면 값의 모양도 앱이 맞춰야 합니다.
