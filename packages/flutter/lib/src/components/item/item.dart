import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_radius.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../../interaction/interactive.dart';
import '../../interaction/pressable_surface.dart';
import '../divider/divider.dart';

enum ItemVariant { ghost, outline, soft }

enum ItemGroupVariant { bordered, separated, ghost }

class Item extends StatelessWidget {
  const Item({
    super.key,
    this.variant,
    this.size,
    this.dense,
    this.onPressed,
    this.selected,
    this.disabled = false,
    this.onInteractionChange,
    this.children = const [],
  });

  final ItemVariant? variant;
  final IdsSize? size;
  final bool? dense;
  final VoidCallback? onPressed;
  final bool? selected;
  final bool disabled;
  final ValueChanged<InteractiveState>? onInteractionChange;
  final List<Widget> children;

  static const _paddings = {IdsSize.standard: 12.0, IdsSize.tiny: 8.0};
  static const _densePaddings = {IdsSize.standard: 6.0, IdsSize.tiny: 4.0};
  static const _heights = {IdsSize.standard: 56.0, IdsSize.tiny: 40.0};
  static const _denseHeights = {IdsSize.standard: 48.0, IdsSize.tiny: 32.0};
  static const _gaps = {IdsSize.standard: 12.0, IdsSize.tiny: 8.0};

  bool get _describes => children.any(
    (child) =>
        child is ItemContent &&
        child.children.any((part) => part is ItemDescription),
  );

  Widget _region(Widget child, {required bool separate}) =>
      separate && child is! ItemContent
      ? Semantics(container: true, child: child)
      : child;

  Widget _surface(
    BuildContext context,
    InteractiveState state, {
    required ItemVariant variant,
    required IdsSize size,
    required bool dense,
    required bool flat,
  }) {
    final theme = ThemeProvider.of(context);
    final pad = (dense ? _densePaddings : _paddings)[size]!;
    final radius = BorderRadius.circular(
      flat ? 0 : math.min(IdsRadius.standard + pad, IdsRadius.container),
    );
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final base = variant == ItemVariant.soft
        ? theme.muted
        : theme.surface.withValues(alpha: 0);
    final separate =
        onPressed != null && children.any((child) => child is ItemContent);
    final grow = children.indexWhere((child) => child is ItemContent);
    final push = grow == -1
        ? children.indexWhere((child) => child is ItemActions)
        : -1;

    return AnimatedContainer(
      duration: reduced ? Duration.zero : IdsMotion.fast,
      decoration: BoxDecoration(
        color: SurfaceLayer.over(
          base,
          theme,
          state,
          selected: selected == true,
        ),
        borderRadius: radius,
        border: FocusRing.around(theme, state),
      ),
      foregroundDecoration: variant == ItemVariant.outline
          ? BoxDecoration(
              border: Border.all(color: FocusRing.edge(theme, state)),
              borderRadius: radius,
            )
          : null,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: (dense ? _denseHeights : _heights)[size]!,
        ),
        child: Padding(
          padding: EdgeInsets.all(pad),
          child: DefaultTextStyle.merge(
            style: TextStyle(color: theme.onSurface),
            child: _ItemRow(
              gap: _gaps[size]!,
              grow: grow == -1 ? null : grow,
              push: push == -1 ? null : push,
              top: {
                if (_describes)
                  for (final (index, child) in children.indexed)
                    if (child is ItemMedia) index,
              },
              children: [
                for (final child in children)
                  _region(child, separate: separate),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final group = _ItemGroupScope.maybeOf(context);
    final resolvedSize = size ?? group?.size ?? IdsSize.standard;
    final resolvedVariant = variant ?? group?.rowVariant ?? ItemVariant.ghost;
    final resolvedDense = dense ?? group?.dense ?? false;
    return _ItemScope(
      size: resolvedSize,
      child: PressableSurface(
        onPressed: onPressed,
        disabled: disabled,
        selected: selected,
        onInteractionChange: onInteractionChange,
        builder: (context, state) => _surface(
          context,
          state,
          variant: resolvedVariant,
          size: resolvedSize,
          dense: resolvedDense,
          flat: group?.variant == ItemGroupVariant.bordered,
        ),
      ),
    );
  }
}

class ItemMedia extends StatelessWidget {
  const ItemMedia({super.key, this.variant = ItemVariant.ghost, this.child});

  final ItemVariant variant;
  final Widget? child;

  static const _tiles = {IdsSize.standard: 32.0, IdsSize.tiny: 28.0};
  static const _icon = 16.0;

  @override
  Widget build(BuildContext context) {
    final size = _ItemScope.sizeOf(context, 'ItemMedia');
    final theme = ThemeProvider.of(context);
    if (variant == ItemVariant.ghost) {
      return IconTheme.merge(
        data: IconThemeData(size: _icon, color: theme.onMuted),
        child: child ?? const SizedBox.shrink(),
      );
    }
    final radius = BorderRadius.circular(IdsRadius.standard);
    return SizedBox.square(
      dimension: _tiles[size],
      child: ClipRRect(
        borderRadius: radius,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: variant == ItemVariant.soft ? theme.muted : null,
            border: variant == ItemVariant.outline
                ? Border.all(color: theme.border)
                : null,
            borderRadius: radius,
          ),
          child: IconTheme.merge(
            data: IconThemeData(size: _icon, color: theme.onSurface),
            child: child is Image ? child! : Center(child: child),
          ),
        ),
      ),
    );
  }
}

class ItemContent extends StatelessWidget {
  const ItemContent({super.key, this.children = const []});

  final List<Widget> children;

  static const _gap = 2.0;

  @override
  Widget build(BuildContext context) {
    _ItemScope.check(context, 'ItemContent');
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: _gap,
      children: children,
    );
  }
}

class ItemTitle extends StatelessWidget {
  const ItemTitle({super.key, this.truncate = false, required this.child});

