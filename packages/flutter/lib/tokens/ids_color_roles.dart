// GENERATED — do not edit manually

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_enums.dart';

abstract final class IdsColorRoles {
  static const neutralFamilies = <String>['neutral'];
  static const brandFamilies = <String>['primary', 'secondary', 'tertiary'];
  static const statusFamilies = <String>['success', 'warning', 'danger', 'info'];
  static const families = <String>['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info'];
  static const baseSlots = <String>['surface', 'on-surface'];
  static const familySlots = <String>['bg-{family}', 'bg-{family}-hover', 'bg-{family}-active', 'bg-{family}-soft', 'bg-{family}-soft-hover', 'bg-{family}-soft-active', 'text-on-{family}', 'text-on-{family}-soft', 'text-{family}', 'border-{family}'];
  static const all = <String>['surface', 'on-surface', 'bg-neutral', 'bg-neutral-hover', 'bg-neutral-active', 'bg-neutral-soft', 'bg-neutral-soft-hover', 'bg-neutral-soft-active', 'text-on-neutral', 'text-on-neutral-soft', 'text-neutral', 'border-neutral', 'bg-primary', 'bg-primary-hover', 'bg-primary-active', 'bg-primary-soft', 'bg-primary-soft-hover', 'bg-primary-soft-active', 'text-on-primary', 'text-on-primary-soft', 'text-primary', 'border-primary', 'bg-secondary', 'bg-secondary-hover', 'bg-secondary-active', 'bg-secondary-soft', 'bg-secondary-soft-hover', 'bg-secondary-soft-active', 'text-on-secondary', 'text-on-secondary-soft', 'text-secondary', 'border-secondary', 'bg-tertiary', 'bg-tertiary-hover', 'bg-tertiary-active', 'bg-tertiary-soft', 'bg-tertiary-soft-hover', 'bg-tertiary-soft-active', 'text-on-tertiary', 'text-on-tertiary-soft', 'text-tertiary', 'border-tertiary', 'bg-success', 'bg-success-hover', 'bg-success-active', 'bg-success-soft', 'bg-success-soft-hover', 'bg-success-soft-active', 'text-on-success', 'text-on-success-soft', 'text-success', 'border-success', 'bg-warning', 'bg-warning-hover', 'bg-warning-active', 'bg-warning-soft', 'bg-warning-soft-hover', 'bg-warning-soft-active', 'text-on-warning', 'text-on-warning-soft', 'text-warning', 'border-warning', 'bg-danger', 'bg-danger-hover', 'bg-danger-active', 'bg-danger-soft', 'bg-danger-soft-hover', 'bg-danger-soft-active', 'text-on-danger', 'text-on-danger-soft', 'text-danger', 'border-danger', 'bg-info', 'bg-info-hover', 'bg-info-active', 'bg-info-soft', 'bg-info-soft-hover', 'bg-info-soft-active', 'text-on-info', 'text-on-info-soft', 'text-info', 'border-info'];

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
    900: Color(0xFF171717),
    950: Color(0xFF0A0A0A),
  };

  static const neutralSteps = <IdsMode, Map<String, int>>{
    IdsMode.light: {
      'surface': 0,
      'on-surface': 900,
      'bg-neutral': 300,
      'bg-neutral-hover': 400,
      'bg-neutral-active': 500,
      'bg-neutral-soft': 100,
      'bg-neutral-soft-hover': 200,
      'bg-neutral-soft-active': 300,
      'text-on-neutral': 950,
      'text-on-neutral-soft': 900,
      'text-neutral': 600,
      'border-neutral': 200,
    },
    IdsMode.dark: {
      'surface': 950,
      'on-surface': 50,
      'bg-neutral': 700,
      'bg-neutral-hover': 600,
      'bg-neutral-active': 500,
      'bg-neutral-soft': 800,
      'bg-neutral-soft-hover': 700,
      'bg-neutral-soft-active': 600,
      'text-on-neutral': 50,
      'text-on-neutral-soft': 50,
      'text-neutral': 300,
      'border-neutral': 800,
    },
  };

  static List<String> slotsOf(String family) => [
    for (final slot in familySlots) slot.replaceAll('{family}', family),
  ];
}

