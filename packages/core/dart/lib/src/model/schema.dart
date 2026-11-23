import 'shapes.dart';

typedef JsonSchema = Map<String, Object?>;

const _root = 'Ir';
const _definitions = r'$defs';
const _reference = r'$ref';
const _localReference = '#/\$defs/';
const _itemSuffix = 'Item';
const _valueSuffix = 'Value';

final _identifier = RegExp(r'^[a-z][A-Za-z0-9]*$');

String _pascal(String name) =>
    name.substring(0, 1).toUpperCase() + name.substring(1);

String _checkedIdentifier(String name, String where) {
  if (!_identifier.hasMatch(name)) {
    throw FormatException('$where: "$name" is not a Dart identifier');
  }
  return name;
}

final class SchemaModel {
  SchemaModel._(this._schema);

  factory SchemaModel.read(JsonSchema schema) {
    final model = SchemaModel._(schema);
    model._declareObject(_root, schema);
    return model;
  }

  final JsonSchema _schema;
  final Map<String, Declaration> _declared = {};

  Iterable<Declaration> get declarations => _declared.values;

  JsonSchema get _definitionTable =>
      (_schema[_definitions] ?? const <String, Object?>{}) as JsonSchema;

  void _declare(Declaration declaration) {
    if (_declared.containsKey(declaration.name)) {
      throw FormatException('${declaration.name} is declared twice');
    }
    _declared[declaration.name] = declaration;
  }

  Shape _shapeOf(JsonSchema node, String name) {
    if (node[_reference] case final String reference) {
      return _referenced(reference);
    }
    if (node['anyOf'] case final List<Object?> members) {
      return _nullable(members.cast(), name);
    }
    if (node['oneOf'] case final List<Object?> variants) {
      _declareSealed(name, variants.cast());
      return ClassShape(name);
    }
    if (node['enum'] case final List<Object?> values) {
      _declare(
        EnumDeclaration(name, [
          for (final value in values) _checkedIdentifier(value as String, name),
        ]),
      );
      return EnumShape(name);
    }
    if (node.containsKey('const')) return _constant(node['const'], name);
    return switch (node['type']) {
      'string' => const PrimitiveShape(PrimitiveKind.string),
      'integer' => const PrimitiveShape(PrimitiveKind.integer),
      'number' => const PrimitiveShape(PrimitiveKind.number),
      'boolean' => const PrimitiveShape(PrimitiveKind.boolean),
      'array' => ListShape(
        _shapeOf(node['items'] as JsonSchema, name + _itemSuffix),
      ),
      'object' when node.containsKey('properties') => _declareObject(
        name,
        node,
      ),
      'object' when node['additionalProperties'] is JsonSchema => MapShape(
        _shapeOf(
          node['additionalProperties'] as JsonSchema,
          name + _valueSuffix,
        ),
      ),
      final type => throw FormatException(
        '$name: the type ${type ?? 'of this node'} has no Dart model',
      ),
    };
  }

  Shape _referenced(String reference) {
    if (!reference.startsWith(_localReference)) {
      throw FormatException('$reference: only local definitions are read');
    }
    final name = reference.substring(_localReference.length);
    final existing = _declared[name];
    if (existing != null) {
      return existing is EnumDeclaration ? EnumShape(name) : ClassShape(name);
    }
    final definition = _definitionTable[name];
    if (definition is! JsonSchema) {
      throw FormatException('$reference: no such definition');
    }
    return _shapeOf(definition, name);
  }

  Shape _nullable(List<JsonSchema> members, String name) {
    final present = members
        .where((member) => member['type'] != 'null')
        .toList();
    if (present.length != 1 || members.length != 2) {
      throw FormatException('$name: anyOf is read only as one schema or null');
    }
    return NullableShape(_shapeOf(present.single, name));
  }

  Shape _constant(Object? value, String name) => switch (value) {
    final int _ => PrimitiveShape(PrimitiveKind.integer, constant: value),
    final String _ => PrimitiveShape(PrimitiveKind.string, constant: value),
    _ => throw FormatException('$name: a constant $value has no Dart model'),
  };

  ClassShape _declareObject(
    String name,
    JsonSchema node, {
    String? variantOf,
    String? discriminator,
  }) {
    _declare(
      _objectDeclaration(
        name,
        node,
        variantOf: variantOf,
        discriminator: discriminator,
      ),
    );
    return ClassShape(name);
  }

  ObjectDeclaration _objectDeclaration(
    String name,
    JsonSchema node, {
    String? variantOf,
    String? discriminator,
  }) {
    final properties =
        (node['properties'] ?? const <String, Object?>{}) as JsonSchema;
    final required = ((node['required'] ?? const <Object?>[]) as List<Object?>)
        .toSet();
    final placeholder = ObjectDeclaration(name, const []);
    _declared[name] = placeholder;
    final fields = [
      for (final MapEntry(key: property, value: schema) in properties.entries)
        if (property != discriminator)
          Property(_checkedIdentifier(property, name), switch (_shapeOf(
            schema as JsonSchema,
            name + _pascal(property),
          )) {
            final shape when required.contains(property) => shape,
            final shape => NullableShape(shape),
          }),
    ];
    _declared.remove(name);
    return ObjectDeclaration(name, fields, variantOf: variantOf);
  }

  void _declareSealed(String name, List<JsonSchema> variants) {
    final discriminator = _discriminatorOf(name, variants);
    _declared[name] = SealedDeclaration(name, discriminator, const []);
    final declared = [
      for (final variant in variants)
        switch ((variant['properties'] as JsonSchema)[discriminator]) {
          {'const': final String value} => Variant(
            value,
            _objectDeclaration(
              name + _pascal(_checkedIdentifier(value, name)),
              variant,
              variantOf: name,
              discriminator: discriminator,
            ),
          ),
          _ => throw FormatException(
            '$name: every variant fixes $discriminator',
          ),
        },
    ];
    _declared[name] = SealedDeclaration(name, discriminator, declared);
    for (final variant in declared) {
      _declare(variant.declaration);
    }
  }

  String _discriminatorOf(String name, List<JsonSchema> variants) {
    final fixed = [
      for (final variant in variants)
        {
          for (final MapEntry(:key, :value)
              in ((variant['properties'] ?? const <String, Object?>{})
                      as JsonSchema)
                  .entries)
            if (value is JsonSchema && value['const'] is String) key,
        },
    ];
    final shared = fixed.reduce((left, right) => left.intersection(right));
    if (shared.length != 1) {
      throw FormatException(
        '$name: oneOf needs one property every variant fixes',
      );
    }
    return shared.single;
  }
}
