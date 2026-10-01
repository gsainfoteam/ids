# Size

`packages/core/tokens/size.json` 의 컨트롤 높이와 아이콘 크기입니다. `IdsSize` 의 `standard` 와 `tiny` 두 단계뿐입니다.

- **컨트롤이 함께 맞춥니다.** Button, IconButton, 필드, Select 가 같은 높이를 써서 한 줄에 섞어도 높이가 같습니다.
- **아이콘은 크기를 따릅니다.** 크기 클래스가 없는 `svg` 는 컨트롤 크기의 아이콘 크기로 그려집니다.

```tsx
<Button size="tiny">저장</Button>
<div className="h-(--ids-size-control-standard)" />
<svg className="size-(--ids-size-icon-standard)" />
```

| 변수                          | 값   | 쓰임                     |
| ----------------------------- | ---- | ------------------------ |
| `--ids-size-control-standard` | 36px | 기본 컨트롤 높이         |
| `--ids-size-control-tiny`     | 32px | 작은 컨트롤 높이         |
| `--ids-size-icon-standard`    | 16px | 기본 컨트롤 안 아이콘    |
| `--ids-size-icon-tiny`        | 14px | 작은 컨트롤 안 아이콘    |

- `sm` `md` `lg` 는 없습니다. 기본값 이름이 `standard` 인 것은 Dart 에서 `default` 가 예약어이기 때문입니다.