@immutable
class IdsColors {
  const IdsColors({
    required this.surface,
    required this.onSurface,
    required this.bgNeutral,
    required this.bgNeutralHover,
    required this.bgNeutralActive,
    required this.bgNeutralSoft,
    required this.bgNeutralSoftHover,
    required this.bgNeutralSoftActive,
    required this.textOnNeutral,
    required this.textOnNeutralSoft,
    required this.textNeutral,
    required this.borderNeutral,
    required this.bgPrimary,
    required this.bgPrimaryHover,
    required this.bgPrimaryActive,
    required this.bgPrimarySoft,
    required this.bgPrimarySoftHover,
    required this.bgPrimarySoftActive,
    required this.textOnPrimary,
    required this.textOnPrimarySoft,
    required this.textPrimary,
    required this.borderPrimary,
    required this.bgSecondary,
    required this.bgSecondaryHover,
    required this.bgSecondaryActive,
    required this.bgSecondarySoft,
    required this.bgSecondarySoftHover,
    required this.bgSecondarySoftActive,
    required this.textOnSecondary,
    required this.textOnSecondarySoft,
    required this.textSecondary,
    required this.borderSecondary,
    required this.bgTertiary,
    required this.bgTertiaryHover,
    required this.bgTertiaryActive,
    required this.bgTertiarySoft,
    required this.bgTertiarySoftHover,
    required this.bgTertiarySoftActive,
    required this.textOnTertiary,
    required this.textOnTertiarySoft,
    required this.textTertiary,
    required this.borderTertiary,
    required this.bgSuccess,
    required this.bgSuccessHover,
    required this.bgSuccessActive,
    required this.bgSuccessSoft,
    required this.bgSuccessSoftHover,
    required this.bgSuccessSoftActive,
    required this.textOnSuccess,
    required this.textOnSuccessSoft,
    required this.textSuccess,
    required this.borderSuccess,
    required this.bgWarning,
    required this.bgWarningHover,
    required this.bgWarningActive,
    required this.bgWarningSoft,
    required this.bgWarningSoftHover,
    required this.bgWarningSoftActive,
    required this.textOnWarning,
    required this.textOnWarningSoft,
    required this.textWarning,
    required this.borderWarning,
    required this.bgDanger,
    required this.bgDangerHover,
    required this.bgDangerActive,
    required this.bgDangerSoft,
    required this.bgDangerSoftHover,
    required this.bgDangerSoftActive,
    required this.textOnDanger,
    required this.textOnDangerSoft,
    required this.textDanger,
    required this.borderDanger,
    required this.bgInfo,
    required this.bgInfoHover,
    required this.bgInfoActive,
    required this.bgInfoSoft,
    required this.bgInfoSoftHover,
    required this.bgInfoSoftActive,
    required this.textOnInfo,
    required this.textOnInfoSoft,
    required this.textInfo,
    required this.borderInfo,
  });

