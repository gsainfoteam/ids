// GENERATED — do not edit manually

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_enums.dart';

abstract final class IdsColorRoles {
  static const neutralFamilies = <String>['neutral'];
  static const brandFamilies = <String>['primary', 'secondary', 'tertiary'];
  static const statusFamilies = <String>['success', 'warning', 'danger', 'info'];
  static const families = <String>['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info'];
  static const familySlots = <String>['bg-{family}-subtlest', 'bg-{family}-subtler', 'bg-{family}-subtle', 'bg-{family}', 'bg-{family}-bold', 'text-on-{family}-subtlest', 'text-on-{family}-subtler', 'text-on-{family}-subtle', 'text-on-{family}', 'text-on-{family}-bold', 'text-{family}', 'text-{family}-bold', 'border-{family}'];
  static const neutralOnlySlots = <String>['bg-{family}-subtlest', 'text-on-{family}-subtlest', 'bg-{family}-bold', 'text-on-{family}-bold', 'text-{family}-bold'];
  static const all = <String>['bg-neutral-subtlest', 'bg-neutral-subtler', 'bg-neutral-subtle', 'bg-neutral', 'bg-neutral-bold', 'text-on-neutral-subtlest', 'text-on-neutral-subtler', 'text-on-neutral-subtle', 'text-on-neutral', 'text-on-neutral-bold', 'text-neutral', 'text-neutral-bold', 'border-neutral', 'bg-primary-subtler', 'bg-primary-subtle', 'bg-primary', 'text-on-primary-subtler', 'text-on-primary-subtle', 'text-on-primary', 'text-primary', 'border-primary', 'bg-secondary-subtler', 'bg-secondary-subtle', 'bg-secondary', 'text-on-secondary-subtler', 'text-on-secondary-subtle', 'text-on-secondary', 'text-secondary', 'border-secondary', 'bg-tertiary-subtler', 'bg-tertiary-subtle', 'bg-tertiary', 'text-on-tertiary-subtler', 'text-on-tertiary-subtle', 'text-on-tertiary', 'text-tertiary', 'border-tertiary', 'bg-success-subtler', 'bg-success-subtle', 'bg-success', 'text-on-success-subtler', 'text-on-success-subtle', 'text-on-success', 'text-success', 'border-success', 'bg-warning-subtler', 'bg-warning-subtle', 'bg-warning', 'text-on-warning-subtler', 'text-on-warning-subtle', 'text-on-warning', 'text-warning', 'border-warning', 'bg-danger-subtler', 'bg-danger-subtle', 'bg-danger', 'text-on-danger-subtler', 'text-on-danger-subtle', 'text-on-danger', 'text-danger', 'border-danger', 'bg-info-subtler', 'bg-info-subtle', 'bg-info', 'text-on-info-subtler', 'text-on-info-subtle', 'text-on-info', 'text-info', 'border-info'];

  static const neutralPalette = <int, Color>{
    0: Color(0xFFFFFFFF),
    50: Color(0xFFFAFAFA),
    100: Color(0xFFF5F5F5),
    200: Color(0xFFE5E5E5),
    300: Color(0xFFD4D4D4),
    400: Color(0xFFA3A3A3),
    500: Color(0xFF737373),
    600: Color(0xFF525252),
    700: Color(0xFF404040),
    800: Color(0xFF262626),
    850: Color(0xFF1E1E1E),
    900: Color(0xFF171717),
    950: Color(0xFF0A0A0A),
  };

  static const neutralSteps = <IdsMode, Map<String, int>>{
    IdsMode.light: {
      'bg-neutral-subtlest': 0,
      'bg-neutral-subtler': 50,
      'bg-neutral-subtle': 100,
      'bg-neutral': 300,
      'bg-neutral-bold': 900,
      'text-on-neutral-subtlest': 900,
      'text-on-neutral-subtler': 900,
      'text-on-neutral-subtle': 900,
      'text-on-neutral': 950,
      'text-on-neutral-bold': 0,
      'text-neutral': 600,
      'text-neutral-bold': 900,
      'border-neutral': 200,
    },
    IdsMode.dark: {
      'bg-neutral-subtlest': 950,
      'bg-neutral-subtler': 900,
      'bg-neutral-subtle': 850,
      'bg-neutral': 700,
      'bg-neutral-bold': 50,
      'text-on-neutral-subtlest': 50,
      'text-on-neutral-subtler': 50,
      'text-on-neutral-subtle': 50,
      'text-on-neutral': 50,
      'text-on-neutral-bold': 950,
      'text-neutral': 300,
      'text-neutral-bold': 50,
      'border-neutral': 800,
    },
  };

