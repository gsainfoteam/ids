# color

팔레트에서 색 역할을 고르는 계산입니다. ids-react 의 `ids-provider` 모듈을 한 줄씩 옮겼습니다.

- 두 플랫폼은 같은 테마에서 같은 8비트 색을 내야 합니다. [`theme_roles_parity_test.dart`](../../../test/theme_roles_parity_test.dart) 가 `packages/core/tests/fixtures/theme-roles.json` 과 모든 역할을 비교합니다.
- fixture 는 React 의 `tests/flutter-parity.test.ts` 가 씁니다. 규칙을 바꾸면 두 포트와 fixture 를 한 커밋에 바꿉니다.

```bash
pnpm --filter @gsainfoteam/ids-react exec vitest run --project node tests/flutter-parity.test.ts -u
```

## 모듈 목록

| 모듈                    | React 원본                          | 내용                                                                 |
| ----------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `oklch.dart`            | culori                              | sRGB, OKLab, OKLCH 변환, `clampChroma`, OKLab 섞기와 거리           |
| `palette_seed.dart`     | `palette-seed.ts`                   | 색 하나로 11단계 팔레트 만들기, hue·채도 비율 읽기, hue 돌리기        |
| `contrast.dart`         | `contrast.ts`, colorjs.io           | APCA `contrastApca`, Lc 기준(75, 60, 45), 적록 색약 시뮬레이션        |
| `status.dart`           | `status.ts`                         | 상태 hue 범위, harmonized(primary 쪽 최대 15°), fixed 팔레트          |
| `derived_brands.dart`   | `derived-brands.ts`                 | 빠진 secondary(채도 1/3), tertiary(+60° 또는 −60°)                   |
| `theme_roles.dart`      | `theme-roles.ts`                    | 계열마다 fill, soft, 텍스트, 테두리 단계 고르기, neutral, `resolveColors` |
| `theme_checks.dart`     | `theme-checks.ts`                   | 브랜드끼리, 브랜드와 상태가 너무 가까운지, 색약에서 danger 와 겹치는지 |
| `color_distance.dart`   | `color-distance.ts`                 | OKLab 거리 기준값                                                   |

## 알아둘 것

- OKLab 행렬은 culori 4 의 값입니다. Flutter 에 OKLab 보간이 없어 직접 둡니다. 행렬이나 반올림을 바꾸면 경계에 있는 단계가 대비 검사를 다르게 통과합니다.
- APCA 는 colorjs.io 0.0.98G 상수를 씁니다. WCAG 2 대비는 쓰지 않습니다.
- fill 의 hover, press 는 글자색 반대쪽(검정 또는 흰색)으로 10%, 20% 섞고, soft 의 hover, press 는 fill 쪽으로 6%, 12% 섞습니다. 모두 OKLab 에서 섞고 8비트로 자릅니다.
- 입력 색은 먼저 불투명 8비트 sRGB 로 맞춥니다(`parsePalette`). 알파와 P3 는 React 의 CSS 색 파싱처럼 버려집니다.