  factory IdsColors.fromRoles(Map<String, Color> roles) {
    Color role(String name) =>
        roles[name] ?? (throw ArgumentError.value(name, 'roles', 'is missing'));
    return IdsColors(
      surface: role('surface'),
      onSurface: role('on-surface'),
      bgNeutral: role('bg-neutral'),
      bgNeutralHover: role('bg-neutral-hover'),
      bgNeutralActive: role('bg-neutral-active'),
      bgNeutralSoft: role('bg-neutral-soft'),
      bgNeutralSoftHover: role('bg-neutral-soft-hover'),
      bgNeutralSoftActive: role('bg-neutral-soft-active'),
      textOnNeutral: role('text-on-neutral'),
      textOnNeutralSoft: role('text-on-neutral-soft'),
      textNeutral: role('text-neutral'),
      borderNeutral: role('border-neutral'),
      bgPrimary: role('bg-primary'),
      bgPrimaryHover: role('bg-primary-hover'),
      bgPrimaryActive: role('bg-primary-active'),
      bgPrimarySoft: role('bg-primary-soft'),
      bgPrimarySoftHover: role('bg-primary-soft-hover'),
      bgPrimarySoftActive: role('bg-primary-soft-active'),
      textOnPrimary: role('text-on-primary'),
      textOnPrimarySoft: role('text-on-primary-soft'),
      textPrimary: role('text-primary'),
      borderPrimary: role('border-primary'),
      bgSecondary: role('bg-secondary'),
      bgSecondaryHover: role('bg-secondary-hover'),
      bgSecondaryActive: role('bg-secondary-active'),
      bgSecondarySoft: role('bg-secondary-soft'),
      bgSecondarySoftHover: role('bg-secondary-soft-hover'),
      bgSecondarySoftActive: role('bg-secondary-soft-active'),
      textOnSecondary: role('text-on-secondary'),
      textOnSecondarySoft: role('text-on-secondary-soft'),
      textSecondary: role('text-secondary'),
      borderSecondary: role('border-secondary'),
      bgTertiary: role('bg-tertiary'),
      bgTertiaryHover: role('bg-tertiary-hover'),
      bgTertiaryActive: role('bg-tertiary-active'),
      bgTertiarySoft: role('bg-tertiary-soft'),
      bgTertiarySoftHover: role('bg-tertiary-soft-hover'),
      bgTertiarySoftActive: role('bg-tertiary-soft-active'),
      textOnTertiary: role('text-on-tertiary'),
      textOnTertiarySoft: role('text-on-tertiary-soft'),
      textTertiary: role('text-tertiary'),
      borderTertiary: role('border-tertiary'),
      bgSuccess: role('bg-success'),
      bgSuccessHover: role('bg-success-hover'),
      bgSuccessActive: role('bg-success-active'),
      bgSuccessSoft: role('bg-success-soft'),
      bgSuccessSoftHover: role('bg-success-soft-hover'),
      bgSuccessSoftActive: role('bg-success-soft-active'),
      textOnSuccess: role('text-on-success'),
      textOnSuccessSoft: role('text-on-success-soft'),
      textSuccess: role('text-success'),
      borderSuccess: role('border-success'),
      bgWarning: role('bg-warning'),
      bgWarningHover: role('bg-warning-hover'),
      bgWarningActive: role('bg-warning-active'),
      bgWarningSoft: role('bg-warning-soft'),
      bgWarningSoftHover: role('bg-warning-soft-hover'),
      bgWarningSoftActive: role('bg-warning-soft-active'),
      textOnWarning: role('text-on-warning'),
      textOnWarningSoft: role('text-on-warning-soft'),
      textWarning: role('text-warning'),
      borderWarning: role('border-warning'),
      bgDanger: role('bg-danger'),
      bgDangerHover: role('bg-danger-hover'),
      bgDangerActive: role('bg-danger-active'),
      bgDangerSoft: role('bg-danger-soft'),
      bgDangerSoftHover: role('bg-danger-soft-hover'),
      bgDangerSoftActive: role('bg-danger-soft-active'),
      textOnDanger: role('text-on-danger'),
      textOnDangerSoft: role('text-on-danger-soft'),
      textDanger: role('text-danger'),
      borderDanger: role('border-danger'),
      bgInfo: role('bg-info'),
      bgInfoHover: role('bg-info-hover'),
      bgInfoActive: role('bg-info-active'),
      bgInfoSoft: role('bg-info-soft'),
      bgInfoSoftHover: role('bg-info-soft-hover'),
      bgInfoSoftActive: role('bg-info-soft-active'),
      textOnInfo: role('text-on-info'),
      textOnInfoSoft: role('text-on-info-soft'),
      textInfo: role('text-info'),
      borderInfo: role('border-info'),
    );
  }

