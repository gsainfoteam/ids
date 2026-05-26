import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

void main() {
  testWidgets('IdsButton renders without error', (WidgetTester tester) async {
    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: ThemeProvider(
          color: IdsColor.blue,
          mode: IdsMode.light,
          child: IdsButton(
            onPressed: () {},
            child: const Text('Test'),
          ),
        ),
      ),
    );

    expect(find.text('Test'), findsOneWidget);
  });
}
