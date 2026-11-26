import 'package:code_builder/code_builder.dart';

sealed class Shape {
  const Shape();
}

enum PrimitiveKind {
  string('String'),
  integer('int'),
  number('double'),
  boolean('bool');

  const PrimitiveKind(this.dartType);

  final String dartType;
}

final class PrimitiveShape extends Shape {
  const PrimitiveShape(this.kind, {this.constant});

  final PrimitiveKind kind;
  final Object? constant;
}

final class ClassShape extends Shape {
  const ClassShape(this.name);

  final String name;
}

final class EnumShape extends Shape {
  const EnumShape(this.name);

  final String name;
}

final class ListShape extends Shape {
  const ListShape(this.item);

  final Shape item;
}

final class MapShape extends Shape {
  const MapShape(this.value);

  final Shape value;
}

final class NullableShape extends Shape {
  const NullableShape(this.inner);

  final Shape inner;
}

final class Property {
  const Property(this.name, this.shape);

  final String name;
  final Shape shape;
}

sealed class Declaration {
  const Declaration(this.name);

  final String name;
}

final class ObjectDeclaration extends Declaration {
  const ObjectDeclaration(super.name, this.properties, {this.variantOf});

  final List<Property> properties;
  final String? variantOf;
}

final class Variant {
  const Variant(this.value, this.declaration);

  final String value;
  final ObjectDeclaration declaration;
}

final class SealedDeclaration extends Declaration {
  const SealedDeclaration(super.name, this.discriminator, this.variants);

  final String discriminator;
  final List<Variant> variants;
}

final class EnumDeclaration extends Declaration {
  const EnumDeclaration(super.name, this.values);

  final List<String> values;
}

final _jsonObject = TypeReference(
  (type) => type
    ..symbol = 'Map'
    ..types.addAll([
      refer('String'),
      TypeReference(
        (object) => object
          ..symbol = 'Object'
          ..isNullable = true,
      ),
    ]),
);

final _jsonList = TypeReference(
  (type) => type
    ..symbol = 'List'
    ..types.add(
      TypeReference(
        (object) => object
          ..symbol = 'Object'
          ..isNullable = true,
      ),
    ),
);

Reference get jsonObjectType => _jsonObject;

Reference typeOf(Shape shape, {bool nullable = false}) => switch (shape) {
  PrimitiveShape(:final kind) => _named(kind.dartType, nullable),
  ClassShape(:final name) || EnumShape(:final name) => _named(name, nullable),
  ListShape(:final item) => TypeReference(
    (type) => type
      ..symbol = 'List'
      ..types.add(typeOf(item))
      ..isNullable = nullable,
  ),
  MapShape(:final value) => TypeReference(
    (type) => type
      ..symbol = 'Map'
      ..types.addAll([refer('String'), typeOf(value)])
      ..isNullable = nullable,
  ),
  NullableShape(:final inner) => typeOf(inner, nullable: true),
};

TypeReference _named(String symbol, bool nullable) => TypeReference(
  (type) => type
    ..symbol = symbol
    ..isNullable = nullable,
);

Expression _unexpected(String message, Expression value) =>
    refer('FormatException').call([literalString(message), value]).thrown;

Expression decode(Shape shape, Expression value) => switch (shape) {
  PrimitiveShape(kind: PrimitiveKind.number) =>
    value.asA(refer('num')).property('toDouble').call([]),
  PrimitiveShape(:final constant?) =>
    value
        .equalTo(literal(constant))
        .conditional(
          literal(constant),
          _unexpected('is not the value the schema fixes', value),
        ),
  PrimitiveShape(:final kind) => value.asA(refer(kind.dartType)),
  ClassShape(:final name) => refer(
    name,
  ).property('fromJson').call([value.asA(_jsonObject)]),
  EnumShape(:final name) => refer(
    name,
  ).property('values').property('byName').call([value.asA(refer('String'))]),
  ListShape(:final item) =>
    value
        .asA(_jsonList)
        .property('map')
        .call([
          _closure(['item'], decode(item, refer('item'))),
        ])
        .property('toList')
        .call([]),
  MapShape(value: final entry) => value.asA(_jsonObject).property('map').call([
    _closure([
      'key',
      'value',
    ], refer('MapEntry').call([refer('key'), decode(entry, refer('value'))])),
  ]),
  NullableShape(:final inner) =>
    value.equalTo(literalNull).conditional(literalNull, decode(inner, value)),
};

Expression _closure(List<String> parameters, Expression body) => Method(
  (method) => method
    ..requiredParameters.addAll(
      parameters.map((name) => Parameter((parameter) => parameter.name = name)),
    )
    ..lambda = true
    ..body = body.code,
).closure;
