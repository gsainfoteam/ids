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

## IDS 문구와 slang

IDS 문구의 원본은 `packages/core/messages/ko.json`과 `en.json`이다. IDS 저장소에서 `pnpm codegen`을 실행하면 한국어 Dart 기본 객체와 slang용 `messages/ko.i18n.json`을 생성한다. 배포 패키지는 생성 결과를 포함하므로 서비스가 IDS용 Node 생성기를 실행하지 않는다.

`IdsMessages`는 모든 멤버가 nullable인 mixin이다. `IdsMessages.ko`는 모든 멤버가 non-null인 기본 객체다. 예를 들어 `dialog.close`는 `dialogClose`, `chipField.remove`는 `chipFieldRemove(label: ...)`가 된다. 인자 타입은 slang 기본값과 같은 `Object`이며, 한국어 기본값은 숫자에 한국어 자릿수 구분을 적용한다.

서비스는 slang 4.19.2 이상을 사용하고, 기존 `slang.yaml`에 다음 설정을 합친다.

```yaml
string_interpolation: braces
imports:
  - 'package:ids_flutter/ids.dart'
interfaces:
  IdsMessages:
    generate_mixin: false
```

기존 interpolation이 `dart`라면 설정을 유지하고 아래 `{label}`을 `$label`로 쓴다. JSON을 서비스 카탈로그에 합칠 때 IDS 하위 키 이름을 유지한다.

```json
{
  "ids(singleInterface=IdsMessages)": {
    "dialogClose": "Close",
    "spinnerLabel": "Loading",
    "chipFieldRemove": "Remove {label}"
  }
}
```

서비스의 기존 `dart run slang`으로 생성한 `t.ids`는 `IdsMessages`로 바로 사용할 수 있다. switch나 번역 함수 어댑터는 필요 없다. 전체 기본 문구가 필요하면 패키지의 `messages/ko.i18n.json`을 사용한다. 객체에서 생략된 IDS 멤버는 null이며, 컴포넌트가 `t?.dialogClose ?? IdsMessages.ko.dialogClose`로 한국어를 선택한다. slang 자체의 언어 fallback은 먼저 적용되므로, slang이 문자열을 돌려주면 IDS는 그 값을 사용한다. 빈 문자열도 유효한 번역이다.

IDS 자체 번역 테스트는 아래 순서로 실행한다. `slang`은 IDS의 개발 의존성이고 런타임 의존성이 아니다.

```bash
flutter pub get
dart run slang
flutter test
```
