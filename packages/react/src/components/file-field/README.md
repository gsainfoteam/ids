# FileField

Native 파일 선택과 드롭을 지원합니다. 업로드·진행률·서버 저장은 앱이 처리합니다.

```tsx
import { useState } from 'react';
import { FileField, Field } from '@gsainfoteam/ids-react';

function Attachments() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <Field>
      <Field.Label>첨부 파일</Field.Label>
      <FileField
        multiple
        value={files}
        onChange={setFiles}
        accept="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        maxCount={5}
        variant="dropzone"
        onReject={(items) => console.log(items)}
      />
    </Field>
  );
}
```

- single(default): value/defaultValue/onChange는 File | null. multiple=true: File[]. value를 생략하면 uncontrolled이며 기본값은 null 또는 []입니다. 실행 중 multiple을 변경하면 앱도 값 형태를 맞춰야 합니다.
- single은 허용된 첫 파일로 교체합니다. multiple은 기존 목록에 추가하며 name/size/lastModified/type이 같은 파일은 중복 추가하지 않습니다. 매 선택 후 native picker 값은 비워 같은 파일을 다시 선택할 수 있습니다. 취소/빈 선택은 기존 값을 유지합니다.
- picker 및 drop 모두 accept, maxSize(파일당 bytes), maxCount(다중 선택 개수)를 검사합니다. 거부된 파일은 선택에서 제외하고 화면의 alert와 trigger aria-invalid/aria-describedby로 표시합니다. onReject는 `{file, reason:'type'|'size'|'count'}[]`를 받습니다. 모두 거부되면 이전 값은 유지합니다.
- accept는 쉼표로 구분한 MIME 또는 확장자입니다. MIME은 File.type, 확장자는 이름의 대소문자 무시 접미사로 비교합니다. 파일 내용 검사는 하지 않으며 서버에서도 검증해야 합니다. 외부 value/defaultValue는 필터링하지 않습니다. 유효 선택·삭제·Clear·native reset 시 거부 메시지를 지웁니다.
- outline(default)/dropzone, standard/tiny. Field 크기를 상속합니다. Dropzone에 파일을 올리면 강조합니다. 텍스트/URL 드롭은 처리하지 않습니다. capture 등 파일 input 속성은 숨겨진 native input에 전달합니다.
- 자동 합성은 Trigger + Clear, 다중 선택 시 List입니다. 직접 합성할 때 정확히 한 Trigger를 선언하세요. Value는 파일명 요약, List는 파일별 Item, Item은 `{file}`을 받아 삭제 버튼을 제공합니다. Clear/List/Item은 Trigger의 **형제**로 배치합니다. 버튼 중첩은 지원하지 않습니다. 각 part는 asChild 단일 자식의 props/ref를 합성합니다.
- root className/style은 전체 컨테이너에 적용합니다. id/ref/autoFocus/tabIndex/ARIA 및 onClick/onFocus/onBlur/onKeyDown은 실제 Trigger button에 전달합니다. root onDrop/onDragOver는 컨테이너 이벤트입니다. 기타 native input 속성은 숨겨진 picker에 전달합니다. 사용자 핸들러의 preventDefault는 기본 동작을 취소합니다.
- disabled/readOnly는 선택·드롭·삭제를 막습니다. readOnly 값은 제출되고 disabled 값은 제외됩니다. Field label은 trigger에 연결됩니다. required는 ARIA 힌트이며 유효성은 앱/RHF에서 검사합니다.
- name/form은 HTML form의 **formdata 이벤트**로 현재 모델의 실제 File들을 같은 이름으로 append합니다. 숨겨진 picker 자체에는 name이 없습니다. 선택이 없으면 항목도 없고, 동일 name의 다른 필드 값은 보존합니다. hydration 이후 native form 제출과 `new FormData(form)`에 적용됩니다. FileList에 값을 쓰지 않으므로 드롭·삭제·controlled 기본값도 동일하게 제출합니다.
- native reset은 uncontrolled defaultValue와 거부 상태를 복원합니다. controlled 값은 부모가 reset합니다. 파일 경로나 기존 서버 URL을 File로 자동 변환하지 않습니다.
- RHF: optional `/react-hook-form` Field에 `controlMode="value"`와 `{resume:null}` 또는 `{attachments:[]}` 기본값을 사용하세요. registerOptions 또는 Zod로 검증하며 오류 시 trigger를 포커스합니다.
- 공개 Badge/Chip 의존성을 추가하지 않고 파일 목록은 내부에서 렌더링합니다. Storybook: SelectValidateAndRemove, Playground.