  static List<String> slotsOf(String family) => [
    for (final slot in familySlots)
      if (family == 'neutral' || !neutralOnlySlots.contains(slot))
        slot.replaceAll('{family}', family),
  ];
}

abstract final class IdsStateOpacity {
  static const double hover = 0.06;
  static const double press = 0.1;
  static const double tintHover = 0.08;
  static const double tintPress = 0.12;
  static const double fillHover = 0.1;
  static const double fillPress = 0.18;
}

abstract final class IdsStateLayer {
  static const fillColor = Color(0xFF000000);
}

@immutable
class IdsColors {
  const IdsColors({
    required this.bgNeutralSubtlest,
    required this.bgNeutralSubtler,
    required this.bgNeutralSubtle,
    required this.bgNeutral,
    required this.bgNeutralBold,
    required this.textOnNeutralSubtlest,
    required this.textOnNeutralSubtler,
    required this.textOnNeutralSubtle,
    required this.textOnNeutral,
    required this.textOnNeutralBold,
    required this.textNeutral,
    required this.textNeutralBold,
    required this.borderNeutral,
    required this.bgPrimarySubtler,
    required this.bgPrimarySubtle,
    required this.bgPrimary,
    required this.textOnPrimarySubtler,
    required this.textOnPrimarySubtle,
    required this.textOnPrimary,
    required this.textPrimary,
    required this.borderPrimary,
    required this.bgSecondarySubtler,
    required this.bgSecondarySubtle,
    required this.bgSecondary,
    required this.textOnSecondarySubtler,
    required this.textOnSecondarySubtle,
    required this.textOnSecondary,
    required this.textSecondary,
    required this.borderSecondary,
    required this.bgTertiarySubtler,
    required this.bgTertiarySubtle,
    required this.bgTertiary,
    required this.textOnTertiarySubtler,
    required this.textOnTertiarySubtle,
    required this.textOnTertiary,
    required this.textTertiary,
    required this.borderTertiary,
    required this.bgSuccessSubtler,
    required this.bgSuccessSubtle,
    required this.bgSuccess,
    required this.textOnSuccessSubtler,
    required this.textOnSuccessSubtle,
    required this.textOnSuccess,
    required this.textSuccess,
    required this.borderSuccess,
    required this.bgWarningSubtler,
    required this.bgWarningSubtle,
    required this.bgWarning,
    required this.textOnWarningSubtler,
    required this.textOnWarningSubtle,
    required this.textOnWarning,
    required this.textWarning,
    required this.borderWarning,
    required this.bgDangerSubtler,
    required this.bgDangerSubtle,
    required this.bgDanger,
    required this.textOnDangerSubtler,
    required this.textOnDangerSubtle,
    required this.textOnDanger,
    required this.textDanger,
    required this.borderDanger,
    required this.bgInfoSubtler,
    required this.bgInfoSubtle,
    required this.bgInfo,
    required this.textOnInfoSubtler,
    required this.textOnInfoSubtle,
    required this.textOnInfo,
    required this.textInfo,
    required this.borderInfo,
  });

