import 'package:flutter/widgets.dart';

import '../messages/ids_messages.dart';
import '../tokens/ids_color_roles.dart';
import '../tokens/ids_enums.dart';
import 'ids_resolved_theme.dart';
import 'ids_theme.dart';

class IdsScope extends InheritedWidget {
  const IdsScope({
    super.key,
    required this.resolved,
    required this.mode,
    required this.locale,
    required this.translation,
    required this.setMode,
    required this.toggleMode,
    required super.child,
  });

  final IdsResolvedTheme resolved;
  final IdsMode mode;
  final Locale locale;
  final IdsMessages? translation;
  final ValueChanged<IdsMode> setMode;
  final VoidCallback toggleMode;

  IdsThemeOverrides get theme => resolved.theme;
  IdsMode get resolvedMode => resolved.mode;
  bool get isDark => resolved.isDark;
  IdsColors get colors => resolved.colors;
  IdsRadius get radius => resolved.radius;
  double get scale => resolved.scale;
  IdsCornerShape get cornerShape => resolved.cornerShape;

  double dimension(double value) => resolved.dimension(value);

  TextStyle textStyle(TextStyle base, {Color? color, bool mono = false}) =>
      resolved.textStyle(base, color: color, mono: mono);

  ShapeBorder shape({double? radius, BorderSide side = BorderSide.none}) =>
      resolved.shape(radius: radius, side: side);

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
      resolved != old.resolved ||
      mode != old.mode ||
      locale != old.locale ||
      translation != old.translation ||
      setMode != old.setMode ||
      toggleMode != old.toggleMode;
}
