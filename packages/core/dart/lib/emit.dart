import 'dart:convert';
import 'dart:io';

import 'package:code_builder/code_builder.dart';

import 'src/ir_model.dart';
import 'src/library.dart';
import 'src/targets/color_roles.dart';
import 'src/targets/component_tokens.dart';
import 'src/targets/enums.dart';
import 'src/targets/motion.dart';
import 'src/targets/palette_model.dart';
import 'src/targets/target.dart';
import 'src/targets/typography.dart';

const _libraries = <String, Iterable<Spec> Function(DartTarget)>{
  'enums': enumsLibrary,
  'colorRoles': colorRolesLibrary,
  'motion': motionLibrary,
  'componentTokens': componentTokensLibrary,
  'typography': typographyLibrary,
  'paletteModel': paletteModelLibrary,
};

Map<String, String> tokenOutputs(String irFile, String coreDirectory) {
  final model = Ir.fromJson(
    jsonDecode(File(irFile).readAsStringSync()) as Map<String, Object?>,
  );
  final target = DartTarget(model, coreDirectory);
  final languageVersion = languageVersionOf(target.packageDirectory);
  return {
    for (final MapEntry(key: output, value: build) in _libraries.entries)
      target.output(output): formattedLibrary(
        generatedLibrary(build(target)),
        languageVersion,
      ),
  };
}
