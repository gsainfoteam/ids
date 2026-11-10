# ids_flutter

IDS Flutter 컴포넌트 라이브러리. [pub.dev](https://pub.dev/packages/ids_flutter)에서 배포한다.

## 시작하기

서비스가 테마와 브랜드 팔레트를 Dart 코드로 만든다. 앱에 설정 파일이나 Node 코드 생성은 필요 없다. 아래 코드를 서비스의 `ids_theme.dart`에 둘 수 있다.

```dart
import 'package:flutter/painting.dart';
import 'package:ids_flutter/ids.dart';

const appTheme = IdsThemeData();

const brandPalette = IdsPalette(
  shade50: Color(0xffeff6ff),
  shade100: Color(0xffdbeafe),
  shade200: Color(0xffbedbff),
  shade300: Color(0xff8ec5ff),
  shade400: Color(0xff51a2ff),
  shade500: Color(0xff2b7fff),
  shade600: Color(0xff155dfc),
  shade700: Color(0xff1447e6),
  shade800: Color(0xff193cb8),
  shade900: Color(0xff1c398e),
  shade950: Color(0xff162456),
);
```

```dart
IdsProvider(
  theme: appTheme,
  palette: brandPalette,
  mode: IdsMode.system,
  child: const MyApp(),
)
```

Provider는 IDS 컴포넌트의 설정만 제공한다. 일반 Text·Icon, Material/Cupertino 테마와 Localizations를 바꾸지 않는다. IDS 컴포넌트는 내부의 `DefaultTextStyle` 등으로 글꼴과 색을 적용한다. 서비스 화면의 배경이나 글자를 IDS로 맞추려면 `IdsProvider.of(context).theme`에서 명시적으로 꺼내 쓴다.

## IdsProvider

| 인자 | 의미 |
|---|---|
| `theme` | `IdsThemeData`. 바깥에서 필수, 안쪽에서 생략하면 부모 테마 상속 |
| `palette` | controlled `IdsPalette`. setter는 콜백만 호출하고 새 인자를 기다림 |
| `defaultPalette` | uncontrolled 초기 팔레트. setter가 내부 상태 변경 |
| `onPaletteChange` | 팔레트 변경 요청 알림 |
| `mode` / `defaultMode` | controlled 모드 / uncontrolled 초기 모드 |
| `onModeChange` | 모드 변경 요청 알림 |
| `locale` | 날짜·숫자용 로케일. 바깥 기본값 `Locale('ko', 'KR')` |
| `translation` | slang이 생성한 `IdsMessages` 객체. 생략하면 부모 객체 상속 |

바깥 Provider는 `theme`와 `palette` 또는 `defaultPalette`가 필요하다. 같은 축의 controlled 인자와 default 인자를 동시에 주지 않는다. 바깥 모드 기본값은 `IdsMode.light`다. `IdsMode.system`은 시스템 밝기 변경을 따른다. 모드 변경 시 현재 시스템 밝기를 저장하는 대신 `mode`와 `resolvedMode`를 구분한다.

```dart
final ids = IdsProvider.of(context);
final theme = ids.theme;

ids.setColor(otherPalette);
ids.setMode(IdsMode.system);
ids.toggleMode();
```

`toggleMode`는 현재 보이는 모드의 반대를 명시적으로 선택한다. default 인자는 초기화에만 쓰이며 부모가 다시 그려져도 로컬 선택을 초기화하지 않는다. 값이 같은 변경 요청은 콜백을 호출하지 않는다. 팔레트 동등성은 객체 동등성을 따른다.

안쪽 Provider는 축별로 생략한 설정과 setter를 가장 가까운 소유자에게 위임한다. 예를 들어 테마만 바꾼 안쪽 Provider에서 `setColor`를 호출하면 부모의 팔레트를 바꾼다. 안쪽에서 `defaultPalette`를 지정하면 팔레트 상태는 그 하위 범위에만 속한다. theme 인자는 전체 테마 객체 교체이며 부분 병합은 하지 않는다.

```dart
IdsProvider(
  theme: const IdsThemeData(radius: 12),
  child: child,
)
```

`locale`과 `translation`은 독립적으로 상속한다. locale만 영어로 바꿔도 영어 문구를 자동 선택하지 않는다. 안쪽에서 한국어로 고정하려면 `translation: IdsMessages.ko`를 준다. 부분 번역 객체가 들어오면 해당 객체의 null 멤버는 한국어로 fallback하며, 부모 객체와 멤버별 병합하지 않는다.

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

서비스의 slang `TranslationProvider` 아래에서 생성 객체를 넘긴다. 언어를 바꿀 때 이 위젯도 재빌드되어 새 객체를 전달해야 한다.

```dart
final t = Translations.of(context);

return IdsProvider(
  theme: appTheme,
  palette: brandPalette,
  translation: t.ids,
  locale: LocaleSettings.currentLocale.flutterLocale,
  child: child,
);
```

번역은 IDS 자체 문구에만 적용한다. 서비스가 전달하는 Label의 child나 명시적 `semanticLabel`은 바꾸지 않는다. 현재 기본 문구를 가진 Flutter 컴포넌트는 Spinner이며, 우선순위는 명시적 semanticLabel → translation.spinnerLabel → IdsMessages.ko.spinnerLabel이다. decorative Spinner는 안내하지 않는다.

## 런타임 테마 데이터

`IdsPalette`는 `shade50`, `shade100`, …, `shade900`, `shade950`의 11개 opaque sRGB 색을 필수로 받는다. 역할 색은 IDS-19의 대비 규칙으로 선택한다. `palette.check()`는 두 모드의 문제 목록을 반환한다. 통과하는 역할 색이 없으면 `resolve`가 오류를 낸다.

`IdsThemeData(radius: 12, fontFamily: 'App Sans', cornerShape: IdsCornerShape.squircle)`로 외형을 지정한다. 기본 radius는 10이고 indicator는 ×0.4, container는 ×1.6이다. 기본 sans는 패키지의 Pretendard GOV Variable이며 `fontPackage`로 다른 패키지 글꼴도 지정할 수 있다. `monoFontFamily`와 `monoFontPackage`는 고정폭 글꼴에 사용한다. `theme.check()`는 잘못된 radius와 빈 글꼴 이름을 보고한다.

`theme.shape()`는 round일 때 `RoundedRectangleBorder`, squircle일 때 `ContinuousRectangleBorder`를 반환한다. `theme.textStyle`은 IDS 글자 스타일에 서비스 글꼴을 적용한다. scale의 범위 및 글자·radius 확대 정책은 IDS-24에서 미정이므로 공개 scale 인자는 아직 없다. `theme.dimension(value)`는 현재 값을 그대로 반환한다.

## 기존 API에서 이동

- `ThemeProvider`를 `IdsProvider`로 바꾼다. 기존 이름의 별칭은 없다.
- `color: IdsColor.blue` 대신 서비스가 작성한 `palette`와 `theme`를 전달한다. 내부 변경이 필요하면 `defaultPalette`를 쓴다.
- 기존 `ThemeProvider.of(context)`의 테마 값은 `IdsProvider.of(context).theme`로 읽는다.
- Flutter의 `IdsColor`와 내장 브랜드 색상표는 제거했다. neutral과 status 색은 core에서 계속 생성한다. `IdsTokens.resolve`는 브랜드를 받지 않고 `brightness`와 고정 semantic token을 받는다.
- 일반 Text와 Icon에 Provider 스타일이 자동 적용되지 않는다. IDS 바깥의 스타일은 서비스가 지정한다.

## 개발과 Widgetbook

```bash
pnpm codegen
cd packages/flutter
flutter pub get
dart run slang
cd example
dart run slang
cd ..
flutter analyze
flutter test
```

Widgetbook: `packages/flutter/example`에서 `flutter run`으로 사용 가능한 iOS 기기를 선택한다. 현재 예제에는 웹 플랫폼 설정이 없다. IdsProvider의 `Runtime theme and slang`은 파란색·보라색 팔레트, 색상 역할, radius, 모서리, 모드, slang 번역과 누락 문구의 한국어 fallback을 보여준다. locale은 번역과 별도로 변경한다. `Nested scopes`에서 부모·상속 자식·독립 자식·형제의 팔레트 변경 범위를 비교할 수 있다.

글꼴 비교의 Helvetica·Times·Courier는 macOS 시스템 글꼴이다. 다른 플랫폼에서는 해당 글꼴이 없으면 시스템 fallback을 사용한다. `Text scale (MediaQuery)`는 예제에 접근성 배율을 주입한다. IDS의 scale API가 아니며, `System`은 플랫폼이 제공한 배율을 유지한다. 생성 fixture와 예제의 slang Dart 파일은 커밋하지 않으며, CI에서 위와 같은 순서로 생성한다.

Field 예제는 Material `TextFormField`를 IDS Field 안에 배치해 입력·포커스·비활성·오류 상태를 확인한다. IDS 입력 컴포넌트를 추가한 것은 아니다. Group 예제는 방향·간격·구분선과 자식 버튼의 동작을 보여준다. 각 컴포넌트 예제도 `Text scale (MediaQuery)`로 확대하고 스크롤할 수 있다.

배율 정책과 intl/gen_l10n 객체의 직접 연동은 이번 구현에 포함하지 않는다.
