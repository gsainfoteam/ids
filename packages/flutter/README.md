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
| `primary`     | `IdsThemeColor.seed(color)`, `IdsRamp`, `IdsPalette`    | 필수                 |
| `secondary`   | 같음                                                    | primary 에서 만든다  |
| `tertiary`    | 같음                                                    | primary 에서 만든다  |
| `neutral`     | `IdsNeutral.pure`, `IdsNeutral.tinted`                  | `pure`               |
| `status`      | `IdsStatus.harmonized`, `IdsStatus.fixed`, `IdsStatusColors(...)` | `harmonized` |
| `radius`      | 0 – 18                                                  | 10                   |
| `cornerShape` | `IdsCornerShape.round`, `IdsCornerShape.squircle`       | `round`              |
| `scale`       | 0.5 – 2. 글자 크기, `dimension`, radius 에 곱한다       | 1                    |

```dart
// 색 하나: hue 와 채도 비율만 읽고 램프와 모드별 스케일을 만든다
const IdsThemeColor.seed(Color(0xFF155DFC));

// 정확한 브랜드 색이 필요하면 램프(50 – 950)를 직접 준다
final brand = IdsRamp(const [
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
- 모드마다 값을 직접 고르려면 `IdsPalette(light: [...], dark: [...])` 로 9단계 스케일 둘을 준다. 번호가 클수록 페이지에서 멀다: 1 base, 2 surface, 3 block, 4 soft, 5 선, 6 진한 선, 7 solid, 8 글자, 9 진한 글자. 1~3단계는 neutral 만 역할로 읽는다.
- 브랜드와 상태 계열의 스케일 규칙과 `textOn*` 계산은 ids-react 와 같다. [IdsProvider README](../react/src/components/utility/ids-provider/README.md#팔레트에서-역할-색-고르기) 를 본다.
- `IdsRamp.fromSeed(color)` 와 `IdsPalette.fromSeed(color)` 는 seed 로 만든 램프와 스케일을 직접 읽을 때 쓴다.
- seed 모델은 ids-react 의 `createIdsRamp`, `createIdsPalette` 와 같아 같은 8비트 색을 낸다. 계수는 `packages/core/palette-model.json` 에 고정돼 있고 `pnpm codegen` 이 `lib/tokens/ids_palette_model.dart` 로 옮긴다.
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
| `locale`              | `IdsLocale`. 문구와 숫자 형식. 없으면 앱 로케일, 그다음 `IdsLocale.ko` |

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
- `locale` 을 주지 않은 scope 는 부모의 `IdsLocale` 을 그대로 쓴다.

## 색 역할

```dart
final colors = IdsProvider.of(context).colors;

Container(
  color: colors.bgPrimarySoft,
  child: Text('저장됨', style: TextStyle(color: colors.textOnPrimarySoft)),
);
```

- 계열 8개(`neutral`, `primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `info`)가 같은 역할을 가진다. 배경은 쓰임새(`Soft`, `Solid`)로, 선과 글자는 세기(없음, `Strong`)로 부른다.
- 역할: `bgXSoft`, `bgXSolid`, `textOnXSoft`, `textOnXSolid`, `textX`, `textXStrong`, `borderX`, `borderXStrong`.
- neutral 만 가진 역할: 페이지 `bgBase`, 카드와 다이얼로그와 팝업의 면 `bgSurface`(다크에서 페이지보다 한 단계 밝다), 그 위에서 구역을 나누는 `bgBlock`(카드 footer, 표 머리), 그리고 그 위 글자 `textOnBase`, `textOnSurface`, `textOnBlock`.
- 이름은 CSS 의 `--ids-color-bg-primary-soft` 을 camelCase 로 바꾼 것이다. `colors['bg-primary-soft']` 로도 읽는다.
- 배경마다 짝이 있다. `bgXSolid` 에는 `textOnXSolid`, `bgXSoft` 에는 `textOnXSoft`, `bgSurface` 에는 `textOnSurface` 를 쓴다. 채움 없는 색 글자와 아이콘에는 `textX` 를 쓴다.
- `textOn*` 은 스케일 단계가 아니다. IdsProvider 가 배경마다 hover, press 층 아래에서도 APCA Lc 75 를 넘는 색을 계산한다.
- hover 와 press 역할은 없다. 바탕 위에 층을 얹는다. 채움은 `IdsStateLayer.fillColor`(검정)를 `IdsStateOpacity.fillHover`(10%), `.fillPress`(18%), 색 있는 soft 면과 상태 색의 outline, ghost 는 계열 채움을 `.tintHover`(8%), `.tintPress`(12%), 나머지는 글자색을 `.hover`(6%), `.press`(10%) 만큼 얹는다. IdsProvider 는 그 층들 아래에서도 글자 대비를 확인한다.
- 구조선(필드 테두리, 구분선)은 `borderNeutral`, 본문 글자는 `textNeutralStrong`, 보조 글자는 `textNeutral` 이다. 읽혀야 하는 색 선(포커스, invalid 테두리)은 `borderPrimaryStrong`, `borderDangerStrong` 이다.

