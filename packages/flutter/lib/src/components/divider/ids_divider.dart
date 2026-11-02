import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsDivider extends StatelessWidget {
  const IdsDivider({
    super.key,
    this.orientation = Axis.horizontal,
    this.decorative = false,
    this.child,
  });

  final Axis orientation;
  final bool decorative;

  /// 레이블이 없으면 null을 넘긴다. 빈 [Text]도 레이블 자리를 차지한다.
  final Widget? child;

  static const _thickness = 1.0;

  bool get _horizontal => orientation == Axis.horizontal;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final label = child;

    return ExcludeSemantics(
      excluding: decorative,
      child: label == null
          ? _line(context, theme.border)
          : _LabelledLine(
              orientation: orientation,
              color: theme.border,
              child: DefaultTextStyle(
                style: IdsTypography.captionC1Medium.copyWith(
                  color: theme.onMuted,
                ),
                textAlign: TextAlign.center,
                child: label,
              ),
            ),
    );
  }

  Widget _line(BuildContext context, Color color) {
    final line = ColoredBox(
      color: color,
      child: SizedBox(
        width: _horizontal ? double.infinity : _thickness,
        height: _horizontal ? _thickness : double.infinity,
      ),
    );
    if (_horizontal) return line;
    final style = DefaultTextStyle.of(context).style;
    return LimitedBox(
      maxHeight: (style.fontSize ?? 14) * (style.height ?? 1.2),
      child: line,
    );
  }
}

class _LabelledLine extends SingleChildRenderObjectWidget {
  const _LabelledLine({
    required this.orientation,
    required this.color,
    required super.child,
  });

  final Axis orientation;
  final Color color;

  @override
  _RenderLabelledLine createRenderObject(BuildContext context) =>
      _RenderLabelledLine(orientation, color);

  @override
  void updateRenderObject(
    BuildContext context,
    _RenderLabelledLine renderObject,
  ) {
    renderObject
      ..orientation = orientation
      ..color = color;
  }
}

class _RenderLabelledLine extends RenderShiftedBox {
  _RenderLabelledLine(this._orientation, this._color) : super(null);

  Axis _orientation;
  set orientation(Axis value) {
    if (value == _orientation) return;
    _orientation = value;
    markNeedsLayout();
  }

  Color _color;
  set color(Color value) {
    if (value == _color) return;
    _color = value;
    markNeedsPaint();
  }

  bool get _horizontal => _orientation == Axis.horizontal;
  double get _gap => _horizontal ? 12 : 8;
  double get _ends => _horizontal ? 2 * (16 + 12) : 2 * (8 + 8);

  double _main(BoxConstraints constraints) =>
      _horizontal ? constraints.maxWidth : constraints.maxHeight;

  BoxConstraints _labelConstraints(BoxConstraints constraints) {
    final labelMax = math.max(0.0, _main(constraints) - _ends);
    return _horizontal
        ? BoxConstraints(maxWidth: labelMax, maxHeight: constraints.maxHeight)
        : BoxConstraints(maxWidth: constraints.maxWidth, maxHeight: labelMax);
  }

  Size _sizeFor(BoxConstraints constraints, Size label) {
    final main = _main(constraints);
    final labelMain = _horizontal ? label.width : label.height;
    final labelCross = _horizontal ? label.height : label.width;
    final mainSize = main.isFinite ? main : labelMain + _ends;
    final crossSize = math.max(labelCross, IdsDivider._thickness);
    return constraints.constrain(
      _horizontal ? Size(mainSize, crossSize) : Size(crossSize, mainSize),
    );
  }

  @override
  double computeMinIntrinsicWidth(double height) => _horizontal
      ? child!.getMinIntrinsicWidth(height) + _ends
      : math.max(IdsDivider._thickness, child!.getMinIntrinsicWidth(height));

  @override
  double computeMaxIntrinsicWidth(double height) => _horizontal
      ? child!.getMaxIntrinsicWidth(height) + _ends
      : math.max(IdsDivider._thickness, child!.getMaxIntrinsicWidth(height));

  @override
  double computeMinIntrinsicHeight(double width) => _horizontal
      ? math.max(
          IdsDivider._thickness,
          child!.getMinIntrinsicHeight(math.max(0, width - _ends)),
        )
      : child!.getMinIntrinsicHeight(width) + _ends;

  @override
  double computeMaxIntrinsicHeight(double width) => _horizontal
      ? math.max(
          IdsDivider._thickness,
          child!.getMaxIntrinsicHeight(math.max(0, width - _ends)),
        )
      : child!.getMaxIntrinsicHeight(width) + _ends;

  @override
  Size computeDryLayout(BoxConstraints constraints) => _sizeFor(
    constraints,
    child!.getDryLayout(_labelConstraints(constraints)),
  );

  @override
  void performLayout() {
    final label = child!
      ..layout(_labelConstraints(constraints), parentUsesSize: true);
    size = _sizeFor(constraints, label.size);
    (label.parentData! as BoxParentData).offset =
        ((size - label.size) as Offset) / 2;
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    final label = child!;
    final labelOffset = (label.parentData! as BoxParentData).offset;
    final paint = Paint()..color = _color;
    const thickness = IdsDivider._thickness;

    if (_horizontal) {
      final top = offset.dy + (size.height - thickness) / 2;
      final before = labelOffset.dx - _gap;
      final after = labelOffset.dx + label.size.width + _gap;
      context.canvas
        ..drawRect(Rect.fromLTWH(offset.dx, top, before, thickness), paint)
        ..drawRect(
          Rect.fromLTWH(offset.dx + after, top, size.width - after, thickness),
          paint,
        );
    } else {
      final left = offset.dx + (size.width - thickness) / 2;
      final before = labelOffset.dy - _gap;
      final after = labelOffset.dy + label.size.height + _gap;
      context.canvas
        ..drawRect(Rect.fromLTWH(left, offset.dy, thickness, before), paint)
        ..drawRect(
          Rect.fromLTWH(
            left,
            offset.dy + after,
            thickness,
            size.height - after,
          ),
          paint,
        );
    }
    super.paint(context, offset);
  }
}
