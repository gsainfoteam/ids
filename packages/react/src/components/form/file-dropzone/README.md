# FileDropzone

파일을 끌어다 놓거나, 눌러서 고르거나, 붙여넣어 첨부하는 넓은 영역입니다.

- **FileField 와 같은 동작.** 값, 제한과 거부, 미리보기, 폼, react-hook-form 연결은 [FileField](../file-field/README.md) 와 같습니다. 두 컴포넌트는 같은 내부 훅을 씁니다.
- **필드 모양이 필요하면 FileField.** 한 줄짜리 필드 안에 파일 이름을 보여 줍니다.
- **규칙을 먼저 보여 줍니다.** `accept`, `maxSize`, `maxCount` 를 주면 `PDF, 이미지 · 파일당 최대 5 MB · 최대 5개` 처럼 영역 안에 보이고, 트리거의 `aria-describedby` 로 읽힙니다.
- **끌어 올리면 색이 바뀝니다.** 파일을 끌어 올리는 동안 영역이 `bg-primary-soft` 로 바뀌고 안내 문구가 `여기에 놓으세요` 로 바뀝니다.

```tsx
import { Field, FileDropzone } from '@gsainfoteam/ids-react';

<Field>
  <Field.Label>증빙 자료</Field.Label>
  <FileDropzone name="evidence" multiple accept="image/*,.pdf" maxSize={5 * 1024 * 1024} />
</Field>;
```

## 값

```tsx
<FileDropzone value={file} onValueChange={setFile} />                // File | null

<FileDropzone multiple value={files} onValueChange={setFiles} />     // File[]
```

- 고른 파일은 영역 아래 목록에 보입니다. 하나만 받아도 목록으로 보입니다.
- 쌓기, 중복, 거부 규칙은 FileField 와 같습니다.

## 구성

```tsx
<FileDropzone multiple>
  <FileDropzone.Trigger /> {/* 생략하면 아이콘 + 안내 문구 + 규칙 */}
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

- part 는 FileField 와 같습니다: `Trigger`, `Value`, `Clear`, `List`, `Item`, `Remove`, `Preview`. `FileField.Trigger` 처럼 FileField 의 이름으로 써도 같게 동작합니다.
- children 을 생략하면 `Trigger` 와 `List` 가 나옵니다. `Clear` 는 직접 둘 때만 나옵니다.
- `Trigger` 는 꼭 하나 둡니다. `Clear`, `List`, `Item` 은 `Trigger` 안이 아니라 옆에 둡니다.

## 상태와 data 속성

| 요소   | 속성                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| 루트   | `data-file-dropzone`, `data-dragging`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-empty` |
| 트리거 | `data-dragging`, `data-placeholder`                                                                                    |

- 루트와 `Trigger` 의 `className` 은 `FileDropzone.State` 를 받는 함수도 됩니다.

## 크기, variant

```tsx
<FileDropzone variant="soft" />   // outline(기본, 점선 테두리) / soft(채움) / ghost(테두리 없음)
<FileDropzone size="tiny" />      // standard / tiny. 생략하면 Field 를 따른다
<FileDropzone invalid />          // danger 테두리
```

## 속성

FileField 와 같습니다. 다른 것만 적습니다.

| 속성          | 기본 / 동작                            |
| ------------- | -------------------------------------- |
| `placeholder` | `파일을 끌어다 놓거나 눌러서 고르세요` |
| `variant`     | `outline`(기본) / `soft` / `ghost`     |

## 알아둘 것

- `accept` 는 이름과 형식만 봅니다. 파일 내용은 서버에서도 검증하세요.
- 업로드, 진행률, 서버 저장은 앱이 맡습니다.
