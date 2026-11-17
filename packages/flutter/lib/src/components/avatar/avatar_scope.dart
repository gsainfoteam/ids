import 'package:flutter/rendering.dart';
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

class BadgeLayer extends SingleChildRenderObjectWidget {
  const BadgeLayer({super.key, super.child});

  @override
  RenderObject createRenderObject(BuildContext context) => RenderBadgeLayer();
}

class RenderBadgeLayer extends RenderProxyBox {
  final _aboveEverySibling = <(RenderBox, Offset)>[];
  PaintingContext? _painting;

  bool paintAboveSiblings(
    PaintingContext context,
    RenderBox indicator,
    Offset offset,
  ) {
    if (!identical(context, _painting)) return false;
    _aboveEverySibling.add((indicator, offset));
    return true;
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    _painting = context;
    super.paint(context, offset);
    _painting = null;
    for (final (indicator, at) in _aboveEverySibling) {
      context.paintChild(indicator, at);
    }
    _aboveEverySibling.clear();
  }
}
