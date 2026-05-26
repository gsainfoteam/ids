import 'package:flutter/widgets.dart';
import '../tokens/ids_enums.dart';

class IdsScope extends InheritedWidget {
  const IdsScope({
    super.key,
    required this.color,
    required this.mode,
    required this.setColor,
    required this.setMode,
    required this.toggleMode,
    required super.child,
  });

  final IdsColor color;
  final IdsMode mode;
  final void Function(IdsColor) setColor;
  final void Function(IdsMode) setMode;
  final void Function() toggleMode;

  static IdsScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<IdsScope>();
    assert(scope != null, 'IdsScope not found — wrap your app with ThemeProvider');
    return scope!;
  }

  static IdsScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<IdsScope>();

  @override
  bool updateShouldNotify(IdsScope old) =>
      color != old.color || mode != old.mode;
}
