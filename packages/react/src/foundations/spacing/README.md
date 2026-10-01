# Spacing

`packages/core/tokens/spacing.json` 의 이름 붙은 간격입니다. 모두 Tailwind 의 4px 눈금 위에 있습니다.

- **Tailwind 단계로 씁니다.** CSS 변수로 나가지 않으므로 `p-4`, `gap-2` 처럼 씁니다.
- **이름은 설계 용어.** 스펙과 리뷰에서 `md 여백` 처럼 부를 때 씁니다.

```tsx
<div className="flex flex-col gap-2 p-4">  {/* sm 간격, md 여백 */}
  <h3 className="text-subtitle-s2-semibold">제목</h3>
  <p className="text-body-b3-regular">설명</p>
</div>
```

| 이름  | 값   | Tailwind       |
| ----- | ---- | -------------- |
| `xs`  | 4px  | `p-1` `gap-1`  |
| `sm`  | 8px  | `p-2` `gap-2`  |
| `md`  | 16px | `p-4` `gap-4`  |
| `lg`  | 24px | `p-6` `gap-6`  |
| `xl`  | 32px | `p-8` `gap-8`  |
| `xxl` | 48px | `p-12` `gap-12` |

- 여백이 있는 상자는 `p-*` 대신 `concentric-p-*` 를 씁니다. [Radius](../radius/README.md) 를 참고합니다.
