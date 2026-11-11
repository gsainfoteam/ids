import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../avatar/avatar.dart';
import '../avatar/avatar_scope.dart';

enum AvatarGroupLayout { stack, inline }

enum AvatarGroupStacking { firstOnTop, lastOnTop }

class AvatarGroup extends StatelessWidget {
  const AvatarGroup({
    super.key,
    this.max,
    this.total,
    this.layout = AvatarGroupLayout.stack,
    this.stacking = AvatarGroupStacking.firstOnTop,
    this.size = IdsSize.standard,
    this.shape = AvatarShape.circle,
    this.overflowLabel = _defaultOverflowLabel,
    this.overflowBuilder,
    this.overflowFirst = false,
    this.semanticLabel,
    required this.children,
  });

  final int? max;
  final int? total;
  final AvatarGroupLayout layout;
  final AvatarGroupStacking stacking;
  final IdsSize size;
  final AvatarShape shape;
  final String Function(int count) overflowLabel;
  final Widget Function(int count)? overflowBuilder;
  final bool overflowFirst;
  final String? semanticLabel;
  final List<Widget> children;

  static String _defaultOverflowLabel(int count) => '외 $count명';

  static const _overlaps = {IdsSize.standard: 10.0, IdsSize.tiny: 6.0};
  static const _inlineGaps = {IdsSize.standard: 6.0, IdsSize.tiny: 4.0};

  Widget _overflow(int count) {
    final (min, factor) = switch ('$count'.length) {
      <= 2 => (9.0, 0.36),
      3 => (7.0, 0.28),
      _ => (6.0, 0.22),
    };
    return Avatar(
      semanticLabel: overflowLabel(count),
      fallbackDelay: Duration.zero,
      fallback: LayoutBuilder(
        builder: (context, box) => DefaultTextStyle.merge(
          maxLines: 1,
          softWrap: false,
          style: TextStyle(
            fontSize: math.max(min, box.maxWidth * factor),
            color: ThemeProvider.of(context).onSurface,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
          child:
              overflowBuilder?.call(count) ??
              Text('+$count', textDirection: TextDirection.ltr),
        ),
      ),
    );
  }

  AvatarCutout? _cutoutAt(int index, int length) {
    if (layout == AvatarGroupLayout.inline) return null;
    return switch (stacking) {
      AvatarGroupStacking.firstOnTop when index > 0 => AvatarCutout.start,
      AvatarGroupStacking.lastOnTop when index < length - 1 => AvatarCutout.end,
      _ => null,
    };
  }

  @override
  Widget build(BuildContext context) {
    final limit = max;
    if (kDebugMode && limit != null && limit < 1) {
      debugPrint('[IDS] AvatarGroup: max must be at least 1.');
    }
    final visible = children
        .take(limit == null ? children.length : math.max(1, limit))
        .toList();
    final hidden = math.max(total ?? 0, children.length) - visible.length;
    final items = [
      if (hidden > 0 && overflowFirst) _overflow(hidden),
      ...visible,
      if (hidden > 0 && !overflowFirst) _overflow(hidden),
    ];
    final stack = layout == AvatarGroupLayout.stack;
    final overlap = _overlaps[size]!;

    return Semantics(
      role: SemanticsRole.list,
      label: semanticLabel,
      container: true,
      child: BadgeLayer(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: stack ? 0 : _inlineGaps[size]!,
          children: [
            for (final (index, item) in items.indexed)
              _Overlap(
                key: item.key == null ? null : ValueKey(item.key),
                overlap: stack && index > 0 ? overlap : 0,
                child: AvatarScope(
                  size: size,
                  shape: shape,
                  cutout: _cutoutAt(index, items.length),
                  overlap: overlap,
                  child: Semantics(role: SemanticsRole.listItem, child: item),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Overlap extends SingleChildRenderObjectWidget {
  const _Overlap({super.key, required this.overlap, super.child});

  final double overlap;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderOverlap(overlap, Directionality.of(context));

  @override
  void updateRenderObject(BuildContext context, _RenderOverlap renderObject) {
    renderObject
      ..overlap = overlap
      ..direction = Directionality.of(context);
  }
}

class _RenderOverlap extends RenderShiftedBox {
  _RenderOverlap(this._overlap, this._direction) : super(null);

  double _overlap;
  set overlap(double value) {
    if (value == _overlap) return;
    _overlap = value;
    markNeedsLayout();
  }

  TextDirection _direction;
  set direction(TextDirection value) {
    if (value == _direction) return;
    _direction = value;
    markNeedsLayout();
  }

  @override
  double computeMinIntrinsicWidth(double height) =>
      math.max(0, super.computeMinIntrinsicWidth(height) - _overlap);

  @override
  double computeMaxIntrinsicWidth(double height) =>
      math.max(0, super.computeMaxIntrinsicWidth(height) - _overlap);

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) =>
      hitTestChildren(result, position: position);

  @override
  void performLayout() {
    final child = this.child!;
    child.layout(constraints.loosen(), parentUsesSize: true);
    size = constraints.constrain(
      Size(math.max(0, child.size.width - _overlap), child.size.height),
    );
    (child.parentData! as BoxParentData).offset = Offset(
      _direction == TextDirection.ltr ? -_overlap : 0,
      0,
    );
  }
}