  final Color surface;
  final Color onSurface;
  final Color bgNeutral;
  final Color bgNeutralHover;
  final Color bgNeutralActive;
  final Color bgNeutralSoft;
  final Color bgNeutralSoftHover;
  final Color bgNeutralSoftActive;
  final Color textOnNeutral;
  final Color textOnNeutralSoft;
  final Color textNeutral;
  final Color borderNeutral;
  final Color bgPrimary;
  final Color bgPrimaryHover;
  final Color bgPrimaryActive;
  final Color bgPrimarySoft;
  final Color bgPrimarySoftHover;
  final Color bgPrimarySoftActive;
  final Color textOnPrimary;
  final Color textOnPrimarySoft;
  final Color textPrimary;
  final Color borderPrimary;
  final Color bgSecondary;
  final Color bgSecondaryHover;
  final Color bgSecondaryActive;
  final Color bgSecondarySoft;
  final Color bgSecondarySoftHover;
  final Color bgSecondarySoftActive;
  final Color textOnSecondary;
  final Color textOnSecondarySoft;
  final Color textSecondary;
  final Color borderSecondary;
  final Color bgTertiary;
  final Color bgTertiaryHover;
  final Color bgTertiaryActive;
  final Color bgTertiarySoft;
  final Color bgTertiarySoftHover;
  final Color bgTertiarySoftActive;
  final Color textOnTertiary;
  final Color textOnTertiarySoft;
  final Color textTertiary;
  final Color borderTertiary;
  final Color bgSuccess;
  final Color bgSuccessHover;
  final Color bgSuccessActive;
  final Color bgSuccessSoft;
  final Color bgSuccessSoftHover;
  final Color bgSuccessSoftActive;
  final Color textOnSuccess;
  final Color textOnSuccessSoft;
  final Color textSuccess;
  final Color borderSuccess;
  final Color bgWarning;
  final Color bgWarningHover;
  final Color bgWarningActive;
  final Color bgWarningSoft;
  final Color bgWarningSoftHover;
  final Color bgWarningSoftActive;
  final Color textOnWarning;
  final Color textOnWarningSoft;
  final Color textWarning;
  final Color borderWarning;
  final Color bgDanger;
  final Color bgDangerHover;
  final Color bgDangerActive;
  final Color bgDangerSoft;
  final Color bgDangerSoftHover;
  final Color bgDangerSoftActive;
  final Color textOnDanger;
  final Color textOnDangerSoft;
  final Color textDanger;
  final Color borderDanger;
  final Color bgInfo;
  final Color bgInfoHover;
  final Color bgInfoActive;
  final Color bgInfoSoft;
  final Color bgInfoSoftHover;
  final Color bgInfoSoftActive;
  final Color textOnInfo;
  final Color textOnInfoSoft;
  final Color textInfo;
  final Color borderInfo;

