import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter_example/components/field_usecase.dart';
import 'package:ids_flutter_example/components/group_usecase.dart';
import 'package:ids_flutter_example/ids_theme.dart';

Widget host(Widget child, {IdsMode mode = IdsMode.light, double scale = 1}) =>
    MaterialApp(
      home: MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(scale)),
        child: IdsProvider(
          theme: appTheme,
          palette: brandPalette,
          mode: mode,
          child: Material(
            child: SingleChildScrollView(
              child: Center(child: SizedBox(width: 320, child: child)),
            ),
          ),
        ),
      ),
    );

void main() {
  testWidgets('field accepts input, exposes errors and disables focus', (
    tester,
  ) async {
    await tester.pumpWidget(host(const EmailFieldPreview()));
    await tester.enterText(find.byType(TextFormField), 'service@example.com');
    expect(find.text('service@example.com'), findsOneWidget);
    expect(
      tester.widget<EditableText>(find.byType(EditableText)).focusNode.hasFocus,
      isTrue,
    );
    await tester.pumpWidget(
      host(
        const EmailFieldPreview(invalid: true),
        mode: IdsMode.dark,
        scale: 3,
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('올바른 이메일 주소를 입력해 주세요.'), findsOneWidget);
    expect(find.text('예시 주소이며 실제로 발송되지 않습니다.'), findsNothing);
    expect(find.text('service@example.com'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(host(const EmailFieldPreview(disabled: true)));
    await tester.pumpAndSettle();
    await tester.tap(find.byType(TextFormField));
    expect(
      tester.widget<EditableText>(find.byType(EditableText)).focusNode.hasFocus,
      isFalse,
    );
    expect(find.text('service@example.com'), findsOneWidget);
  });

  testWidgets('group actions work in both orientations and spacing modes', (
    tester,
  ) async {
    for (final mode in [IdsMode.light, IdsMode.dark]) {
      for (final axis in Axis.values) {
        for (final attached in [true, false]) {
          await tester.pumpWidget(
            host(
              GroupPreview(orientation: axis, attached: attached),
              mode: mode,
              scale: 3,
            ),
          );
          await tester.tap(find.text('One'));
          await tester.pumpAndSettle();
          expect(find.text('Action: One'), findsOneWidget);
          await tester.tap(find.text('Two'));
          await tester.pumpAndSettle();
          expect(find.text('Action: Two'), findsOneWidget);
          expect(tester.takeException(), isNull);
        }
      }
    }
  });
}
