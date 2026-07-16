import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsText extends StatelessWidget {
  const IdsText(
    this.data, {
    super.key,
    this.style = IdsTypography.bodyB2Regular,
    this.color,
    this.align,
    this.maxLines,
    this.overflow,
  });

  final String data;
  final TextStyle style;
  final Color? color;
  final TextAlign? align;
  final int? maxLines;
  final TextOverflow? overflow;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Text(
      data,
      style: style.copyWith(color: color ?? theme.onSurface),
      textAlign: align,
      maxLines: maxLines,
      overflow: overflow,
    );
  }
}
