import 'package:flutter/widgets.dart';

import '../text/ids_text.dart';

class IdsHeading extends StatelessWidget {
  const IdsHeading(
    this.data, {
    super.key,
    this.variant = IdsTextVariant.heading,
    this.color,
    this.align,
  });

  final String data;
  final IdsTextVariant variant;
  final Color? color;
  final TextAlign? align;

  @override
  Widget build(BuildContext context) {
    return IdsText(
      data,
      variant: variant,
      color: color,
      align: align,
    );
  }
}
