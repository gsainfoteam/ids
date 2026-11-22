// GENERATED — do not edit manually

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_enums.dart';

abstract final class IdsColorRoles {
  static const neutralFamilies = <String>['neutral'];
  static const brandFamilies = <String>['primary', 'secondary', 'tertiary'];
  static const statusFamilies = <String>['success', 'warning', 'danger', 'info'];
  static const families = <String>['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info'];
  static const familySlots = <String>['bg-base', 'bg-surface', 'bg-block', 'bg-{family}-soft', 'bg-{family}-solid', 'text-on-base', 'text-on-surface', 'text-on-block', 'text-on-{family}-soft', 'text-on-{family}-solid', 'text-{family}', 'text-{family}-strong', 'border-{family}', 'border-{family}-strong'];
  static const neutralOnlySlots = <String>['bg-base', 'bg-surface', 'bg-block', 'text-on-base', 'text-on-surface', 'text-on-block'];
  static const all = <String>['bg-base', 'bg-surface', 'bg-block', 'bg-neutral-soft', 'bg-neutral-solid', 'text-on-base', 'text-on-surface', 'text-on-block', 'text-on-neutral-soft', 'text-on-neutral-solid', 'text-neutral', 'text-neutral-strong', 'border-neutral', 'border-neutral-strong', 'bg-primary-soft', 'bg-primary-solid', 'text-on-primary-soft', 'text-on-primary-solid', 'text-primary', 'text-primary-strong', 'border-primary', 'border-primary-strong', 'bg-secondary-soft', 'bg-secondary-solid', 'text-on-secondary-soft', 'text-on-secondary-solid', 'text-secondary', 'text-secondary-strong', 'border-secondary', 'border-secondary-strong', 'bg-tertiary-soft', 'bg-tertiary-solid', 'text-on-tertiary-soft', 'text-on-tertiary-solid', 'text-tertiary', 'text-tertiary-strong', 'border-tertiary', 'border-tertiary-strong', 'bg-success-soft', 'bg-success-solid', 'text-on-success-soft', 'text-on-success-solid', 'text-success', 'text-success-strong', 'border-success', 'border-success-strong', 'bg-warning-soft', 'bg-warning-solid', 'text-on-warning-soft', 'text-on-warning-solid', 'text-warning', 'text-warning-strong', 'border-warning', 'border-warning-strong', 'bg-danger-soft', 'bg-danger-solid', 'text-on-danger-soft', 'text-on-danger-solid', 'text-danger', 'text-danger-strong', 'border-danger', 'border-danger-strong', 'bg-info-soft', 'bg-info-solid', 'text-on-info-soft', 'text-on-info-solid', 'text-info', 'text-info-strong', 'border-info', 'border-info-strong'];

  static const neutralScales = <IdsMode, List<Color>>{
    IdsMode.light: [
      Color(0xFFFFFFFF),
      Color(0xFFFFFFFF),
      Color(0xFFFAFAFA),
      Color(0xFFF5F5F5),
      Color(0xFFE5E5E5),
      Color(0xFFD4D4D4),
      Color(0xFFA3A3A3),
      Color(0xFF525252),
      Color(0xFF0A0A0A),
    ],
    IdsMode.dark: [
      Color(0xFF0A0A0A),
      Color(0xFF171717),
      Color(0xFF1E1E1E),
      Color(0xFF262626),
      Color(0xFF2E2E2E),
      Color(0xFF3A3A3A),
      Color(0xFF737373),
      Color(0xFFD4D4D4),
      Color(0xFFFAFAFA),
    ],
  };

