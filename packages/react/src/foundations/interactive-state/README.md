# InteractiveState

IDS 컴포넌트는 hover, press, focus 상태를 스스로 가지고, 그 상태를 바깥에 두 가지 방식으로만 보여 줍니다.

- **컴포넌트 안에서.** `variant`, `className`, `style`, `children` 에 `(state) => 값` 을 넘기면 그 컴포넌트와 자손이 상태에 반응합니다.
- **CSS로.** 요소에 `data-hovered`, `data-active`, `data-pressed`, `data-focus-visible`, `data-disabled` 가 붙어 `data-hovered:*` 같은 클래스로 꾸밉니다.
- **형제에게.** 옆 요소가 스크립트로 반응해야 하면 `onInteractionChange` 로 상태의 사본을 받습니다.

```tsx
<Button variant={(state) => (state.hovered ? 'solid' : 'outline')}>
  {(state) => (state.hovered ? '올라왔어요' : '올려 보세요')}
</Button>

<Button className="data-hovered:inset-ring-(--ids-color-primary)">테두리</Button>

const [interaction, setInteraction] = useState(INTERACTIVE_STATE_DEFAULTS);
<Button onInteractionChange={setInteraction}>올려 보세요</Button>
{interaction.hovered && <Hint />}
```

## 상태

| 상태           | 뜻                                             |
| -------------- | ---------------------------------------------- |
| `hovered`      | 마우스가 올라와 있다. 터치에서는 켜지지 않는다 |
| `active`       | 누르고 있다                                    |
| `pressed`      | 토글이 눌린 상태다                             |
| `focused`      | 포커스가 있다                                  |
| `focusVisible` | 키보드로 포커스가 왔다                         |
| `disabled`     | 비활성이다                                     |

- DOM에는 `pressed` > `active` > `hovered` 순서로 하나만 붙어, 같은 배경색을 두고 다투지 않습니다.

## 알아둘 것

- hover를 부모가 제어하는 prop으로 올리지 않습니다. 상태의 주인은 컴포넌트입니다.
- 형제의 스타일만 바꾸면 되면 스크립트 대신 Tailwind `group` / `peer` 와 `data-*` 로 충분합니다.