  final bool truncate;
  final Widget child;

  static const _styles = {
    IdsSize.standard: IdsTypography.bodyB3Medium,
    IdsSize.tiny: IdsTypography.captionC1Medium,
  };

  @override
  Widget build(BuildContext context) => DefaultTextStyle.merge(
    style: _styles[_ItemScope.sizeOf(context, 'ItemTitle')],
    maxLines: truncate ? 1 : null,
    softWrap: !truncate,
    overflow: truncate ? TextOverflow.ellipsis : null,
    child: child,
  );
}

class ItemDescription extends StatelessWidget {
  const ItemDescription({super.key, required this.child});

  final Widget child;

  static const _styles = {
    IdsSize.standard: IdsTypography.bodyB3Regular,
    IdsSize.tiny: IdsTypography.captionC1Regular,
  };
  static const _lines = 2;

  @override
  Widget build(BuildContext context) => DefaultTextStyle.merge(
    style: _styles[_ItemScope.sizeOf(context, 'ItemDescription')]!.copyWith(
      color: ThemeProvider.of(context).onMuted,
    ),
    maxLines: _lines,
    overflow: TextOverflow.ellipsis,
    child: child,
  );
}

class ItemActions extends StatelessWidget {
  const ItemActions({super.key, this.children = const []});

  final List<Widget> children;

  static const _gap = 8.0;
  static const _icon = 16.0;

  @override
  Widget build(BuildContext context) {
    _ItemScope.check(context, 'ItemActions');
    return IconTheme.merge(
      data: IconThemeData(
        size: _icon,
        color: ThemeProvider.of(context).onMuted,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: _gap,
        children: children,
      ),
    );
  }
}

class ItemGroup extends StatelessWidget {
  const ItemGroup({
    super.key,
    this.variant = ItemGroupVariant.bordered,
    this.size,
    this.dense,
    this.semanticLabel,
    this.children = const [],
  });

  final ItemGroupVariant variant;
  final IdsSize? size;
  final bool? dense;
  final String? semanticLabel;
  final List<Widget> children;

  static const _separatedGap = 8.0;

