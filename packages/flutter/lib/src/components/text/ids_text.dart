import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

enum IdsTextVariant { display, heading, title, body, label, caption }

class IdsText extends StatelessWidget {
  const IdsText(
    this.data, {
    super.key,
    this.variant = IdsTextVariant.body,
    this.color,
    this.align,
    this.maxLines,
    this.overflow,
  });

  final String data;
  final IdsTextVariant variant;
  final Color? color;
  final TextAlign? align;
  final int? maxLines;
  final TextOverflow? overflow;

  static const _styles = <IdsTextVariant, TextStyle>{
    IdsTextVariant.display: IdsTypography.display,
    IdsTextVariant.heading: IdsTypography.heading,
    IdsTextVariant.title: IdsTypography.title,
    IdsTextVariant.body: IdsTypography.body,
    IdsTextVariant.label: IdsTypography.label,
    IdsTextVariant.caption: IdsTypography.caption,
  };

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final style = _styles[variant]!.copyWith(
      color: color ?? theme.onSurface,
    );

    return Text(
      data,
      style: style,
      textAlign: align,
      maxLines: maxLines,
      overflow: overflow,
    );
  }
}
