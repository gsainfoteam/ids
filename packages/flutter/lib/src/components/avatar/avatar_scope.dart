import 'package:flutter/widgets.dart';

import '../../../tokens/ids_enums.dart';
import 'avatar.dart';

enum AvatarCutout { start, end }

class AvatarScope extends InheritedWidget {
  const AvatarScope({
    super.key,
    required this.size,
    required this.shape,
    this.cutout,
    this.overlap = 0,
    required super.child,
  });

  final IdsSize size;
  final AvatarShape shape;
  final AvatarCutout? cutout;
  final double overlap;

  static AvatarScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<AvatarScope>();

  @override
  bool updateShouldNotify(AvatarScope oldWidget) =>
      size != oldWidget.size ||
      shape != oldWidget.shape ||
      cutout != oldWidget.cutout ||
      overlap != oldWidget.overlap;
}