  @override
  Widget build(BuildContext context) {
    final line = BorderSide(color: ThemeProvider.of(context).border);
    final bordered = variant == ItemGroupVariant.bordered;
    return _ItemGroupScope(
      variant: variant,
      size: size,
      dense: dense,
      child: Semantics(
        role: SemanticsRole.list,
        label: semanticLabel,
        container: true,
        child: _ShrinkWhenUnbounded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: variant == ItemGroupVariant.separated ? _separatedGap : 0,
            children: [
              for (final (index, child) in children.indexed)
                Container(
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: bordered && index < children.length - 1
                          ? line
                          : BorderSide.none,
                    ),
                  ),
                  child: child is ItemSeparator
                      ? child
                      : Semantics(role: SemanticsRole.listItem, child: child),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class ItemSeparator extends StatelessWidget {
  const ItemSeparator({super.key});

  @override
  Widget build(BuildContext context) =>
      Divider(decorative: _ItemGroupScope.maybeOf(context) != null);
}

class _ItemScope extends InheritedWidget {
  const _ItemScope({required this.size, required super.child});

  final IdsSize size;

  static void check(BuildContext context, String part) {
    assert(
      context.getInheritedWidgetOfExactType<_ItemScope>() != null,
      '[IDS] $part: must be used inside Item.',
    );
  }

  static IdsSize sizeOf(BuildContext context, String part) {
    final scope = context.dependOnInheritedWidgetOfExactType<_ItemScope>();
    assert(scope != null, '[IDS] $part: must be used inside Item.');
    return scope?.size ?? IdsSize.standard;
  }

  @override
  bool updateShouldNotify(_ItemScope oldWidget) => size != oldWidget.size;
}

class _ItemGroupScope extends InheritedWidget {
  const _ItemGroupScope({
    required this.variant,
    required this.size,
    required this.dense,
    required super.child,
  });

  final ItemGroupVariant variant;
  final IdsSize? size;
  final bool? dense;

  ItemVariant? get rowVariant =>
      variant == ItemGroupVariant.separated ? ItemVariant.outline : null;

  static _ItemGroupScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_ItemGroupScope>();

  @override
  bool updateShouldNotify(_ItemGroupScope oldWidget) =>
      variant != oldWidget.variant ||
      size != oldWidget.size ||
      dense != oldWidget.dense;
}

class _ShrinkWhenUnbounded extends SingleChildRenderObjectWidget {
  const _ShrinkWhenUnbounded({super.child});

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderShrinkWhenUnbounded();
}

class _RenderShrinkWhenUnbounded extends RenderProxyBox {
  BoxConstraints _bounded(BoxConstraints constraints) {
    if (constraints.hasBoundedWidth) return constraints;
    final width = math.max(
      constraints.minWidth,
      child!.getMaxIntrinsicWidth(constraints.maxHeight),
    );
    return constraints.copyWith(maxWidth: width);
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) =>
      child?.getDryLayout(_bounded(constraints)) ?? constraints.smallest;

  @override
  void performLayout() {
    final child = this.child;
    if (child == null) {
      size = constraints.smallest;
      return;
    }
    child.layout(_bounded(constraints), parentUsesSize: true);
    size = child.size;
  }
}

class _ItemRow extends MultiChildRenderObjectWidget {
  const _ItemRow({
    required this.gap,
    required this.grow,
    required this.push,
    required this.top,
    super.children,
  });

  final double gap;
  final int? grow;
  final int? push;
  final Set<int> top;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderItemRow(
    gap: gap,
    grow: grow,
    push: push,
    top: top,
    direction: Directionality.of(context),
  );

  @override
  void updateRenderObject(BuildContext context, _RenderItemRow renderObject) {
    renderObject
      ..gap = gap
      ..grow = grow
      ..push = push
      ..top = top
      ..direction = Directionality.of(context);
  }
}

class _ItemRowParentData extends ContainerBoxParentData<RenderBox> {}

typedef _RowLayout = ({
  Size size,
  List<Size> sizes,
  List<BoxConstraints> constraints,
});

class _RenderItemRow extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _ItemRowParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _ItemRowParentData> {
  _RenderItemRow({
    required double gap,
    required int? grow,
    required int? push,
    required Set<int> top,
    required TextDirection direction,
  }) : _gap = gap,
       _grow = grow,
       _push = push,
       _top = top,
       _direction = direction;

  double _gap;
  set gap(double value) {
    if (value == _gap) return;
    _gap = value;
    markNeedsLayout();
  }

  int? _grow;
  set grow(int? value) {
    if (value == _grow) return;
    _grow = value;
    markNeedsLayout();
  }

  int? _push;
  set push(int? value) {
    if (value == _push) return;
    _push = value;
    markNeedsLayout();
  }

  Set<int> _top;
  set top(Set<int> value) {
    if (value.length == _top.length && value.containsAll(_top)) return;
    _top = value;
    markNeedsLayout();
  }

  TextDirection _direction;
  set direction(TextDirection value) {
    if (value == _direction) return;
    _direction = value;
    markNeedsLayout();
  }

  double get _gaps => _gap * math.max(0, childCount - 1);

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _ItemRowParentData) {
      child.parentData = _ItemRowParentData();
    }
  }

  @override
  double computeMinIntrinsicWidth(double height) => getChildrenAsList()
      .map((child) => child.getMinIntrinsicWidth(height))
      .fold(_gaps, (sum, width) => sum + width);

  @override
  double computeMaxIntrinsicWidth(double height) => getChildrenAsList()
      .map((child) => child.getMaxIntrinsicWidth(height))
      .fold(_gaps, (sum, width) => sum + width);

  double _intrinsicHeight(
    double width,
    double Function(RenderBox child, double width) heightOf,
  ) {
    final children = getChildrenAsList();
    final fixed = children.indexed
        .where((entry) => entry.$1 != _grow)
        .map((entry) => entry.$2.getMaxIntrinsicWidth(double.infinity))
        .fold(_gaps, (sum, width) => sum + width);
    return children.indexed
        .map(
          (entry) => heightOf(
            entry.$2,
            entry.$1 == _grow ? math.max(0, width - fixed) : double.infinity,
          ),
        )
        .fold(0.0, math.max);
  }

  @override
  double computeMinIntrinsicHeight(double width) => _intrinsicHeight(
    width,
    (child, width) => child.getMinIntrinsicHeight(width),
  );

  @override
  double computeMaxIntrinsicHeight(double width) => _intrinsicHeight(
    width,
    (child, width) => child.getMaxIntrinsicHeight(width),
  );

  _RowLayout _layout(BoxConstraints constraints, ChildLayouter layoutChild) {
    final children = getChildrenAsList();
    final loose = BoxConstraints(
      maxWidth: constraints.maxWidth,
      maxHeight: constraints.maxHeight,
    );
    final sizes = List.filled(children.length, Size.zero);
    final given = List.filled(children.length, loose);
    var used = _gaps;
    for (final (index, child) in children.indexed) {
      if (index == _grow) continue;
      sizes[index] = layoutChild(child, loose);
      used += sizes[index].width;
    }
    final grow = _grow;
    if (grow != null && grow < children.length) {
      final width = math.max(0.0, constraints.maxWidth - used);
      given[grow] = constraints.hasBoundedWidth
          ? loose.copyWith(minWidth: width, maxWidth: width)
          : loose;
      sizes[grow] = layoutChild(children[grow], given[grow]);
      used += sizes[grow].width;
    }
    final height = sizes.fold(constraints.minHeight, (tallest, size) {
      return math.max(tallest, size.height);
    });
    return (
      size: constraints.constrain(
        Size(constraints.hasBoundedWidth ? constraints.maxWidth : used, height),
      ),
      sizes: sizes,
      constraints: given,
    );
  }

  double _offsetY(int index, Size size, Size child) =>
      _top.contains(index) ? 0 : (size.height - child.height) / 2;

  @override
  Size computeDryLayout(BoxConstraints constraints) =>
      _layout(constraints, ChildLayoutHelper.dryLayoutChild).size;

  @override
  double? computeDryBaseline(
    BoxConstraints constraints,
    TextBaseline baseline,
  ) {
    final layout = _layout(constraints, ChildLayoutHelper.dryLayoutChild);
    double? highest;
    for (final (index, child) in getChildrenAsList().indexed) {
      final distance = child.getDryBaseline(
        layout.constraints[index],
        baseline,
      );
      if (distance == null) continue;
      final y = _offsetY(index, layout.size, layout.sizes[index]) + distance;
      highest = highest == null ? y : math.min(highest, y);
    }
    return highest;
  }

  @override
  double? computeDistanceToActualBaseline(TextBaseline baseline) =>
      defaultComputeDistanceToHighestActualBaseline(baseline);

  @override
  void performLayout() {
    final layout = _layout(constraints, ChildLayoutHelper.layoutChild);
    size = layout.size;
    final used = layout.sizes.fold(_gaps, (sum, child) => sum + child.width);
    final free = math.max(0.0, size.width - used);
    var x = 0.0;
    for (final (index, child) in getChildrenAsList().indexed) {
      if (index == _push) x += free;
      final width = layout.sizes[index].width;
      (child.parentData! as _ItemRowParentData).offset = Offset(
        _direction == TextDirection.ltr ? x : size.width - x - width,
        _offsetY(index, size, layout.sizes[index]),
      );
      x += width + _gap;
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) =>
      defaultHitTestChildren(result, position: position);

  @override
  void paint(PaintingContext context, Offset offset) =>
      defaultPaint(context, offset);
}
