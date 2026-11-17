import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_color_roles.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../../color/oklch.dart';
import '../avatar/avatar.dart';
import '../avatar/avatar_scope.dart';

enum BadgePlacement { topEnd, topStart, bottomEnd, bottomStart }

enum BadgeShape { rectangular, circular }

enum BadgeVariant { solid, soft, outline }

class Badge extends StatelessWidget {
  const Badge({
    super.key,
    required Widget this.content,
    this.invisible = false,
    this.placement = BadgePlacement.topEnd,
    this.shape,
    this.variant = BadgeVariant.solid,
    this.colorScheme,
    this.size = IdsSize.standard,
    this.semanticLabel,
    this.child,
  }) : count = null,
       max = 99,
       showZero = false,
       dot = false;

  const Badge.count({
    super.key,
    required int this.count,
    this.max = 99,
    this.showZero = false,
    this.invisible = false,
    this.placement = BadgePlacement.topEnd,
    this.shape,
    this.variant = BadgeVariant.solid,
    this.colorScheme,
    this.size = IdsSize.standard,
    this.semanticLabel,
    this.child,
  }) : content = null,
       dot = false;

  const Badge.dot({
    super.key,
    this.invisible = false,
    this.placement = BadgePlacement.topEnd,
    this.shape,
    this.variant = BadgeVariant.solid,
    this.colorScheme,
    this.size = IdsSize.standard,
    this.semanticLabel,
    this.child,
  }) : content = null,
       count = null,
       max = 99,
       showZero = false,
       dot = true;

  final Widget? content;
  final int? count;
  final int max;
  final bool showZero;
  final bool dot;
  final bool invisible;
  final BadgePlacement placement;
  final BadgeShape? shape;
  final BadgeVariant variant;
  final IdsColorScheme? colorScheme;
  final IdsSize size;
  final String? semanticLabel;
  final Widget? child;

  static const _circularInset = 0.146;
  static const _ringWidth = 2.0;
  static const _outlineAlpha = 0.45;
  static const _tintAmount = 0.16;
  static const _dotSizes = {IdsSize.standard: 10.0, IdsSize.tiny: 8.0};
  static const _heights = {IdsSize.standard: 20.0, IdsSize.tiny: 16.0};
  static const _paddings = {IdsSize.standard: 6.0, IdsSize.tiny: 4.0};
  static const _iconSizes = {IdsSize.standard: 12.0, IdsSize.tiny: 10.0};
  static const _styles = {
    IdsSize.standard: IdsTypography.captionC1Medium,
    IdsSize.tiny: IdsTypography.captionC2Medium,
  };

  int? get _shownCount => count == null ? null : math.max(0, count!);

  bool get _hidden => invisible || (_shownCount == 0 && !showZero);

  String get _countText {
    final cap = math.max(0, max);
    return _shownCount! > cap ? '$cap+' : '$_shownCount';
  }

  bool _circular(BuildContext context) => switch ((shape, child)) {
    (BadgeShape.circular, _) => true,
    (null, Avatar(shape: final own)) =>
      (own ?? AvatarScope.maybeOf(context)?.shape ?? AvatarShape.circle) ==
          AvatarShape.circle,
    _ => false,
  };

  bool get _describes => semanticLabel == null && !dot && !_hidden;

  ({Color background, Color foreground, Color? edge}) _colors(
    IdsColors colors,
    IdsColorScheme scheme,
  ) {
    final neutral = scheme == IdsColorScheme.neutral;
    final family = scheme.name;
    return switch (variant) {
      BadgeVariant.solid => (
        background: neutral ? colors.onSurface : colors['bg-$family'],
        foreground: neutral ? colors.surface : colors['text-on-$family'],
        edge: null,
      ),
      BadgeVariant.soft => (
        background: neutral
            ? mixOklab(colors.surface, colors.onSurface, _tintAmount)
            : colors['bg-$family-soft'],
        foreground: neutral ? colors.onSurface : colors['text-on-$family-soft'],
        edge: null,
      ),
      BadgeVariant.outline => (
        background: colors.surface,
        foreground: neutral ? colors.onSurface : colors['text-$family'],
        edge: (neutral ? colors.onSurface : colors['border-$family'])
            .withValues(alpha: _outlineAlpha),
      ),
    };
  }

