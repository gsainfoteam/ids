import 'package:flutter/widgets.dart';

import '../../../tokens/ids_typography.dart';
import '../text/ids_text.dart';

class IdsHeading extends StatelessWidget {
  const IdsHeading(
    this.data, {
    super.key,
    this.style = IdsTypography.headlineH5Semibold,
    this.color,
    this.align,
  });

  final String data;
  final TextStyle style;
  final Color? color;
  final TextAlign? align;

  @override
  Widget build(BuildContext context) {
    return IdsText(
      data,
      style: style,
      color: color,
      align: align,
    );
  }
}
