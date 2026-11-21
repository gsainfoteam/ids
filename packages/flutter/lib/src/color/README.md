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
| `palette_seed.dart`     | `palette-seed.ts`                   | 색 하나로 50~950 램프 만들기, hue·채도 비율 읽기, hue 돌리기          |
| `palette_scales.dart`   | `palette-scales.ts`                 | 램프에서 모드별 9단계 스케일 만들기(`scaleRules`), state layer 아래 대비, neutral 스케일 |
| `contrast.dart`         | `contrast.ts`, colorjs.io           | APCA `contrastApca`, Lc 기준(75, 60, 45), 적록 색약 시뮬레이션        |
| `status.dart`           | `status.ts`                         | 상태 hue 범위, harmonized(primary 쪽 최대 15°), fixed 팔레트          |
| `derived_brands.dart`   | `derived-brands.ts`                 | 빠진 secondary(채도 1/3), tertiary(+60° 또는 −60°)                   |
| `theme_roles.dart`      | `theme-roles.ts`                    | 테마 색 읽기(seed, 램프, 스케일), 스케일 단계를 역할로 옮기고 대비 검사, tinted neutral, `resolveColors` |
| `theme_checks.dart`     | `theme-checks.ts`                   | 브랜드끼리, 브랜드와 상태가 너무 가까운지, 색약에서 danger 와 겹치는지 |
| `color_distance.dart`   | `color-distance.ts`                 | OKLab 거리 기준값                                                   |

## 알아둘 것

- OKLab 행렬은 culori 4 의 값입니다. Flutter 에 OKLab 보간이 없어 직접 둡니다. 행렬이나 반올림을 바꾸면 경계에 있는 단계가 대비 검사를 다르게 통과합니다.
- APCA 는 colorjs.io 0.0.98G 상수를 씁니다. WCAG 2 대비는 쓰지 않습니다.
- hover, press 역할은 없습니다. 글자는 쉴 때의 배경과 그 위 state layer 두 겹 아래에서 함께 잽니다.
  - `withStateLayer(base, layer, opacity)`: 채널마다 `base + opacity × (layer − base)` 로 sRGB 에서 섞고 8비트로 반올림한다. React 의 `withStateLayer`(culori `rgb` 보간)와 같다.
  - `underStateLayers(base, layers)`: 쉴 때의 배경과 층마다의 hover, press 배경.
  - `_firstReadableOn`, `_lowestContrastUnderStateLayers`: React 의 `firstReadableOn`, `lowestContrastUnderStateLayers`.
- 다크 스케일의 1~5 단계는 페이지에서 램프 950, 900 … 으로 이어지는 선 위에서 같은 번호 neutral 단계와 OKLab 밝기가 같은 점입니다(`onRampAtLightness`, `mixOklab`).
- `IdsPalette` 로 받은 계열은 hue 계산(harmonized, 파생 브랜드, 거리 검사)에 light 7단계로 만든 램프를 씁니다.
- 입력 색은 먼저 불투명 8비트 sRGB 로 맞춥니다(`parseThemeColor`). 알파와 P3 는 React 의 CSS 색 파싱처럼 버려집니다.
