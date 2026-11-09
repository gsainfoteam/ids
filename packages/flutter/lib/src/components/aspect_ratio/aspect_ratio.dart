import 'package:flutter/widgets.dart' as widgets;
import 'package:flutter/widgets.dart' hide AspectRatio;

class AspectRatio extends StatelessWidget {
  const AspectRatio({super.key, this.ratio = 1, this.child})
    : assert(
        ratio > 0 && ratio < double.infinity,
        '[IDS] AspectRatio: ratio must be a finite positive number, got $ratio.',
      );

  final double ratio;
  final Widget? child;

  @override
  Widget build(BuildContext context) =>
      widgets.AspectRatio(aspectRatio: ratio, child: child);
}