## 컴포넌트 토큰

```dart
final ids = IdsProvider.of(context);

DecoratedBox(
  decoration: BoxDecoration(
    color: ids.colors.bgSurface,
    boxShadow: ids.componentShadows.shadowSurface,
  ),
  child: child,
);
```

- 모드마다 시맨틱 역할 하나를 가리키는 이름이다. 라이트와 다크에서 다른 역할을 쓰는 면은 `isDark` 로 고르지 않고 이 토큰을 쓴다.
- 이름은 ids-react 와 같은 `{속성}-{그룹}[-{부분}][-{변형}]` 을 camelCase 로 바꾼 것이다. `border-control-outline` 은 `borderControlOutline` 이다.
- `bgControlOutline` 과 `borderControlOutline` 은 outline 컨트롤, `bgFieldOutline` 과 `borderFieldOutline` 은 outline 입력 상자다. 다크에서는 `bgBlock` 바탕에 `borderNeutralStrong` 테두리다.
- 카드의 면 `bgSurface` 와 면 안의 구역 `bgBlock` 은 컴포넌트 토큰이 아니라 `colors` 의 역할이다.
- 그림자는 `IdsShadows.steps` 의 단계 `0`, `1`, `2` 이고, `componentShadows.shadowSurface`(라이트 1, 다크 0)처럼 토큰이 단계를 고른다.
- 원본은 `packages/core/tokens/component.json` 과 `shadow.json` 이고, `pnpm codegen` 이 `lib/tokens/ids_component_tokens.dart` 를 쓴다. `test/theme_roles_parity_test.dart` 가 17개 팔레트에서 ids-react 와 같은 색인지 확인한다.

## radius 와 글자

```dart
final ids = IdsProvider.of(context);

DecoratedBox(
  decoration: ShapeDecoration(
    color: ids.colors.bgBase,
    shape: ids.shape(radius: ids.radius.container),
  ),
  child: Text(
    '제목',
    style: ids.textStyle(IdsTypography.bodyB3Medium, color: ids.colors.textNeutralStrong),
  ),
);
```

- `ids.radius` 는 `standard`(theme radius), `indicator`(×0.4), `container`(×1.6), `full` 이다. squircle 이면 그린 반지름이 1.84배다.
- `ids.shape()` 는 round 면 `RoundedRectangleBorder`, squircle 이면 `RoundedSuperellipseBorder` 다.
- 글자 스타일 이름은 CSS 와 같다. `text-body-b3-medium` 은 `IdsTypography.bodyB3Medium` 이다.
- `textStyle(..., mono: true)` 는 패키지에 든 Geist Mono 로 그린다. Geist Mono 에 없는 글자(한글 등)는 Pretendard GOV 로 그린다.
- 두 글꼴 파일은 `pnpm codegen` 이 npm 패키지(`pretendard-gov`, Vercel 의 `geist`)에서 `fonts/` 로 복사한다. 버전은 `packages/core/package.json` 이 정한다. 라이선스(SIL OFL 1.1)는 `fonts/*-LICENSE.txt` 에 있다.
- `textStyle` 은 `inherit: false` 스타일을 돌려준다. 색은 `color` 로 준다.

