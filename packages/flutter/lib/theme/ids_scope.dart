import 'package:flutter/widgets.dart';

import '../messages/ids_messages.dart';
import '../tokens/ids_enums.dart';
import 'ids_palette.dart';
import 'ids_theme.dart';

class IdsScope extends InheritedWidget {
  const IdsScope({
    super.key,
    required this.theme,
    required this.mode,
    required this.locale,
    required this.translation,
    required this.setColor,
    required this.setMode,
    required this.toggleMode,
    required super.child,
  });

  final IdsTheme theme;
  final IdsMode mode;
  final Locale locale;
  final IdsMessages? translation;
  final ValueChanged<IdsPalette> setColor;
  final ValueChanged<IdsMode> setMode;
  final VoidCallback toggleMode;

  IdsPalette get palette => theme.palette;
  IdsMode get resolvedMode => theme.mode;

  static IdsScope of(BuildContext context) {
    final scope = maybeOf(context);
    if (scope == null) {
      throw FlutterError(
        'IdsProvider not found. Wrap IDS components in an IdsProvider.',
      );
    }
    return scope;
  }

  static IdsScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<IdsScope>();

  @override
  bool updateShouldNotify(IdsScope old) =>
      theme.data != old.theme.data ||
      palette != old.palette ||
      mode != old.mode ||
      resolvedMode != old.resolvedMode ||
      locale != old.locale ||
      translation != old.translation ||
      setColor != old.setColor ||
      setMode != old.setMode ||
      toggleMode != old.toggleMode;
}
