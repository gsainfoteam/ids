import 'dart:math' as math;

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
    final line = ColoredBox(
      color: theme.border,
      child: SizedBox(
        width: _horizontal ? double.infinity : _thickness,
        height: _horizontal ? _thickness : double.infinity,
      ),
    );

    return ExcludeSemantics(
      excluding: decorative,
      child: switch ((child, orientation)) {
        (null, Axis.horizontal) => line,
        (null, Axis.vertical) => LimitedBox(
          maxHeight: _lineHeight(context),
          child: line,
        ),
        (final label?, _) => _labelled(line, label, theme.onMuted),
      },
    );
  }

  Widget _labelled(Widget line, Widget label, Color color) {
    final minLine = _horizontal ? 16.0 : 8.0;
    final gap = _horizontal ? 12.0 : 8.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final main = _horizontal ? constraints.maxWidth : constraints.maxHeight;
        final labelMax = math.max(0.0, main - 2 * (minLine + gap));
        final side = Expanded(child: line);

        return Flex(
          direction: orientation,
          mainAxisSize: MainAxisSize.min,
          spacing: gap,
          children: [
            side,
            ConstrainedBox(
              constraints: _horizontal
                  ? BoxConstraints(maxWidth: labelMax)
                  : BoxConstraints(maxHeight: labelMax),
              child: DefaultTextStyle(
                style: IdsTypography.captionC1Medium.copyWith(color: color),
                textAlign: TextAlign.center,
                child: label,
              ),
            ),
            side,
          ],
        );
      },
    );
  }

  static double _lineHeight(BuildContext context) {
    final style = DefaultTextStyle.of(context).style;
    return (style.fontSize ?? 14) * (style.height ?? 1.2);
  }
}
