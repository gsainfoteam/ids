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
      'bg-field-code-outline': 'bg-neutral-subtle',
      'bg-switch-thumb': 'bg-neutral-subtlest',
      'bg-segmented-control-item': 'bg-neutral-subtlest',
      'bg-qr-code': 'bg-neutral-subtlest',
      'text-qr-code': 'text-neutral-bold',
      'bg-qr-code-inverse': 'bg-neutral-bold',
      'text-qr-code-inverse': 'text-on-neutral-bold',
    },
    IdsMode.dark: {
      'bg-panel': 'bg-neutral-subtler',
      'bg-band': 'bg-neutral-subtlest',
      'bg-control-outline': 'bg-neutral-subtle',
      'border-control-outline': 'bg-neutral',
      'bg-field-outline': 'bg-neutral-subtle',
      'border-field-outline': 'bg-neutral',
      'border-field-bar': 'bg-neutral',
      'bg-field-code-outline': 'bg-neutral-subtler',
      'bg-switch-thumb': 'bg-neutral-bold',
      'bg-segmented-control-item': 'bg-neutral',
      'bg-qr-code': 'bg-neutral-bold',
      'text-qr-code': 'text-on-neutral-bold',
      'bg-qr-code-inverse': 'bg-neutral-subtlest',
      'text-qr-code-inverse': 'text-neutral-bold',
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
    required this.bgFieldCodeOutline,
    required this.bgSwitchThumb,
    required this.bgSegmentedControlItem,
    required this.bgQrCode,
    required this.textQrCode,
    required this.bgQrCodeInverse,
    required this.textQrCodeInverse,
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
      bgFieldCodeOutline: token('bg-field-code-outline'),
      bgSwitchThumb: token('bg-switch-thumb'),
      bgSegmentedControlItem: token('bg-segmented-control-item'),
      bgQrCode: token('bg-qr-code'),
      textQrCode: token('text-qr-code'),
      bgQrCodeInverse: token('bg-qr-code-inverse'),
      textQrCodeInverse: token('text-qr-code-inverse'),
    );
  }

  final Color bgPanel;
  final Color bgBand;
  final Color bgControlOutline;
  final Color borderControlOutline;
  final Color bgFieldOutline;
  final Color borderFieldOutline;
  final Color borderFieldBar;
  final Color bgFieldCodeOutline;
  final Color bgSwitchThumb;
  final Color bgSegmentedControlItem;
  final Color bgQrCode;
  final Color textQrCode;
  final Color bgQrCodeInverse;
  final Color textQrCodeInverse;

  Map<String, Color> get tokens => {
    'bg-panel': bgPanel,
    'bg-band': bgBand,
    'bg-control-outline': bgControlOutline,
    'border-control-outline': borderControlOutline,
    'bg-field-outline': bgFieldOutline,
    'border-field-outline': borderFieldOutline,
    'border-field-bar': borderFieldBar,
    'bg-field-code-outline': bgFieldCodeOutline,
    'bg-switch-thumb': bgSwitchThumb,
    'bg-segmented-control-item': bgSegmentedControlItem,
    'bg-qr-code': bgQrCode,
    'text-qr-code': textQrCode,
    'bg-qr-code-inverse': bgQrCodeInverse,
    'text-qr-code-inverse': textQrCodeInverse,
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
      other.bgFieldCodeOutline == bgFieldCodeOutline &&
      other.bgSwitchThumb == bgSwitchThumb &&
      other.bgSegmentedControlItem == bgSegmentedControlItem &&
      other.bgQrCode == bgQrCode &&
      other.textQrCode == textQrCode &&
      other.bgQrCodeInverse == bgQrCodeInverse &&
      other.textQrCodeInverse == textQrCodeInverse;

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