  Map<String, Color> get roles => {
    'surface': surface,
    'on-surface': onSurface,
    'bg-neutral': bgNeutral,
    'bg-neutral-hover': bgNeutralHover,
    'bg-neutral-active': bgNeutralActive,
    'bg-neutral-soft': bgNeutralSoft,
    'bg-neutral-soft-hover': bgNeutralSoftHover,
    'bg-neutral-soft-active': bgNeutralSoftActive,
    'text-on-neutral': textOnNeutral,
    'text-on-neutral-soft': textOnNeutralSoft,
    'text-neutral': textNeutral,
    'border-neutral': borderNeutral,
    'bg-primary': bgPrimary,
    'bg-primary-hover': bgPrimaryHover,
    'bg-primary-active': bgPrimaryActive,
    'bg-primary-soft': bgPrimarySoft,
    'bg-primary-soft-hover': bgPrimarySoftHover,
    'bg-primary-soft-active': bgPrimarySoftActive,
    'text-on-primary': textOnPrimary,
    'text-on-primary-soft': textOnPrimarySoft,
    'text-primary': textPrimary,
    'border-primary': borderPrimary,
    'bg-secondary': bgSecondary,
    'bg-secondary-hover': bgSecondaryHover,
    'bg-secondary-active': bgSecondaryActive,
    'bg-secondary-soft': bgSecondarySoft,
    'bg-secondary-soft-hover': bgSecondarySoftHover,
    'bg-secondary-soft-active': bgSecondarySoftActive,
    'text-on-secondary': textOnSecondary,
    'text-on-secondary-soft': textOnSecondarySoft,
    'text-secondary': textSecondary,
    'border-secondary': borderSecondary,
    'bg-tertiary': bgTertiary,
    'bg-tertiary-hover': bgTertiaryHover,
    'bg-tertiary-active': bgTertiaryActive,
    'bg-tertiary-soft': bgTertiarySoft,
    'bg-tertiary-soft-hover': bgTertiarySoftHover,
    'bg-tertiary-soft-active': bgTertiarySoftActive,
    'text-on-tertiary': textOnTertiary,
    'text-on-tertiary-soft': textOnTertiarySoft,
    'text-tertiary': textTertiary,
    'border-tertiary': borderTertiary,
    'bg-success': bgSuccess,
    'bg-success-hover': bgSuccessHover,
    'bg-success-active': bgSuccessActive,
    'bg-success-soft': bgSuccessSoft,
    'bg-success-soft-hover': bgSuccessSoftHover,
    'bg-success-soft-active': bgSuccessSoftActive,
    'text-on-success': textOnSuccess,
    'text-on-success-soft': textOnSuccessSoft,
    'text-success': textSuccess,
    'border-success': borderSuccess,
    'bg-warning': bgWarning,
    'bg-warning-hover': bgWarningHover,
    'bg-warning-active': bgWarningActive,
    'bg-warning-soft': bgWarningSoft,
    'bg-warning-soft-hover': bgWarningSoftHover,
    'bg-warning-soft-active': bgWarningSoftActive,
    'text-on-warning': textOnWarning,
    'text-on-warning-soft': textOnWarningSoft,
    'text-warning': textWarning,
    'border-warning': borderWarning,
    'bg-danger': bgDanger,
    'bg-danger-hover': bgDangerHover,
    'bg-danger-active': bgDangerActive,
    'bg-danger-soft': bgDangerSoft,
    'bg-danger-soft-hover': bgDangerSoftHover,
    'bg-danger-soft-active': bgDangerSoftActive,
    'text-on-danger': textOnDanger,
    'text-on-danger-soft': textOnDangerSoft,
    'text-danger': textDanger,
    'border-danger': borderDanger,
    'bg-info': bgInfo,
    'bg-info-hover': bgInfoHover,
    'bg-info-active': bgInfoActive,
    'bg-info-soft': bgInfoSoft,
    'bg-info-soft-hover': bgInfoSoftHover,
    'bg-info-soft-active': bgInfoSoftActive,
    'text-on-info': textOnInfo,
    'text-on-info-soft': textOnInfoSoft,
    'text-info': textInfo,
    'border-info': borderInfo,
  };

  Color operator [](String role) =>
      roles[role] ?? (throw ArgumentError.value(role, 'role', 'is not an IDS color role'));

