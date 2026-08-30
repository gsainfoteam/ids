# ids_flutter

IDS Flutter 컴포넌트 라이브러리.

## 설치

pub.dev에 배포하지 않는다. `pubspec.yaml`에서 git dependency로 참조한다.

```yaml
dependencies:
  ids_flutter:
    git:
      url: https://github.com/gsainfoteam/ids.git
      path: packages/flutter
      ref: v0.1.0
```

`ref`는 릴리스 태그다. 생략하면 `main`을 따라가므로 항상 태그를 고정한다.
퍼블릭 레포라 토큰은 필요 없다.

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

테마 접근:

```dart
final theme = ThemeProvider.of(context);
// theme.primary, theme.onPrimary, theme.secondary, ...
```

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
