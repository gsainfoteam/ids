import 'package:flutter/widgets.dart';

import '../i18n/translations.g.dart';

class ExampleStrings extends InheritedWidget {
  const ExampleStrings({super.key, required this.locale, required super.child});

  final AppLocale locale;

  static Translations of(BuildContext context) =>
      context
          .dependOnInheritedWidgetOfExactType<ExampleStrings>()
          ?.locale
          .translations ??
      t;

  @override
  bool updateShouldNotify(ExampleStrings oldWidget) =>
      oldWidget.locale != locale;
}

extension ExampleStringsOf on BuildContext {
  Translations get strings => ExampleStrings.of(this);
}