  factory IdsColors.fromRoles(Map<String, Color> roles) {
    Color role(String name) =>
        roles[name] ?? (throw ArgumentError.value(name, 'roles', 'is missing'));
    return IdsColors(
      bgNeutralSubtlest: role('bg-neutral-subtlest'),
      bgNeutralSubtler: role('bg-neutral-subtler'),
      bgNeutralSubtle: role('bg-neutral-subtle'),
      bgNeutral: role('bg-neutral'),
      bgNeutralBold: role('bg-neutral-bold'),
      textOnNeutralSubtlest: role('text-on-neutral-subtlest'),
      textOnNeutralSubtler: role('text-on-neutral-subtler'),
      textOnNeutralSubtle: role('text-on-neutral-subtle'),
      textOnNeutral: role('text-on-neutral'),
      textOnNeutralBold: role('text-on-neutral-bold'),
      textNeutral: role('text-neutral'),
      textNeutralBold: role('text-neutral-bold'),
      borderNeutral: role('border-neutral'),
      bgPrimarySubtler: role('bg-primary-subtler'),
      bgPrimarySubtle: role('bg-primary-subtle'),
      bgPrimary: role('bg-primary'),
      textOnPrimarySubtler: role('text-on-primary-subtler'),
      textOnPrimarySubtle: role('text-on-primary-subtle'),
      textOnPrimary: role('text-on-primary'),
      textPrimary: role('text-primary'),
      borderPrimary: role('border-primary'),
      bgSecondarySubtler: role('bg-secondary-subtler'),
      bgSecondarySubtle: role('bg-secondary-subtle'),
      bgSecondary: role('bg-secondary'),
      textOnSecondarySubtler: role('text-on-secondary-subtler'),
      textOnSecondarySubtle: role('text-on-secondary-subtle'),
      textOnSecondary: role('text-on-secondary'),
      textSecondary: role('text-secondary'),
      borderSecondary: role('border-secondary'),
      bgTertiarySubtler: role('bg-tertiary-subtler'),
      bgTertiarySubtle: role('bg-tertiary-subtle'),
      bgTertiary: role('bg-tertiary'),
      textOnTertiarySubtler: role('text-on-tertiary-subtler'),
      textOnTertiarySubtle: role('text-on-tertiary-subtle'),
      textOnTertiary: role('text-on-tertiary'),
      textTertiary: role('text-tertiary'),
      borderTertiary: role('border-tertiary'),
      bgSuccessSubtler: role('bg-success-subtler'),
      bgSuccessSubtle: role('bg-success-subtle'),
      bgSuccess: role('bg-success'),
      textOnSuccessSubtler: role('text-on-success-subtler'),
      textOnSuccessSubtle: role('text-on-success-subtle'),
      textOnSuccess: role('text-on-success'),
      textSuccess: role('text-success'),
      borderSuccess: role('border-success'),
      bgWarningSubtler: role('bg-warning-subtler'),
      bgWarningSubtle: role('bg-warning-subtle'),
      bgWarning: role('bg-warning'),
      textOnWarningSubtler: role('text-on-warning-subtler'),
      textOnWarningSubtle: role('text-on-warning-subtle'),
      textOnWarning: role('text-on-warning'),
      textWarning: role('text-warning'),
      borderWarning: role('border-warning'),
      bgDangerSubtler: role('bg-danger-subtler'),
      bgDangerSubtle: role('bg-danger-subtle'),
      bgDanger: role('bg-danger'),
      textOnDangerSubtler: role('text-on-danger-subtler'),
      textOnDangerSubtle: role('text-on-danger-subtle'),
      textOnDanger: role('text-on-danger'),
      textDanger: role('text-danger'),
      borderDanger: role('border-danger'),
      bgInfoSubtler: role('bg-info-subtler'),
      bgInfoSubtle: role('bg-info-subtle'),
      bgInfo: role('bg-info'),
      textOnInfoSubtler: role('text-on-info-subtler'),
      textOnInfoSubtle: role('text-on-info-subtle'),
      textOnInfo: role('text-on-info'),
      textInfo: role('text-info'),
      borderInfo: role('border-info'),
    );
  }

  final Color bgNeutralSubtlest;
  final Color bgNeutralSubtler;
  final Color bgNeutralSubtle;
  final Color bgNeutral;
  final Color bgNeutralBold;
  final Color textOnNeutralSubtlest;
  final Color textOnNeutralSubtler;
  final Color textOnNeutralSubtle;
  final Color textOnNeutral;
  final Color textOnNeutralBold;
  final Color textNeutral;
  final Color textNeutralBold;
  final Color borderNeutral;
  final Color bgPrimarySubtler;
  final Color bgPrimarySubtle;
  final Color bgPrimary;
  final Color textOnPrimarySubtler;
  final Color textOnPrimarySubtle;
  final Color textOnPrimary;
  final Color textPrimary;
  final Color borderPrimary;
  final Color bgSecondarySubtler;
  final Color bgSecondarySubtle;
  final Color bgSecondary;
  final Color textOnSecondarySubtler;
  final Color textOnSecondarySubtle;
  final Color textOnSecondary;
  final Color textSecondary;
  final Color borderSecondary;
  final Color bgTertiarySubtler;
  final Color bgTertiarySubtle;
  final Color bgTertiary;
  final Color textOnTertiarySubtler;
  final Color textOnTertiarySubtle;
  final Color textOnTertiary;
  final Color textTertiary;
  final Color borderTertiary;
  final Color bgSuccessSubtler;
  final Color bgSuccessSubtle;
  final Color bgSuccess;
  final Color textOnSuccessSubtler;
  final Color textOnSuccessSubtle;
  final Color textOnSuccess;
  final Color textSuccess;
  final Color borderSuccess;
  final Color bgWarningSubtler;
  final Color bgWarningSubtle;
  final Color bgWarning;
  final Color textOnWarningSubtler;
  final Color textOnWarningSubtle;
  final Color textOnWarning;
  final Color textWarning;
  final Color borderWarning;
  final Color bgDangerSubtler;
  final Color bgDangerSubtle;
  final Color bgDanger;
  final Color textOnDangerSubtler;
  final Color textOnDangerSubtle;
  final Color textOnDanger;
  final Color textDanger;
  final Color borderDanger;
  final Color bgInfoSubtler;
  final Color bgInfoSubtle;
  final Color bgInfo;
  final Color textOnInfoSubtler;
  final Color textOnInfoSubtle;
  final Color textOnInfo;
  final Color textInfo;
  final Color borderInfo;

