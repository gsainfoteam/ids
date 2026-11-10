import 'package:flutter/widgets.dart';

import '../messages/ids_messages.dart';
import '../tokens/ids_enums.dart';
import 'ids_palette.dart';
import 'ids_scope.dart';
import 'ids_theme.dart';
import 'ids_theme_data.dart';

class IdsProvider extends StatefulWidget {
  const IdsProvider({
    super.key,
    this.theme,
    this.palette,
    this.defaultPalette,
    this.onPaletteChange,
    this.mode,
    this.defaultMode,
    this.onModeChange,
    this.locale,
    this.translation,
    required this.child,
  }) : assert(
         palette == null || defaultPalette == null,
         'Use palette or defaultPalette, not both.',
       ),
       assert(
         mode == null || defaultMode == null,
         'Use mode or defaultMode, not both.',
       );

  final IdsThemeData? theme;
  final IdsPalette? palette;
  final IdsPalette? defaultPalette;
  final ValueChanged<IdsPalette>? onPaletteChange;
  final IdsMode? mode;
  final IdsMode? defaultMode;
  final ValueChanged<IdsMode>? onModeChange;
  final Locale? locale;
  final IdsMessages? translation;
  final Widget child;

  static IdsScope of(BuildContext context) => IdsScope.of(context);
  static IdsScope? maybeOf(BuildContext context) => IdsScope.maybeOf(context);

  @override
  State<IdsProvider> createState() => _IdsProviderState();
}

class _IdsProviderState extends State<IdsProvider> with WidgetsBindingObserver {
  late IdsPalette? _palette = widget.defaultPalette;
  late IdsMode _mode = widget.defaultMode ?? IdsMode.light;
  IdsScope? _parent;
  IdsTheme? _theme;

  bool get _ownsPalette =>
      widget.palette != null || widget.defaultPalette != null;
  bool get _ownsMode =>
      widget.mode != null || widget.defaultMode != null || _parent == null;
  IdsPalette? get _effectivePalette => _ownsPalette
      ? widget.palette ?? _palette ?? widget.defaultPalette
      : _parent?.palette;
  IdsMode get _effectiveMode =>
      _ownsMode ? widget.mode ?? _mode : _parent!.mode;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangePlatformBrightness() {
    if (_ownsMode && _effectiveMode == IdsMode.system) setState(() {});
  }

  void _setColor(IdsPalette palette) {
    if (!_ownsPalette) {
      _parent!.setColor(palette);
      return;
    }
    if (palette == _effectivePalette) return;
    assert(palette.check().isEmpty, palette.check().join('\n'));
    if (widget.palette == null) setState(() => _palette = palette);
    widget.onPaletteChange?.call(palette);
  }

  void _setMode(IdsMode mode) {
    if (!_ownsMode) {
      _parent!.setMode(mode);
      return;
    }
    if (mode == _effectiveMode) return;
    if (widget.mode == null) setState(() => _mode = mode);
    widget.onModeChange?.call(mode);
  }

  void _toggleMode() => _setMode(_theme!.isDark ? IdsMode.light : IdsMode.dark);

  @override
  Widget build(BuildContext context) {
    _parent = IdsScope.maybeOf(context);
    final data = widget.theme ?? _parent?.theme.data;
    final palette = _effectivePalette;
    if (data == null || palette == null) {
      throw FlutterError(
        'The outermost IdsProvider requires theme and palette (or defaultPalette).',
      );
    }
    assert(data.check().isEmpty, data.check().join('\n'));
    assert(palette.check().isEmpty, palette.check().join('\n'));
    final mode = _effectiveMode;
    final brightness = mode == IdsMode.system && _ownsMode
        ? MediaQuery.maybePlatformBrightnessOf(context) ??
              View.of(context).platformDispatcher.platformBrightness
        : null;
    final resolvedMode = !_ownsMode
        ? _parent!.resolvedMode
        : mode == IdsMode.system
        ? brightness == Brightness.dark
              ? IdsMode.dark
              : IdsMode.light
        : mode;
    if (_theme?.data != data ||
        _theme?.palette != palette ||
        _theme?.mode != resolvedMode) {
      _theme = IdsTheme(data: data, palette: palette, mode: resolvedMode);
    }
    return IdsScope(
      theme: _theme!,
      mode: mode,
      locale: widget.locale ?? _parent?.locale ?? const Locale('ko', 'KR'),
      translation: widget.translation ?? _parent?.translation,
      setColor: _setColor,
      setMode: _setMode,
      toggleMode: _toggleMode,
      child: widget.child,
    );
  }
}
