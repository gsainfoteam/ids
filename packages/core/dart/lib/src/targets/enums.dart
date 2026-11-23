import 'package:code_builder/code_builder.dart';

import 'target.dart';

Iterable<Spec> enumsLibrary(DartTarget target) => target.model.enums.map(
  (entry) => Enum(
    (type) => type
      ..name = entry.name.dart.type
      ..values.addAll(
        entry.dart.map(
          (value) => EnumValue((item) => item.name = value.dart.member),
        ),
      ),
  ),
);
