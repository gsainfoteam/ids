# theme

IdsProvider 와 그 테마 객체입니다. 앱이 넘긴 `IdsTheme` 을 색 역할, radius, 글자 스타일로 풀어 IDS 컴포넌트에 내려줍니다.

- 설계는 ids-react 의 [IdsProvider](../../../react/src/components/utility/ids-provider/README.md) 를 따릅니다. 규칙을 바꿀 때는 React 를 먼저 바꾸고 이쪽을 맞춥니다.
- 색을 고르는 계산은 [`lib/src/color`](../src/color/README.md) 에 있습니다. 이 폴더는 입력을 받고, 결과를 캐시하고, 위젯 트리로 내려주는 일만 합니다.

## 모듈 목록

| 모듈                       | 내용                                                                                  | 쓰는 곳                                  |
| -------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| `ids_palette.dart`         | `IdsThemeColor`(`seed`, 50~950 `IdsRamp`, 모드별 9단계 `IdsPalette`), `fromSeed`  | 앱, `ids_theme.dart`, `src/color`        |
| `ids_theme.dart`           | `IdsTheme`, `IdsThemeOverrides`, `IdsNeutral`, `IdsStatus`, `IdsCornerShape`, `IdsThemeIssue` | 앱, `ids_provider.dart`                  |
| `ids_resolved_theme.dart`  | `IdsResolvedTheme`(색, radius, `textStyle`, `dimension`, `shape`), `IdsRadius`, `checkIdsTheme` | `ids_provider.dart`, `ids_scope.dart`, 테스트 |
| `ids_provider.dart`        | `IdsProvider`, `IdsProviderScope`. 모드 소유, 테마 병합, 캐시, 개발 경고               | 앱                                       |
| `ids_scope.dart`           | `InheritedWidget`. `IdsProvider.of(context)` 가 돌려주는 값                           | 모든 IDS 컴포넌트                        |

## ids_resolved_theme.dart

- 색은 테마의 색 필드(primary, secondary, tertiary, neutral, status)를 키로 `resolveColors` 결과를 32개까지 캐시합니다. light 와 dark 는 한 번에 풀립니다.
- `IdsRadius.of` 는 React 의 `--ids-theme-radius-*` 계산과 같습니다. `indicator` 는 ×0.4, `container` 는 ×1.6, squircle 은 그린 반지름에 1.84 를 곱합니다. 이 값을 바꾸면 두 플랫폼의 모서리가 달라집니다.
- `textStyle` 은 토큰에서 새 `TextStyle` 을 만들고 `inherit: false` 를 둡니다.
  - `copyWith` 는 `package: null` 일 때 원래 패키지를 남기므로 앱 글꼴을 ids_flutter 안에서 찾습니다.
  - `inherit: true` 이면 `Text` 가 조상의 글꼴 패키지를 다시 합칩니다.
- `scale` 은 `textStyle` 의 글자 크기, `dimension`, radius 에 곱합니다. 시스템 글자 배율은 Flutter 가 따로 적용합니다.

## ids_provider.dart

- 가장 바깥 `IdsProvider` 는 `theme.primary` 가 있어야 합니다. 없으면 `FlutterError` 를 던집니다.
- `IdsProviderScope` 는 부모 테마에 자기 `IdsThemeOverrides` 를 덮습니다(`merge`). 풀린 색은 병합한 테마로 캐시하므로 radius 만 바꾼 scope 는 부모와 같은 색을 다시 계산하지 않습니다. 색 필드를 쓴 scope 만 색 경고를 냅니다.
- `mode` 나 `defaultMode` 를 가진 provider 가 모드를 소유합니다. 나머지는 `setMode`, `toggleMode` 를 소유한 조상에게 넘깁니다. `IdsMode.system` 은 플랫폼 밝기를 구독합니다.
- 개발 빌드에서 자기 테마의 문제(`checkIdsTheme`)를 `debugPrint('[IDS] ...')` 로 한 번 알립니다.
- `locale` 은 `IdsLocale` 하나입니다. 문구(`messages`)와 날짜·숫자 형식(`locale`)을 함께 바꾸고, 다른 `IdsLocale` 로 바꾸면 의존 위젯이 다시 그려집니다. 비교는 `locale` 과 `messages` 의 `==` 입니다.
- `locale` 이 없으면 부모의 것을 쓰고, 가장 바깥이면 `_localeOfTheApp` 이 `Localizations.maybeLocaleOf` 를 읽습니다. 언어가 같은 실린 문구를 앱의 `Locale` 과 묶고, 없으면 `IdsLocale.ko` 입니다. `Localizations` 에 의존하므로 앱 로케일이 바뀌면 다시 풉니다.
- `IdsLocale`, `IdsMessagesBase`, `IdsMessagesKo`, `IdsMessagesEn` 은 `packages/core/dart-messages.mjs` 가 만듭니다. 숫자 인자는 각 문구 클래스의 태그(ko-KR, en-US)로 `intl` 의 `NumberFormat` 이 씁니다.
- Material, Cupertino 테마나 전역 `DefaultTextStyle` 을 넣지 않습니다. IDS 스타일은 IDS 컴포넌트 안에만 머뭅니다.
