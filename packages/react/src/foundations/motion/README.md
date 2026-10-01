# Motion

`packages/core/tokens/motion.json` 의 전환 시간입니다.

- **세 단계.** `fast`(150ms), `normal`(250ms), `slow`(400ms) 이고 `--ids-motion-*` 변수와 Flutter `IdsMotion` 으로 나갑니다.
- **곡선은 토큰이 아닙니다.** 대부분 `ease-out` 이고, Drawer 만 vaul 에서 가져온 `cubic-bezier(0.32, 0.72, 0, 1)` 을 씁니다.
- **동작 줄이기를 따릅니다.** 전환에는 `motion-reduce:transition-none` 을 함께 둡니다.

```tsx
<button className="transition-colors duration-(--ids-motion-fast) ease-out motion-reduce:transition-none" />
```

| 토큰     | 값    | 쓰임                                      |
| -------- | ----- | ----------------------------------------- |
| `fast`   | 150ms | hover, press, 색 전환 (Button, Chip, 필드) |
| `normal` | 250ms | Accordion, Progress, Dialog, 필드 팝업    |
| `slow`   | 400ms | Drawer, Toast 처럼 멀리 움직이는 전환     |

- 퇴장 애니메이션은 타이머 없이 `usePresence` 의 `data-ending-style` 로 끝을 기다립니다.
