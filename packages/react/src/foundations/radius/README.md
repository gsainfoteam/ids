# Radius

모서리는 세 단계뿐입니다. 컨트롤은 크기와 상관없이 12px이고, 안쪽 여백이 있는 상자는 여백만큼 모서리를 키웁니다.

- **작은 스케일.** `standard`(12px), `indicator`(4px), `full` 세 가지이고 `sm` `md` `lg` 는 없습니다.
- **같은 중심.** `concentric-p-*` 상자의 모서리는 안쪽 내용의 모서리에 여백을 더한 값이라, 안팎의 곡선이 같은 중심을 가집니다.

```tsx
<Button className="rounded-standard" />        // 모든 컨트롤 (기본값)
<span className="rounded-indicator size-4" />  // 24px 미만의 작은 상자: 체크박스, Kbd
<span className="rounded-full" />              // 알약, 원

<div className="concentric-p-4">                // 여백 16px, 모서리 12 + 16 = 28px
  <Button>저장</Button>
</div>
```

## 스케일

| 클래스              | 값     | 쓰임                                       |
| ------------------- | ------ | ------------------------------------------ |
| `rounded-standard`  | 12px   | Button, 필드, 팝업 안 항목 등 모든 컨트롤  |
| `rounded-indicator` | 4px    | 24px보다 작은 상자. 12px이면 원처럼 보인다 |
| `rounded-full`      | 9999px | 알약, 아바타, 스위치                       |

## 여백만큼 커지는 모서리

```tsx
<div className="concentric-p-4">                        {/* 12 + 16 = 28px */}
  <div className="concentric-p-2">                      {/* 12 + 8 = 20px, 바깥은 12 + 16 + 8 = 36px */}
    <Button>저장</Button>
  </div>
</div>

<div className="concentric-p-3 px-4" />                 {/* 모서리는 12 + 12, 가로 여백만 16px */}
```

- Card, Alert, Item, 팝업처럼 여백이 있는 상자는 `p-*` 와 손으로 계산한 `rounded-*` 대신 `concentric-p-*` 를 씁니다.
- 두 단계 중첩까지 정확합니다. 팝오버는 DOM에서 안에 있어도 시각적으로 겹치지 않으므로 계산에서 빠집니다.
- `rounded-[10px]` 같은 값을 직접 쓰지 않습니다.