  Widget _indicator(BuildContext context, {required bool attached}) {
    final ids = IdsProvider.of(context);
    final roles = ids.colors;
    final colors = _colors(
      roles,
      colorScheme ??
          (attached ? IdsColorScheme.danger : IdsColorScheme.neutral),
    );
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final duration = reduced ? Duration.zero : IdsMotion.fast;
    final style = _styles[size]!;
    final scale =
        ids.scale *
        MediaQuery.textScalerOf(context).scale(style.fontSize!) /
        style.fontSize!;
    final height = _heights[size]! * scale;

    Widget box = Container(
      constraints: dot
          ? BoxConstraints.tight(Size.square(ids.dimension(_dotSizes[size]!)))
          : BoxConstraints(
              minWidth: height,
              minHeight: height,
              maxHeight: height,
            ),
      padding: dot
          ? null
          : EdgeInsets.symmetric(horizontal: _paddings[size]! * scale),
      decoration: ShapeDecoration(
        color: colors.background,
        shape: StadiumBorder(
          side: attached
              ? BorderSide(
                  color: roles.surface,
                  width: _ringWidth,
                  strokeAlign: BorderSide.strokeAlignOutside,
                )
              : BorderSide.none,
        ),
      ),
      foregroundDecoration: colors.edge == null
          ? null
          : ShapeDecoration(
              shape: StadiumBorder(side: BorderSide(color: colors.edge!)),
            ),
      child: dot
          ? null
          : DefaultTextStyle(
              style: ids
                  .textStyle(style, color: colors.foreground)
                  .copyWith(
                    height: 1,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
              maxLines: 1,
              softWrap: false,
              child: IconTheme(
                data: IconThemeData(
                  size: _iconSizes[size]! * scale,
                  color: colors.foreground,
                ),
                child: Center(
                  widthFactor: 1,
                  heightFactor: 1,
                  child: content ?? Text(_countText),
                ),
              ),
            ),
    );

    box = AnimatedOpacity(
      opacity: _hidden ? 0 : 1,
      duration: duration,
      curve: Curves.fastOutSlowIn,
      child: AnimatedScale(
        scale: _hidden ? 0 : 1,
        duration: duration,
        curve: Curves.fastOutSlowIn,
        child: box,
      ),
    );

    if (semanticLabel != null) {
      return Semantics(
        liveRegion: true,
        label: semanticLabel,
        excludeSemantics: true,
        child: box,
      );
    }
    return ExcludeSemantics(excluding: !_describes, child: box);
  }

  @override
  Widget build(BuildContext context) {
    final anchor = child;
    if (anchor == null) return _indicator(context, attached: false);

    final rtl = Directionality.of(context) == TextDirection.rtl;
    final top =
        placement == BadgePlacement.topEnd ||
        placement == BadgePlacement.topStart;
    final end =
        placement == BadgePlacement.topEnd ||
        placement == BadgePlacement.bottomEnd;
    final right = end != rtl;
    final inset = _circular(context) ? _circularInset : 0.0;

    final badge = Stack(
      clipBehavior: Clip.none,
      children: [
        anchor,
        Positioned.fill(
          child: IgnorePointer(
            child: LayoutBuilder(
              builder: (context, box) {
                final dx = inset * box.maxWidth;
                final dy = inset * box.maxHeight;
                return Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Positioned(
                      left: right ? null : dx,
                      right: right ? dx : null,
                      top: top ? dy : null,
                      bottom: top ? null : dy,
                      child: FractionalTranslation(
                        translation: Offset(
                          right ? 0.5 : -0.5,
                          top ? -0.5 : 0.5,
                        ),
                        child: _AboveSiblings(
                          child: _indicator(context, attached: true),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ],
    );

    return _MergeSemanticsWhen(merge: _describes, child: badge);
  }
}

class _AboveSiblings extends SingleChildRenderObjectWidget {
  const _AboveSiblings({super.child});

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderAboveSiblings();
}

class _RenderAboveSiblings extends RenderProxyBox {
  RenderBadgeLayer? _layer;

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);
    var ancestor = parent;
    while (ancestor != null && ancestor is! RenderBadgeLayer) {
      ancestor = ancestor.parent;
    }
    _layer = ancestor as RenderBadgeLayer?;
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    final child = this.child;
    if (child == null) return;
    final later = _layer?.paintAboveSiblings(context, child, offset) ?? false;
    if (!later) context.paintChild(child, offset);
  }
}

class _MergeSemanticsWhen extends SingleChildRenderObjectWidget {
  const _MergeSemanticsWhen({required this.merge, super.child});

  final bool merge;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderMergeSemanticsWhen(merge);

  @override
  void updateRenderObject(
    BuildContext context,
    _RenderMergeSemanticsWhen renderObject,
  ) => renderObject.merge = merge;
}

class _RenderMergeSemanticsWhen extends RenderProxyBox {
  _RenderMergeSemanticsWhen(this._merge);

  bool _merge;
  set merge(bool value) {
    if (value == _merge) return;
    _merge = value;
    markNeedsSemanticsUpdate();
  }

  @override
  void describeSemanticsConfiguration(SemanticsConfiguration config) {
    super.describeSemanticsConfiguration(config);
    if (!_merge) return;
    config
      ..isSemanticBoundary = true
      ..isMergingSemanticsOfDescendants = true;
  }
}
