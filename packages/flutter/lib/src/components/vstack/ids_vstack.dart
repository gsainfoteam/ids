import 'package:flutter/widgets.dart';
import '../../layout/ids_axis.dart';

export '../../layout/ids_axis.dart';

class IdsVStack extends StatelessWidget {
  const IdsVStack({
    super.key,
    required this.children,
    this.gap = 0,
    this.mainAxis = MainAxis.start,
    this.crossAxis = CrossAxis.stretch,
    this.fit = IdsStackFit.fill,
  });

  final List<Widget> children;
  final double gap;
  final MainAxis mainAxis;
  final CrossAxis crossAxis;
  final IdsStackFit fit;

  @override
  Widget build(BuildContext context) {
    if (crossAxis == CrossAxis.baseline) {
      throw UnsupportedError('CrossAxis.baseline is only supported by IdsHStack.');
    }

    final spaced = <Widget>[];
    for (int i = 0; i < children.length; i++) {
      if (i > 0 && gap > 0) spaced.add(SizedBox(height: gap));
      spaced.add(children[i]);
    }

    return Column(
      mainAxisSize: fit.mainAxisSize,
      mainAxisAlignment: mainAxis.alignment,
      crossAxisAlignment: crossAxis.alignment,
      children: spaced,
    );
  }
}
