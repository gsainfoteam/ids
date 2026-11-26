// GENERATED — do not edit manually

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_color_roles.dart';
import 'ids_enums.dart';

abstract final class IdsShadows {
  static const steps = <String, List<BoxShadow>>{
    '0': <BoxShadow>[],
    '1': <BoxShadow>[
      BoxShadow(
        color: Color(0x0D000000),
        offset: Offset(0, 1),
        blurRadius: 2,
        spreadRadius: 0,
      ),
    ],
    '2': <BoxShadow>[
      BoxShadow(
        color: Color(0x1A000000),
        offset: Offset(0, 10),
        blurRadius: 15,
        spreadRadius: -3,
      ),
      BoxShadow(
        color: Color(0x1A000000),
        offset: Offset(0, 4),
        blurRadius: 6,
        spreadRadius: -4,
      ),
    ],
  };
}

abstract final class IdsComponentTokens {
  static const colorRoles = <IdsMode, Map<String, String>>{
    IdsMode.light: {
      'bg-control-outline': 'bg-base',
      'border-control-outline': 'border-neutral',
      'bg-field-outline': 'bg-base',
      'border-field-outline': 'border-neutral',
      'border-field-bar': 'border-neutral',
      'bg-field-code-outline': 'bg-neutral-soft',
      'bg-field-block-outline': 'bg-block',
      'bg-switch-thumb': 'bg-base',
      'bg-segment': 'bg-base',
      'bg-qr-code': 'bg-base',
      'text-qr-code': 'text-neutral-strong',
      'bg-qr-code-inverse': 'bg-neutral-solid',
      'text-qr-code-inverse': 'text-on-neutral-solid',
    },
    IdsMode.dark: {
      'bg-control-outline': 'bg-block',
      'border-control-outline': 'border-neutral-strong',
      'bg-field-outline': 'bg-block',
      'border-field-outline': 'border-neutral-strong',
      'border-field-bar': 'border-neutral-strong',
      'bg-field-code-outline': 'bg-surface',
      'bg-field-block-outline': 'bg-surface',
      'bg-switch-thumb': 'bg-neutral-solid',
      'bg-segment': 'border-neutral-strong',
      'bg-qr-code': 'bg-neutral-solid',
      'text-qr-code': 'text-on-neutral-solid',
      'bg-qr-code-inverse': 'bg-base',
      'text-qr-code-inverse': 'text-neutral-strong',
    },
  };

  static const shadowSteps = <IdsMode, Map<String, String>>{
    IdsMode.light: {'shadow-surface': '1'},
    IdsMode.dark: {'shadow-surface': '0'},
  };

  static Map<String, T> inMode<T>(
    Map<IdsMode, Map<String, T>> table,
    IdsMode mode,
  ) => table[mode] ?? (throw ArgumentError.value(mode, 'mode', 'has no table'));
}

@immutable
class IdsComponentColors {
  const IdsComponentColors({
    required this.bgControlOutline,
    required this.borderControlOutline,
    required this.bgFieldOutline,
    required this.borderFieldOutline,
    required this.borderFieldBar,
    required this.bgFieldCodeOutline,
    required this.bgFieldBlockOutline,
    required this.bgSwitchThumb,
    required this.bgSegment,
    required this.bgQrCode,
    required this.textQrCode,
    required this.bgQrCodeInverse,
    required this.textQrCodeInverse,
  });

  factory IdsComponentColors.of(IdsColors colors, IdsMode mode) {
    final roles = IdsComponentTokens.inMode(
      IdsComponentTokens.colorRoles,
      mode,
    );
    return IdsComponentColors(
      bgControlOutline: colors[roles['bg-control-outline']!],
      borderControlOutline: colors[roles['border-control-outline']!],
      bgFieldOutline: colors[roles['bg-field-outline']!],
      borderFieldOutline: colors[roles['border-field-outline']!],
      borderFieldBar: colors[roles['border-field-bar']!],
      bgFieldCodeOutline: colors[roles['bg-field-code-outline']!],
      bgFieldBlockOutline: colors[roles['bg-field-block-outline']!],
      bgSwitchThumb: colors[roles['bg-switch-thumb']!],
      bgSegment: colors[roles['bg-segment']!],
      bgQrCode: colors[roles['bg-qr-code']!],
      textQrCode: colors[roles['text-qr-code']!],
      bgQrCodeInverse: colors[roles['bg-qr-code-inverse']!],
      textQrCodeInverse: colors[roles['text-qr-code-inverse']!],
    );
  }

  final Color bgControlOutline;

  final Color borderControlOutline;

  final Color bgFieldOutline;

  final Color borderFieldOutline;

  final Color borderFieldBar;

  final Color bgFieldCodeOutline;

  final Color bgFieldBlockOutline;

  final Color bgSwitchThumb;

  final Color bgSegment;

  final Color bgQrCode;

  final Color textQrCode;

  final Color bgQrCodeInverse;

  final Color textQrCodeInverse;

  Map<String, Color> get tokens => {
    'bg-control-outline': bgControlOutline,
    'border-control-outline': borderControlOutline,
    'bg-field-outline': bgFieldOutline,
    'border-field-outline': borderFieldOutline,
    'border-field-bar': borderFieldBar,
    'bg-field-code-outline': bgFieldCodeOutline,
    'bg-field-block-outline': bgFieldBlockOutline,
    'bg-switch-thumb': bgSwitchThumb,
    'bg-segment': bgSegment,
    'bg-qr-code': bgQrCode,
    'text-qr-code': textQrCode,
    'bg-qr-code-inverse': bgQrCodeInverse,
    'text-qr-code-inverse': textQrCodeInverse,
  };

  @override
  bool operator ==(Object other) =>
      other is IdsComponentColors &&
      other.bgControlOutline == bgControlOutline &&
      other.borderControlOutline == borderControlOutline &&
      other.bgFieldOutline == bgFieldOutline &&
      other.borderFieldOutline == borderFieldOutline &&
      other.borderFieldBar == borderFieldBar &&
      other.bgFieldCodeOutline == bgFieldCodeOutline &&
      other.bgFieldBlockOutline == bgFieldBlockOutline &&
      other.bgSwitchThumb == bgSwitchThumb &&
      other.bgSegment == bgSegment &&
      other.bgQrCode == bgQrCode &&
      other.textQrCode == textQrCode &&
      other.bgQrCodeInverse == bgQrCodeInverse &&
      other.textQrCodeInverse == textQrCodeInverse;

  @override
  int get hashCode => Object.hashAll(tokens.values);
}

@immutable
class IdsComponentShadows {
  const IdsComponentShadows({required this.shadowSurface});

  factory IdsComponentShadows.of(IdsMode mode) {
    final steps = IdsComponentTokens.inMode(
      IdsComponentTokens.shadowSteps,
      mode,
    );
    return IdsComponentShadows(
      shadowSurface: IdsShadows.steps[steps['shadow-surface']!]!,
    );
  }

  final List<BoxShadow> shadowSurface;

  @override
  bool operator ==(Object other) =>
      other is IdsComponentShadows &&
      listEquals(other.shadowSurface, shadowSurface);

  @override
  int get hashCode => Object.hashAll([...shadowSurface]);
}
