import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

class _Messages extends IdsMessagesKo {
  const _Messages();
  @override
  String get kbdCommand => 'Command';
}

void main() {
  testWidgets('displays punctuation codes as their keys', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: IdsProvider(
          theme: testTheme,
          child: Column(
            children: [
              IdsKbd(keys: 'Mod+Slash', platform: TargetPlatform.windows),
              IdsKbd(keys: 'Comma+Backslash', platform: TargetPlatform.macOS),
            ],
          ),
        ),
      ),
    );

    expect(find.text('/'), findsOneWidget);
    expect(find.text(','), findsOneWidget);
    expect(find.text(r'\'), findsOneWidget);
  });

  testWidgets('draws Shift separately from arrows and renders special glyphs', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: IdsProvider(
          theme: testTheme,
          child: Column(
            children: [
              IdsKbd(keys: 'Shift+ArrowUp', platform: TargetPlatform.macOS),
              IdsKbd(child: '⌦␣↖↘', platform: TargetPlatform.macOS),
            ],
          ),
        ),
      ),
    );

    final shiftAndArrow = find.byType(IdsKbd).first;
    expect(
      find.descendant(of: shiftAndArrow, matching: find.byType(CustomPaint)),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.arrow_upward), findsOneWidget);
    expect(find.byIcon(Icons.backspace_outlined), findsOneWidget);
    expect(find.byIcon(Icons.space_bar), findsOneWidget);
    expect(find.byIcon(Icons.north_west), findsOneWidget);
    expect(find.byIcon(Icons.south_east), findsOneWidget);
  });

  testWidgets('shows localized modifier names and platform ordering', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: IdsProvider(
          theme: testTheme,
          locale: IdsLocale(
            locale: const Locale('ko', 'KR'),
            messages: const _Messages(),
          ),
          child: const Column(
            children: [
              IdsKbd(keys: 'Mod+Shift+KeyK', platform: TargetPlatform.macOS),
              IdsKbd(keys: 'Shift+Mod+K', platform: TargetPlatform.windows),
            ],
          ),
        ),
      ),
    );
    expect(find.bySemanticsLabel('시프트 Command K'), findsOneWidget);
    expect(find.bySemanticsLabel('컨트롤 시프트 K'), findsOneWidget);
    final caps = find.byType(IdsKbd);
    expect(
      find.descendant(of: caps.first, matching: find.text('+')),
      findsNothing,
    );
    expect(
      find.descendant(of: caps.last, matching: find.text('+')),
      findsNWidgets(2),
    );
    expect(
      tester.getTopLeft(find.text('Ctrl')).dx,
      lessThan(tester.getTopLeft(find.text('Shift')).dx),
    );
  });

  testWidgets('literal glyphs stay in one cap and size inherits from Field', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: IdsProvider(
          theme: testTheme,
          child: const IdsField(
            size: IdsSize.tiny,
            children: [
              Align(
                child: IdsKbd(child: '⌘K', labels: {'command': 'Command'}),
              ),
              Align(
                child: IdsKbd(keys: '+', size: IdsSize.standard),
              ),
            ],
          ),
        ),
      ),
    );
    expect(find.bySemanticsLabel('Command K'), findsOneWidget);
    expect(tester.getSize(find.byType(IdsKbd).first).height, 16);
    expect(tester.getSize(find.byType(IdsKbd).last), const Size.square(20));
    expect(find.text('+'), findsOneWidget);
  });
}
