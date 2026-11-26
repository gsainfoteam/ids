# ChipGroup

여러 [Chip](../chip/README.md) 을 한 줄로 묶어 줄바꿈합니다. Chip 의 일부가 아니라 여러 Chip 을 담는 그릇이라, `Chip.Group` 이 아닌 별도 컴포넌트입니다.

- **칩 사이 간격.** `flex-wrap` 으로 칩을 늘어놓고, 간격은 `size` 를 따릅니다(`standard` 8px, `tiny` 6px).
- **설정을 잇습니다.** `size` 는 안의 Chip 으로 이어집니다. Chip 에 직접 준 값이 이깁니다.
- **지운 뒤 포커스.** 그룹 안의 칩을 키보드로 지우면 포커스가 같은 그룹의 옆 칩으로 갑니다. 그룹 밖의 칩은 포커스를 옮기지 않습니다.
- **시멘틱.** `role="group"` 인 `<div>` 입니다. 이름은 `aria-label` 이나 `aria-labelledby` 로 줍니다.

```tsx
import { Chip, ChipGroup } from '@gsainfoteam/ids-react';

<ChipGroup aria-label="태그">
  {tags.map((tag) => (
    <Chip key={tag} onRemove={() => removeTag(tag)}>
      {tag}
    </Chip>
  ))}
</ChipGroup>;
```

| 속성      | 기본 / 동작                                       |
| --------- | ------------------------------------------------- |
| `size`    | `standard`(기본) / `tiny`. 간격과 안의 Chip 크기 |
| `asChild` | `<div>` 대신 자식 요소(`<ul>`)에 속성을 합친다    |
| 그 외     | `<div>` 의 native 속성                            |

## 크기 계약

- **fill.** 그룹은 부모 폭을 채우고, 넘치는 칩은 다음 줄로 내려갑니다.
- 칩 하나하나는 글 폭만큼입니다(hug).

## 목록으로

```tsx
<ChipGroup asChild aria-label="관심사">
  <ul>
    {interests.map((interest) => (
      <li key={interest}>
        <Chip>{interest}</Chip>
      </li>
    ))}
  </ul>
</ChipGroup>
```

- `asChild` 면 `role="group"` 을 붙이지 않아 `<ul>` 이 목록으로 읽힙니다. `<li>` 는 앱이 씁니다.

## 상태

- 그룹은 스스로 정하는 상태가 없습니다. 칩의 켜짐과 지우기는 각 Chip 의 `selected`, `onSelectedChange`, `onRemove` 로 읽습니다.
