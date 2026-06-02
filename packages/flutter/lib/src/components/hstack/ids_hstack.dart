import 'package:flutter/widgets.dart';
import '../../layout/ids_axis.dart';

export '../../layout/ids_axis.dart';

class IdsHStack extends StatelessWidget {
  const IdsHStack({
    super.key,
    required this.children,
    this.gap = 0,
    this.mainAxis = MainAxis.start,
    this.crossAxis = CrossAxis.stretch,
    this.fit = IdsStackFit.fill,
    this.textBaseline = TextBaseline.alphabetic,
  });

  final List<Widget> children;
  final double gap;
  final MainAxis mainAxis;
  final CrossAxis crossAxis;
  final IdsStackFit fit;
  final TextBaseline textBaseline;

  @override
  Widget build(BuildContext context) {
    final spaced = <Widget>[];
    for (int i = 0; i < children.length; i++) {
      if (i > 0 && gap > 0) spaced.add(SizedBox(width: gap));
      spaced.add(children[i]);
    }

    return Row(
      mainAxisSize: fit.mainAxisSize,
      mainAxisAlignment: mainAxis.alignment,
      crossAxisAlignment: crossAxis.alignment,
      textBaseline: crossAxis == CrossAxis.baseline ? textBaseline : null,
      children: spaced,
    );
  }
}
