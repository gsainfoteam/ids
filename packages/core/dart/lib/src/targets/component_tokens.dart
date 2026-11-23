import 'package:code_builder/code_builder.dart';

import '../ir_model.dart' as ir;
import 'literals.dart';
import 'specs.dart';
import 'target.dart';

const _output = 'componentTokens';
const _enums = 'enums';
const _colorRoles = 'colorRoles';
const _table = 'table';
const _mode = 'mode';
const _colors = 'colors';
const _roles = 'roles';
const _steps = 'steps';
const _value = 'T';

final _boxShadow = refer('BoxShadow', painting);

Expression _pixels(ir.Dimension length) => length.unit == ir.DimensionUnit.px
    ? number(length.value)
    : throw FormatException('ir: a shadow length is not in px', length.unit);

Expression _layer(ir.ShadowLayer layer) => _boxShadow.call([], {
  'color': color(layer.color),
  'offset': refer(
    'Offset',
    painting,
  ).call([_pixels(layer.offsetX), _pixels(layer.offsetY)]),
  'blurRadius': _pixels(layer.blur),
  'spreadRadius': _pixels(layer.spread),
});

Expression _byMode<Entry>(
  DartTarget target,
  Iterable<(String, Iterable<Entry>)> tokens,
  String Function(Entry) modeOf,
  String Function(Entry) valueOf,
) => literalMap(
  {
    for (final mode in target.model.modes)
      target.mode(mode.name.dart.key, _output, _enums): literalMap({
        for (final (key, entries) in tokens)
          literalString(key): literalString(
            valueOf(
              entries.firstWhere(
                (entry) => modeOf(entry) == mode.name.dart.key,
                orElse: () =>
                    throw FormatException('ir: nothing for this mode', key),
              ),
            ),
          ),
      }),
  },
  target.symbolType('mode', _output, _enums),
  mapOf(string, string),
);

Iterable<Spec> componentTokensLibrary(DartTarget target) {
  String member(String key) => target.symbol(key).dart.member;
  final modeType = target.symbolType('mode', _output, _enums);
  final tokens = target.symbol('componentTokens').dart.type;
  final shadows = target.symbol('shadows').dart.type;
  final shadowList = listOf(_boxShadow);
  final valueType = refer(_value);

  Expression inMode(String table) => refer(tokens)
      .property(member('inMode'))
      .call([refer(tokens).property(member(table)), refer(_mode)]);

  final colors = [
    for (final token in target.model.componentColors)
      (key: token.name.dart.key, name: token.name.dart.member),
  ];
  final shadowTokens = [
    for (final token in target.model.componentShadows)
      (key: token.name.dart.key, name: token.name.dart.member),
  ];
  final colorsType = target.symbol('componentColors').dart.type;
  final shadowsType = target.symbol('componentShadows').dart.type;

  return [
    holder(shadows, [
      staticConst(
        member('shadowSteps'),
        literalMap(
          {
            for (final shadow in target.model.shadows)
              literalString(shadow.name.dart.key): literalList(
                shadow.layers.map(_layer),
                _boxShadow,
              ),
          },
          string,
          shadowList,
        ),
      ),
    ]),
    holder(
      tokens,
      [
        staticConst(
          member('componentColorRoles'),
          _byMode(
            target,
            [
              for (final token in target.model.componentColors)
                (token.name.dart.key, token.modes),
            ],
            (entry) => entry.mode,
            (entry) => entry.role,
          ),
        ),
        staticConst(
          member('componentShadowSteps'),
          _byMode(
            target,
            [
              for (final token in target.model.componentShadows)
                (token.name.dart.key, token.modes),
            ],
            (entry) => entry.mode,
            (entry) => entry.shadow,
          ),
        ),
      ],
      methods: [
        Method(
          (method) => method
            ..name = member('inMode')
            ..static = true
            ..types.add(valueType)
            ..returns = mapOf(string, valueType)
            ..requiredParameters.addAll([
              positional(_table, mapOf(modeType, mapOf(string, valueType))),
              positional(_mode, modeType),
            ])
            ..lambda = true
            ..body = refer(_table)
                .index(refer(_mode))
                .ifNullThen(argumentError(refer(_mode), _mode, 'has no table'))
                .code,
        ),
      ],
    ),
    valueClass(
      name: colorsType,
      fields: [for (final token in colors) (name: token.name, type: colorType)],
      factory: factoryOf(
        member('of'),
        [
          positional(
            _colors,
            target.symbolType('colors', _output, _colorRoles),
          ),
          positional(_mode, modeType),
        ],
        Block.of([
          declareFinal(_roles).assign(inMode('componentColorRoles')).statement,
          refer(colorsType)
              .call([], {
                for (final token in colors)
                  token.name: refer(_colors).index(
                    refer(_roles).index(literalString(token.key)).nullChecked,
                  ),
              })
              .returned
              .statement,
        ]),
      ),
      members: [
        lambda(
          member('tokens'),
          mapOf(string, colorType),
          literalMap({
            for (final token in colors)
              literalString(token.key): refer(token.name),
          }),
          type: MethodType.getter,
        ),
      ],
      equals: sameAs,
      hash: refer(
        'Object',
      ).property('hashAll').call([refer(member('tokens')).property('values')]),
    ),
    valueClass(
      name: shadowsType,
      fields: [
        for (final token in shadowTokens) (name: token.name, type: shadowList),
      ],
      factory: factoryOf(
        member('of'),
        [positional(_mode, modeType)],
        Block.of([
          declareFinal(_steps).assign(inMode('componentShadowSteps')).statement,
          refer(shadowsType)
              .call([], {
                for (final token in shadowTokens)
                  token.name: refer(shadows)
                      .property(member('shadowSteps'))
                      .index(
                        refer(
                          _steps,
                        ).index(literalString(token.key)).nullChecked,
                      )
                      .nullChecked,
              })
              .returned
              .statement,
        ]),
      ),
      equals: (field) => refer(
        'listEquals',
        foundation,
      ).call([refer('other').property(field.name), refer(field.name)]),
      hash: refer('Object').property('hashAll').call([
        literalList([
          for (final token in shadowTokens) refer(token.name).spread,
        ]),
      ]),
    ),
  ];
}
