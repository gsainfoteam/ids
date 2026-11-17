import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

double depthAtTheCorner(ShapeBorder shape) {
  final path = shape.getOuterPath(Offset.zero & const Size.square(200));
  var depth = 0.0;
  while (!path.contains(Offset(depth, depth))) {
    depth += 0.01;
  }
  return depth;
}

IdsResolvedTheme themeWith(IdsCornerShape cornerShape) => IdsResolvedTheme(
  theme: IdsTheme(primary: testTheme.primary, cornerShape: cornerShape),
  mode: IdsMode.light,
);

void main() {
  test('a squircle keeps the radius and the depth of the round corner', () {
    final round = themeWith(IdsCornerShape.round);
    final squircle = themeWith(IdsCornerShape.squircle);

    expect(squircle.radius.standard, round.radius.standard);
    expect(squircle.radius.indicator, round.radius.indicator);
    expect(squircle.radius.container, round.radius.container);
    expect(squircle.shape(), isA<RoundedSuperellipseBorder>());
    expect(
      depthAtTheCorner(squircle.shape()),
      closeTo(depthAtTheCorner(round.shape()), 0.05),
    );
  });
}
