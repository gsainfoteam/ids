import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_radius.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../../interaction/interactive.dart';

enum CardVariant { outline, soft, ghost }

class Card extends StatelessWidget {
  const Card({
    super.key,
    this.variant = CardVariant.outline,
    this.size = IdsSize.standard,
    this.onPressed,
    this.disabled = false,
    this.onInteractionChange,
    this.children = const [],
  });

  final CardVariant variant;
  final IdsSize size;
  final VoidCallback? onPressed;
  final bool disabled;
  final ValueChanged<InteractiveState>? onInteractionChange;
  final List<Widget> children;

  static const _paddings = {IdsSize.standard: 16.0, IdsSize.tiny: 12.0};
  static const _textStyles = {
    IdsSize.standard: IdsTypography.bodyB3Regular,
    IdsSize.tiny: IdsTypography.captionC1Regular,
  };
  static const _hoverAlpha = 0.04;
  static const _activeAlpha = 0.08;
  static const _disabledOpacity = 0.5;
  static const _focusRingWidth = 3.0;
  static const _focusRingAlpha = 0.4;
  static const _shadow = BoxShadow(
    color: Color(0x0D000000),
    offset: Offset(0, 1),
    blurRadius: 2,
  );

  bool get _interactive => onPressed != null;

  bool get _hasHeader => children.any((child) => child is CardHeader);

