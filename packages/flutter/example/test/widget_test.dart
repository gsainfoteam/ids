import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter_example/main.dart';

void main() {
  testWidgets('WidgetbookApp renders', (WidgetTester tester) async {
    await tester.pumpWidget(const WidgetbookApp());
    expect(find.byType(WidgetbookApp), findsOneWidget);
  });
}
