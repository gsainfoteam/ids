import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' show Icons;
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

class _HeldImage extends ImageProvider<_HeldImage> {
  final completer = Completer<ImageInfo>();

  @override
  Future<_HeldImage> obtainKey(ImageConfiguration configuration) =>
      SynchronousFuture(this);

  @override
  ImageStreamCompleter loadImage(_HeldImage key, ImageDecoderCallback decode) =>
      OneFrameImageStreamCompleter(completer.future);
}

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: ThemeProvider(child: Center(child: child)),
  ),
);

Future<ui.Image> testImage(WidgetTester tester) async =>
    (await tester.runAsync(() => createTestImage(width: 1, height: 1)))!;

void main() {
  group('initialsOf', () {
    test('takes the first letters of two words, uppercased', () {
      expect(initialsOf('Alice Kim'), 'AK');
      expect(initialsOf('ada lovelace king'), 'AL');
    });

    test('takes one letter of a Korean name', () {
      expect(initialsOf('류현승'), '류');
    });

    test('skips symbols and keeps graphemes whole', () {
      expect(initialsOf('(주)아크메'), '주');
      expect(initialsOf('@alice'), 'A');
      expect(initialsOf('Émile Zola'), 'ÉZ');
    });

    test('returns nothing for a blank name', () {
      expect(initialsOf('   '), '');
    });
  });

  group('size', () {
    testWidgets('is 40 standard and 24 tiny', (tester) async {
      await pump(tester, const Avatar(name: 'A'));
      expect(tester.getSize(find.byType(Avatar)), const Size.square(40));

      await pump(tester, const Avatar(name: 'A', size: IdsSize.tiny));
      expect(tester.getSize(find.byType(Avatar)), const Size.square(24));
    });

    testWidgets('stays square when only its width is forced', (tester) async {
      await pump(
        tester,
        const SizedBox(width: 300, child: Avatar(name: 'Alice Kim')),
      );
      expect(
        tester.getSize(
          find
              .descendant(
                of: find.byType(Avatar),
                matching: find.byType(ClipPath),
              )
              .first,
        ),
        const Size.square(40),
      );
      expect(
        DefaultTextStyle.of(tester.element(find.text('AK'))).style.fontSize,
        16,
      );
    });

    testWidgets('follows a tight parent and scales the initials', (
      tester,
    ) async {
      await pump(
        tester,
        const SizedBox.square(dimension: 80, child: Avatar(name: 'Alice Kim')),
      );
      expect(tester.getSize(find.byType(Avatar)), const Size.square(80));
      expect(tester.widget<Text>(find.text('AK')).style, isNull);
      expect(
        DefaultTextStyle.of(tester.element(find.text('AK'))).style.fontSize,
        32,
      );
    });
  });

  group('fallback', () {
    testWidgets('the initials keep their size at any text scale', (
      tester,
    ) async {
      await pump(tester, const Avatar(name: 'Alice Kim'));
      final unscaled = tester.getSize(find.text('AK'));

      await pump(
        tester,
        const MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(2)),
          child: Avatar(name: 'Alice Kim'),
        ),
      );
      expect(tester.getSize(find.text('AK')), unscaled);
    });

    testWidgets('shows the initials, or a person without a name', (
      tester,
    ) async {
      await pump(tester, const Avatar(name: 'Alice Kim'));
      expect(find.text('AK'), findsOneWidget);

      await pump(tester, const Avatar(semanticLabel: 'user'));
      expect(find.byIcon(Icons.person), findsOneWidget);
    });

    testWidgets('draws a given fallback instead', (tester) async {
      await pump(
        tester,
        const Avatar(name: 'Acme', fallback: Icon(Icons.business)),
      );
      expect(find.byIcon(Icons.business), findsOneWidget);
      expect(find.text('A'), findsNothing);
    });
  });

  group('image', () {
    testWidgets('waits before showing the fallback, then shows the image', (
      tester,
    ) async {
      final image = _HeldImage();
      final statuses = <AvatarStatus>[];
      await pump(
        tester,
        Avatar(image: image, name: 'Alice Kim', onStatusChange: statuses.add),
      );
      await tester.pump();
      expect(find.text('AK'), findsNothing);

      await tester.pump(const Duration(milliseconds: 600));
      expect(find.text('AK'), findsOneWidget);

      image.completer.complete(ImageInfo(image: await testImage(tester)));
      await tester.pump();
      await tester.pump();
      expect(find.text('AK'), findsNothing);
      expect(find.byType(RawImage), findsOneWidget);
      expect(statuses, [AvatarStatus.loading, AvatarStatus.loaded]);
    });

    testWidgets('shows the fallback at once when the image fails', (
      tester,
    ) async {
      final image = _HeldImage();
      final statuses = <AvatarStatus>[];
      await pump(
        tester,
        Avatar(image: image, name: 'Alice Kim', onStatusChange: statuses.add),
      );
      image.completer.completeError(Exception('broken'));
      await tester.pump();
      await tester.pump();
      expect(find.text('AK'), findsOneWidget);
      expect(find.byType(RawImage), findsNothing);
      expect(statuses, [AvatarStatus.loading, AvatarStatus.error]);
    });

    testWidgets('shows the fallback at once with no delay', (tester) async {
      await pump(
        tester,
        Avatar(
          image: _HeldImage(),
          name: 'Alice Kim',
          fallbackDelay: Duration.zero,
        ),
      );
      expect(find.text('AK'), findsOneWidget);
    });

    testWidgets('a new image after a failed one loads and waits again', (
      tester,
    ) async {
      final broken = _HeldImage();
      final statuses = <AvatarStatus>[];
      await pump(
        tester,
        Avatar(image: broken, name: 'Alice Kim', onStatusChange: statuses.add),
      );
      broken.completer.completeError(Exception('broken'));
      await tester.pump();
      await tester.pump();

      await pump(
        tester,
        Avatar(
          image: _HeldImage(),
          name: 'Alice Kim',
          onStatusChange: statuses.add,
        ),
      );
      await tester.pump();
      expect(find.text('AK'), findsNothing);
      expect(statuses, [
        AvatarStatus.loading,
        AvatarStatus.error,
        AvatarStatus.loading,
      ]);
      await tester.pump(const Duration(milliseconds: 600));
      expect(find.text('AK'), findsOneWidget);
    });

    testWidgets('starts over when the image changes', (tester) async {
      final first = _HeldImage();
      await pump(tester, Avatar(image: first, name: 'Alice Kim'));
      first.completer.complete(ImageInfo(image: await testImage(tester)));
      await tester.pump();
      await tester.pump();
      expect(find.byType(RawImage), findsOneWidget);

      await pump(tester, Avatar(image: _HeldImage(), name: 'Alice Kim'));
      expect(find.byType(RawImage), findsNothing);
      expect(find.text('AK'), findsNothing);
      await tester.pump(const Duration(milliseconds: 600));
      expect(find.text('AK'), findsOneWidget);
    });
  });

  group('semantics', () {
    testWidgets('is an image named by semanticLabel, then name', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();

      await pump(tester, const Avatar(name: 'Alice Kim'));
      expect(
        tester.getSemantics(find.byType(Avatar)),
        matchesSemantics(label: 'Alice Kim', isImage: true),
      );

      await pump(
        tester,
        const Avatar(name: 'Alice Kim', semanticLabel: 'Alice의 프로필 사진'),
      );
      expect(
        tester.getSemantics(find.byType(Avatar)),
        matchesSemantics(label: 'Alice의 프로필 사진', isImage: true),
      );

      semantics.dispose();
    });

    testWidgets('hides a decorative avatar', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        const Avatar(name: 'Alice Kim', excludeFromSemantics: true),
      );
      expect(find.bySemanticsLabel('Alice Kim'), findsNothing);
      semantics.dispose();
    });

    testWidgets('warns without an accessible name', (tester) async {
      final printed = <String>[];
      final original = debugPrint;
      debugPrint = (message, {wrapWidth}) => printed.add(message!);
      try {
        await pump(tester, const Avatar());
        await pump(tester, const Avatar(excludeFromSemantics: true));
      } finally {
        debugPrint = original;
      }
      expect(printed, hasLength(1));
      expect(printed.single, startsWith('[IDS] Avatar:'));
    });
  });
}