  Map<String, Color> get roles => {
    'bg-neutral-subtlest': bgNeutralSubtlest,
    'bg-neutral-subtler': bgNeutralSubtler,
    'bg-neutral-subtle': bgNeutralSubtle,
    'bg-neutral': bgNeutral,
    'bg-neutral-bold': bgNeutralBold,
    'text-on-neutral-subtlest': textOnNeutralSubtlest,
    'text-on-neutral-subtler': textOnNeutralSubtler,
    'text-on-neutral-subtle': textOnNeutralSubtle,
    'text-on-neutral': textOnNeutral,
    'text-on-neutral-bold': textOnNeutralBold,
    'text-neutral': textNeutral,
    'text-neutral-bold': textNeutralBold,
    'border-neutral': borderNeutral,
    'bg-primary-subtler': bgPrimarySubtler,
    'bg-primary-subtle': bgPrimarySubtle,
    'bg-primary': bgPrimary,
    'text-on-primary-subtler': textOnPrimarySubtler,
    'text-on-primary-subtle': textOnPrimarySubtle,
    'text-on-primary': textOnPrimary,
    'text-primary': textPrimary,
    'border-primary': borderPrimary,
    'bg-secondary-subtler': bgSecondarySubtler,
    'bg-secondary-subtle': bgSecondarySubtle,
    'bg-secondary': bgSecondary,
    'text-on-secondary-subtler': textOnSecondarySubtler,
    'text-on-secondary-subtle': textOnSecondarySubtle,
    'text-on-secondary': textOnSecondary,
    'text-secondary': textSecondary,
    'border-secondary': borderSecondary,
    'bg-tertiary-subtler': bgTertiarySubtler,
    'bg-tertiary-subtle': bgTertiarySubtle,
    'bg-tertiary': bgTertiary,
    'text-on-tertiary-subtler': textOnTertiarySubtler,
    'text-on-tertiary-subtle': textOnTertiarySubtle,
    'text-on-tertiary': textOnTertiary,
    'text-tertiary': textTertiary,
    'border-tertiary': borderTertiary,
    'bg-success-subtler': bgSuccessSubtler,
    'bg-success-subtle': bgSuccessSubtle,
    'bg-success': bgSuccess,
    'text-on-success-subtler': textOnSuccessSubtler,
    'text-on-success-subtle': textOnSuccessSubtle,
    'text-on-success': textOnSuccess,
    'text-success': textSuccess,
    'border-success': borderSuccess,
    'bg-warning-subtler': bgWarningSubtler,
    'bg-warning-subtle': bgWarningSubtle,
    'bg-warning': bgWarning,
    'text-on-warning-subtler': textOnWarningSubtler,
    'text-on-warning-subtle': textOnWarningSubtle,
    'text-on-warning': textOnWarning,
    'text-warning': textWarning,
    'border-warning': borderWarning,
    'bg-danger-subtler': bgDangerSubtler,
    'bg-danger-subtle': bgDangerSubtle,
    'bg-danger': bgDanger,
    'text-on-danger-subtler': textOnDangerSubtler,
    'text-on-danger-subtle': textOnDangerSubtle,
    'text-on-danger': textOnDanger,
    'text-danger': textDanger,
    'border-danger': borderDanger,
    'bg-info-subtler': bgInfoSubtler,
    'bg-info-subtle': bgInfoSubtle,
    'bg-info': bgInfo,
    'text-on-info-subtler': textOnInfoSubtler,
    'text-on-info-subtle': textOnInfoSubtle,
    'text-on-info': textOnInfo,
    'text-info': textInfo,
    'border-info': borderInfo,
  };

