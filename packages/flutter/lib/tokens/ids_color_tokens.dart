// GENERATED — do not edit manually

import 'package:flutter/material.dart';
import 'ids_enums.dart';

class IdsTokens {
  IdsTokens._();

  static Color resolve({
    required IdsColor color,
    required IdsMode mode,
    required String token,
  }) {
    return switch ((color, mode)) {
      (IdsColor.blue, IdsMode.dark) => _blueDark[token] ?? Colors.transparent,
      (IdsColor.blue, IdsMode.light) => _blueLight[token] ?? Colors.transparent,
      (IdsColor.green, IdsMode.dark) => _greenDark[token] ?? Colors.transparent,
      (IdsColor.green, IdsMode.light) => _greenLight[token] ?? Colors.transparent,
      (IdsColor.orange, IdsMode.dark) => _orangeDark[token] ?? Colors.transparent,
      (IdsColor.orange, IdsMode.light) => _orangeLight[token] ?? Colors.transparent,
    };
  }

  static const _blueDark = <String, Color>{
    'primary': const Color(0xFF60A5FA),
    'on-primary': const Color(0xFF030712),
    'secondary': const Color(0xFF1E3A8A),
    'on-secondary': const Color(0xFFBFDBFE),
  };

  static const _blueLight = <String, Color>{
    'primary': const Color(0xFF2563EB),
    'on-primary': const Color(0xFFFFFFFF),
    'secondary': const Color(0xFFDBEAFE),
    'on-secondary': const Color(0xFF1E40AF),
  };

  static const _greenDark = <String, Color>{
    'primary': const Color(0xFF4ADE5E),
    'on-primary': const Color(0xFF030712),
    'secondary': const Color(0xFF1E4001),
    'on-secondary': const Color(0xFFBBF7BB),
  };

  static const _greenLight = <String, Color>{
    'primary': const Color(0xFF418501),
    'on-primary': const Color(0xFFFFFFFF),
    'secondary': const Color(0xFFDCFCDC),
    'on-secondary': const Color(0xFF2A5701),
  };

  static const _orangeDark = <String, Color>{
    'primary': const Color(0xFFFF7650),
    'on-primary': const Color(0xFF030712),
    'secondary': const Color(0xFF7A2200),
    'on-secondary': const Color(0xFFFFC8B4),
  };

  static const _orangeLight = <String, Color>{
    'primary': const Color(0xFFFF4500),
    'on-primary': const Color(0xFFFFFFFF),
    'secondary': const Color(0xFFFFE8DE),
    'on-secondary': const Color(0xFFA32D00),
  };
}
