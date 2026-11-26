import 'package:ids_codegen/model.dart';
import 'package:ids_codegen/src/outputs.dart';

void main(List<String> arguments) {
  final [schemaFile, packageDirectory] = positional(
    arguments,
    2,
    'dart run bin/model.dart <ir.schema.json> <package directory> [--print]',
  );
  deliver(modelOutputs(schemaFile, packageDirectory), arguments);
}