  static const neutralSteps = <String, int>{
    'bg-base': 1,
    'bg-surface': 2,
    'bg-block': 3,
    'bg-neutral-soft': 4,
    'bg-neutral-solid': 9,
    'border-neutral': 5,
    'border-neutral-strong': 6,
    'text-neutral': 8,
    'text-neutral-strong': 9,
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
    required this.bgBase,
    required this.bgSurface,
    required this.bgBlock,
    required this.bgNeutralSoft,
    required this.bgNeutralSolid,
    required this.textOnBase,
    required this.textOnSurface,
    required this.textOnBlock,
    required this.textOnNeutralSoft,
    required this.textOnNeutralSolid,
    required this.textNeutral,
    required this.textNeutralStrong,
    required this.borderNeutral,
    required this.borderNeutralStrong,
    required this.bgPrimarySoft,
    required this.bgPrimarySolid,
    required this.textOnPrimarySoft,
    required this.textOnPrimarySolid,
    required this.textPrimary,
    required this.textPrimaryStrong,
    required this.borderPrimary,
    required this.borderPrimaryStrong,
    required this.bgSecondarySoft,
    required this.bgSecondarySolid,
    required this.textOnSecondarySoft,
    required this.textOnSecondarySolid,
    required this.textSecondary,
    required this.textSecondaryStrong,
    required this.borderSecondary,
    required this.borderSecondaryStrong,
    required this.bgTertiarySoft,
    required this.bgTertiarySolid,
    required this.textOnTertiarySoft,
    required this.textOnTertiarySolid,
    required this.textTertiary,
    required this.textTertiaryStrong,
    required this.borderTertiary,
    required this.borderTertiaryStrong,
    required this.bgSuccessSoft,
    required this.bgSuccessSolid,
    required this.textOnSuccessSoft,
    required this.textOnSuccessSolid,
    required this.textSuccess,
    required this.textSuccessStrong,
    required this.borderSuccess,
    required this.borderSuccessStrong,
    required this.bgWarningSoft,
    required this.bgWarningSolid,
    required this.textOnWarningSoft,
    required this.textOnWarningSolid,
    required this.textWarning,
    required this.textWarningStrong,
    required this.borderWarning,
    required this.borderWarningStrong,
    required this.bgDangerSoft,
    required this.bgDangerSolid,
    required this.textOnDangerSoft,
    required this.textOnDangerSolid,
    required this.textDanger,
    required this.textDangerStrong,
    required this.borderDanger,
    required this.borderDangerStrong,
    required this.bgInfoSoft,
    required this.bgInfoSolid,
    required this.textOnInfoSoft,
    required this.textOnInfoSolid,
    required this.textInfo,
    required this.textInfoStrong,
    required this.borderInfo,
    required this.borderInfoStrong,
  });

  factory IdsColors.fromRoles(Map<String, Color> roles) {
    Color role(String name) =>
        roles[name] ?? (throw ArgumentError.value(name, 'roles', 'is missing'));
    return IdsColors(
      bgBase: role('bg-base'),
      bgSurface: role('bg-surface'),
      bgBlock: role('bg-block'),
      bgNeutralSoft: role('bg-neutral-soft'),
      bgNeutralSolid: role('bg-neutral-solid'),
      textOnBase: role('text-on-base'),
      textOnSurface: role('text-on-surface'),
      textOnBlock: role('text-on-block'),
      textOnNeutralSoft: role('text-on-neutral-soft'),
      textOnNeutralSolid: role('text-on-neutral-solid'),
      textNeutral: role('text-neutral'),
      textNeutralStrong: role('text-neutral-strong'),
      borderNeutral: role('border-neutral'),
      borderNeutralStrong: role('border-neutral-strong'),
      bgPrimarySoft: role('bg-primary-soft'),
      bgPrimarySolid: role('bg-primary-solid'),
      textOnPrimarySoft: role('text-on-primary-soft'),
      textOnPrimarySolid: role('text-on-primary-solid'),
      textPrimary: role('text-primary'),
      textPrimaryStrong: role('text-primary-strong'),
      borderPrimary: role('border-primary'),
      borderPrimaryStrong: role('border-primary-strong'),
      bgSecondarySoft: role('bg-secondary-soft'),
      bgSecondarySolid: role('bg-secondary-solid'),
      textOnSecondarySoft: role('text-on-secondary-soft'),
      textOnSecondarySolid: role('text-on-secondary-solid'),
      textSecondary: role('text-secondary'),
      textSecondaryStrong: role('text-secondary-strong'),
      borderSecondary: role('border-secondary'),
      borderSecondaryStrong: role('border-secondary-strong'),
      bgTertiarySoft: role('bg-tertiary-soft'),
      bgTertiarySolid: role('bg-tertiary-solid'),
      textOnTertiarySoft: role('text-on-tertiary-soft'),
      textOnTertiarySolid: role('text-on-tertiary-solid'),
      textTertiary: role('text-tertiary'),
      textTertiaryStrong: role('text-tertiary-strong'),
      borderTertiary: role('border-tertiary'),
      borderTertiaryStrong: role('border-tertiary-strong'),
      bgSuccessSoft: role('bg-success-soft'),
      bgSuccessSolid: role('bg-success-solid'),
      textOnSuccessSoft: role('text-on-success-soft'),
      textOnSuccessSolid: role('text-on-success-solid'),
      textSuccess: role('text-success'),
      textSuccessStrong: role('text-success-strong'),
      borderSuccess: role('border-success'),
      borderSuccessStrong: role('border-success-strong'),
      bgWarningSoft: role('bg-warning-soft'),
      bgWarningSolid: role('bg-warning-solid'),
      textOnWarningSoft: role('text-on-warning-soft'),
      textOnWarningSolid: role('text-on-warning-solid'),
      textWarning: role('text-warning'),
      textWarningStrong: role('text-warning-strong'),
      borderWarning: role('border-warning'),
      borderWarningStrong: role('border-warning-strong'),
      bgDangerSoft: role('bg-danger-soft'),
      bgDangerSolid: role('bg-danger-solid'),
      textOnDangerSoft: role('text-on-danger-soft'),
      textOnDangerSolid: role('text-on-danger-solid'),
      textDanger: role('text-danger'),
      textDangerStrong: role('text-danger-strong'),
      borderDanger: role('border-danger'),
      borderDangerStrong: role('border-danger-strong'),
      bgInfoSoft: role('bg-info-soft'),
      bgInfoSolid: role('bg-info-solid'),
      textOnInfoSoft: role('text-on-info-soft'),
      textOnInfoSolid: role('text-on-info-solid'),
      textInfo: role('text-info'),
      textInfoStrong: role('text-info-strong'),
      borderInfo: role('border-info'),
      borderInfoStrong: role('border-info-strong'),
    );
  }

  final Color bgBase;
  final Color bgSurface;
  final Color bgBlock;
  final Color bgNeutralSoft;
  final Color bgNeutralSolid;
  final Color textOnBase;
  final Color textOnSurface;
  final Color textOnBlock;
  final Color textOnNeutralSoft;
  final Color textOnNeutralSolid;
  final Color textNeutral;
  final Color textNeutralStrong;
  final Color borderNeutral;
  final Color borderNeutralStrong;
  final Color bgPrimarySoft;
  final Color bgPrimarySolid;
  final Color textOnPrimarySoft;
  final Color textOnPrimarySolid;
  final Color textPrimary;
  final Color textPrimaryStrong;
  final Color borderPrimary;
  final Color borderPrimaryStrong;
  final Color bgSecondarySoft;
  final Color bgSecondarySolid;
  final Color textOnSecondarySoft;
  final Color textOnSecondarySolid;
  final Color textSecondary;
  final Color textSecondaryStrong;
  final Color borderSecondary;
  final Color borderSecondaryStrong;
  final Color bgTertiarySoft;
  final Color bgTertiarySolid;
  final Color textOnTertiarySoft;
  final Color textOnTertiarySolid;
  final Color textTertiary;
  final Color textTertiaryStrong;
  final Color borderTertiary;
  final Color borderTertiaryStrong;
  final Color bgSuccessSoft;
  final Color bgSuccessSolid;
  final Color textOnSuccessSoft;
  final Color textOnSuccessSolid;
  final Color textSuccess;
  final Color textSuccessStrong;
  final Color borderSuccess;
  final Color borderSuccessStrong;
  final Color bgWarningSoft;
  final Color bgWarningSolid;
  final Color textOnWarningSoft;
  final Color textOnWarningSolid;
  final Color textWarning;
  final Color textWarningStrong;
  final Color borderWarning;
  final Color borderWarningStrong;
  final Color bgDangerSoft;
  final Color bgDangerSolid;
  final Color textOnDangerSoft;
  final Color textOnDangerSolid;
  final Color textDanger;
  final Color textDangerStrong;
  final Color borderDanger;
  final Color borderDangerStrong;
  final Color bgInfoSoft;
  final Color bgInfoSolid;
  final Color textOnInfoSoft;
  final Color textOnInfoSolid;
  final Color textInfo;
  final Color textInfoStrong;
  final Color borderInfo;
  final Color borderInfoStrong;

  Map<String, Color> get roles => {
    'bg-base': bgBase,
    'bg-surface': bgSurface,
    'bg-block': bgBlock,
    'bg-neutral-soft': bgNeutralSoft,
    'bg-neutral-solid': bgNeutralSolid,
    'text-on-base': textOnBase,
    'text-on-surface': textOnSurface,
    'text-on-block': textOnBlock,
    'text-on-neutral-soft': textOnNeutralSoft,
    'text-on-neutral-solid': textOnNeutralSolid,
    'text-neutral': textNeutral,
    'text-neutral-strong': textNeutralStrong,
    'border-neutral': borderNeutral,
    'border-neutral-strong': borderNeutralStrong,
    'bg-primary-soft': bgPrimarySoft,
    'bg-primary-solid': bgPrimarySolid,
    'text-on-primary-soft': textOnPrimarySoft,
    'text-on-primary-solid': textOnPrimarySolid,
    'text-primary': textPrimary,
    'text-primary-strong': textPrimaryStrong,
    'border-primary': borderPrimary,
    'border-primary-strong': borderPrimaryStrong,
    'bg-secondary-soft': bgSecondarySoft,
    'bg-secondary-solid': bgSecondarySolid,
    'text-on-secondary-soft': textOnSecondarySoft,
    'text-on-secondary-solid': textOnSecondarySolid,
    'text-secondary': textSecondary,
    'text-secondary-strong': textSecondaryStrong,
    'border-secondary': borderSecondary,
    'border-secondary-strong': borderSecondaryStrong,
    'bg-tertiary-soft': bgTertiarySoft,
    'bg-tertiary-solid': bgTertiarySolid,
    'text-on-tertiary-soft': textOnTertiarySoft,
    'text-on-tertiary-solid': textOnTertiarySolid,
    'text-tertiary': textTertiary,
    'text-tertiary-strong': textTertiaryStrong,
    'border-tertiary': borderTertiary,
    'border-tertiary-strong': borderTertiaryStrong,
    'bg-success-soft': bgSuccessSoft,
    'bg-success-solid': bgSuccessSolid,
    'text-on-success-soft': textOnSuccessSoft,
    'text-on-success-solid': textOnSuccessSolid,
    'text-success': textSuccess,
    'text-success-strong': textSuccessStrong,
    'border-success': borderSuccess,
    'border-success-strong': borderSuccessStrong,
    'bg-warning-soft': bgWarningSoft,
    'bg-warning-solid': bgWarningSolid,
    'text-on-warning-soft': textOnWarningSoft,
    'text-on-warning-solid': textOnWarningSolid,
    'text-warning': textWarning,
    'text-warning-strong': textWarningStrong,
    'border-warning': borderWarning,
    'border-warning-strong': borderWarningStrong,
    'bg-danger-soft': bgDangerSoft,
    'bg-danger-solid': bgDangerSolid,
    'text-on-danger-soft': textOnDangerSoft,
    'text-on-danger-solid': textOnDangerSolid,
    'text-danger': textDanger,
    'text-danger-strong': textDangerStrong,
    'border-danger': borderDanger,
    'border-danger-strong': borderDangerStrong,
    'bg-info-soft': bgInfoSoft,
    'bg-info-solid': bgInfoSolid,
    'text-on-info-soft': textOnInfoSoft,
    'text-on-info-solid': textOnInfoSolid,
    'text-info': textInfo,
    'text-info-strong': textInfoStrong,
    'border-info': borderInfo,
    'border-info-strong': borderInfoStrong,
  };

  Color operator [](String role) =>
      roles[role] ?? (throw ArgumentError.value(role, 'role', 'is not an IDS color role'));

  @override
  bool operator ==(Object other) =>
      other is IdsColors &&
      other.bgBase == bgBase &&
      other.bgSurface == bgSurface &&
      other.bgBlock == bgBlock &&
      other.bgNeutralSoft == bgNeutralSoft &&
      other.bgNeutralSolid == bgNeutralSolid &&
      other.textOnBase == textOnBase &&
      other.textOnSurface == textOnSurface &&
      other.textOnBlock == textOnBlock &&
      other.textOnNeutralSoft == textOnNeutralSoft &&
      other.textOnNeutralSolid == textOnNeutralSolid &&
      other.textNeutral == textNeutral &&
      other.textNeutralStrong == textNeutralStrong &&
      other.borderNeutral == borderNeutral &&
      other.borderNeutralStrong == borderNeutralStrong &&
      other.bgPrimarySoft == bgPrimarySoft &&
      other.bgPrimarySolid == bgPrimarySolid &&
      other.textOnPrimarySoft == textOnPrimarySoft &&
      other.textOnPrimarySolid == textOnPrimarySolid &&
      other.textPrimary == textPrimary &&
      other.textPrimaryStrong == textPrimaryStrong &&
      other.borderPrimary == borderPrimary &&
      other.borderPrimaryStrong == borderPrimaryStrong &&
      other.bgSecondarySoft == bgSecondarySoft &&
      other.bgSecondarySolid == bgSecondarySolid &&
      other.textOnSecondarySoft == textOnSecondarySoft &&
      other.textOnSecondarySolid == textOnSecondarySolid &&
      other.textSecondary == textSecondary &&
      other.textSecondaryStrong == textSecondaryStrong &&
      other.borderSecondary == borderSecondary &&
      other.borderSecondaryStrong == borderSecondaryStrong &&
      other.bgTertiarySoft == bgTertiarySoft &&
      other.bgTertiarySolid == bgTertiarySolid &&
      other.textOnTertiarySoft == textOnTertiarySoft &&
      other.textOnTertiarySolid == textOnTertiarySolid &&
      other.textTertiary == textTertiary &&
      other.textTertiaryStrong == textTertiaryStrong &&
      other.borderTertiary == borderTertiary &&
      other.borderTertiaryStrong == borderTertiaryStrong &&
      other.bgSuccessSoft == bgSuccessSoft &&
      other.bgSuccessSolid == bgSuccessSolid &&
      other.textOnSuccessSoft == textOnSuccessSoft &&
      other.textOnSuccessSolid == textOnSuccessSolid &&
      other.textSuccess == textSuccess &&
      other.textSuccessStrong == textSuccessStrong &&
      other.borderSuccess == borderSuccess &&
      other.borderSuccessStrong == borderSuccessStrong &&
      other.bgWarningSoft == bgWarningSoft &&
      other.bgWarningSolid == bgWarningSolid &&
      other.textOnWarningSoft == textOnWarningSoft &&
      other.textOnWarningSolid == textOnWarningSolid &&
      other.textWarning == textWarning &&
      other.textWarningStrong == textWarningStrong &&
      other.borderWarning == borderWarning &&
      other.borderWarningStrong == borderWarningStrong &&
      other.bgDangerSoft == bgDangerSoft &&
      other.bgDangerSolid == bgDangerSolid &&
      other.textOnDangerSoft == textOnDangerSoft &&
      other.textOnDangerSolid == textOnDangerSolid &&
      other.textDanger == textDanger &&
      other.textDangerStrong == textDangerStrong &&
      other.borderDanger == borderDanger &&
      other.borderDangerStrong == borderDangerStrong &&
      other.bgInfoSoft == bgInfoSoft &&
      other.bgInfoSolid == bgInfoSolid &&
      other.textOnInfoSoft == textOnInfoSoft &&
      other.textOnInfoSolid == textOnInfoSolid &&
      other.textInfo == textInfo &&
      other.textInfoStrong == textInfoStrong &&
      other.borderInfo == borderInfo &&
      other.borderInfoStrong == borderInfoStrong;

  @override
  int get hashCode => Object.hashAll(roles.values);
}
