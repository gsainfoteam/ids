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
  Color get outline => _neutral('outline');

  bool get isDark => mode == IdsMode.dark;

  Color _neutral(String token) {
    final neutralMap = mode == IdsMode.light
        ? _neutralLight
        : _neutralDark;
    return neutralMap[token] ?? Colors.transparent;
  }

  static const _neutralLight = <String, Color>{
    'surface': Color(0xFFFFFFFF),
    'on-surface': Color(0xFF111827),
    'muted': Color(0xFFF3F4F6),
    'on-muted': Color(0xFF4B5563),
    'outline': Color(0xFFD1D5DB),
  };

  static const _neutralDark = <String, Color>{
    'surface': Color(0xFF030712),
    'on-surface': Color(0xFFF9FAFB),
    'muted': Color(0xFF1F2937),
    'on-muted': Color(0xFF9CA3AF),
    'outline': Color(0xFF374151),
  };
}