  Widget _region(
    Widget child, {
    required int index,
    required double pad,
    required Color lineColor,
  }) {
    if (child is CardMedia) return child;
    final lineAbove = child is CardFooter && child.divider;
    final lineBelow = child is CardHeader && child.divider;
    final line = BorderSide(color: lineColor);
    return Padding(
      padding: EdgeInsets.only(
        top: index == 0 ? pad : 0,
        bottom: index == children.length - 1 ? pad : 0,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(
            top: lineAbove ? line : BorderSide.none,
            bottom: lineBelow ? line : BorderSide.none,
          ),
        ),
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            pad,
            lineAbove ? pad : 0,
            pad,
            lineBelow ? pad : 0,
          ),
          child: _interactive && _hasHeader && child is! CardHeader
              ? Semantics(container: true, child: child)
              : child,
        ),
      ),
    );
  }

  Widget _surface(BuildContext context, InteractiveState state) {
    final theme = ThemeProvider.of(context);
    final pad = _paddings[size]!;
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final base = switch (variant) {
      CardVariant.outline => theme.surface,
      CardVariant.soft => theme.muted,
      CardVariant.ghost => theme.surface.withValues(alpha: 0),
    };
    final layer = state.active
        ? _activeAlpha
        : state.hovered
        ? _hoverAlpha
        : 0.0;
    final edge = state.focusVisible ? theme.primary : theme.border;
    final radius = BorderRadius.circular(IdsRadius.container);

    return AnimatedContainer(
      duration: reduced ? Duration.zero : IdsMotion.fast,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Color.alphaBlend(theme.onSurface.withValues(alpha: layer), base),
        borderRadius: radius,
        border: Border.all(
          color: theme.primary.withValues(
            alpha: state.focusVisible ? _focusRingAlpha : 0,
          ),
          width: state.focusVisible ? _focusRingWidth : 0,
          strokeAlign: BorderSide.strokeAlignOutside,
        ),
        boxShadow: [if (variant == CardVariant.outline) _shadow],
      ),
      foregroundDecoration: variant == CardVariant.outline
          ? BoxDecoration(
              border: Border.all(color: edge),
              borderRadius: radius,
            )
          : null,
      child: DefaultTextStyle.merge(
        style: _textStyles[size]!.copyWith(color: theme.onSurface),
        child: _CardBody(
          gap: pad,
          growing: {
            for (final (index, child) in children.indexed)
              if (child is CardContent) index,
          },
          children: [
            for (final (index, child) in children.indexed)
              _region(child, index: index, pad: pad, lineColor: theme.border),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => _CardScope(
    size: size,
    child: !_interactive
        ? _surface(context, const InteractiveState())
        : Semantics(
            button: true,
            enabled: !disabled,
            container: true,
            child: MouseRegion(
              cursor: disabled
                  ? SystemMouseCursors.forbidden
                  : SystemMouseCursors.click,
              child: Opacity(
                opacity: disabled ? _disabledOpacity : 1,
                child: Interactive(
                  onPressed: onPressed,
                  disabled: disabled,
                  onInteractionChange: onInteractionChange,
                  builder: _surface,
                ),
              ),
            ),
          ),
  );
}

class CardHeader extends StatelessWidget {
  const CardHeader({super.key, this.divider = false, this.children = const []});

  final bool divider;
  final List<Widget> children;

  static const _gap = 4.0;

  @override
  Widget build(BuildContext context) {
    _CardScope.check(context, 'CardHeader');
    final action = children.whereType<CardAction>().firstOrNull;
    final text = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _gap,
      children: [
        for (final child in children)
          if (child is! CardAction) child,
      ],
    );
    if (action == null) return text;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _gap,
      children: [
        Expanded(child: text),
        action,
      ],
    );
  }
}

class CardTitle extends StatelessWidget {
  const CardTitle({super.key, this.headingLevel = 3, required this.child});

  final int headingLevel;
  final Widget child;

  static const _styles = {
    IdsSize.standard: IdsTypography.subtitleS2Semibold,
    IdsSize.tiny: IdsTypography.bodyB3Semibold,
  };

  @override
  Widget build(BuildContext context) => Semantics(
    header: true,
    headingLevel: headingLevel,
    child: DefaultTextStyle.merge(
      style: _styles[_CardScope.sizeOf(context, 'CardTitle')],
      child: child,
    ),
  );
}

class CardDescription extends StatelessWidget {
  const CardDescription({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    _CardScope.check(context, 'CardDescription');
    return DefaultTextStyle.merge(
      style: TextStyle(color: ThemeProvider.of(context).onMuted),
      child: child,
    );
  }
}

class CardAction extends StatelessWidget {
  const CardAction({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    _CardScope.check(context, 'CardAction');
    return child;
  }
}

class CardContent extends StatelessWidget {
  const CardContent({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    _CardScope.check(context, 'CardContent');
    return child;
  }
}

class CardFooter extends StatelessWidget {
  const CardFooter({super.key, this.divider = false, this.children = const []});

  final bool divider;
  final List<Widget> children;

  static const _gap = 8.0;

  @override
  Widget build(BuildContext context) {
    _CardScope.check(context, 'CardFooter');
    return Row(spacing: _gap, children: children);
  }
}

class CardMedia extends StatelessWidget {
  const CardMedia({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    _CardScope.check(context, 'CardMedia');
    return child;
  }
}

class _CardBody extends MultiChildRenderObjectWidget {
  const _CardBody({required this.gap, required this.growing, super.children});

  final double gap;
  final Set<int> growing;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderCardBody(gap, growing);

  @override
  void updateRenderObject(BuildContext context, _RenderCardBody renderObject) {
    renderObject
      ..gap = gap
      ..growing = growing;
  }
}

class _CardBodyParentData extends ContainerBoxParentData<RenderBox> {}

class _RenderCardBody extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _CardBodyParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _CardBodyParentData> {
  _RenderCardBody(this._gap, this._growing);

  double _gap;
  set gap(double value) {
    if (value == _gap) return;
    _gap = value;
    markNeedsLayout();
  }

  Set<int> _growing;
  set growing(Set<int> value) {
    if (value.length == _growing.length && value.containsAll(_growing)) return;
    _growing = value;
    markNeedsLayout();
  }

  double get _gaps => _gap * math.max(0, childCount - 1);

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _CardBodyParentData) {
      child.parentData = _CardBodyParentData();
    }
  }

  double _widest(double Function(RenderBox child) widthOf) =>
      getChildrenAsList().map(widthOf).fold(0, math.max);

  double _stacked(double Function(RenderBox child) heightOf) =>
      getChildrenAsList()
          .map(heightOf)
          .fold(_gaps, (sum, height) => sum + height);

  @override
  double computeMinIntrinsicWidth(double height) =>
      _widest((child) => child.getMinIntrinsicWidth(double.infinity));

  @override
  double computeMaxIntrinsicWidth(double height) =>
      _widest((child) => child.getMaxIntrinsicWidth(double.infinity));

  @override
  double computeMinIntrinsicHeight(double width) =>
      _stacked((child) => child.getMinIntrinsicHeight(width));

  @override
  double computeMaxIntrinsicHeight(double width) =>
      _stacked((child) => child.getMaxIntrinsicHeight(width));

  double _widthFor(BoxConstraints constraints) => constraints.constrainWidth(
    constraints.hasBoundedWidth
        ? constraints.maxWidth
        : getMaxIntrinsicWidth(double.infinity),
  );

  Size _layout(BoxConstraints constraints, ChildLayouter layoutChild) {
    final regions = getChildrenAsList();
    final fullWidth = BoxConstraints.tightFor(width: _widthFor(constraints));
    final heights = [
      for (final region in regions) layoutChild(region, fullWidth).height,
    ];
    final fixed = [
      for (final (index, height) in heights.indexed)
        if (!_growing.contains(index)) height,
    ].fold(_gaps, (sum, height) => sum + height);
    final growing = [
      for (final index in _growing)
        if (index < regions.length) index,
    ]..sort((a, b) => heights[b].compareTo(heights[a]));
    var pool = constraints.minHeight - fixed;
    final natural = growing.fold(0.0, (sum, index) => sum + heights[index]);
    if (growing.isNotEmpty && pool > natural) {
      while (growing.length > 1 &&
          heights[growing.first] > pool / growing.length) {
        pool -= heights[growing.removeAt(0)];
      }
      final share = pool / growing.length;
      for (final index in growing) {
        heights[index] = layoutChild(
          regions[index],
          fullWidth.copyWith(minHeight: share, maxHeight: share),
        ).height;
      }
    }
    final height = heights.fold(_gaps, (sum, height) => sum + height);
    return constraints.constrain(Size(fullWidth.maxWidth, height));
  }

  @override
  double? computeDistanceToActualBaseline(TextBaseline baseline) =>
      defaultComputeDistanceToFirstActualBaseline(baseline);

  @override
  double? computeDryBaseline(
    BoxConstraints constraints,
    TextBaseline baseline,
  ) => firstChild?.getDryBaseline(
    BoxConstraints.tightFor(width: _widthFor(constraints)),
    baseline,
  );

  @override
  Size computeDryLayout(BoxConstraints constraints) =>
      _layout(constraints, ChildLayoutHelper.dryLayoutChild);

  @override
  void performLayout() {
    size = _layout(constraints, ChildLayoutHelper.layoutChild);
    var top = 0.0;
    for (final region in getChildrenAsList()) {
      (region.parentData! as _CardBodyParentData).offset = Offset(0, top);
      top += region.size.height + _gap;
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) =>
      defaultHitTestChildren(result, position: position);

  @override
  void paint(PaintingContext context, Offset offset) =>
      defaultPaint(context, offset);
}

class _CardScope extends InheritedWidget {
  const _CardScope({required this.size, required super.child});

  final IdsSize size;

  static void check(BuildContext context, String part) {
    assert(
      context.getInheritedWidgetOfExactType<_CardScope>() != null,
      '[IDS] $part: must be used inside Card.',
    );
  }

  static IdsSize sizeOf(BuildContext context, String part) {
    final scope = context.dependOnInheritedWidgetOfExactType<_CardScope>();
    assert(scope != null, '[IDS] $part: must be used inside Card.');
    return scope?.size ?? IdsSize.standard;
  }

  @override
  bool updateShouldNotify(_CardScope oldWidget) => size != oldWidget.size;
}
