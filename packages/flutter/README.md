# ids_flutter

IDS Flutter 컴포넌트 라이브러리. [pub.dev](https://pub.dev/packages/ids_flutter)에서 배포한다.

- 테마는 ids-react 와 같다. 같은 `IdsTheme` 이면 두 플랫폼이 같은 8비트 색, 같은 radius, 같은 글자 스타일을 낸다.
- 색은 앱이 준다. IDS 에는 브랜드 색이 없고, 앱의 팔레트에서 역할 색을 대비(APCA)로 고른다.
- 글꼴은 고정이다. 본문은 Pretendard GOV, 고정폭은 Geist Mono 이고 둘 다 패키지에 들어 있다.

## 시작하기

```dart
import 'package:flutter/painting.dart';
import 'package:ids_flutter/ids.dart';

const appTheme = IdsTheme(
  primary: IdsThemeColor.seed(Color(0xFF155DFC)),
);
```

```dart
IdsProvider(
  theme: appTheme,
  mode: IdsMode.system,
  child: const MyApp(),
)
```

- 테마는 Dart 코드로 만든다. 설정 파일이나 Node 코드 생성은 필요 없다.
- Provider 는 IDS 컴포넌트에만 스타일을 준다. Material, Cupertino 테마, 일반 `Text`, `Icon`, `Localizations` 는 바꾸지 않는다.

## IdsTheme

| 필드          | 값                                                      | 기본                 |
| ------------- | ------------------------------------------------------- | -------------------- |
| `primary`     | `IdsPalette` 또는 `IdsThemeColor.seed(color)`           | 필수                 |
| `secondary`   | 같음                                                    | primary 에서 만든다  |
| `tertiary`    | 같음                                                    | primary 에서 만든다  |
| `neutral`     | `IdsNeutral.pure`, `IdsNeutral.tinted`                  | `pure`               |
| `status`      | `IdsStatus.harmonized`, `IdsStatus.fixed`, `IdsStatusColors(...)` | `harmonized` |
| `radius`      | 0 – 18                                                  | 10                   |
| `cornerShape` | `IdsCornerShape.round`, `IdsCornerShape.squircle`       | `round`              |
| `scale`       | 0.5 – 2. 글자 크기, `dimension`, radius 에 곱한다       | 1                    |

```dart
// 색 하나: hue 와 채도 비율만 읽고 11단계를 만든다
const IdsThemeColor.seed(Color(0xFF155DFC));

// 정확한 브랜드 색이 필요하면 11단계(50 – 950)를 직접 준다
final brand = IdsPalette(const [
  Color(0xFFEFF6FF), Color(0xFFDBEAFE), Color(0xFFBEDBFF), Color(0xFF8EC5FF),
  Color(0xFF51A2FF), Color(0xFF2B7FFF), Color(0xFF155DFC), Color(0xFF1447E6),
  Color(0xFF193CB8), Color(0xFF1C398E), Color(0xFF162456),
]);

final theme = IdsTheme(
  primary: brand,
  neutral: IdsNeutral.tinted,          // neutral 에 primary hue 를 옅게
  status: IdsStatus.fixed,             // 상태 색을 primary 쪽으로 돌리지 않는다
  radius: 12,
  cornerShape: IdsCornerShape.squircle,
);
```

- `secondary` 를 빼면 primary 의 hue 에 채도 1/3, `tertiary` 를 빼면 hue 를 +60° (상태 색과 겹치면 −60°) 돌린다.
- `harmonized` 는 상태 hue 를 primary 쪽으로 최대 15° 돌린다. `IdsStatusColors(danger: ...)` 로 일부만 고를 수 있다.
- `IdsPalette.fromSeed(color)` 는 seed 로 만든 팔레트를 직접 읽을 때 쓴다.
- seed 모델은 ids-react 의 `createIdsPalette` 와 같아 같은 8비트 색을 낸다. 계수는 `packages/core/palette-model.json` 에 고정돼 있고 `pnpm codegen` 이 `lib/tokens/ids_palette_model.dart` 로 옮긴다.
- 상태 팔레트는 `IdsStatusPalettes.red` `yellow` `green` `sky` 에 있다.
- 입력 색은 불투명 sRGB 로 맞춘다. 알파와 Display P3 는 버린다.

## 테마 검사

```dart
for (final issue in checkIdsTheme(appTheme)) {
  print('${issue.path}: ${issue.message}');
}
```

- 범위를 벗어난 `radius`, `scale`, 대비를 맞출 단계가 없는 팔레트를 보고한다.
- 브랜드 계열끼리, 브랜드와 상태 색이 너무 가까운 경우와 적록 색약에서 success, warning 이 danger 와 겹치는 경우도 보고한다.
- 개발 빌드에서 Provider 가 같은 문제를 `debugPrint('[IDS] ...')` 로 한 번 알린다.

## IdsProvider

| 인자                  | 의미                                                          |
| --------------------- | ------------------------------------------------------------- |
| `theme`               | `IdsTheme`. 가장 바깥 Provider 에서 필수                       |
| `mode`                | controlled 모드. 바꾸기 요청은 `onModeChange` 만 부른다        |
| `defaultMode`         | uncontrolled 초기 모드. 바깥 기본값 `IdsMode.light`            |
| `onModeChange`        | 모드 변경 요청 알림                                           |
| `locale`              | 날짜, 숫자용 로케일. 바깥 기본값 `Locale('ko', 'KR')`          |
| `translation`         | slang 이 만든 `IdsMessages` 객체                              |

```dart
final ids = IdsProvider.of(context);

ids.setMode(IdsMode.system);
ids.toggleMode();         // 지금 보이는 모드의 반대를 고른다
ids.mode;                 // 고른 모드 (system 일 수 있다)
ids.resolvedMode;         // 실제 그리는 light 또는 dark
```

- `IdsMode.system` 은 플랫폼 밝기를 따른다.
- `defaultMode` 는 처음 한 번만 읽는다. 부모가 다시 그려도 로컬 선택을 되돌리지 않는다.
- 같은 값으로 바꾸기를 요청하면 콜백을 부르지 않는다.

## IdsProviderScope

하위 트리에서 테마 일부를 바꾼다. React 의 `IdsProvider.Scope` 다.

```dart
IdsProviderScope(
  theme: const IdsThemeOverrides(primary: IdsThemeColor.seed(Color(0xFF9810FA))),
  child: child,
)

IdsProviderScope(
  defaultMode: IdsMode.dark,   // 이 범위만 따로 모드를 가진다
  child: child,
)
```

- 준 필드만 부모 테마에 덮는다. 나머지는 부모를 따른다.
- `mode` 나 `defaultMode` 를 주지 않은 scope 의 `setMode`, `toggleMode` 는 모드를 가진 조상을 바꾼다.
- `locale` 과 `translation` 은 따로 상속한다. locale 만 영어로 바꿔도 영어 문구를 고르지 않는다.

## 색 역할

```dart
final colors = IdsProvider.of(context).colors;

Container(
  color: colors.bgPrimarySoft,
  child: Text('저장됨', style: TextStyle(color: colors.textOnPrimarySoft)),
);
```

- 계열 8개(`neutral`, `primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `info`) × 역할 10개에 바탕 층 `surface`, `onSurface` 다.
- 역할: `bgX`, `bgXHover`, `bgXActive`, `bgXSoft`, `bgXSoftHover`, `bgXSoftActive`, `textOnX`, `textOnXSoft`, `textX`, `borderX`.
- 이름은 CSS 의 `--ids-color-bg-primary-soft` 를 camelCase 로 바꾼 것이다. `colors['bg-primary-soft']` 로도 읽는다.
- 채움(`bgX`)에는 `textOnX`, soft 면(`bgXSoft`)에는 `textOnXSoft`, 채움 없는 글자와 아이콘에는 `textX` 를 쓴다.
- 구조선(필드 테두리, 구분선)은 `borderNeutral`, 보조 글자는 `textNeutral` 이다.

## radius 와 글자

```dart
final ids = IdsProvider.of(context);

DecoratedBox(
  decoration: ShapeDecoration(
    color: ids.colors.surface,
    shape: ids.shape(radius: ids.radius.container),
  ),
  child: Text(
    '제목',
    style: ids.textStyle(IdsTypography.bodyB3Medium, color: ids.colors.onSurface),
  ),
);
```

- `ids.radius` 는 `standard`(theme radius), `indicator`(×0.4), `container`(×1.6), `full` 이다. squircle 이면 그린 반지름이 1.84배다.
- `ids.shape()` 는 round 면 `RoundedRectangleBorder`, squircle 이면 `RoundedSuperellipseBorder` 다.
- 글자 스타일 이름은 CSS 와 같다. `text-body-b3-medium` 은 `IdsTypography.bodyB3Medium` 이다.
- `textStyle(..., mono: true)` 는 패키지에 든 Geist Mono 로 그린다. Geist Mono 에 없는 글자(한글 등)는 Pretendard GOV 로 그린다.
- 두 글꼴 파일은 `pnpm codegen` 이 npm 패키지(`pretendard-gov`, Vercel 의 `geist`)에서 `fonts/` 로 복사한다. 버전은 `packages/core/package.json` 이 정한다. 라이선스(SIL OFL 1.1)는 `fonts/*-LICENSE.txt` 에 있다.
- `textStyle` 은 `inherit: false` 스타일을 돌려준다. 색은 `color` 로 준다.

## IDS 문구와 slang

- IDS 문구의 원본은 `packages/core/messages/ko.json` 과 `en.json` 이다. `pnpm codegen` 이 Dart 기본 객체 `IdsMessages.ko` 와 slang 용 `messages/ko.i18n.json` 을 만든다.
- `IdsMessages` 는 모든 멤버가 nullable 인 mixin 이다. `dialog.close` 는 `dialogClose`, `chipField.remove` 는 `chipFieldRemove(label: ...)` 가 된다.
- 빠진 멤버는 컴포넌트가 `t?.dialogClose ?? IdsMessages.ko.dialogClose` 로 한국어를 고른다.

서비스는 slang 4.19.2 이상을 쓰고 `slang.yaml` 에 다음을 합친다.

```yaml
string_interpolation: braces
imports:
  - 'package:ids_flutter/ids.dart'
interfaces:
  IdsMessages:
    generate_mixin: false
```

```json
{
  "ids(singleInterface=IdsMessages)": {
    "dialogClose": "Close",
    "spinnerLabel": "Loading",
    "chipFieldRemove": "Remove {label}"
  }
}
```

```dart
final t = Translations.of(context);

return IdsProvider(
  theme: appTheme,
  translation: t.ids,
  locale: LocaleSettings.currentLocale.flutterLocale,
  child: child,
);
```

- 기존 interpolation 이 `dart` 이면 `{label}` 을 `$label` 로 쓴다.
- 번역은 IDS 자체 문구에만 쓴다. Label 의 child 나 명시한 `semanticLabel` 은 바꾸지 않는다.

## 이전 API 에서 옮기기

- `IdsThemeData` 와 `palette:` 는 `IdsTheme` 하나로 합쳤다. `IdsProvider(theme: IdsTheme(primary: ...))` 로 쓴다.
- `setColor`, `defaultPalette`, `onPaletteChange` 는 없다. 색을 바꾸려면 앱이 새 `IdsTheme` 을 넘기거나 `IdsProviderScope` 로 덮는다.
- 안쪽 `IdsProvider(theme: ...)` 는 `IdsProviderScope(theme: IdsThemeOverrides(...))` 로 바꾼다.
- `theme.primary`, `onPrimary`, `secondary`, `onSecondary`, `accent`, `outline`, `muted` 같은 이전 역할은 `colors` 의 역할로 바꾼다. 예: `secondary` → `bgPrimarySoft`, `outline` → `borderNeutral`, `muted` → `bgNeutralSoft`.
- `fontFamily`, `monoFontFamily` 는 없다. 글꼴은 고정이다.
- `IdsTypography.buttonStandard`, `buttonTiny` 는 `bodyB3Medium`, `captionC1Medium` 이다.

## Button

`IdsButton`은 `variant`, `colorScheme`, `size`를 지원한다. `leading`과 `trailing`에 넣은 아이콘은 버튼의 색상과 크기를 상속한다. `IdsButton.builder`와 `onInteractionChange`로 포커스, 호버, 누르는 중 같은 상태를 읽을 수 있다. `onPressed`를 생략하거나 `disabled`를 켜면 비활성화된다.

```dart
IdsButton(
  onPressed: save,
  disabled: saving,
  busy: saving,
  focusableWhenDisabled: true,
  leading: saving ? const IdsSpinner(decorative: true) : null,
  child: Text(saving ? '저장 중' : '저장'),
)
```

`busy`는 진행 커서와 접근성 안내를 적용한다. `disabled`가 재실행을 막고 `focusableWhenDisabled`가 키보드 포커스를 유지한다.

부모가 가로 너비를 정하는 곳에서 `SizedBox(width: double.infinity, child: IdsButton(...))`으로 버튼을 가로로 채울 수 있다.

## IconButton

`IdsIconButton`은 정사각형 아이콘 버튼입니다. `semanticLabel`로 버튼의 목적을 전달하며
`IdsButton`과 같은 variant, 색상, 크기를 사용합니다. 기본 variant는 `ghost`입니다.

## Kbd

`IdsKbd(keys: 'Mod+Shift+K')`는 플랫폼에 맞게 키를 배열한다. `IdsKbd(child: '⌘K')`처럼 한 키캡에 직접 표시할 수도 있다. `size`를 생략하면 `IdsField`의 크기를 따르고, 스크린 리더가 읽는 키 이름은 Provider의 번역과 `labels`로 지정한다.

## TextField

```dart
IdsField(
  required: true,
  children: [
    const IdsFieldLabel(child: Text('검색')),
    IdsTextField(clearable: true, onValueChange: updateQuery),
  ],
)
```

라벨을 누르면 입력에 포커스가 간다. `IdsField`의 크기, 비활성, 필수, 오류 상태를 입력에 적용한다. `clearable`을 켜면 지우기 버튼과 Escape로 값을 지울 수 있다. 초기값은 `defaultValue` 또는 외부 `TextEditingController`에서 가져온다. `FormState.reset()`은 초기값을 복원하며 `onValueChange`를 호출하지 않는다.

## 개발과 Widgetbook

```bash
pnpm codegen
cd packages/flutter
flutter pub get
dart run slang
flutter analyze
flutter test
cd example
dart run slang
flutter test
```

- Widgetbook 은 `packages/flutter/example` 에서 `flutter run` 으로 연다.
- `Runtime theme and slang`: primary, neutral, status, radius, 모서리, 모드, 번역, 글자 배율을 바꾸며 계열마다 fill, soft, text, border 역할을 본다.
- `Nested scopes`: 부모, 모드를 물려받는 scope, 색과 모드를 따로 가진 scope 의 범위를 비교한다.
- `Service integration`: 실제 slang `TranslationProvider` 아래에서 테마와 언어를 바꿔도 자식 상태가 남는지 본다.
- slang 이 만든 Dart 파일은 커밋하지 않는다. CI 가 위 순서로 만든다.
- `test/theme_roles_parity_test.dart` 는 ids-react 가 쓴 `packages/core/tests/fixtures/theme-roles.json` 과 모든 역할을 비교한다.