  @override
  bool operator ==(Object other) =>
      other is IdsColors &&
      other.surface == surface &&
      other.onSurface == onSurface &&
      other.bgNeutral == bgNeutral &&
      other.bgNeutralHover == bgNeutralHover &&
      other.bgNeutralActive == bgNeutralActive &&
      other.bgNeutralSoft == bgNeutralSoft &&
      other.bgNeutralSoftHover == bgNeutralSoftHover &&
      other.bgNeutralSoftActive == bgNeutralSoftActive &&
      other.textOnNeutral == textOnNeutral &&
      other.textOnNeutralSoft == textOnNeutralSoft &&
      other.textNeutral == textNeutral &&
      other.borderNeutral == borderNeutral &&
      other.bgPrimary == bgPrimary &&
      other.bgPrimaryHover == bgPrimaryHover &&
      other.bgPrimaryActive == bgPrimaryActive &&
      other.bgPrimarySoft == bgPrimarySoft &&
      other.bgPrimarySoftHover == bgPrimarySoftHover &&
      other.bgPrimarySoftActive == bgPrimarySoftActive &&
      other.textOnPrimary == textOnPrimary &&
      other.textOnPrimarySoft == textOnPrimarySoft &&
      other.textPrimary == textPrimary &&
      other.borderPrimary == borderPrimary &&
      other.bgSecondary == bgSecondary &&
      other.bgSecondaryHover == bgSecondaryHover &&
      other.bgSecondaryActive == bgSecondaryActive &&
      other.bgSecondarySoft == bgSecondarySoft &&
      other.bgSecondarySoftHover == bgSecondarySoftHover &&
      other.bgSecondarySoftActive == bgSecondarySoftActive &&
      other.textOnSecondary == textOnSecondary &&
      other.textOnSecondarySoft == textOnSecondarySoft &&
      other.textSecondary == textSecondary &&
      other.borderSecondary == borderSecondary &&
      other.bgTertiary == bgTertiary &&
      other.bgTertiaryHover == bgTertiaryHover &&
      other.bgTertiaryActive == bgTertiaryActive &&
      other.bgTertiarySoft == bgTertiarySoft &&
      other.bgTertiarySoftHover == bgTertiarySoftHover &&
      other.bgTertiarySoftActive == bgTertiarySoftActive &&
      other.textOnTertiary == textOnTertiary &&
      other.textOnTertiarySoft == textOnTertiarySoft &&
      other.textTertiary == textTertiary &&
      other.borderTertiary == borderTertiary &&
      other.bgSuccess == bgSuccess &&
      other.bgSuccessHover == bgSuccessHover &&
      other.bgSuccessActive == bgSuccessActive &&
      other.bgSuccessSoft == bgSuccessSoft &&
      other.bgSuccessSoftHover == bgSuccessSoftHover &&
      other.bgSuccessSoftActive == bgSuccessSoftActive &&
      other.textOnSuccess == textOnSuccess &&
      other.textOnSuccessSoft == textOnSuccessSoft &&
      other.textSuccess == textSuccess &&
      other.borderSuccess == borderSuccess &&
      other.bgWarning == bgWarning &&
      other.bgWarningHover == bgWarningHover &&
      other.bgWarningActive == bgWarningActive &&
      other.bgWarningSoft == bgWarningSoft &&
      other.bgWarningSoftHover == bgWarningSoftHover &&
      other.bgWarningSoftActive == bgWarningSoftActive &&
      other.textOnWarning == textOnWarning &&
      other.textOnWarningSoft == textOnWarningSoft &&
      other.textWarning == textWarning &&
      other.borderWarning == borderWarning &&
      other.bgDanger == bgDanger &&
      other.bgDangerHover == bgDangerHover &&
      other.bgDangerActive == bgDangerActive &&
      other.bgDangerSoft == bgDangerSoft &&
      other.bgDangerSoftHover == bgDangerSoftHover &&
      other.bgDangerSoftActive == bgDangerSoftActive &&
      other.textOnDanger == textOnDanger &&
      other.textOnDangerSoft == textOnDangerSoft &&
      other.textDanger == textDanger &&
      other.borderDanger == borderDanger &&
      other.bgInfo == bgInfo &&
      other.bgInfoHover == bgInfoHover &&
      other.bgInfoActive == bgInfoActive &&
      other.bgInfoSoft == bgInfoSoft &&
      other.bgInfoSoftHover == bgInfoSoftHover &&
      other.bgInfoSoftActive == bgInfoSoftActive &&
      other.textOnInfo == textOnInfo &&
      other.textOnInfoSoft == textOnInfoSoft &&
      other.textInfo == textInfo &&
      other.borderInfo == borderInfo;

  @override
  int get hashCode => Object.hashAll(roles.values);
}
