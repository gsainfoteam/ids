import 'package:flutter/widgets.dart';
import '../tokens/ids_enums.dart';
import '../tokens/ids_typography.dart';
import 'ids_scope.dart';
import 'ids_theme.dart';

class ThemeProvider extends StatefulWidget {
  const ThemeProvider({
    super.key,
    this.color = IdsColor.blue,
    this.mode = IdsMode.light,
    required this.child,
  });

  final IdsColor color;
  final IdsMode mode;
  final Widget child;

  static IdsTheme of(BuildContext context) {
    final scope = IdsScope.of(context);
    return IdsTheme(color: scope.color, mode: scope.mode);
  }

  static IdsTheme? maybeOf(BuildContext context) {
    final scope = IdsScope.maybeOf(context);
    if (scope == null) return null;
    return IdsTheme(color: scope.color, mode: scope.mode);
  }

  @override
  State<ThemeProvider> createState() => _ThemeProviderState();
}

class _ThemeProviderState extends State<ThemeProvider> {
  late IdsColor _color = widget.color;
  late IdsMode _mode = widget.mode;

  @override
  void didUpdateWidget(ThemeProvider oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.color != widget.color) setState(() => _color = widget.color);
    if (oldWidget.mode != widget.mode) setState(() => _mode = widget.mode);
  }

  void _setColor(IdsColor color) => setState(() => _color = color);
  void _setMode(IdsMode mode) => setState(() => _mode = mode);
  void _toggleMode() =>
      setState(() => _mode = _mode == IdsMode.light ? IdsMode.dark : IdsMode.light);

  @override
  Widget build(BuildContext context) {
    return IdsScope(
      color: _color,
      mode: _mode,
      setColor: _setColor,
      setMode: _setMode,
      toggleMode: _toggleMode,
      child: DefaultTextStyle(
        style: const TextStyle(fontFamily: IdsTypography.sansFontFamily),
        child: widget.child,
      ),
    );
  }
}
