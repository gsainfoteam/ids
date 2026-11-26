# FileDropzone

파일을 끌어다 놓거나, 눌러서 고르거나, 붙여넣어 첨부하는 넓은 영역입니다.

- **FileField 와 같은 동작.** 값, 제한과 거부, 미리보기, 폼, react-hook-form 연결은 [FileField](../file-field/README.md) 와 같습니다. 두 컴포넌트는 같은 내부 훅을 씁니다.
- **필드 모양이 필요하면 FileField.** 한 줄짜리 필드 안에 파일 이름을 보여 줍니다.
- **안내 문구는 `FileDropzone.Title` 입니다.** 영역 가운데, 아이콘 아래에 보입니다. 생략하면 문구 없이 아이콘만 보입니다.
- **규칙을 먼저 보여 줍니다.** `FileDropzone.Limits` 에 쓴 규칙은 안내 문구 아래에 보이고, 트리거의 `aria-describedby` 로 읽힙니다.
- **끌어 올리면 색이 바뀝니다.** 파일을 끌어 올리는 동안 영역이 `bg-primary-soft` 로 바뀝니다. 안내 문구는 그대로입니다.

```tsx
import { Field, FileDropzone, useFileField } from '@gsainfoteam/ids-react';

const fileField = useFileField({ limits: { maxSize: 5 * 1024 * 1024 } });

<Field>
  <Field.Label>증빙 자료</Field.Label>
  <FileDropzone name="evidence" multiple accept="image/*,.pdf" fileField={fileField}>
    <FileDropzone.Title>파일을 끌어다 놓거나 눌러서 고르세요</FileDropzone.Title>
    <FileDropzone.Limits>이미지, PDF · 파일당 최대 5 MB</FileDropzone.Limits>
    <FileDropzone.Rejection>
      {({ file }) => `${file.name}: 올릴 수 없는 파일입니다.`}
    </FileDropzone.Rejection>
  </FileDropzone>
</Field>;
```

## 값

```tsx
<FileDropzone value={file} onValueChange={setFile} />                // File | null

<FileDropzone multiple value={files} onValueChange={setFiles} />     // File[]
```

- 고른 파일은 영역 아래 목록에 보입니다. 하나만 받아도 목록으로 보입니다.
- 쌓기, 중복, 거부 규칙은 FileField 와 같습니다. `maxSize`, `maxCount`, `onReject` 는 `useFileField({ limits })` 에 주고 결과를 `fileField` 로 넘깁니다.

## 구성

```tsx
<FileDropzone multiple>
  <FileDropzone.Title>파일을 끌어다 놓으세요</FileDropzone.Title>
  <FileDropzone.Trigger /> {/* 생략하면 아이콘 + Title + Limits */}
  <FileDropzone.List>
    {(files) =>
      files.map((file) => (
        <FileDropzone.Item key={file.name} file={file}>
          <FileDropzone.Preview file={file} />
          <Item.Content>
            <Item.Title truncate>{file.name}</Item.Title>
          </Item.Content>
          <Item.Actions>
            <FileDropzone.Remove file={file} />
          </Item.Actions>
        </FileDropzone.Item>
      ))
    }
  </FileDropzone.List>
</FileDropzone>
```

- part 는 FileField 와 같습니다: `Trigger`, `Value`, `Clear`, `List`, `Item`, `Remove`, `Preview`, `Limits`, `Rejection`. `FileField.Trigger` 처럼 FileField 의 이름으로 써도 같게 동작합니다.
- `Title` 은 FileDropzone 에만 있습니다. `<span>` 이고, `asChild` 를 받습니다.
- children 을 생략하면 `Trigger` 와 `List` 가 나옵니다. `Clear` 는 직접 둘 때만 나옵니다.
- `Trigger` 는 꼭 하나 둡니다. `Clear`, `List`, `Item` 은 `Trigger` 안이 아니라 옆에 둡니다.
- 루트에 둔 `Title` 과 `Limits` 는 기본 트리거 안으로 들어갑니다. `Trigger` 에 children 을 주면 둘도 그 안에 직접 둡니다.

## 상태

앱은 상태를 런타임 값으로 읽습니다. DOM 의 `data-*` 속성은 IDS 내부 스타일용이라 문서에 두지 않고 지키겠다고 약속하지도 않습니다.

```tsx custom-design
<FileDropzone className={(state) => (state.dragging ? 'ring-2' : undefined)} />
```

- 값은 `value` / `onValueChange`, 거부된 파일은 `useFileField` 의 `limits.onReject` 로 읽습니다. 비어 있는지는 `null` 이나 빈 배열로 압니다.
- `disabled`, `readOnly`, `required`, `multiple` 은 앱이 준 값 그대로입니다.
- 상태의 `invalid` 는 `aria-invalid` 나 감싼 `Field` 의 `invalid` 가 켜졌을 때, 또는 `onReject` 로 받은 거부 파일이 남아 있는 동안 켜집니다.
- 새 디자인(`custom-design`)에서만 루트와 `Trigger` 의 `className` 에 `FileDropzone.State`(`dragging`, `disabled`, `readOnly`, `invalid`, `required`, `empty`, `multiple`)를 받는 함수를 줍니다.
- 파일을 끌어 올리고 있는지(`dragging`)는 값이나 콜백으로 나오지 않고 위 함수로만 받습니다.

## 크기, variant

```tsx
<FileDropzone variant="soft" />   // outline(기본, 점선 테두리) / soft(채움) / ghost(테두리 없음)
<FileDropzone size="tiny" />      // standard / tiny. 생략하면 Field 를 따른다
<FileDropzone aria-invalid />     // danger 테두리. Field 안이면 Field 의 invalid 를 따른다
```

## 속성

FileField 와 같습니다. 다른 것만 적습니다.

| 속성          | 기본 / 동작                                            |
| ------------- | ------------------------------------------------------ |
| `placeholder` | 없음. 안내 문구는 `FileDropzone.Title` 로 둔다         |
| `variant`     | `outline`(기본) / `soft` / `ghost`                     |

## 알아둘 것

- `accept` 는 이름과 형식만 봅니다. 파일 내용은 서버에서도 검증하세요.
- 업로드, 진행률, 서버 저장은 앱이 맡습니다.
