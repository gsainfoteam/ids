import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart' show ThemeProvider;
import 'package:ids_flutter_example/main.dart';
import 'package:widgetbook/widgetbook.dart';

Iterable<WidgetbookUseCase> useCasesIn(Iterable<WidgetbookNode> nodes) sync* {
  for (final node in nodes) {
    if (node is WidgetbookUseCase) yield node;
    yield* useCasesIn(node.children ?? const []);
  }
}

void main() {
  final root = WidgetbookRoot(children: directories);

  for (final useCase in useCasesIn(root.children!)) {
    testWidgets('${useCase.path} renders', (tester) async {
      tester.view.physicalSize = const Size(1920, 1200);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        WidgetbookApp(initialRoute: '/?path=${useCase.path}'),
      );
      await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 300)),
      );
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.byType(ThemeProvider), findsWidgets);
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump(const Duration(seconds: 1));
    });
  }
}
