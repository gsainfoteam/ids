import 'package:code_builder/code_builder.dart';

Class holder(
  String name,
  Iterable<Field> fields, {
  Iterable<Method> methods = const [],
}) => Class(
  (type) => type
    ..name = name
    ..abstract = true
    ..modifier = ClassModifier.final$
    ..fields.addAll(fields)
    ..methods.addAll(methods),
);

Field staticConst(String name, Expression value, {Reference? type}) => Field(
  (field) => field
    ..name = name
    ..static = true
    ..modifier = FieldModifier.constant
    ..type = type
    ..assignment = value.code,
);

Field finalField(String name, Reference type) => Field(
  (field) => field
    ..name = name
    ..modifier = FieldModifier.final$
    ..type = type,
);

Parameter requiredThis(String name) => Parameter(
  (parameter) => parameter
    ..name = name
    ..named = true
    ..required = true
    ..toThis = true,
);

Parameter positional(String name, Reference type) => Parameter(
  (parameter) => parameter
    ..name = name
    ..type = type,
);

Reference generic(String symbol, List<Reference> types, {String? url}) =>
    TypeReference(
      (type) => type
        ..symbol = symbol
        ..url = url
        ..types.addAll(types),
    );

Reference listOf(Reference item) => generic('List', [item]);

Reference mapOf(Reference key, Reference value) => generic('Map', [key, value]);

Reference get string => refer('String');

Method lambda(
  String name,
  Reference returns,
  Expression body, {
  Iterable<Parameter> parameters = const [],
  bool static = false,
  MethodType? type,
}) => Method(
  (method) => method
    ..name = name
    ..returns = returns
    ..static = static
    ..type = type
    ..requiredParameters.addAll(parameters)
    ..lambda = true
    ..body = body.code,
);

Method override(
  String name,
  Reference returns,
  Expression body, {
  Iterable<Parameter> parameters = const [],
  MethodType? type,
}) => Method(
  (method) => method
    ..annotations.add(refer('override'))
    ..name = name
    ..returns = returns
    ..type = type
    ..requiredParameters.addAll(parameters)
    ..lambda = true
    ..body = body.code,
);

Expression allOf(Iterable<Expression> conditions) =>
    conditions.reduce((left, right) => left.and(right));

Expression argumentError(Expression value, String argument, String problem) =>
    refer('ArgumentError')
        .property('value')
        .call([value, literalString(argument), literalString(problem)])
        .thrown
        .parenthesized;

typedef Member = ({String name, Reference type});

Class valueClass({
  required String name,
  required List<Member> fields,
  required Constructor factory,
  required Expression Function(Member field) equals,
  required Expression hash,
  Iterable<Method> members = const [],
}) => Class(
  (type) => type
    ..annotations.add(refer('immutable', 'package:flutter/foundation.dart'))
    ..name = name
    ..constructors.addAll([
      Constructor(
        (constructor) => constructor
          ..constant = true
          ..optionalParameters.addAll(
            fields.map((field) => requiredThis(field.name)),
          ),
      ),
      factory,
    ])
    ..fields.addAll(fields.map((field) => finalField(field.name, field.type)))
    ..methods.addAll([
      ...members,
      override(
        'operator ==',
        refer('bool'),
        allOf([refer('other').isA(refer(name)), ...fields.map(equals)]),
        parameters: [positional('other', refer('Object'))],
      ),
      override('hashCode', refer('int'), hash, type: MethodType.getter),
    ]),
);

Expression sameAs(Member field) =>
    refer('other').property(field.name).equalTo(refer(field.name));

Constructor factoryOf(String name, List<Parameter> parameters, Code body) =>
    Constructor(
      (constructor) => constructor
        ..factory = true
        ..name = name
        ..requiredParameters.addAll(parameters)
        ..body = body,
    );
