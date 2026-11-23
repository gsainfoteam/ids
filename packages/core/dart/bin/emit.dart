import 'package:ids_codegen/emit.dart';
import 'package:ids_codegen/src/outputs.dart';

void main(List<String> arguments) {
  final [irFile, coreDirectory] = positional(
    arguments,
    2,
    'dart run bin/emit.dart <ir.json> <core directory> [--print]',
  );
  deliver(tokenOutputs(irFile, coreDirectory), arguments);
}
