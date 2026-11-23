import 'package:code_builder/code_builder.dart';

import '../ir_model.dart' as ir;
import 'literals.dart';
import 'specs.dart';
import 'target.dart';

const _output = 'colorRoles';
const _enums = 'enums';
const _family = 'family';
const _slot = 'slot';
const _name = 'name';
const _role = 'role';
const _roles = 'roles';
const _lookup = '_role';

Expression _closure(String parameter, Expression body) => Method(
  (method) => method
    ..requiredParameters.add(Parameter((item) => item.name = parameter))
    ..lambda = true
    ..body = body.code,
).closure;

String _onlyOwnerOfNeutralOnlySlots(
  ir.IrColor palette,
  List<String> neutralOnly,
) {
  final owners = {
    for (final role in palette.roles)
      if (neutralOnly.contains(role.slot)) role.family,
  };
  if (owners.length != 1) {
    throw FormatException(
      'ir: the neutral-only slots do not belong to one family',
      owners,
    );
  }
  return owners.single;
}

Method _slotsOf(
  DartTarget target,
  String Function(String) member,
  String owner,
) => lambda(
  member('slotsOf'),
  listOf(string),
  refer(member('familySlots'))
      .property('where')
      .call([
        _closure(
          _slot,
          refer(_family)
              .equalTo(literalString(owner))
              .or(
                refer(
                  member('neutralOnlySlots'),
                ).property('contains').call([refer(_slot)]).negate(),
              ),
        ),
      ])
      .property('map')
      .call([
        _closure(
          _slot,
          refer(_slot).property('replaceAll').call([
            literalString(target.model.placeholders.family),
            refer(_family),
          ]),
        ),
      ])
      .property('toList')
      .call([]),
  parameters: [positional(_family, string)],
  static: true,
);

Iterable<Spec> colorRolesLibrary(DartTarget target) {
  final palette = target.model.color;
  String member(String key) => target.symbol(key).dart.member;
  final modeType = target.symbolType('mode', _output, _enums);
  final neutralOnly = [
    for (final slot in palette.slots)
      if (slot.neutralOnly) slot.template.key,
  ];
  return [
    holder(
      target.symbol('colorRoles').dart.type,
      [
        for (final group in palette.familyGroups)
          staticConst(group.list.dart.member, strings(group.families)),
        staticConst(
          member('families'),
          strings(palette.families.map((family) => family.dart.key)),
        ),
        staticConst(
          member('familySlots'),
          strings(palette.slots.map((slot) => slot.template.key)),
        ),
        staticConst(member('neutralOnlySlots'), strings(neutralOnly)),
        staticConst(
          member('allSlots'),
          strings(palette.roles.map((role) => role.name.dart.key)),
        ),
        staticConst(
          member('neutralScales'),
          literalMap(
            {
              for (final scale in palette.neutralScales)
                target.mode(scale.mode, _output, _enums): literalList(
                  scale.steps.map(color),
                ),
            },
            modeType,
            listOf(colorType),
          ),
        ),
        staticConst(
          member('neutralSteps'),
          literalMap(
            {
              for (final entry in palette.neutralSteps)
                literalString(entry.role): literalNum(entry.step),
            },
            string,
            refer('int'),
          ),
        ),
      ],
      methods: [
        _slotsOf(
          target,
          member,
          _onlyOwnerOfNeutralOnlySlots(palette, neutralOnly),
        ),
      ],
    ),
    holder(target.symbol('stateOpacity').dart.type, [
      for (final token in target.model.state.tokens)
        if (token case ir.IrStateTokensItemOpacity(:final name, :final ratio))
          staticConst(name.dart.member, number(ratio), type: refer('double')),
    ]),
    holder(target.symbol('stateLayer').dart.type, [
      for (final token in target.model.state.tokens)
        if (token case ir.IrStateTokensItemColor(
          :final name,
          color: final value,
        ))
          staticConst(name.dart.member, color(value)),
    ]),
    _colors(target, member),
  ];
}

Class _colors(DartTarget target, String Function(String) member) {
  final type = target.symbol('colors').dart.type;
  final roles = [
    for (final role in target.model.color.roles)
      (key: role.name.dart.key, name: role.name.dart.member),
  ];
  final fields = [for (final role in roles) (name: role.name, type: colorType)];
  final rolesParameter = positional(_roles, mapOf(string, colorType));
  return valueClass(
    name: type,
    fields: fields,
    factory: factoryOf(
      member('fromRoles'),
      [rolesParameter],
      refer(type)
          .call([], {
            for (final role in roles)
              role.name: refer(
                _lookup,
              ).call([refer(_roles), literalString(role.key)]),
          })
          .returned
          .statement,
    ),
    members: [
      lambda(
        _lookup,
        colorType,
        refer(_roles)
            .index(refer(_name))
            .ifNullThen(argumentError(refer(_name), _roles, 'is missing')),
        parameters: [rolesParameter, positional(_name, string)],
        static: true,
      ),
      lambda(
        member('roles'),
        mapOf(string, colorType),
        literalMap({
          for (final role in roles) literalString(role.key): refer(role.name),
        }),
        type: MethodType.getter,
      ),
      lambda(
        'operator []',
        colorType,
        refer(member('roles'))
            .index(refer(_role))
            .ifNullThen(
              argumentError(refer(_role), _role, 'is not an IDS color role'),
            ),
        parameters: [positional(_role, string)],
      ),
    ],
    equals: sameAs,
    hash: refer(
      'Object',
    ).property('hashAll').call([refer(member('roles')).property('values')]),
  );
}