  Color operator [](String role) =>
      roles[role] ?? (throw ArgumentError.value(role, 'role', 'is not an IDS color role'));

  @override
  bool operator ==(Object other) =>
      other is IdsColors &&
      other.bgNeutralSubtlest == bgNeutralSubtlest &&
      other.bgNeutralSubtler == bgNeutralSubtler &&
      other.bgNeutralSubtle == bgNeutralSubtle &&
      other.bgNeutral == bgNeutral &&
      other.bgNeutralBold == bgNeutralBold &&
      other.textOnNeutralSubtlest == textOnNeutralSubtlest &&
      other.textOnNeutralSubtler == textOnNeutralSubtler &&
      other.textOnNeutralSubtle == textOnNeutralSubtle &&
      other.textOnNeutral == textOnNeutral &&
      other.textOnNeutralBold == textOnNeutralBold &&
      other.textNeutral == textNeutral &&
      other.textNeutralBold == textNeutralBold &&
      other.borderNeutral == borderNeutral &&
      other.bgPrimarySubtler == bgPrimarySubtler &&
      other.bgPrimarySubtle == bgPrimarySubtle &&
      other.bgPrimary == bgPrimary &&
      other.textOnPrimarySubtler == textOnPrimarySubtler &&
      other.textOnPrimarySubtle == textOnPrimarySubtle &&
      other.textOnPrimary == textOnPrimary &&
      other.textPrimary == textPrimary &&
      other.borderPrimary == borderPrimary &&
      other.bgSecondarySubtler == bgSecondarySubtler &&
      other.bgSecondarySubtle == bgSecondarySubtle &&
      other.bgSecondary == bgSecondary &&
      other.textOnSecondarySubtler == textOnSecondarySubtler &&
      other.textOnSecondarySubtle == textOnSecondarySubtle &&
      other.textOnSecondary == textOnSecondary &&
      other.textSecondary == textSecondary &&
      other.borderSecondary == borderSecondary &&
      other.bgTertiarySubtler == bgTertiarySubtler &&
      other.bgTertiarySubtle == bgTertiarySubtle &&
      other.bgTertiary == bgTertiary &&
      other.textOnTertiarySubtler == textOnTertiarySubtler &&
      other.textOnTertiarySubtle == textOnTertiarySubtle &&
      other.textOnTertiary == textOnTertiary &&
      other.textTertiary == textTertiary &&
      other.borderTertiary == borderTertiary &&
      other.bgSuccessSubtler == bgSuccessSubtler &&
      other.bgSuccessSubtle == bgSuccessSubtle &&
      other.bgSuccess == bgSuccess &&
      other.textOnSuccessSubtler == textOnSuccessSubtler &&
      other.textOnSuccessSubtle == textOnSuccessSubtle &&
      other.textOnSuccess == textOnSuccess &&
      other.textSuccess == textSuccess &&
      other.borderSuccess == borderSuccess &&
      other.bgWarningSubtler == bgWarningSubtler &&
      other.bgWarningSubtle == bgWarningSubtle &&
      other.bgWarning == bgWarning &&
      other.textOnWarningSubtler == textOnWarningSubtler &&
      other.textOnWarningSubtle == textOnWarningSubtle &&
      other.textOnWarning == textOnWarning &&
      other.textWarning == textWarning &&
      other.borderWarning == borderWarning &&
      other.bgDangerSubtler == bgDangerSubtler &&
      other.bgDangerSubtle == bgDangerSubtle &&
      other.bgDanger == bgDanger &&
      other.textOnDangerSubtler == textOnDangerSubtler &&
      other.textOnDangerSubtle == textOnDangerSubtle &&
      other.textOnDanger == textOnDanger &&
      other.textDanger == textDanger &&
      other.borderDanger == borderDanger &&
      other.bgInfoSubtler == bgInfoSubtler &&
      other.bgInfoSubtle == bgInfoSubtle &&
      other.bgInfo == bgInfo &&
      other.textOnInfoSubtler == textOnInfoSubtler &&
      other.textOnInfoSubtle == textOnInfoSubtle &&
      other.textOnInfo == textOnInfo &&
      other.textInfo == textInfo &&
      other.borderInfo == borderInfo;

  @override
  int get hashCode => Object.hashAll(roles.values);
}
