# KbdGroup

여러 [Kbd](../kbd/README.md) 를 하나의 입력으로 묶습니다. Kbd 의 일부가 아니라 여러 Kbd 를 담는 그릇이라, `Kbd.Group` 이 아닌 별도 컴포넌트입니다.

- **시멘틱 구성.** `<kbd>` 안에 `<kbd>` 를 넣어 여러 키가 하나의 입력임을 나타냅니다. HTML 이 정한 키 조합 표기입니다.
- **설정을 잇습니다.** `size`, `platform`, `labels` 는 안쪽 Kbd 로 이어집니다. Kbd 에 직접 준 값이 이깁니다.
- **글자와 같은 높이.** 문장 속 묶음은 Kbd 처럼 주변 글자의 대문자 높이 가운데에 섭니다.

```tsx
import { Kbd, KbdGroup } from '@gsainfoteam/ids-react';

<KbdGroup size="tiny">
  <Kbd keys="Mod" />
  <span>다음</span>
  <Kbd>G</Kbd>
</KbdGroup>
```

- `keys="Mod+K"` 처럼 한 번에 누르는 단축키는 Kbd 하나로 적습니다. Kbd 가 같은 묶음을 알아서 만듭니다. KbdGroup 은 `G` 다음 `S` 처럼 문자열 하나로 적을 수 없는 입력에 씁니다.

## 상태

| 상태          | 뜻                                       |
| ------------- | ---------------------------------------- |
| `size`        | 적용된 크기                              |
| `platform`    | 그린 플랫폼. `mac` / `windows` / `linux` |
| `combination` | 늘 `true`                                |

## 속성

| 속성        | 기본 / 동작                                           |
| ----------- | ----------------------------------------------------- |
| `size`      | `standard` / `tiny`. 생략하면 Field → `standard`      |
| `platform`  | `mac` / `windows` / `linux`. 생략하면 기기를 따른다   |
| `labels`    | 안쪽 Kbd 의 스크린 리더 이름                          |
| `className` | 바깥 `<kbd>` 로 간다. 상태를 받는 함수도 된다         |
| 그 외 속성  | `<kbd>` 로 간다                                       |
