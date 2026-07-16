import 'package:flutter/material.dart';
import '../tokens/ids_enums.dart';
import '../tokens/ids_color_tokens.dart';

class IdsTheme {
  const IdsTheme({required this.color, required this.mode});

  final IdsColor color;
  final IdsMode mode;

  Color resolve(String token) =>
      IdsTokens.resolve(color: color, mode: mode, token: token);

  Color get primary => resolve('primary');
  Color get onPrimary => resolve('on-primary');
  Color get secondary => resolve('secondary');
  Color get onSecondary => resolve('on-secondary');

  Color get surface => _neutral('surface');
  Color get onSurface => _neutral('on-surface');
  Color get muted => _neutral('muted');
  Color get onMuted => _neutral('on-muted');
  Color get outline => resolve('outline');

  bool get isDark => mode == IdsMode.dark;

  Color _neutral(String token) {
    final neutralMap = mode == IdsMode.light ? _neutralLight : _neutralDark;
    return neutralMap[token] ?? Colors.transparent;
  }

  static const _neutralLight = <String, Color>{
    'surface': Color(0xFFFFFFFF),
    'on-surface': Color(0xFF171717),
    'muted': Color(0xFFF5F5F5),
    'on-muted': Color(0xFF525252),
  };

  static const _neutralDark = <String, Color>{
    'surface': Color(0xFF0A0A0A),
    'on-surface': Color(0xFFFAFAFA),
    'muted': Color(0xFF262626),
    'on-muted': Color(0xFFA3A3A3),
  };
}
