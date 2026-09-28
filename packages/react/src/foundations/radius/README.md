# Radius

모서리는 세 단계뿐입니다. 컨트롤은 크기와 상관없이 10px이고, 안쪽 여백이 있는 상자는 여백만큼 모서리를 키웁니다.

- **작은 스케일.** `standard`(10px), `indicator`(4px), `full` 세 가지이고 `sm` `md` `lg` 는 없습니다.
- **같은 중심.** `concentric-p-*` 상자의 모서리는 안쪽 내용의 모서리에 여백을 더한 값이라, 안팎의 곡선이 같은 중심을 가집니다.

```tsx
<Button className="rounded-standard" />        // 모든 컨트롤 (기본값)
<span className="rounded-indicator size-4" />  // 24px 미만의 작은 상자: 체크박스, Kbd
<span className="rounded-full" />              // 알약, 원

<div className="concentric-p-4">                // 여백 16px, 모서리 10 + 16 = 26px
  <Button>저장</Button>
</div>
```

## 스케일

| 클래스              | 값     | 쓰임                                       |
| ------------------- | ------ | ------------------------------------------ |
| `rounded-standard`  | 10px   | Button, 필드, 팝업 안 항목 등 모든 컨트롤  |
| `rounded-indicator` | 4px    | 24px보다 작은 상자. 10px이면 원처럼 보인다 |
| `rounded-full`      | 9999px | 알약, 아바타, 스위치                       |

## 여백만큼 커지는 모서리

```tsx
<div className="concentric-p-4">                        {/* 10 + 16 = 26px */}
  <div className="concentric-p-2">                      {/* 10 + 8 = 18px, 바깥은 10 + 16 + 8 = 34px */}
    <Button>저장</Button>
  </div>
</div>

<div className="concentric-p-3 px-4" />                 {/* 모서리는 10 + 12, 가로 여백만 16px */}
```

- Card, Alert, Item, 팝업처럼 여백이 있는 상자는 `p-*` 와 손으로 계산한 `rounded-*` 대신 `concentric-p-*` 를 씁니다.
- 두 단계 중첩까지 정확하고, 갈래가 여럿이면 가장 두꺼운 쪽을 따릅니다.
- 팝오버는 DOM 에서 안에 있어도 top layer 에 따로 그려지므로 바깥 상자의 계산에서 빠집니다. 팝오버 안의 상자는 페이지에서와 똑같이 더해집니다(오버레이 안의 오버레이까지).
- `rounded-[14px]` 같은 값을 직접 쓰지 않습니다.
