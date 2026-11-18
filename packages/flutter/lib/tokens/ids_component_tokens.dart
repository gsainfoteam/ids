// GENERATED — do not edit manually

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_color_roles.dart';
import 'ids_enums.dart';

abstract final class IdsShadows {
  static const steps = <String, List<BoxShadow>>{
    '0': <BoxShadow>[],
    '1': <BoxShadow>[BoxShadow(color: Color(0x0D000000), offset: Offset(0, 1), blurRadius: 2, spreadRadius: 0)],
    '2': <BoxShadow>[BoxShadow(color: Color(0x1A000000), offset: Offset(0, 10), blurRadius: 15, spreadRadius: -3), BoxShadow(color: Color(0x1A000000), offset: Offset(0, 4), blurRadius: 6, spreadRadius: -4)],
  };
}

abstract final class IdsComponentTokens {
  static const colorRoles = <IdsMode, Map<String, String>>{
    IdsMode.light: {
      'bg-panel': 'bg-neutral-subtlest',
      'bg-band': 'bg-neutral-subtler',
      'bg-control-outline': 'bg-neutral-subtlest',
      'border-control-outline': 'border-neutral',
      'bg-field-outline': 'bg-neutral-subtlest',
      'border-field-outline': 'border-neutral',
      'border-field-bar': 'border-neutral',
      'bg-switch-thumb': 'bg-neutral-subtlest',
      'bg-qr-code-light': 'bg-neutral-subtlest',
      'text-qr-code-light': 'text-neutral-bold',
      'bg-qr-code-dark': 'bg-neutral-bold',
      'text-qr-code-dark': 'text-on-neutral-bold',
    },
    IdsMode.dark: {
      'bg-panel': 'bg-neutral-subtler',
      'bg-band': 'bg-neutral-subtlest',
      'bg-control-outline': 'bg-neutral-subtle',
      'border-control-outline': 'bg-neutral',
      'bg-field-outline': 'bg-neutral-subtle',
      'border-field-outline': 'bg-neutral',
      'border-field-bar': 'bg-neutral',
      'bg-switch-thumb': 'bg-neutral-bold',
      'bg-qr-code-light': 'bg-neutral-bold',
      'text-qr-code-light': 'text-on-neutral-bold',
      'bg-qr-code-dark': 'bg-neutral-subtlest',
      'text-qr-code-dark': 'text-neutral-bold',
    },
  };

  static const shadowSteps = <IdsMode, Map<String, String>>{
    IdsMode.light: {
      'shadow-panel': '1',
    },
    IdsMode.dark: {
      'shadow-panel': '0',
    },
  };

  static Map<String, T> inMode<T>(Map<IdsMode, Map<String, T>> table, IdsMode mode) =>
      table[mode] ?? (throw ArgumentError.value(mode, 'mode', 'is not light or dark'));
}

@immutable
class IdsComponentColors {
  const IdsComponentColors({
    required this.bgPanel,
    required this.bgBand,
    required this.bgControlOutline,
    required this.borderControlOutline,
    required this.bgFieldOutline,
    required this.borderFieldOutline,
    required this.borderFieldBar,
    required this.bgSwitchThumb,
    required this.bgQrCodeLight,
    required this.textQrCodeLight,
    required this.bgQrCodeDark,
    required this.textQrCodeDark,
  });

  factory IdsComponentColors.of(IdsColors colors, IdsMode mode) {
    final roles = IdsComponentTokens.inMode(IdsComponentTokens.colorRoles, mode);
    Color token(String name) => colors[roles[name]!];
    return IdsComponentColors(
      bgPanel: token('bg-panel'),
      bgBand: token('bg-band'),
      bgControlOutline: token('bg-control-outline'),
      borderControlOutline: token('border-control-outline'),
      bgFieldOutline: token('bg-field-outline'),
      borderFieldOutline: token('border-field-outline'),
      borderFieldBar: token('border-field-bar'),
      bgSwitchThumb: token('bg-switch-thumb'),
      bgQrCodeLight: token('bg-qr-code-light'),
      textQrCodeLight: token('text-qr-code-light'),
      bgQrCodeDark: token('bg-qr-code-dark'),
      textQrCodeDark: token('text-qr-code-dark'),
    );
  }

  final Color bgPanel;
  final Color bgBand;
  final Color bgControlOutline;
  final Color borderControlOutline;
  final Color bgFieldOutline;
  final Color borderFieldOutline;
  final Color borderFieldBar;
  final Color bgSwitchThumb;
  final Color bgQrCodeLight;
  final Color textQrCodeLight;
  final Color bgQrCodeDark;
  final Color textQrCodeDark;

  Map<String, Color> get tokens => {
    'bg-panel': bgPanel,
    'bg-band': bgBand,
    'bg-control-outline': bgControlOutline,
    'border-control-outline': borderControlOutline,
    'bg-field-outline': bgFieldOutline,
    'border-field-outline': borderFieldOutline,
    'border-field-bar': borderFieldBar,
    'bg-switch-thumb': bgSwitchThumb,
    'bg-qr-code-light': bgQrCodeLight,
    'text-qr-code-light': textQrCodeLight,
    'bg-qr-code-dark': bgQrCodeDark,
    'text-qr-code-dark': textQrCodeDark,
  };

  @override
  bool operator ==(Object other) =>
      other is IdsComponentColors &&
      other.bgPanel == bgPanel &&
      other.bgBand == bgBand &&
      other.bgControlOutline == bgControlOutline &&
      other.borderControlOutline == borderControlOutline &&
      other.bgFieldOutline == bgFieldOutline &&
      other.borderFieldOutline == borderFieldOutline &&
      other.borderFieldBar == borderFieldBar &&
      other.bgSwitchThumb == bgSwitchThumb &&
      other.bgQrCodeLight == bgQrCodeLight &&
      other.textQrCodeLight == textQrCodeLight &&
      other.bgQrCodeDark == bgQrCodeDark &&
      other.textQrCodeDark == textQrCodeDark;

  @override
  int get hashCode => Object.hashAll(tokens.values);
}

@immutable
class IdsComponentShadows {
  const IdsComponentShadows({
    required this.shadowPanel,
  });

  factory IdsComponentShadows.of(IdsMode mode) {
    final steps = IdsComponentTokens.inMode(IdsComponentTokens.shadowSteps, mode);
    List<BoxShadow> token(String name) => IdsShadows.steps[steps[name]!]!;
    return IdsComponentShadows(
      shadowPanel: token('shadow-panel'),
    );
  }

  final List<BoxShadow> shadowPanel;

  @override
  bool operator ==(Object other) =>
      other is IdsComponentShadows &&
      listEquals(other.shadowPanel, shadowPanel);

  @override
  int get hashCode => Object.hashAll([...shadowPanel]);
}
