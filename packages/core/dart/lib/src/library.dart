import 'dart:io';

import 'package:code_builder/code_builder.dart';
import 'package:dart_style/dart_style.dart';
import 'package:pub_semver/pub_semver.dart';
import 'package:yaml/yaml.dart';

const generatedNotice = 'GENERATED — do not edit manually';

const _pubspec = 'pubspec.yaml';

Version languageVersionOf(String packageDirectory) {
  final manifest = File.fromUri(
    Directory(packageDirectory).uri.resolve(_pubspec),
  );
  final pubspec = loadYaml(manifest.readAsStringSync()) as YamlMap;
  final environment = pubspec['environment'] as YamlMap;
  final constraint = VersionConstraint.parse(environment['sdk'] as String);
  if (constraint is! VersionRange || constraint.min == null) {
    throw FormatException(
      '${manifest.path}: environment.sdk has no lower bound',
      constraint,
    );
  }
  final lowest = constraint.min!;
  return Version(lowest.major, lowest.minor, 0);
}

Library generatedLibrary(Iterable<Spec> body) => Library(
  (library) => library
    ..comments.add(generatedNotice)
    ..body.addAll(body),
);

String formattedLibrary(Library library, Version languageVersion) {
  final emitter = DartEmitter(
    allocator: Allocator(),
    orderDirectives: true,
    useNullSafetySyntax: true,
  );
  return DartFormatter(
    languageVersion: languageVersion,
  ).format(library.accept(emitter).toString());
}
