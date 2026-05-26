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

  static const _orangeDark = <String, Color>{
    'primary': const Color(0xFFFB923C),
    'on-primary': const Color(0xFF030712),
    'secondary': const Color(0xFF7C2D12),
    'on-secondary': const Color(0xFFFED7AA),
  };

  static const _orangeLight = <String, Color>{
    'primary': const Color(0xFFEA580C),
    'on-primary': const Color(0xFFFFFFFF),
    'secondary': const Color(0xFFFFEDD5),
    'on-secondary': const Color(0xFF9A3412),
  };
}
