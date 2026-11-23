import 'package:code_builder/code_builder.dart';
import 'package:path/path.dart' as p;

import '../ir_model.dart' as ir;

const foundation = 'package:flutter/foundation.dart';
const painting = 'package:flutter/painting.dart';
const widgets = 'package:flutter/widgets.dart';
const intl = 'package:intl/intl.dart';

const _lib = 'lib';

final class DartTarget {
  DartTarget(this.model, this.coreDirectory);

  final ir.Ir model;
  final String coreDirectory;

  String get packageDirectory =>
      p.normalize(p.join(coreDirectory, model.packages.dart.directory));

  ir.Name symbol(String key) =>
      model.targets.dart.symbols[key] ??
      (throw FormatException(
        'config/targets.json: targets.dart.symbols.$key: missing',
      ));

  String output(String key) => p.join(
    packageDirectory,
    model.targets.dart.outputs[key] ??
        (throw FormatException(
          'config/targets.json: targets.dart.outputs.$key: missing',
        )),
  );

  String importFrom(String fromOutput, String toOutput) => p.posix.relative(
    p.posix.joinAll(p.split(output(toOutput))),
    from: p.posix.dirname(p.posix.joinAll(p.split(output(fromOutput)))),
  );

  String packageImport(String output) => p.posix.join(
    'package:${model.packages.dart.name}',
    p.posix.relative(
      p.posix.joinAll(p.split(this.output(output))),
      from: p.posix.join(p.posix.joinAll(p.split(packageDirectory)), _lib),
    ),
  );

  Reference symbolType(String key, String fromOutput, String definedIn) =>
      refer(symbol(key).dart.type, importFrom(fromOutput, definedIn));

  Expression mode(String key, String fromOutput, String definedIn) {
    final name = model.modes
        .firstWhere(
          (mode) => mode.name.dart.key == key,
          orElse: () => throw FormatException('ir: $key is not a mode'),
        )
        .name;
    return symbolType('mode', fromOutput, definedIn).property(name.dart.member);
  }
}
