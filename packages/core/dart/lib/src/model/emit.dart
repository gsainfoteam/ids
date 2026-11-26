import 'package:code_builder/code_builder.dart';

import 'shapes.dart';

const _fromJson = 'fromJson';
const _json = 'json';

Spec specOf(Declaration declaration) => switch (declaration) {
  ObjectDeclaration() => _objectClass(declaration),
  SealedDeclaration() => _sealedClass(declaration),
  EnumDeclaration(:final name, :final values) => Enum(
    (type) => type
      ..name = name
      ..values.addAll(
        values.map((value) => EnumValue((entry) => entry.name = value)),
      ),
  ),
};

Parameter _jsonParameter() => Parameter(
  (parameter) => parameter
    ..name = _json
    ..type = jsonObjectType,
);

Expression _field(String property) =>
    refer(_json).index(literalString(property));

Class _objectClass(ObjectDeclaration declaration) => Class(
  (type) => type
    ..name = declaration.name
    ..modifier = ClassModifier.final$
    ..extend = declaration.variantOf == null
        ? null
        : refer(declaration.variantOf!)
    ..constructors.addAll([
      Constructor(
        (constructor) => constructor
          ..constant = true
          ..optionalParameters.addAll(
            declaration.properties.map(
              (property) => Parameter(
                (parameter) => parameter
                  ..name = property.name
                  ..named = true
                  ..required = property.shape is! NullableShape
                  ..toThis = true,
              ),
            ),
          ),
      ),
      Constructor(
        (constructor) => constructor
          ..factory = true
          ..name = _fromJson
          ..requiredParameters.add(_jsonParameter())
          ..lambda = true
          ..body = refer(declaration.name).call([], {
            for (final property in declaration.properties)
              property.name: decode(property.shape, _field(property.name)),
          }).code,
      ),
    ])
    ..fields.addAll(
      declaration.properties.map(
        (property) => Field(
          (field) => field
            ..name = property.name
            ..modifier = FieldModifier.final$
            ..type = typeOf(property.shape),
        ),
      ),
    ),
);

Class _sealedClass(SealedDeclaration declaration) {
  final discriminator = _field(declaration.discriminator);
  final unknown = refer(
    'FormatException',
  ).call([literalString('names no variant'), discriminator]).thrown;
  final dispatch = declaration.variants.reversed.fold<Expression>(
    unknown,
    (otherwise, variant) => discriminator
        .equalTo(literalString(variant.value))
        .conditional(
          refer(
            variant.declaration.name,
          ).property(_fromJson).call([refer(_json)]),
          otherwise,
        ),
  );
  return Class(
    (type) => type
      ..name = declaration.name
      ..sealed = true
      ..constructors.addAll([
        Constructor((constructor) => constructor.constant = true),
        Constructor(
          (constructor) => constructor
            ..factory = true
            ..name = _fromJson
            ..requiredParameters.add(_jsonParameter())
            ..lambda = true
            ..body = dispatch.code,
        ),
      ]),
  );
}
