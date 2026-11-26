import 'package:code_builder/code_builder.dart';

import 'literals.dart';
import 'specs.dart';
import 'target.dart';

Iterable<Spec> paletteModelLibrary(DartTarget target) {
  final model = target.model.paletteModel;
  return [
    holder(
      target.symbol('paletteModel').dart.type,
      model.series.map(
        (series) => staticConst(
          series.name.dart.member,
          literalList(
            series.coefficients.map((row) => literalList(row.map(number))),
            listOf(refer('double')),
          ),
        ),
      ),
    ),
    holder(
      target.symbol('statusPalettes').dart.type,
      model.statusPalettes.map(
        (palette) => staticConst(
          palette.name.dart.member,
          literalList(palette.colors.map(color), refer('Color', painting)),
        ),
      ),
    ),
  ];
}
