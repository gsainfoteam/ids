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
  });

  final List<Widget> children;
  final double gap;
  final MainAxis mainAxis;
  final CrossAxis crossAxis;

  @override
  Widget build(BuildContext context) {
    final mainAxisSize = switch (mainAxis) {
      MainAxis.between || MainAxis.around || MainAxis.evenly => MainAxisSize.max,
      _ => MainAxisSize.min,
    };

    final spaced = <Widget>[];
    for (int i = 0; i < children.length; i++) {
      if (i > 0 && gap > 0) spaced.add(SizedBox(width: gap));
      spaced.add(children[i]);
    }

    return Row(
      mainAxisSize: mainAxisSize,
      mainAxisAlignment: _mainAxisAlignment(),
      crossAxisAlignment: _crossAxisAlignment(),
      children: spaced,
    );
  }

  MainAxisAlignment _mainAxisAlignment() => switch (mainAxis) {
    MainAxis.start => MainAxisAlignment.start,
    MainAxis.center => MainAxisAlignment.center,
    MainAxis.end => MainAxisAlignment.end,
    MainAxis.between => MainAxisAlignment.spaceBetween,
    MainAxis.around => MainAxisAlignment.spaceAround,
    MainAxis.evenly => MainAxisAlignment.spaceEvenly,
  };

  CrossAxisAlignment _crossAxisAlignment() => switch (crossAxis) {
    CrossAxis.start => CrossAxisAlignment.start,
    CrossAxis.center => CrossAxisAlignment.center,
    CrossAxis.end => CrossAxisAlignment.end,
    CrossAxis.stretch => CrossAxisAlignment.stretch,
    CrossAxis.baseline => CrossAxisAlignment.center,
  };
}
