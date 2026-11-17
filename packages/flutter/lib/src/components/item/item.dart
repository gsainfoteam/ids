import 'dart:math' as math;

import 'package:flutter/foundation.dart' show precisionErrorTolerance;
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../../interaction/interactive.dart';
import '../../interaction/pressable_surface.dart';
import '../../layout/covering_image.dart';
import '../divider/divider.dart';

enum ItemVariant { ghost, outline, soft }

enum ItemGroupVariant { bordered, separated, ghost }

class Item extends StatelessWidget {
  const Item({
    super.key,
    this.variant,
    this.size,
    this.onPressed,
    this.selected,
    this.disabled = false,
    this.onInteractionChange,
    this.children = const [],
  });

  final ItemVariant? variant;
  final IdsSize? size;
  final VoidCallback? onPressed;
  final bool? selected;
  final bool disabled;
  final ValueChanged<InteractiveState>? onInteractionChange;
  final List<Widget> children;

  static const _paddings = {IdsSize.standard: 12.0, IdsSize.tiny: 8.0};
  static const _heights = {IdsSize.standard: 56.0, IdsSize.tiny: 40.0};
  static const _gaps = {IdsSize.standard: 12.0, IdsSize.tiny: 8.0};
  static const _titleOnlyRows = {IdsSize.standard: 56.0, IdsSize.tiny: 44.0};

  Widget _region(Widget child, {required bool separate}) =>
      separate && child is! ItemContent
      ? Semantics(container: true, child: child)
      : child;

