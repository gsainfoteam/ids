# packages/flutter

`lib/src/components/` 아래 파일을 만들거나 고치기 전에 [MIGRATION.md](MIGRATION.md)를 읽는다.

## Widgetbook

`example/`은 ids_flutter의 Widgetbook(3.25, 수동 트리) 카탈로그다. React Storybook의 세 층(기본,
예제, 검증)을 Widgetbook의 use case, knob, addon으로 옮긴다.

### 트리

```
Components                     Checks
  Form/Field                     Form/Field
    Playground                     Long label
    Usage
    Gallery
    Report an invalid value
```

- 폴더는 React의 유형이다. 순서는 Storybook과 같다: `Action` `Form` `Data` `Feedback` `Layout`
  `Navigation` `Overlay` `Typography` `Utility`.
- 컴포넌트 노드 이름은 React 이름이다. `Divider`이고 `IdsDivider`가 아니다. React에서도
  `IdsProvider`인 것만 `IdsProvider`다.
- 파일은 `example/lib/components/<category>/<name>.dart` 하나다. 문서 트리용 컴포넌트와 검증용
  컴포넌트를 함께 내보내고, `lib/main.dart`의 `directories`에 등록한다.

```dart
final divider = WidgetbookComponent(name: 'Divider', useCases: [...]);
final dividerChecks = WidgetbookComponent(name: 'Divider', useCases: [...]);
```

### use case 순서

1. `Playground`: public 파라미터마다 knob 하나를 둔다. knob label은 파라미터 이름(`size`,
   `required`)이다. 값이 둘이나 셋인 enum은 `segmented`, nullable 파라미터는 `objectOrNull`이나
   `stringOrNull`을 쓴다.
2. `Usage`: 가장 작은 실제 사용 예다. knob을 두지 않는다.
3. `Gallery`: 필수다. 모든 variant × size와 모든 상태를 한 화면에 그린다. 반드시
   `catalog/showcase.dart`로 짓는다.
4. 예제: 사용자가 하려는 일로 이름을 짓는다(`Separate alternatives`, `Report an invalid value`).
   Widgetbook use case에는 설명 필드가 없으므로 `Example`이 설명을 캔버스 첫 줄에 그린다.
   설명은 필수다.
5. 검증: RTL, reduced motion, 긴 텍스트, text scale처럼 문서가 아닌 확인용 화면이다.
   `xChecks`에 넣으면 `Checks` 카테고리의 같은 경로에 나온다. 이름은 확인할 내용을 문장으로
   쓴다(`Reduced motion pulses instead of turning`).

```dart
WidgetbookUseCase(
  name: 'Gallery',
  builder: (context) => Showcase(
    children: [
      ShowcaseSection(
        title: 'Size × State',
        children: [
          ShowcaseMatrix(
            rows: IdsSize.values,
            columns: const ['default', 'required', 'disabled'],
            builder: (size, state) => IdsLabel(
              size: size,
              required: state == 'required',
              disabled: state == 'disabled',
              child: Text(context.strings.demo.label.text),
            ),
          ),
        ],
      ),
      ShowcaseSection(
        title: 'States',
        children: [ShowcaseRow(label: 'disabled', children: [...])],
      ),
    ],
  ),
),
WidgetbookUseCase(
  name: 'Separate alternatives',
  builder: (context) => Example(
    description: context.strings.examples.divider.separateAlternatives,
    child: ...,
  ),
),
```

### 테마와 캔버스

- addon이 모든 use case를 감싼다. use case는 `IdsProvider`, mode, 팔레트를 정하지 않는다.
  예외는 `IdsProvider` 자신의 use case다.
  - `IdsThemeAddon`: mode, primary, secondary, tertiary, neutral, status, corner. React toolbar의
    globals와 같은 항목이다. 팔레트 17개는 `catalog/palettes.dart`에 있고, 값은
    `.storybook/palettes.ts`의 seed와 같다.
  - `IdsLocaleAddon`: ko 또는 en이다. `IdsProviderScope`의 `locale`과 `translation`, 데모 문구를
    함께 바꾼다.
  - `TextScaleAddon`: 1부터 3까지다.
- 캔버스는 페이지 색(`bgBase`)에 32px padding을 둔다. 캔버스 자체는 스크롤하지
  않는다. `Showcase`는 스스로 스크롤하고, 페이지 전체를 그리는 데모는 자기 scroll view를 가진다.
  캔버스까지 스크롤하면 그 안의 scroll view가 높이 제한을 받지 못한다.

### 문구와 색

- 컴포넌트 문구는 `IdsMessages`가 정한다(`IdsProvider`의 `translation`). use case는 이 문구를
  직접 쓰지 않는다.
- 데모 문구와 예제 설명은 `example/assets/i18n/{ko,en}.i18n.json`의 `demo`와 `examples`에 두고
  `context.strings`로 읽는다. Dart 파일에는 한글 리터럴을 두지 않는다.
- API 이름인 라벨은 영어 리터럴로 쓴다. 섹션 제목, 행 라벨, enum 값, knob label이 여기에 속한다.
- 색은 IDS 역할(`ids.colors.textNeutral`)로만 쓴다. 치수는 `ids.dimension`, 모서리는
  `ids.shape()`로 쓴다. `Color(0x…)`와 `Colors.*`는 `palettes.dart`의 seed에만 둔다.

### 테스트

```bash
cd packages/flutter && dart run slang
cd example && dart run slang && flutter analyze && flutter test
```

- `test/use_cases_test.dart`는 트리의 모든 use case를 light/dark × ko/en으로 띄운다. 예외가
  없는지, addon의 mode와 locale이 use case까지 닿는지 확인하고, Dart 파일의 한글 리터럴을 찾는다.
- Widgetbook에는 Storybook의 `play`가 없다. 동작은 `packages/flutter/test`에서 검사하고, Checks는
  눈으로 확인하는 화면으로만 쓴다.

### 새 컴포넌트

- 컴포넌트와 같은 PR에서 use case 파일을 더한다. `Playground`, `Usage`, `Gallery`는 필수다.
- 예제와 Checks는 React 스토리에 대응하는 것이 있을 때 옮긴다.
