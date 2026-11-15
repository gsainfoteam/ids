# ids_flutter

IDS Flutter 컴포넌트 라이브러리.

## 설치

[pub.dev](https://pub.dev/packages/ids_flutter) 에서 배포한다.

```yaml
dependencies:
  ids_flutter: ^0.1.1
```

```bash
flutter pub get
```

## 설정

앱 최상단에 `ThemeProvider` 추가:

```dart
import 'package:ids_flutter/ids.dart';

void main() {
  runApp(
    ThemeProvider(
      color: IdsColor.blue,
      mode: IdsMode.light,
      child: const MyApp(),
    ),
  );
}
```

`ThemeProvider` 없이는 `ThemeProvider.of(context)` 호출 시 에러가 발생한다.

## ThemeProvider

| 파라미터 | 타입 | 기본값 |
|---|---|---|
| `color` | `IdsColor` | `IdsColor.blue` |
| `mode` | `IdsMode` | `IdsMode.light` |

- `IdsColor` 는 17색이다: `red` `orange` `amber` `yellow` `lime` `green` `emerald` `teal` `cyan` `sky` `blue` `indigo` `violet` `purple` `fuchsia` `pink` `rose`.
- `orange` `amber` `yellow` `lime` `emerald` `teal` `cyan` `sky` 는 `onPrimary` 가 검은색이다.

테마 접근:

```dart
final theme = ThemeProvider.of(context);
// theme.primary, theme.onPrimary, theme.secondary, theme.onSecondary, theme.accent, ...
```

- `accent` 는 배경 채움 없이 페이지 위에 놓이는 브랜드 글자와 아이콘 색이다. `surface` 와 `secondary` 위에서 대비 4.5:1 을 넘는다.

## IdsPalette

앱 브랜드 색 하나로 `50`–`950` 팔레트를 만든다:

```dart
final palette = IdsPalette.fromSeed(const Color(0xFF0D9488));

palette[500];     // Color
palette.colors;   // 50 부터 950 까지 11색
IdsPalette.steps; // [50, 100, ..., 950]
```

- ids-react 의 `createIdsPalette` 와 같은 모델을 쓰고, 같은 시드에서 같은 8비트 색을 낸다.
- 모델 계수는 `packages/core/palette-model.json` 에 고정돼 있고, `pnpm codegen` 이 `lib/tokens/ids_palette_model.dart` 로 옮긴다.
- 시드 색은 바뀌지 않고, 명도가 가장 가까운 단계에 그대로 들어간다.
- 시드의 alpha 는 무시한다.
- 상태 팔레트는 `IdsStatusPalettes.red` `yellow` `green` `sky` 에 있다.
- 아직 `ThemeProvider` 는 `IdsPalette` 를 받지 않는다. 지금은 `IdsColor` 로 고른다.

## 컴포넌트

### IdsButton

```dart
IdsButton(
  onPressed: () {},
  variant: IdsVariant.solid,
  size: IdsSize.standard,
  child: const Text('클릭'),
)
```

| 파라미터 | 타입 | 기본값 |
|---|---|---|
| `variant` | `IdsVariant` | `IdsVariant.solid` |
| `size` | `IdsSize` | `IdsSize.standard` |
| `disabled` | `bool` | `false` |

**IdsVariant**: `solid`, `soft`, `outline`, `ghost`

**IdsSize**: `standard`, `tiny`

## 토큰 직접 사용

```dart
import 'package:ids_flutter/ids.dart';

// 간격
SizedBox(height: IdsSpacing.md)

// 타이포그래피
Text('제목', style: IdsTypography.headlineH5Semibold)

// 애니메이션 지속시간
AnimatedOpacity(duration: IdsMotion.fast, ...)
```

## 개발

```bash
cd packages/flutter
flutter pub get
flutter test
```
