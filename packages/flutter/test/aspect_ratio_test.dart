import 'package:flutter/widgets.dart' hide AspectRatio;
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(WidgetTester tester, Widget box, {double width = 200}) =>
    tester.pumpWidget(
      Align(
        alignment: Alignment.topLeft,
        child: SizedBox(width: width, child: box),
      ),
    );

const _child = Key('child');

void main() {
  testWidgets('is square by default and fills the width', (tester) async {
    await pump(tester, const AspectRatio());
    expect(tester.getSize(find.byType(AspectRatio)), const Size(200, 200));
  });

  testWidgets('sets the height from the width', (tester) async {
    await pump(tester, const AspectRatio(ratio: 16 / 9), width: 320);
    expect(tester.getSize(find.byType(AspectRatio)), const Size(320, 180));
  });

  testWidgets('stretches the child to the box', (tester) async {
    await pump(
      tester,
      const AspectRatio(ratio: 2, child: SizedBox(key: _child)),
    );
    expect(tester.getSize(find.byKey(_child)), const Size(200, 100));
  });

  testWidgets('keeps the ratio when the child is larger', (tester) async {
    await pump(
      tester,
      const AspectRatio(
        ratio: 2,
        child: SizedBox(key: _child, width: 999, height: 999),
      ),
    );
    expect(tester.getSize(find.byType(AspectRatio)), const Size(200, 100));
    expect(tester.getSize(find.byKey(_child)), const Size(200, 100));
  });

  test('rejects a ratio that is not finite and positive', () {
    for (final ratio in [0.0, -1.0, double.infinity, double.nan]) {
      expect(
        () => AspectRatio(ratio: ratio),
        throwsA(
          isA<AssertionError>().having(
            (e) => e.message,
            'message',
            startsWith('[IDS] AspectRatio:'),
          ),
        ),
      );
    }
  });
}
