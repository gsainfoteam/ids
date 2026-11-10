import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../theme/ids_theme_data.dart';
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

  final Widget? child;

  static const _thickness = 1.0;

  bool get _horizontal => orientation == Axis.horizontal;

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context).theme;
    final label = child;

    return ExcludeSemantics(
      excluding: decorative,
      child: label == null
          ? _line(context, theme.border, theme.dimension(_thickness))
          : _LabelledLine(
              orientation: orientation,
              color: theme.border,
              theme: theme.data,
              child: DefaultTextStyle(
                style: theme.textStyle(
                  IdsTypography.captionC1Medium,
                  color: theme.onMuted,
                ),
                textAlign: TextAlign.center,
                child: label,
              ),
            ),
    );
  }

  Widget _line(BuildContext context, Color color, double thickness) {
    final line = ColoredBox(
      color: color,
      child: SizedBox(
        width: _horizontal ? double.infinity : thickness,
        height: _horizontal ? thickness : double.infinity,
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
    required this.theme,
    required super.child,
  });

  final Axis orientation;
  final Color color;
  final IdsThemeData theme;

  @override
  _RenderLabelledLine createRenderObject(BuildContext context) =>
      _RenderLabelledLine(orientation, color, theme);

  @override
  void updateRenderObject(
    BuildContext context,
    _RenderLabelledLine renderObject,
  ) {
    renderObject
      ..orientation = orientation
      ..color = color
      ..theme = theme;
  }
}

class _RenderLabelledLine extends RenderShiftedBox {
  _RenderLabelledLine(this._orientation, this._color, this._theme)
    : super(null);

  IdsThemeData _theme;
  set theme(IdsThemeData value) {
    if (_theme == value) return;
    _theme = value;
    markNeedsLayout();
  }

  double get _thickness => _theme.dimension(IdsDivider._thickness);

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
  double get _gap => _theme.dimension(_horizontal ? 12 : 8);
  double get _ends =>
      _theme.dimension(_horizontal ? 2 * (16 + 12) : 2 * (8 + 8));

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
    final crossSize = math.max(labelCross, _thickness);
    return constraints.constrain(
      _horizontal ? Size(mainSize, crossSize) : Size(crossSize, mainSize),
    );
  }

  double _intrinsicWidth(double height, double Function(double) label) =>
      _horizontal ? label(height) + _ends : math.max(_thickness, label(height));

  double _intrinsicHeight(double width, double Function(double) label) =>
      _horizontal
      ? math.max(_thickness, label(math.max(0, width - _ends)))
      : label(width) + _ends;

  @override
  double computeMinIntrinsicWidth(double height) =>
      _intrinsicWidth(height, child!.getMinIntrinsicWidth);

  @override
  double computeMaxIntrinsicWidth(double height) =>
      _intrinsicWidth(height, child!.getMaxIntrinsicWidth);

  @override
  double computeMinIntrinsicHeight(double width) =>
      _intrinsicHeight(width, child!.getMinIntrinsicHeight);

  @override
  double computeMaxIntrinsicHeight(double width) =>
      _intrinsicHeight(width, child!.getMaxIntrinsicHeight);

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

  Rect _segment(Offset offset, double start, double length) {
    final thickness = _thickness;
    return _horizontal
        ? Rect.fromLTWH(
            offset.dx + start,
            offset.dy + (size.height - thickness) / 2,
            length,
            thickness,
          )
        : Rect.fromLTWH(
            offset.dx + (size.width - thickness) / 2,
            offset.dy + start,
            thickness,
            length,
          );
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    final label = child!;
    final labelOffset = (label.parentData! as BoxParentData).offset;
    final labelStart = _horizontal ? labelOffset.dx : labelOffset.dy;
    final labelEnd =
        labelStart + (_horizontal ? label.size.width : label.size.height);
    final mainSize = _horizontal ? size.width : size.height;
    final paint = Paint()..color = _color;

    context.canvas
      ..drawRect(_segment(offset, 0, labelStart - _gap), paint)
      ..drawRect(
        _segment(offset, labelEnd + _gap, mainSize - labelEnd - _gap),
        paint,
      );
    super.paint(context, offset);
  }
}
