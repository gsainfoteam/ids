import 'package:flutter/widgets.dart';
import '../../../theme/theme_provider.dart';

class IdsDivider extends StatelessWidget {
  const IdsDivider({
    super.key,
    this.orientation = IdsDividerOrientation.horizontal,
    this.thickness = 1.0,
  });

  final IdsDividerOrientation orientation;
  final double thickness;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Container(
      width: orientation == IdsDividerOrientation.horizontal ? double.infinity : thickness,
      height: orientation == IdsDividerOrientation.horizontal ? thickness : double.infinity,
      color: theme.outline,
    );
  }
}

enum IdsDividerOrientation { horizontal, vertical }