## 문구와 언어

```dart
IdsProvider(theme: appTheme, locale: IdsLocale.en, child: child)
```

- `IdsLocale` 은 `locale`(Flutter `Locale`) 과 `messages`(`IdsMessagesBase`) 를 묶는다. 패키지는 `IdsLocale.ko`(ko-KR) 와 `IdsLocale.en`(en-US) 을 싣는다.
- `locale` 을 주지 않으면 가장 바깥 Provider 가 `Localizations.maybeLocaleOf(context)` 를 읽는다. 언어가 같은 실린 문구가 있으면 앱의 `Locale` 과 그 문구를 쓰고, 없으면 `IdsLocale.ko` 를 쓴다.
- 문구는 접근성 이름과 알림뿐이다. `dialog.close` 는 `dialogClose`, `chipField.remove` 는 `chipFieldRemove(label: ...)` 가 된다.
- `IdsLocale` 을 만들 때 `locale.languageCode` 와 `messages.language` 가 다르면 debug 빌드에서 assert 가 실패한다.

### 일부만 바꾸기

실린 언어의 클래스를 상속해 바꿀 멤버만 덮는다.

```dart
class AppMessages extends IdsMessagesEn {
  const AppMessages();

  @override
  String get dialogClose => 'Dismiss';
}

final appLocale = IdsLocale(
  locale: const Locale('en', 'GB'),
  messages: const AppMessages(),
);
```

### 새 언어

`IdsMessagesBase` 를 상속하면 모든 멤버를 구현해야 한다. 빠진 멤버는 컴파일 오류다.

```dart
class JapaneseMessages extends IdsMessagesBase {
  const JapaneseMessages();

  @override
  String get language => 'ja';

  @override
  String get dialogClose => '閉じる';

  // ...
}

final japanese = IdsLocale(
  locale: const Locale('ja', 'JP'),
  messages: const JapaneseMessages(),
);
```

### 앱 i18n 과 맞추기

앱 언어마다 `IdsLocale` 을 하나 고른다. slang 이면 이렇게 쓴다.

```dart
final ids = switch (TranslationProvider.of(context).locale) {
  AppLocale.ko => IdsLocale.ko,
  AppLocale.en => IdsLocale.en,
};

return IdsProvider(theme: appTheme, locale: ids, child: child);
```

- `MaterialApp` 의 `locale` 과 `supportedLocales` 만 쓰는 앱은 `locale` 을 주지 않아도 앱 로케일을 따른다.
- 원본은 `packages/core/messages/<language>.json` 이다. `pnpm codegen` 이 `lib/messages/ids_messages.dart` 를 만든다.

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

## 개발과 Widgetbook

```bash
pnpm codegen
cd packages/flutter
flutter pub get
flutter analyze
flutter test
cd example
dart run slang
flutter test
```

- Widgetbook 은 `packages/flutter/example` 에서 `flutter run` 으로 연다.
- `Playground`: primary, neutral, status, radius, 모서리, 모드, 언어, 글자 배율을 바꾸며 계열마다 solid, soft, 글자, 선 역할을 본다.
- `Nested scopes`: 부모, 모드를 물려받는 scope, 색과 모드를 따로 가진 scope 의 범위를 비교한다.
- `Follow the app language`: 예제 앱의 slang `TranslationProvider` 아래에서 테마와 언어를 바꿔도 자식 상태가 남는지 본다.
- 예제 앱의 slang 이 만든 Dart 파일은 커밋하지 않는다. CI 가 위 순서로 만든다.
- `test/theme_roles_parity_test.dart` 는 ids-react 가 쓴 `packages/core/tests/fixtures/theme-roles.json` 과 모든 역할을 비교한다.