  Widget _surface(
    BuildContext context,
    InteractiveState state, {
    required ItemVariant variant,
    required IdsSize size,
    required bool flat,
  }) {
    final ids = IdsProvider.of(context);
    final colors = ids.colors;
    final pad = ids.dimension(_paddings[size]!);
    final textScaler = MediaQuery.textScalerOf(context);
    double laidOutLineOf(TextStyle token) {
      final style = ids.textStyle(token);
      return (textScaler.scale(style.fontSize!) * style.height!)
          .roundToDouble();
    }

    Decoration surface(BorderSide side, {Color? color}) => flat
        ? BoxDecoration(
            color: color,
            borderRadius: BorderRadius.zero,
            border: Border.fromBorderSide(side),
          )
        : ShapeDecoration(
            color: color,
            shape: ids.shape(
              radius: math.min(ids.radius.standard + pad, ids.radius.container),
              side: side,
            ),
          );
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final base = variant == ItemVariant.soft
        ? colors.bgNeutralSoft
        : colors.surface.withValues(alpha: 0);
    final separate =
        onPressed != null && children.any((child) => child is ItemContent);
    final grow = children.indexWhere((child) => child is ItemContent);
    final push = grow == -1
        ? children.indexWhere((child) => child is ItemActions)
        : -1;

    return AnimatedContainer(
      duration: reduced ? Duration.zero : IdsMotion.fast,
      decoration: surface(
        FocusRing.around(colors, state),
        color: SurfaceLayer.over(
          base,
          colors,
          state,
          selected: selected == true,
        ),
      ),
      foregroundDecoration: variant == ItemVariant.outline
          ? surface(BorderSide(color: FocusRing.edge(colors, state)))
          : null,
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: ids.dimension(_heights[size]!)),
        child: Padding(
          padding: EdgeInsets.all(pad),
          child: DefaultTextStyle.merge(
            style: TextStyle(color: colors.onSurface),
            child: _ItemRow(
              rule: (
                gap: ids.dimension(_gaps[size]!),
                grow: grow == -1 ? null : grow,
                push: push == -1 ? null : push,
                tile: (
                  padding: pad,
                  side: ids.dimension(ItemMedia._tiles[size]!),
                  row: ids.dimension(_titleOnlyRows[size]!),
                  largestRow:
                      laidOutLineOf(ItemTitle._styles[size]!) +
                      ids.dimension(ItemContent._gap) +
                      laidOutLineOf(ItemDescription._styles[size]!) +
                      2 * pad,
                ),
                direction: Directionality.of(context),
              ),
              tiles: {
                for (final (index, child) in children.indexed)
                  if (child is ItemMedia && child.variant != ItemVariant.ghost)
                    index,
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
    final ids = IdsProvider.of(context);
    final colors = ids.colors;
    if (variant == ItemVariant.ghost) {
      return IconTheme.merge(
        data: IconThemeData(
          size: ids.dimension(_icon),
          color: colors.textNeutral,
        ),
        child: child ?? const SizedBox.shrink(),
      );
    }
    final base = ids.dimension(_tiles[size]!);
    return _SquareWithoutBaseline(
      side: base,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final side = constraints.isTight ? constraints.maxWidth : base;
          return SizedBox.square(
            dimension: side,
            child: ClipPath(
              clipper: ShapeBorderClipper(shape: ids.shape()),
              child: DecoratedBox(
                decoration: ShapeDecoration(
                  color: variant == ItemVariant.soft
                      ? colors.bgNeutralSoft
                      : null,
                  shape: ids.shape(
                    side: variant == ItemVariant.outline
                        ? BorderSide(color: colors.borderNeutral)
                        : BorderSide.none,
                  ),
                ),
                child: IconTheme.merge(
                  data: IconThemeData(size: side / 2, color: colors.onSurface),
                  child: child is Image
                      ? coveringItsBox(child!)
                      : Center(child: child),
                ),
              ),
            ),
          );
        },
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
      spacing: IdsProvider.of(context).dimension(_gap),
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
  Widget build(BuildContext context) {
    final size = _ItemScope.sizeOf(context, 'ItemTitle');
    final ids = IdsProvider.of(context);
    return DefaultTextStyle(
      style: ids.textStyle(_styles[size]!, color: ids.colors.onSurface),
      maxLines: truncate ? 1 : null,
      softWrap: !truncate,
      overflow: truncate ? TextOverflow.ellipsis : TextOverflow.clip,
      child: child,
    );
  }
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
  Widget build(BuildContext context) {
    final size = _ItemScope.sizeOf(context, 'ItemDescription');
    final ids = IdsProvider.of(context);
    return DefaultTextStyle(
      style: ids.textStyle(_styles[size]!, color: ids.colors.textNeutral),
      maxLines: _lines,
      overflow: TextOverflow.ellipsis,
      child: child,
    );
  }
}

class ItemActions extends StatelessWidget {
  const ItemActions({super.key, this.children = const []});

  final List<Widget> children;

  static const _gap = 8.0;
  static const _icon = 16.0;

  @override
  Widget build(BuildContext context) {
    _ItemScope.check(context, 'ItemActions');
    final ids = IdsProvider.of(context);
    return IconTheme.merge(
      data: IconThemeData(
        size: ids.dimension(_icon),
        color: ids.colors.textNeutral,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: ids.dimension(_gap),
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
    this.semanticLabel,
    this.children = const [],
  });

  final ItemGroupVariant variant;
  final IdsSize? size;
  final String? semanticLabel;
  final List<Widget> children;

  static const _separatedGap = 8.0;

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    final line = BorderSide(color: ids.colors.borderNeutral);
    final bordered = variant == ItemGroupVariant.bordered;
    return _ItemGroupScope(
      variant: variant,
      size: size,
      child: Semantics(
        role: SemanticsRole.list,
        label: semanticLabel,
        container: true,
        child: _ShrinkWhenUnbounded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: variant == ItemGroupVariant.separated
                ? ids.dimension(_separatedGap)
                : 0,
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
    required super.child,
  });

  final ItemGroupVariant variant;
  final IdsSize? size;

  ItemVariant? get rowVariant =>
      variant == ItemGroupVariant.separated ? ItemVariant.outline : null;

  static _ItemGroupScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_ItemGroupScope>();

  @override
  bool updateShouldNotify(_ItemGroupScope oldWidget) =>
      variant != oldWidget.variant || size != oldWidget.size;
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

class _SquareWithoutBaseline extends SingleChildRenderObjectWidget {
  const _SquareWithoutBaseline({required this.side, super.child});

  final double side;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderSquareWithoutBaseline(side);

  @override
  void updateRenderObject(
    BuildContext context,
    _RenderSquareWithoutBaseline renderObject,
  ) {
    renderObject.side = side;
  }
}

class _RenderSquareWithoutBaseline extends RenderProxyBox {
  _RenderSquareWithoutBaseline(this._side);

  double _side;
  set side(double value) {
    if (value == _side) return;
    _side = value;
    markNeedsLayout();
  }

  @override
  double computeMinIntrinsicWidth(double height) => _side;

  @override
  double computeMaxIntrinsicWidth(double height) => _side;

  @override
  double computeMinIntrinsicHeight(double width) => _side;

  @override
  double computeMaxIntrinsicHeight(double width) => _side;

  @override
  Size computeDryLayout(BoxConstraints constraints) =>
      constraints.constrain(Size.square(_side));

  @override
  double? computeDryBaseline(
    BoxConstraints constraints,
    TextBaseline baseline,
  ) => null;

  @override
  double? computeDistanceToActualBaseline(TextBaseline baseline) => null;
}

class _ItemRow extends MultiChildRenderObjectWidget {
  const _ItemRow({required this.rule, required this.tiles, super.children});

  final _RowRule rule;
  final Set<int> tiles;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderItemRow(rule, tiles);

  @override
  void updateRenderObject(BuildContext context, _RenderItemRow renderObject) {
    renderObject
      ..rule = rule
      ..tiles = tiles;
  }
}

class _ItemRowParentData extends ContainerBoxParentData<RenderBox> {}

typedef _TileRule = ({
  double padding,
  double side,
  double row,
  double largestRow,
});

typedef _RowRule = ({
  double gap,
  int? grow,
  int? push,
  _TileRule tile,
  TextDirection direction,
});

typedef _RowLayout = ({
  Size size,
  List<Size> sizes,
  List<BoxConstraints> constraints,
  double tileInset,
});

class _RenderItemRow extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _ItemRowParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _ItemRowParentData> {
  _RenderItemRow(this._rule, this._tiles);

  _RowRule _rule;
  set rule(_RowRule value) {
    if (value == _rule) return;
    _rule = value;
    markNeedsLayout();
  }

  Set<int> _tiles;
  set tiles(Set<int> value) {
    if (value.length == _tiles.length && value.containsAll(_tiles)) return;
    _tiles = value;
    markNeedsLayout();
  }

  double get _gaps => _rule.gap * math.max(0, childCount - 1);

  double get _largestRow => math.max(_rule.tile.row, _rule.tile.largestRow);

  double _rowAround(double tallest) =>
      (tallest + 2 * _rule.tile.padding).clamp(_rule.tile.row, _largestRow);

  double _tileSide(double row) => row * _rule.tile.side / _rule.tile.row;

  double _tileInset(double row) =>
      (row - _tileSide(row)) / 2 - _rule.tile.padding;

  double _tileSpan(double row) => _tileInset(row) + _tileSide(row);

  double _tileSpans(double row) => _tiles.length * _tileSpan(row);

  Iterable<(int, RenderBox)> get _flowing =>
      getChildrenAsList().indexed.where((entry) => !_tiles.contains(entry.$1));

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _ItemRowParentData) {
      child.parentData = _ItemRowParentData();
    }
  }

  double _intrinsicWidth(double Function(RenderBox child) widthOf) {
    final row = _tiles.isEmpty
        ? _rule.tile.row
        : _rowAround(
            _flowing
                .map((entry) => entry.$2.getMaxIntrinsicHeight(double.infinity))
                .fold(0.0, math.max),
          );
    return _flowing
        .map((entry) => widthOf(entry.$2))
        .fold(_gaps + _tileSpans(row), (sum, width) => sum + width);
  }

  @override
  double computeMinIntrinsicWidth(double height) =>
      _intrinsicWidth((child) => child.getMinIntrinsicWidth(height));

  @override
  double computeMaxIntrinsicWidth(double height) =>
      _intrinsicWidth((child) => child.getMaxIntrinsicWidth(height));

  double _intrinsicHeight(
    double width,
    double Function(RenderBox child, double width) heightOf,
  ) {
    final fixed = _flowing
        .where((entry) => entry.$1 != _rule.grow)
        .map((entry) => entry.$2.getMaxIntrinsicWidth(double.infinity))
        .fold(_gaps, (sum, width) => sum + width);
    double tallestBeside(double row) => _flowing
        .map(
          (entry) => heightOf(
            entry.$2,
            entry.$1 == _rule.grow
                ? math.max(0, width - fixed - _tileSpans(row))
                : double.infinity,
          ),
        )
        .fold(0.0, math.max);
    if (_tiles.isEmpty) return tallestBeside(_rule.tile.row);
    final row = _rowAround(tallestBeside(_rule.tile.row));
    return math.max(tallestBeside(row), _tileSpan(row));
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
    var fixed = _gaps;
    var tallest = constraints.minHeight;
    for (final (index, child) in _flowing) {
      if (index == _rule.grow) continue;
      sizes[index] = layoutChild(child, loose);
      fixed += sizes[index].width;
      tallest = math.max(tallest, sizes[index].height);
    }
    var row = _rule.tile.row;
    final grow = _rule.grow;
    if (grow != null) {
      Size fitBeside(double row) {
        final width = math.max(
          0.0,
          constraints.maxWidth - fixed - _tileSpans(row),
        );
        given[grow] = constraints.hasBoundedWidth
            ? loose.copyWith(minWidth: width, maxWidth: width)
            : loose;
        return sizes[grow] = layoutChild(children[grow], given[grow]);
      }

      final settled = _rowAround(math.max(tallest, fitBeside(row).height));
      final moved = (settled - row).abs() > precisionErrorTolerance;
      row = settled;
      if (moved && _tiles.isNotEmpty) fitBeside(row);
      tallest = math.max(tallest, sizes[grow].height);
    } else {
      row = _rowAround(tallest);
    }
    for (final index in _tiles) {
      sizes[index] = Size.square(_tileSide(row));
      given[index] = BoxConstraints.tight(sizes[index]);
    }
    final used = _flowing.fold(
      _gaps + _tileSpans(row),
      (sum, entry) => sum + sizes[entry.$1].width,
    );
    return (
      size: constraints.constrain(
        Size(
          constraints.hasBoundedWidth ? constraints.maxWidth : used,
          _tiles.isEmpty ? tallest : math.max(tallest, _tileSpan(row)),
        ),
      ),
      sizes: sizes,
      constraints: given,
      tileInset: _tileInset(row),
    );
  }

  double _offsetY(int index, _RowLayout layout) => _tiles.contains(index)
      ? layout.tileInset
      : (layout.size.height - layout.sizes[index].height) / 2;

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
    for (final (index, child) in _flowing) {
      final distance = child.getDryBaseline(
        layout.constraints[index],
        baseline,
      );
      if (distance == null) continue;
      final y = _offsetY(index, layout) + distance;
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
    final tileInsets = _tiles.length * layout.tileInset;
    final used = layout.sizes.fold(
      _gaps + tileInsets,
      (sum, child) => sum + child.width,
    );
    final free = math.max(0.0, size.width - used);
    var x = 0.0;
    for (final (index, child) in getChildrenAsList().indexed) {
      if (index == _rule.push) x += free;
      if (_tiles.contains(index)) {
        child.layout(layout.constraints[index]);
        x += layout.tileInset;
      }
      final width = layout.sizes[index].width;
      (child.parentData! as _ItemRowParentData).offset = Offset(
        _rule.direction == TextDirection.ltr ? x : size.width - x - width,
        _offsetY(index, layout),
      );
      x += width + _rule.gap;
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) =>
      defaultHitTestChildren(result, position: position);

  @override
  void paint(PaintingContext context, Offset offset) =>
      defaultPaint(context, offset);
}
