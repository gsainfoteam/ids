import 'package:code_builder/code_builder.dart';

import 'literals.dart';
import 'specs.dart';
import 'target.dart';

Iterable<Spec> motionLibrary(DartTarget target) => [
  holder(
    target.symbol('motion').dart.type,
    target.model.motion.map(
      (token) => staticConst(
        token.name.dart.member,
        refer(
          'Duration',
        ).call([], {'milliseconds': wholeNumber(token.milliseconds)}),
        type: refer('Duration'),
      ),
    ),
  ),
];
