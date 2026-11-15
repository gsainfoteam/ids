import 'package:flutter/widgets.dart';

abstract final class IdsTokens {
  static Color resolve({required Brightness brightness, required String token}) {
    final colors = brightness == Brightness.light ? _light : _dark;
    final color = colors[token];
    if (color == null) throw ArgumentError.value(token, 'token', 'Unknown IDS semantic color');
    return color;
  }

  static const _light = <String, Color>{
    'surface': Color(0xFFFFFFFF),
    'on-surface': Color(0xFF171717),
    'muted': Color(0xFFF5F5F5),
    'muted-hover': Color(0xFFE5E5E5),
    'muted-active': Color(0xFFD4D4D4),
    'border': Color(0xFFE5E5E5),
    'on-muted': Color(0xFF525252),
    'handle': Color(0xFFD4D4D4),
    'handle-hover': Color(0xFFA3A3A3),
    'handle-active': Color(0xFF737373),
    'success': Color(0xFF418501),
    'on-success': Color(0xFFFFFFFF),
    'success-strong': Color(0xFF366E01),
    'warning': Color(0xFFF0B100),
    'on-warning': Color(0xFF0A0A0A),
    'warning-strong': Color(0xFF894B00),
    'danger': Color(0xFFC10007),
    'on-danger': Color(0xFFFFFFFF),
    'danger-strong': Color(0xFFC10007),
    'info': Color(0xFF0069A8),
    'on-info': Color(0xFFFFFFFF),
    'info-strong': Color(0xFF0069A8),
  };

  static const _dark = <String, Color>{
    'surface': Color(0xFF0A0A0A),
    'on-surface': Color(0xFFFAFAFA),
    'muted': Color(0xFF262626),
    'muted-hover': Color(0xFF404040),
    'muted-active': Color(0xFF525252),
    'border': Color(0xFF262626),
    'on-muted': Color(0xFFA3A3A3),
    'handle': Color(0xFF404040),
    'handle-hover': Color(0xFF525252),
    'handle-active': Color(0xFF737373),
    'success': Color(0xFF4ADE5E),
    'on-success': Color(0xFF0A0A0A),
    'success-strong': Color(0xFF4ADE5E),
    'warning': Color(0xFFFDC700),
    'on-warning': Color(0xFF0A0A0A),
    'warning-strong': Color(0xFFFDC700),
    'danger': Color(0xFFFF6467),
    'on-danger': Color(0xFF0A0A0A),
    'danger-strong': Color(0xFFFF6467),
    'info': Color(0xFF00BCFF),
    'on-info': Color(0xFF0A0A0A),
    'info-strong': Color(0xFF00BCFF),
  };
}
