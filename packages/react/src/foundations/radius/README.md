# Radius

컨트롤은 크기와 상관없이 10px이고, 안쪽 여백이 있는 상자는 여백만큼 모서리를 키우되 16px 에서 멈춥니다.

- **작은 스케일.** `standard`(10px), `indicator`(4px), `container`(16px), `full` 이고 `sm` `md` `lg` 는 없습니다.
- **같은 중심.** `concentric-p-*` 상자의 모서리는 안쪽 내용의 모서리에 여백을 더한 값이라, 안팎의 곡선이 같은 중심을 가집니다.
- **16px 에서 멈춤.** 여백이 크거나 상자가 겹쳐도 `container`(16px)를 넘지 않습니다.

```tsx
<Button className="rounded-standard" />        // 모든 컨트롤 (기본값)
<span className="rounded-indicator size-4" />  // 24px 미만의 작은 상자: 체크박스, Kbd
<span className="rounded-full" />              // 알약, 원

<div className="concentric-p-1">                // 여백 4px, 모서리 10 + 4 = 14px
  <Button>저장</Button>
</div>
```

## 스케일

| 클래스              | 값     | 쓰임                                       |
| ------------------- | ------ | ------------------------------------------ |
| `rounded-standard`  | 10px   | Button, 필드, 팝업 안 항목 등 모든 컨트롤  |
| `rounded-indicator` | 4px    | 24px보다 작은 상자. 10px이면 원처럼 보인다 |
| `rounded-container` | 16px   | 여백이 있는 상자가 커질 수 있는 최대값     |
| `rounded-full`      | 9999px | 알약, 아바타, 스위치                       |

## 여백만큼 커지는 모서리

```tsx
<div className="concentric-p-1.5">                      {/* 10 + 6 = 16px */}
  <Button>저장</Button>
</div>

<div className="concentric-p-4">                        {/* 10 + 16 = 26px → 16px */}
  <div className="concentric-p-1">                      {/* 10 + 4 = 14px */}
    <Button>저장</Button>
  </div>
</div>
```

- Card, Alert, Item, 팝업처럼 여백이 있는 상자는 `p-*` 와 손으로 계산한 `rounded-*` 대신 `concentric-p-*` 를 씁니다.
- 공식은 모서리에 10px 컨트롤이 붙어 있다고 봅니다. Card, Dialog, Toast 처럼 모서리에 글자나 빈 곳이 오는 상자는 합이 크면 과하게 둥글어서 16px 에서 멈춥니다.
- 두 단계 중첩까지 정확하고, 갈래가 여럿이면 가장 두꺼운 쪽을 따릅니다.
- 팝오버는 DOM 에서 안에 있어도 top layer 에 따로 그려지므로 바깥 상자의 계산에서 빠집니다. 팝오버 안의 상자는 페이지에서와 똑같이 더해집니다(오버레이 안의 오버레이까지).
- `rounded-[14px]` 같은 값을 직접 쓰지 않습니다.
- Storybook `Foundations/Radius` 의 Scale 은 `radius.json` 의 토큰이 모두 그려지고 값이 맞는지 검사합니다.
