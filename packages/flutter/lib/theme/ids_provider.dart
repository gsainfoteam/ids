import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../messages/ids_messages.dart';
import '../tokens/ids_enums.dart';
import 'ids_resolved_theme.dart';
import 'ids_scope.dart';
import 'ids_theme.dart';

class IdsProvider extends StatefulWidget {
  const IdsProvider({
    super.key,
    required IdsTheme this.theme,
    this.mode,
    this.defaultMode,
    this.onModeChange,
    this.locale,
    required this.child,
  }) : assert(
         mode == null || defaultMode == null,
         'Use mode or defaultMode, not both.',
       );

  const IdsProvider._scope({
    super.key,
    this.theme,
    this.mode,
    this.defaultMode,
    this.onModeChange,
    this.locale,
    required this.child,
  }) : assert(
         mode == null || defaultMode == null,
         'Use mode or defaultMode, not both.',
       );

  final IdsThemeOverrides? theme;
  final IdsMode? mode;
  final IdsMode? defaultMode;
  final ValueChanged<IdsMode>? onModeChange;
  final IdsLocale? locale;
  final Widget child;

  static IdsScope of(BuildContext context) => IdsScope.of(context);
  static IdsScope? maybeOf(BuildContext context) => IdsScope.maybeOf(context);

  @override
  State<IdsProvider> createState() => _IdsProviderState();
}

class IdsProviderScope extends IdsProvider {
  const IdsProviderScope({
    super.key,
    super.theme,
    super.mode,
    super.defaultMode,
    super.onModeChange,
    super.locale,
    required super.child,
  }) : super._scope();
}

class _IdsProviderState extends State<IdsProvider> with WidgetsBindingObserver {
  IdsScope? _parent;
  late IdsMode? _innerMode = widget.defaultMode;
  IdsResolvedTheme? _resolved;
  IdsThemeOverrides? _reportedTheme;

  bool get _ownsMode =>
      _parent == null || widget.mode != null || widget.defaultMode != null;

  IdsMode get _currentMode {
    if (!_ownsMode) return _parent!.mode;
    return widget.mode ?? _innerMode ?? IdsMode.light;
  }

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
    if (_ownsMode && _currentMode == IdsMode.system) setState(() {});
  }

  void _setMode(IdsMode mode) {
    if (!_ownsMode) {
      _parent!.setMode(mode);
      return;
    }
    if (mode == _currentMode) return;
    if (widget.mode == null) setState(() => _innerMode = mode);
    widget.onModeChange?.call(mode);
  }

  void _toggleMode() =>
      _setMode(_resolved!.isDark ? IdsMode.light : IdsMode.dark);

  IdsMode _resolveMode(BuildContext context, IdsMode mode) {
    if (!_ownsMode) return _parent!.resolvedMode;
    if (mode != IdsMode.system) return mode;
    final brightness =
        MediaQuery.maybePlatformBrightnessOf(context) ??
        View.of(context).platformDispatcher.platformBrightness;
    return brightness == Brightness.dark ? IdsMode.dark : IdsMode.light;
  }

  void _reportIssues(IdsThemeOverrides own, IdsThemeOverrides merged) {
    if (!kDebugMode || identical(own, _reportedTheme)) return;
    _reportedTheme = own;
    for (final issue in themeIssues(own, merged)) {
      debugPrint('[IDS] IdsProvider theme.${issue.path}: ${issue.message}');
    }
  }

  IdsLocale _localeOfTheApp(BuildContext context) {
    final appLocale = Localizations.maybeLocaleOf(context);
    if (appLocale == null) return IdsLocale.ko;
    for (final shipped in IdsLocale.values) {
      if (shipped.locale.languageCode == appLocale.languageCode) {
        return IdsLocale(locale: appLocale, messages: shipped.messages);
      }
    }
    return IdsLocale.ko;
  }

  @override
  Widget build(BuildContext context) {
    _parent = IdsScope.maybeOf(context);
    final own = widget.theme;
    final inherited = _parent?.theme;
    final merged = inherited == null ? own : inherited.merge(own);

    if (merged?.primary == null) {
      throw FlutterError(
        'The outermost IdsProvider needs a theme with a primary color, such as '
        'IdsProvider(theme: IdsTheme(primary: IdsThemeColor.seed(Color(0xFF0D9488)))). '
        'IdsProviderScope only changes the theme it inherits.',
      );
    }
    if (own != null) _reportIssues(own, merged!);

    final mode = _currentMode;
    final resolvedMode = _resolveMode(context, mode);
    if (_resolved?.theme != merged || _resolved?.mode != resolvedMode) {
      final next = IdsResolvedTheme(theme: merged!, mode: resolvedMode);
      if (next != _resolved) _resolved = next;
    }

    return IdsScope(
      resolved: _resolved!,
      mode: mode,
      locale: widget.locale ?? _parent?.locale ?? _localeOfTheApp(context),
      setMode: _setMode,
      toggleMode: _toggleMode,
      child: widget.child,
    );
  }
}
