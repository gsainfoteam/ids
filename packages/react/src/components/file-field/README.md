# FileField

파일을 고르거나 끌어다 놓는 필드. 업로드, 진행률, 서버 저장은 앱이 맡는다.

```tsx
import { Field, FileField } from '@gsainfoteam/ids-react';

const [resume, setResume] = useState<File | null>(null);

<Field>
  <Field.Label>이력서</Field.Label>
  <FileField name="resume" accept=".pdf" value={resume} onChange={setResume} />
</Field>;
```

## 여러 파일

```tsx
const [files, setFiles] = useState<File[]>([]);

<FileField
  multiple                             // 값이 File[]가 된다. 기본 합성에 파일 목록이 추가된다
  value={files}
  onChange={setFiles}
  variant="dropzone"
/>
// single: 허용된 첫 파일로 교체한다
// multiple: 기존 목록에 추가한다. name, size, lastModified, type이 모두 같은 파일은 다시 넣지 않는다
// 같은 파일을 다시 고를 수 있다. 선택을 취소하면 기존 값을 유지한다
```

## 제한과 거부

```tsx
<FileField
  multiple
  accept="image/*,.pdf"                // MIME은 File.type, 확장자는 이름 끝을 대소문자 무시로 비교
  maxSize={5 * 1024 * 1024}            // 파일당 bytes
  maxCount={5}                         // multiple일 때 총 개수
  onReject={(rejections) => {
    // [{ file, reason: 'type' | 'size' | 'count' }]
  }}
/>
// 거부된 파일은 빼고 나머지만 반영한다. 모두 거부되면 이전 값을 유지한다
// 거부 사유는 필드 아래 alert로 보이고 트리거가 aria-invalid가 된다
// 다음 유효 선택, 삭제, Clear, reset에서 메시지가 사라진다
```

## 합성

```tsx
<FileField multiple value={files} onChange={setFiles}>
  <FileField.Trigger>                  {/* 정확히 한 개. 생략하면 아이콘 + Value로 자동 생성 */}
    <PaperClipIcon />
    <FileField.Value placeholder="첨부" /> {/* "a.pdf, b.pdf, +3"처럼 두 개까지 요약 */}
  </FileField.Trigger>
  <FileField.Clear />                  {/* 파일이나 거부 메시지가 있을 때만 보인다 */}
  <FileField.List>                     {/* 생략하면 파일마다 Item */}
    {files.map((file) => (
      <FileField.Item key={file.name} file={file} /> // 이름, 크기, 삭제 버튼
    ))}
  </FileField.List>
</FileField>
// Clear, List, Item은 Trigger의 형제로 둔다. Trigger 안에 넣으면 오류
// 모든 part는 asChild를 받는다
```

## 속성 전달

```tsx
<FileField
  className="w-80"                     // 컨테이너
  id="resume"                          // 트리거 button (ref, autoFocus, tabIndex, aria-*, onClick, onFocus, onBlur, onKeyDown도)
  onDrop={(e) => e.preventDefault()}   // 컨테이너 이벤트. preventDefault()하면 기본 처리를 건너뛴다
  capture="environment"                // 그 외 input 속성은 숨겨진 native picker로
/>
```

## React Hook Form

```tsx
import { FileField } from '@gsainfoteam/ids-react';
import { Field } from '@gsainfoteam/ids-react/react-hook-form';

const methods = useForm({ defaultValues: { resume: null, attachments: [] } });

<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(save)}>
    <Field name="resume" controlMode="value" registerOptions={{ required: '파일을 첨부하세요' }}>
      <Field.Label>이력서</Field.Label>
      <FileField accept=".pdf" />
      <Field.Error />                  {/* 오류 시 트리거로 포커스 */}
    </Field>
  </form>
</FormProvider>;
```

## 속성

| 속성                     | 기본 / 동작                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `multiple`               | `false`: `File \| null` / `true`: `File[]`                         |
| `value` / `defaultValue` | 생략하면 uncontrolled. 기본 `null` / `[]`                          |
| `accept`                 | 쉼표로 구분한 MIME 또는 `.확장자`. 형식이 틀리면 오류              |
| `maxSize` / `maxCount`   | 파일당 bytes / 다중 선택 개수                                      |
| `onReject`               | 거부 목록 콜백                                                     |
| `variant`                | `outline`(기본) / `dropzone`                                       |
| `size`                   | `standard` / `tiny`. 생략하면 `Field` 크기, 없으면 `standard`                |
| `placeholder`            | `파일 선택 또는 드래그`                                            |
| `invalid`                | 오류 표시. 명시한 `aria-invalid`가 우선, 거부가 있으면 항상 오류  |
| `disabled` / `readOnly`  | 선택, 드롭, 삭제를 막는다. `readOnly` 값은 제출, `disabled`는 제외 |
| `name` / `form`          | 현재 파일들을 같은 이름으로 제출                                   |
| `required`               | ARIA 힌트만. 검증은 RHF나 앱이 한다                                |

## 알아둘 것

- 제출은 form의 `formdata` 이벤트에서 현재 값의 `File`을 append한다. 드롭, 삭제, controlled 값도 그대로 제출되고, 같은 `name`의 다른 필드 값은 보존한다. hydration 이후에만 동작한다.
- `accept`는 이름과 MIME만 본다. 파일 내용은 검사하지 않으므로 서버에서도 검증한다. 외부 `value`/`defaultValue`는 걸러내지 않는다.
- 파일 드래그만 강조하고 받는다. 텍스트나 URL 드롭은 무시한다.
- `form.reset()`은 uncontrolled 값과 거부 상태를 되돌린다. controlled 값은 부모가 reset한다.
- 실행 중 `multiple`을 바꾸면 값 형태도 앱이 맞춰야 한다.
- 파일 경로나 서버 URL을 `File`로 바꿔주지 않는다.
