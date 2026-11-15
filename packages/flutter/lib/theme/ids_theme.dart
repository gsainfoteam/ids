import 'package:flutter/foundation.dart';

import 'ids_palette.dart';

enum IdsNeutral { pure, tinted }

enum IdsCornerShape { round, squircle }

@immutable
sealed class IdsStatus {
  const IdsStatus();

  static const harmonized = _HarmonizedStatus();

  static const fixed = _FixedStatus();
}

final class _HarmonizedStatus extends IdsStatus {
  const _HarmonizedStatus();

  @override
  String toString() => 'IdsStatus.harmonized';
}

final class _FixedStatus extends IdsStatus {
  const _FixedStatus();

  @override
  String toString() => 'IdsStatus.fixed';
}

final class IdsStatusColors extends IdsStatus {
  const IdsStatusColors({this.success, this.warning, this.danger, this.info});

  final IdsThemeColor? success;
  final IdsThemeColor? warning;
  final IdsThemeColor? danger;
  final IdsThemeColor? info;

  IdsThemeColor? operator [](String family) => switch (family) {
    'success' => success,
    'warning' => warning,
    'danger' => danger,
    'info' => info,
    _ => null,
  };

  @override
  bool operator ==(Object other) =>
      other is IdsStatusColors &&
      other.success == success &&
      other.warning == warning &&
      other.danger == danger &&
      other.info == info;

  @override
  int get hashCode => Object.hash(success, warning, danger, info);
}

@immutable
class IdsThemeOverrides {
  const IdsThemeOverrides({
    this.primary,
    this.secondary,
    this.tertiary,
    this.neutral,
    this.status,
    this.radius,
    this.cornerShape,
    this.scale,
  });

  final IdsThemeColor? primary;
  final IdsThemeColor? secondary;
  final IdsThemeColor? tertiary;
  final IdsNeutral? neutral;
  final IdsStatus? status;
  final double? radius;
  final IdsCornerShape? cornerShape;
  final double? scale;

  bool get writesColors =>
      primary != null ||
      secondary != null ||
      tertiary != null ||
      neutral != null ||
      status != null;

  IdsThemeOverrides merge(IdsThemeOverrides? other) => other == null
      ? this
      : IdsThemeOverrides(
          primary: other.primary ?? primary,
          secondary: other.secondary ?? secondary,
          tertiary: other.tertiary ?? tertiary,
          neutral: other.neutral ?? neutral,
          status: other.status ?? status,
          radius: other.radius ?? radius,
          cornerShape: other.cornerShape ?? cornerShape,
          scale: other.scale ?? scale,
        );

  IdsThemeColor? brand(String family) => switch (family) {
    'primary' => primary,
    'secondary' => secondary,
    'tertiary' => tertiary,
    _ => null,
  };

  @override
  bool operator ==(Object other) =>
      other is IdsThemeOverrides &&
      other.primary == primary &&
      other.secondary == secondary &&
      other.tertiary == tertiary &&
      other.neutral == neutral &&
      other.status == status &&
      other.radius == radius &&
      other.cornerShape == cornerShape &&
      other.scale == scale;

  @override
  int get hashCode => Object.hash(
    primary,
    secondary,
    tertiary,
    neutral,
    status,
    radius,
    cornerShape,
    scale,
  );
}

class IdsTheme extends IdsThemeOverrides {
  const IdsTheme({
    required IdsThemeColor super.primary,
    super.secondary,
    super.tertiary,
    super.neutral,
    super.status,
    super.radius,
    super.cornerShape,
    super.scale,
  });

  @override
  IdsThemeColor get primary => super.primary!;
}

@immutable
class IdsThemeIssue {
  const IdsThemeIssue(this.path, this.message);

  final String path;
  final String message;

  @override
  bool operator ==(Object other) =>
      other is IdsThemeIssue && other.path == path && other.message == message;

  @override
  int get hashCode => Object.hash(path, message);

  @override
  String toString() => '$path: $message';
}
