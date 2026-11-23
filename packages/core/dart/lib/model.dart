import 'dart:convert';
import 'dart:io';

import 'package:path/path.dart' as p;

import 'src/library.dart';
import 'src/model/emit.dart';
import 'src/model/schema.dart';

const modelLibrary = 'lib/src/ir_model.dart';

Map<String, String> modelOutputs(String schemaFile, String packageDirectory) {
  final schema = jsonDecode(File(schemaFile).readAsStringSync()) as JsonSchema;
  final model = SchemaModel.read(schema);
  final library = generatedLibrary(model.declarations.map(specOf));
  return {
    p.join(packageDirectory, modelLibrary): formattedLibrary(
      library,
      languageVersionOf(packageDirectory),
    ),
  };
}
