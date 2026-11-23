// GENERATED — do not edit manually

final class IrPackagesCss {
  const IrPackagesCss({required this.name, required this.directory});

  factory IrPackagesCss.fromJson(Map<String, Object?> json) => IrPackagesCss(
    name: (json['name'] as String),
    directory: (json['directory'] as String),
  );

  final String name;

  final String directory;
}

final class IrPackagesTs {
  const IrPackagesTs({required this.name, required this.directory});

  factory IrPackagesTs.fromJson(Map<String, Object?> json) => IrPackagesTs(
    name: (json['name'] as String),
    directory: (json['directory'] as String),
  );

  final String name;

  final String directory;
}

final class IrPackagesDart {
  const IrPackagesDart({required this.name, required this.directory});

  factory IrPackagesDart.fromJson(Map<String, Object?> json) => IrPackagesDart(
    name: (json['name'] as String),
    directory: (json['directory'] as String),
  );

  final String name;

  final String directory;
}

final class IrPackages {
  const IrPackages({required this.css, required this.ts, required this.dart});

  factory IrPackages.fromJson(Map<String, Object?> json) => IrPackages(
    css: IrPackagesCss.fromJson((json['css'] as Map<String, Object?>)),
    ts: IrPackagesTs.fromJson((json['ts'] as Map<String, Object?>)),
    dart: IrPackagesDart.fromJson((json['dart'] as Map<String, Object?>)),
  );

  final IrPackagesCss css;

  final IrPackagesTs ts;

  final IrPackagesDart dart;
}

final class NameCss {
  const NameCss({
    required this.identifier,
    required this.customProperty,
    required this.themeProperty,
  });

  factory NameCss.fromJson(Map<String, Object?> json) => NameCss(
    identifier: (json['identifier'] as String),
    customProperty: (json['customProperty'] as String),
    themeProperty: (json['themeProperty'] as String),
  );

  final String identifier;

  final String customProperty;

  final String themeProperty;
}

final class NameTs {
  const NameTs({
    required this.constant,
    required this.member,
    required this.type,
    required this.key,
  });

  factory NameTs.fromJson(Map<String, Object?> json) => NameTs(
    constant: (json['constant'] as String),
    member: (json['member'] as String),
    type: (json['type'] as String),
    key: (json['key'] as String),
  );

  final String constant;

  final String member;

  final String type;

  final String key;
}

final class NameDart {
  const NameDart({required this.member, required this.type, required this.key});

  factory NameDart.fromJson(Map<String, Object?> json) => NameDart(
    member: (json['member'] as String),
    type: (json['type'] as String),
    key: (json['key'] as String),
  );

  final String member;

  final String type;

  final String key;
}

final class Name {
  const Name({
    required this.segments,
    this.sub,
    required this.css,
    required this.ts,
    required this.dart,
  });

  factory Name.fromJson(Map<String, Object?> json) => Name(
    segments: (json['segments'] as List<Object?>)
        .map((item) => (item as String))
        .toList(),
    sub: json['sub'] == null
        ? null
        : (json['sub'] as List<Object?>)
              .map((item) => (item as String))
              .toList(),
    css: NameCss.fromJson((json['css'] as Map<String, Object?>)),
    ts: NameTs.fromJson((json['ts'] as Map<String, Object?>)),
    dart: NameDart.fromJson((json['dart'] as Map<String, Object?>)),
  );

  final List<String> segments;

  final List<String>? sub;

  final NameCss css;

  final NameTs ts;

  final NameDart dart;
}

final class IrTargetsCss {
  const IrTargetsCss({
    required this.symbols,
    required this.outputs,
    this.modules,
  });

  factory IrTargetsCss.fromJson(Map<String, Object?> json) => IrTargetsCss(
    symbols: (json['symbols'] as Map<String, Object?>).map(
      (key, value) =>
          MapEntry(key, Name.fromJson((value as Map<String, Object?>))),
    ),
    outputs: (json['outputs'] as Map<String, Object?>).map(
      (key, value) => MapEntry(key, (value as String)),
    ),
    modules: json['modules'] == null
        ? null
        : (json['modules'] as Map<String, Object?>).map(
            (key, value) => MapEntry(key, (value as String)),
          ),
  );

  final Map<String, Name> symbols;

  final Map<String, String> outputs;

  final Map<String, String>? modules;
}

final class IrTargetsTs {
  const IrTargetsTs({
    required this.symbols,
    required this.outputs,
    this.modules,
  });

  factory IrTargetsTs.fromJson(Map<String, Object?> json) => IrTargetsTs(
    symbols: (json['symbols'] as Map<String, Object?>).map(
      (key, value) =>
          MapEntry(key, Name.fromJson((value as Map<String, Object?>))),
    ),
    outputs: (json['outputs'] as Map<String, Object?>).map(
      (key, value) => MapEntry(key, (value as String)),
    ),
    modules: json['modules'] == null
        ? null
        : (json['modules'] as Map<String, Object?>).map(
            (key, value) => MapEntry(key, (value as String)),
          ),
  );

  final Map<String, Name> symbols;

  final Map<String, String> outputs;

  final Map<String, String>? modules;
}

final class IrTargetsDart {
  const IrTargetsDart({
    required this.symbols,
    required this.outputs,
    this.modules,
  });

  factory IrTargetsDart.fromJson(Map<String, Object?> json) => IrTargetsDart(
    symbols: (json['symbols'] as Map<String, Object?>).map(
      (key, value) =>
          MapEntry(key, Name.fromJson((value as Map<String, Object?>))),
    ),
    outputs: (json['outputs'] as Map<String, Object?>).map(
      (key, value) => MapEntry(key, (value as String)),
    ),
    modules: json['modules'] == null
        ? null
        : (json['modules'] as Map<String, Object?>).map(
            (key, value) => MapEntry(key, (value as String)),
          ),
  );

  final Map<String, Name> symbols;

  final Map<String, String> outputs;

  final Map<String, String>? modules;
}

final class IrTargets {
  const IrTargets({required this.css, required this.ts, required this.dart});

  factory IrTargets.fromJson(Map<String, Object?> json) => IrTargets(
    css: IrTargetsCss.fromJson((json['css'] as Map<String, Object?>)),
    ts: IrTargetsTs.fromJson((json['ts'] as Map<String, Object?>)),
    dart: IrTargetsDart.fromJson((json['dart'] as Map<String, Object?>)),
  );

  final IrTargetsCss css;

  final IrTargetsTs ts;

  final IrTargetsDart dart;
}

final class IrPlaceholders {
  const IrPlaceholders({required this.family});

  factory IrPlaceholders.fromJson(Map<String, Object?> json) =>
      IrPlaceholders(family: (json['family'] as String));

  final String family;
}

final class IrModesItem {
  const IrModesItem({required this.name});

  factory IrModesItem.fromJson(Map<String, Object?> json) =>
      IrModesItem(name: Name.fromJson((json['name'] as Map<String, Object?>)));

  final Name name;
}

final class IrEnumsItem {
  const IrEnumsItem({required this.name, required this.ts, required this.dart});

  factory IrEnumsItem.fromJson(Map<String, Object?> json) => IrEnumsItem(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    ts: (json['ts'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
    dart: (json['dart'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
  );

  final Name name;

  final List<Name> ts;

  final List<Name> dart;
}

final class IrColorFamilyGroupsItem {
  const IrColorFamilyGroupsItem({
    required this.name,
    required this.list,
    required this.families,
  });

  factory IrColorFamilyGroupsItem.fromJson(Map<String, Object?> json) =>
      IrColorFamilyGroupsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        list: Name.fromJson((json['list'] as Map<String, Object?>)),
        families: (json['families'] as List<Object?>)
            .map((item) => (item as String))
            .toList(),
      );

  final Name name;

  final Name list;

  final List<String> families;
}

final class SlotTemplate {
  const SlotTemplate({required this.key});

  factory SlotTemplate.fromJson(Map<String, Object?> json) =>
      SlotTemplate(key: (json['key'] as String));

  final String key;
}

final class Slot {
  const Slot({
    required this.property,
    required this.usesFamily,
    required this.neutralOnly,
    required this.template,
  });

  factory Slot.fromJson(Map<String, Object?> json) => Slot(
    property: (json['property'] as String),
    usesFamily: (json['usesFamily'] as bool),
    neutralOnly: (json['neutralOnly'] as bool),
    template: SlotTemplate.fromJson((json['template'] as Map<String, Object?>)),
  );

  final String property;

  final bool usesFamily;

  final bool neutralOnly;

  final SlotTemplate template;
}

final class Color {
  const Color({
    required this.red,
    required this.green,
    required this.blue,
    required this.alpha,
    required this.hex,
  });

  factory Color.fromJson(Map<String, Object?> json) => Color(
    red: (json['red'] as int),
    green: (json['green'] as int),
    blue: (json['blue'] as int),
    alpha: (json['alpha'] as int),
    hex: (json['hex'] as String),
  );

  final int red;

  final int green;

  final int blue;

  final int alpha;

  final String hex;
}

final class RoleThemeItem {
  const RoleThemeItem({
    required this.mode,
    required this.variable,
    this.fallback,
  });

  factory RoleThemeItem.fromJson(Map<String, Object?> json) => RoleThemeItem(
    mode: (json['mode'] as String),
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    fallback: json['fallback'] == null
        ? null
        : Color.fromJson((json['fallback'] as Map<String, Object?>)),
  );

  final String mode;

  final Name variable;

  final Color? fallback;
}

final class Role {
  const Role({
    required this.name,
    required this.variable,
    required this.property,
    required this.family,
    required this.slot,
    required this.theme,
    required this.tailwind,
  });

  factory Role.fromJson(Map<String, Object?> json) => Role(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    property: (json['property'] as String),
    family: (json['family'] as String),
    slot: (json['slot'] as String),
    theme: (json['theme'] as List<Object?>)
        .map((item) => RoleThemeItem.fromJson((item as Map<String, Object?>)))
        .toList(),
    tailwind: (json['tailwind'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
  );

  final Name name;

  final Name variable;

  final String property;

  final String family;

  final String slot;

  final List<RoleThemeItem> theme;

  final List<Name> tailwind;
}

final class IrColorNeutralScalesItem {
  const IrColorNeutralScalesItem({required this.mode, required this.steps});

  factory IrColorNeutralScalesItem.fromJson(Map<String, Object?> json) =>
      IrColorNeutralScalesItem(
        mode: (json['mode'] as String),
        steps: (json['steps'] as List<Object?>)
            .map((item) => Color.fromJson((item as Map<String, Object?>)))
            .toList(),
      );

  final String mode;

  final List<Color> steps;
}

final class IrColorNeutralStepsItem {
  const IrColorNeutralStepsItem({required this.role, required this.step});

  factory IrColorNeutralStepsItem.fromJson(Map<String, Object?> json) =>
      IrColorNeutralStepsItem(
        role: (json['role'] as String),
        step: (json['step'] as int),
      );

  final String role;

  final int step;
}

final class IrColorSchemeRolesItemTargetsItem {
  const IrColorSchemeRolesItemTargetsItem({
    required this.family,
    required this.role,
  });

  factory IrColorSchemeRolesItemTargetsItem.fromJson(
    Map<String, Object?> json,
  ) => IrColorSchemeRolesItemTargetsItem(
    family: (json['family'] as String),
    role: (json['role'] as String),
  );

  final String family;

  final String role;
}

final class IrColorSchemeRolesItem {
  const IrColorSchemeRolesItem({
    required this.name,
    required this.variable,
    required this.slot,
    required this.tailwind,
    required this.targets,
  });

  factory IrColorSchemeRolesItem.fromJson(Map<String, Object?> json) =>
      IrColorSchemeRolesItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        slot: (json['slot'] as String),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        targets: (json['targets'] as List<Object?>)
            .map(
              (item) => IrColorSchemeRolesItemTargetsItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
      );

  final Name name;

  final Name variable;

  final String slot;

  final List<Name> tailwind;

  final List<IrColorSchemeRolesItemTargetsItem> targets;
}

sealed class IrColorSchemeUtilitiesItemLayerColor {
  const IrColorSchemeUtilitiesItemLayerColor();

  factory IrColorSchemeUtilitiesItemLayerColor.fromJson(
    Map<String, Object?> json,
  ) => json['kind'] == 'role'
      ? IrColorSchemeUtilitiesItemLayerColorRole.fromJson(json)
      : json['kind'] == 'keyword'
      ? IrColorSchemeUtilitiesItemLayerColorKeyword.fromJson(json)
      : throw FormatException('names no variant', json['kind']);
}

final class IrColorSchemeUtilitiesItemLayerColorRole
    extends IrColorSchemeUtilitiesItemLayerColor {
  const IrColorSchemeUtilitiesItemLayerColorRole({required this.role});

  factory IrColorSchemeUtilitiesItemLayerColorRole.fromJson(
    Map<String, Object?> json,
  ) => IrColorSchemeUtilitiesItemLayerColorRole(role: (json['role'] as String));

  final String role;
}

final class IrColorSchemeUtilitiesItemLayerColorKeyword
    extends IrColorSchemeUtilitiesItemLayerColor {
  const IrColorSchemeUtilitiesItemLayerColorKeyword({required this.keyword});

  factory IrColorSchemeUtilitiesItemLayerColorKeyword.fromJson(
    Map<String, Object?> json,
  ) => IrColorSchemeUtilitiesItemLayerColorKeyword(
    keyword: (json['keyword'] as String),
  );

  final String keyword;
}

final class IrColorSchemeUtilitiesItemLayerHover {
  const IrColorSchemeUtilitiesItemLayerHover({
    required this.variable,
    required this.opacity,
  });

  factory IrColorSchemeUtilitiesItemLayerHover.fromJson(
    Map<String, Object?> json,
  ) => IrColorSchemeUtilitiesItemLayerHover(
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    opacity: (json['opacity'] as String),
  );

  final Name variable;

  final String opacity;
}

final class IrColorSchemeUtilitiesItemLayerPress {
  const IrColorSchemeUtilitiesItemLayerPress({
    required this.variable,
    required this.opacity,
  });

  factory IrColorSchemeUtilitiesItemLayerPress.fromJson(
    Map<String, Object?> json,
  ) => IrColorSchemeUtilitiesItemLayerPress(
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    opacity: (json['opacity'] as String),
  );

  final Name variable;

  final String opacity;
}

final class IrColorSchemeUtilitiesItemLayer {
  const IrColorSchemeUtilitiesItemLayer({
    required this.variable,
    required this.color,
    required this.hover,
    required this.press,
  });

  factory IrColorSchemeUtilitiesItemLayer.fromJson(Map<String, Object?> json) =>
      IrColorSchemeUtilitiesItemLayer(
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        color: IrColorSchemeUtilitiesItemLayerColor.fromJson(
          (json['color'] as Map<String, Object?>),
        ),
        hover: IrColorSchemeUtilitiesItemLayerHover.fromJson(
          (json['hover'] as Map<String, Object?>),
        ),
        press: IrColorSchemeUtilitiesItemLayerPress.fromJson(
          (json['press'] as Map<String, Object?>),
        ),
      );

  final Name variable;

  final IrColorSchemeUtilitiesItemLayerColor color;

  final IrColorSchemeUtilitiesItemLayerHover hover;

  final IrColorSchemeUtilitiesItemLayerPress press;
}

final class IrColorSchemeUtilitiesItem {
  const IrColorSchemeUtilitiesItem({
    required this.family,
    required this.name,
    required this.layer,
  });

  factory IrColorSchemeUtilitiesItem.fromJson(Map<String, Object?> json) =>
      IrColorSchemeUtilitiesItem(
        family: (json['family'] as String),
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        layer: IrColorSchemeUtilitiesItemLayer.fromJson(
          (json['layer'] as Map<String, Object?>),
        ),
      );

  final String family;

  final Name name;

  final IrColorSchemeUtilitiesItemLayer layer;
}

final class IrColorScheme {
  const IrColorScheme({
    required this.family,
    required this.roles,
    required this.utilities,
  });

  factory IrColorScheme.fromJson(Map<String, Object?> json) => IrColorScheme(
    family: Name.fromJson((json['family'] as Map<String, Object?>)),
    roles: (json['roles'] as List<Object?>)
        .map(
          (item) =>
              IrColorSchemeRolesItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    utilities: (json['utilities'] as List<Object?>)
        .map(
          (item) => IrColorSchemeUtilitiesItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
  );

  final Name family;

  final List<IrColorSchemeRolesItem> roles;

  final List<IrColorSchemeUtilitiesItem> utilities;
}

final class IrColor {
  const IrColor({
    required this.familyGroups,
    required this.families,
    required this.slots,
    required this.roles,
    required this.neutralScales,
    required this.neutralSteps,
    required this.scheme,
  });

  factory IrColor.fromJson(Map<String, Object?> json) => IrColor(
    familyGroups: (json['familyGroups'] as List<Object?>)
        .map(
          (item) =>
              IrColorFamilyGroupsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    families: (json['families'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
    slots: (json['slots'] as List<Object?>)
        .map((item) => Slot.fromJson((item as Map<String, Object?>)))
        .toList(),
    roles: (json['roles'] as List<Object?>)
        .map((item) => Role.fromJson((item as Map<String, Object?>)))
        .toList(),
    neutralScales: (json['neutralScales'] as List<Object?>)
        .map(
          (item) =>
              IrColorNeutralScalesItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    neutralSteps: (json['neutralSteps'] as List<Object?>)
        .map(
          (item) =>
              IrColorNeutralStepsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    scheme: IrColorScheme.fromJson((json['scheme'] as Map<String, Object?>)),
  );

  final List<IrColorFamilyGroupsItem> familyGroups;

  final List<Name> families;

  final List<Slot> slots;

  final List<Role> roles;

  final List<IrColorNeutralScalesItem> neutralScales;

  final List<IrColorNeutralStepsItem> neutralSteps;

  final IrColorScheme scheme;
}

sealed class IrStateTokensItem {
  const IrStateTokensItem();

  factory IrStateTokensItem.fromJson(Map<String, Object?> json) =>
      json['kind'] == 'opacity'
      ? IrStateTokensItemOpacity.fromJson(json)
      : json['kind'] == 'color'
      ? IrStateTokensItemColor.fromJson(json)
      : throw FormatException('names no variant', json['kind']);
}

final class IrStateTokensItemOpacity extends IrStateTokensItem {
  const IrStateTokensItemOpacity({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.ratio,
    required this.percent,
  });

  factory IrStateTokensItemOpacity.fromJson(Map<String, Object?> json) =>
      IrStateTokensItemOpacity(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        ratio: (json['ratio'] as num).toDouble(),
        percent: (json['percent'] as num).toDouble(),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final double ratio;

  final double percent;
}

final class IrStateTokensItemColor extends IrStateTokensItem {
  const IrStateTokensItemColor({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.color,
  });

  factory IrStateTokensItemColor.fromJson(Map<String, Object?> json) =>
      IrStateTokensItemColor(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        color: Color.fromJson((json['color'] as Map<String, Object?>)),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final Color color;
}

final class IrState {
  const IrState({required this.tokens});

  factory IrState.fromJson(Map<String, Object?> json) => IrState(
    tokens: (json['tokens'] as List<Object?>)
        .map(
          (item) => IrStateTokensItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
  );

  final List<IrStateTokensItem> tokens;
}

enum DimensionUnit { px, em, rem }

final class Dimension {
  const Dimension({required this.value, required this.unit});

  factory Dimension.fromJson(Map<String, Object?> json) => Dimension(
    value: (json['value'] as num).toDouble(),
    unit: DimensionUnit.values.byName((json['unit'] as String)),
  );

  final double value;

  final DimensionUnit unit;
}

final class ShadowLayer {
  const ShadowLayer({
    required this.offsetX,
    required this.offsetY,
    required this.blur,
    required this.spread,
    required this.color,
  });

  factory ShadowLayer.fromJson(Map<String, Object?> json) => ShadowLayer(
    offsetX: Dimension.fromJson((json['offsetX'] as Map<String, Object?>)),
    offsetY: Dimension.fromJson((json['offsetY'] as Map<String, Object?>)),
    blur: Dimension.fromJson((json['blur'] as Map<String, Object?>)),
    spread: Dimension.fromJson((json['spread'] as Map<String, Object?>)),
    color: Color.fromJson((json['color'] as Map<String, Object?>)),
  );

  final Dimension offsetX;

  final Dimension offsetY;

  final Dimension blur;

  final Dimension spread;

  final Color color;
}

final class Shadow {
  const Shadow({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.layers,
  });

  factory Shadow.fromJson(Map<String, Object?> json) => Shadow(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    tailwind: (json['tailwind'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
    layers: (json['layers'] as List<Object?>)
        .map((item) => ShadowLayer.fromJson((item as Map<String, Object?>)))
        .toList(),
  );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final List<ShadowLayer> layers;
}

final class IrComponentColorsItemModesItem {
  const IrComponentColorsItemModesItem({
    required this.mode,
    required this.role,
  });

  factory IrComponentColorsItemModesItem.fromJson(Map<String, Object?> json) =>
      IrComponentColorsItemModesItem(
        mode: (json['mode'] as String),
        role: (json['role'] as String),
      );

  final String mode;

  final String role;
}

final class IrComponentColorsItem {
  const IrComponentColorsItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.property,
    required this.part,
    required this.modes,
  });

  factory IrComponentColorsItem.fromJson(Map<String, Object?> json) =>
      IrComponentColorsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        property: (json['property'] as String),
        part: Name.fromJson((json['part'] as Map<String, Object?>)),
        modes: (json['modes'] as List<Object?>)
            .map(
              (item) => IrComponentColorsItemModesItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final String property;

  final Name part;

  final List<IrComponentColorsItemModesItem> modes;
}

final class IrComponentShadowsItemModesItem {
  const IrComponentShadowsItemModesItem({
    required this.mode,
    required this.shadow,
  });

  factory IrComponentShadowsItemModesItem.fromJson(Map<String, Object?> json) =>
      IrComponentShadowsItemModesItem(
        mode: (json['mode'] as String),
        shadow: (json['shadow'] as String),
      );

  final String mode;

  final String shadow;
}

final class IrComponentShadowsItem {
  const IrComponentShadowsItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.part,
    required this.modes,
  });

  factory IrComponentShadowsItem.fromJson(Map<String, Object?> json) =>
      IrComponentShadowsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        part: Name.fromJson((json['part'] as Map<String, Object?>)),
        modes: (json['modes'] as List<Object?>)
            .map(
              (item) => IrComponentShadowsItemModesItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final Name part;

  final List<IrComponentShadowsItemModesItem> modes;
}

final class IrMotionItem {
  const IrMotionItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.milliseconds,
  });

  factory IrMotionItem.fromJson(Map<String, Object?> json) => IrMotionItem(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    tailwind: (json['tailwind'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
    milliseconds: (json['milliseconds'] as num).toDouble(),
  );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final double milliseconds;
}

final class DimensionToken {
  const DimensionToken({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.value,
  });

  factory DimensionToken.fromJson(Map<String, Object?> json) => DimensionToken(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    tailwind: (json['tailwind'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
    value: Dimension.fromJson((json['value'] as Map<String, Object?>)),
  );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final Dimension value;
}

final class IrTypographyFontWeightsItem {
  const IrTypographyFontWeightsItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.value,
  });

  factory IrTypographyFontWeightsItem.fromJson(Map<String, Object?> json) =>
      IrTypographyFontWeightsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        value: (json['value'] as num).toDouble(),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final double value;
}

sealed class LineHeight {
  const LineHeight();

  factory LineHeight.fromJson(Map<String, Object?> json) =>
      json['kind'] == 'length'
      ? LineHeightLength.fromJson(json)
      : json['kind'] == 'multiplier'
      ? LineHeightMultiplier.fromJson(json)
      : throw FormatException('names no variant', json['kind']);
}

final class LineHeightLength extends LineHeight {
  const LineHeightLength({required this.length});

  factory LineHeightLength.fromJson(Map<String, Object?> json) =>
      LineHeightLength(
        length: Dimension.fromJson((json['length'] as Map<String, Object?>)),
      );

  final Dimension length;
}

final class LineHeightMultiplier extends LineHeight {
  const LineHeightMultiplier({required this.multiplier});

  factory LineHeightMultiplier.fromJson(Map<String, Object?> json) =>
      LineHeightMultiplier(multiplier: (json['multiplier'] as num).toDouble());

  final double multiplier;
}

final class IrTypographyLineHeightsItem {
  const IrTypographyLineHeightsItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.value,
  });

  factory IrTypographyLineHeightsItem.fromJson(Map<String, Object?> json) =>
      IrTypographyLineHeightsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        value: LineHeight.fromJson((json['value'] as Map<String, Object?>)),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final LineHeight value;
}

final class IrTypographyFontFamiliesItemFlutter {
  const IrTypographyFontFamiliesItemFlutter({
    required this.family,
    this.package,
    required this.qualifiedFamily,
    required this.fallback,
  });

  factory IrTypographyFontFamiliesItemFlutter.fromJson(
    Map<String, Object?> json,
  ) => IrTypographyFontFamiliesItemFlutter(
    family: (json['family'] as String),
    package: json['package'] == null ? null : (json['package'] as String),
    qualifiedFamily: (json['qualifiedFamily'] as String),
    fallback: (json['fallback'] as List<Object?>)
        .map((item) => (item as String))
        .toList(),
  );

  final String family;

  final String? package;

  final String qualifiedFamily;

  final List<String> fallback;
}

final class IrTypographyFontFamiliesItem {
  const IrTypographyFontFamiliesItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.stack,
    required this.flutter,
  });

  factory IrTypographyFontFamiliesItem.fromJson(Map<String, Object?> json) =>
      IrTypographyFontFamiliesItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        stack: (json['stack'] as List<Object?>)
            .map((item) => (item as String))
            .toList(),
        flutter: IrTypographyFontFamiliesItemFlutter.fromJson(
          (json['flutter'] as Map<String, Object?>),
        ),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final List<String> stack;

  final IrTypographyFontFamiliesItemFlutter flutter;
}

final class IrTypographyFontSizeAdjustsItem {
  const IrTypographyFontSizeAdjustsItem({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.value,
  });

  factory IrTypographyFontSizeAdjustsItem.fromJson(Map<String, Object?> json) =>
      IrTypographyFontSizeAdjustsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
        value: (json['value'] as num).toDouble(),
      );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final double value;
}

enum TextStylePartsItemPart { fontSize, fontWeight, lineHeight, letterSpacing }

final class TextStylePartsItem {
  const TextStylePartsItem({
    required this.part,
    required this.variable,
    required this.tailwind,
  });

  factory TextStylePartsItem.fromJson(Map<String, Object?> json) =>
      TextStylePartsItem(
        part: TextStylePartsItemPart.values.byName((json['part'] as String)),
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        tailwind: (json['tailwind'] as List<Object?>)
            .map((item) => Name.fromJson((item as Map<String, Object?>)))
            .toList(),
      );

  final TextStylePartsItemPart part;

  final Name variable;

  final List<Name> tailwind;
}

final class TextStyleFlutter {
  const TextStyleFlutter({
    required this.fontSize,
    required this.height,
    required this.letterSpacing,
  });

  factory TextStyleFlutter.fromJson(Map<String, Object?> json) =>
      TextStyleFlutter(
        fontSize: (json['fontSize'] as num).toDouble(),
        height: (json['height'] as num).toDouble(),
        letterSpacing: (json['letterSpacing'] as num).toDouble(),
      );

  final double fontSize;

  final double height;

  final double letterSpacing;
}

final class TextStyle {
  const TextStyle({
    required this.name,
    required this.variable,
    required this.tailwind,
    required this.fontFamily,
    required this.fontSize,
    required this.fontWeight,
    required this.lineHeight,
    required this.letterSpacing,
    required this.parts,
    required this.flutter,
  });

  factory TextStyle.fromJson(Map<String, Object?> json) => TextStyle(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
    tailwind: (json['tailwind'] as List<Object?>)
        .map((item) => Name.fromJson((item as Map<String, Object?>)))
        .toList(),
    fontFamily: (json['fontFamily'] as String),
    fontSize: Dimension.fromJson((json['fontSize'] as Map<String, Object?>)),
    fontWeight: (json['fontWeight'] as num).toDouble(),
    lineHeight: LineHeight.fromJson(
      (json['lineHeight'] as Map<String, Object?>),
    ),
    letterSpacing: Dimension.fromJson(
      (json['letterSpacing'] as Map<String, Object?>),
    ),
    parts: (json['parts'] as List<Object?>)
        .map(
          (item) => TextStylePartsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    flutter: TextStyleFlutter.fromJson(
      (json['flutter'] as Map<String, Object?>),
    ),
  );

  final Name name;

  final Name variable;

  final List<Name> tailwind;

  final String fontFamily;

  final Dimension fontSize;

  final double fontWeight;

  final LineHeight lineHeight;

  final Dimension letterSpacing;

  final List<TextStylePartsItem> parts;

  final TextStyleFlutter flutter;
}

final class IrTypography {
  const IrTypography({
    required this.fontSizes,
    required this.fontWeights,
    required this.lineHeights,
    required this.letterSpacings,
    required this.fontFamilies,
    required this.fontSizeAdjusts,
    required this.textStyles,
  });

  factory IrTypography.fromJson(Map<String, Object?> json) => IrTypography(
    fontSizes: (json['fontSizes'] as List<Object?>)
        .map((item) => DimensionToken.fromJson((item as Map<String, Object?>)))
        .toList(),
    fontWeights: (json['fontWeights'] as List<Object?>)
        .map(
          (item) => IrTypographyFontWeightsItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
    lineHeights: (json['lineHeights'] as List<Object?>)
        .map(
          (item) => IrTypographyLineHeightsItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
    letterSpacings: (json['letterSpacings'] as List<Object?>)
        .map((item) => DimensionToken.fromJson((item as Map<String, Object?>)))
        .toList(),
    fontFamilies: (json['fontFamilies'] as List<Object?>)
        .map(
          (item) => IrTypographyFontFamiliesItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
    fontSizeAdjusts: (json['fontSizeAdjusts'] as List<Object?>)
        .map(
          (item) => IrTypographyFontSizeAdjustsItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
    textStyles: (json['textStyles'] as List<Object?>)
        .map((item) => TextStyle.fromJson((item as Map<String, Object?>)))
        .toList(),
  );

  final List<DimensionToken> fontSizes;

  final List<IrTypographyFontWeightsItem> fontWeights;

  final List<IrTypographyLineHeightsItem> lineHeights;

  final List<DimensionToken> letterSpacings;

  final List<IrTypographyFontFamiliesItem> fontFamilies;

  final List<IrTypographyFontSizeAdjustsItem> fontSizeAdjusts;

  final List<TextStyle> textStyles;
}

final class IrFontsBundledItemFont {
  const IrFontsBundledItemFont({required this.from, required this.to});

  factory IrFontsBundledItemFont.fromJson(Map<String, Object?> json) =>
      IrFontsBundledItemFont(
        from: (json['from'] as String),
        to: (json['to'] as String),
      );

  final String from;

  final String to;
}

final class IrFontsBundledItemLicense {
  const IrFontsBundledItemLicense({required this.from, required this.to});

  factory IrFontsBundledItemLicense.fromJson(Map<String, Object?> json) =>
      IrFontsBundledItemLicense(
        from: (json['from'] as String),
        to: (json['to'] as String),
      );

  final String from;

  final String to;
}

final class IrFontsBundledItem {
  const IrFontsBundledItem({
    required this.family,
    required this.aliases,
    required this.font,
    required this.license,
  });

  factory IrFontsBundledItem.fromJson(Map<String, Object?> json) =>
      IrFontsBundledItem(
        family: (json['family'] as String),
        aliases: (json['aliases'] as List<Object?>)
            .map((item) => (item as String))
            .toList(),
        font: IrFontsBundledItemFont.fromJson(
          (json['font'] as Map<String, Object?>),
        ),
        license: IrFontsBundledItemLicense.fromJson(
          (json['license'] as Map<String, Object?>),
        ),
      );

  final String family;

  final List<String> aliases;

  final IrFontsBundledItemFont font;

  final IrFontsBundledItemLicense license;
}

final class IrFonts {
  const IrFonts({required this.bundled});

  factory IrFonts.fromJson(Map<String, Object?> json) => IrFonts(
    bundled: (json['bundled'] as List<Object?>)
        .map(
          (item) => IrFontsBundledItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
  );

  final List<IrFontsBundledItem> bundled;
}

final class IrPaletteModelSeriesItem {
  const IrPaletteModelSeriesItem({
    required this.name,
    required this.coefficients,
  });

  factory IrPaletteModelSeriesItem.fromJson(Map<String, Object?> json) =>
      IrPaletteModelSeriesItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        coefficients: (json['coefficients'] as List<Object?>)
            .map(
              (item) => (item as List<Object?>)
                  .map((item) => (item as num).toDouble())
                  .toList(),
            )
            .toList(),
      );

  final Name name;

  final List<List<double>> coefficients;
}

final class IrPaletteModelStatusPalettesItem {
  const IrPaletteModelStatusPalettesItem({
    required this.name,
    required this.colors,
  });

  factory IrPaletteModelStatusPalettesItem.fromJson(
    Map<String, Object?> json,
  ) => IrPaletteModelStatusPalettesItem(
    name: Name.fromJson((json['name'] as Map<String, Object?>)),
    colors: (json['colors'] as List<Object?>)
        .map((item) => Color.fromJson((item as Map<String, Object?>)))
        .toList(),
  );

  final Name name;

  final List<Color> colors;
}

final class IrPaletteModel {
  const IrPaletteModel({
    required this.steps,
    required this.series,
    required this.statusPalettes,
  });

  factory IrPaletteModel.fromJson(Map<String, Object?> json) => IrPaletteModel(
    steps: (json['steps'] as List<Object?>)
        .map((item) => (item as String))
        .toList(),
    series: (json['series'] as List<Object?>)
        .map(
          (item) =>
              IrPaletteModelSeriesItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    statusPalettes: (json['statusPalettes'] as List<Object?>)
        .map(
          (item) => IrPaletteModelStatusPalettesItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
  );

  final List<String> steps;

  final List<IrPaletteModelSeriesItem> series;

  final List<IrPaletteModelStatusPalettesItem> statusPalettes;
}

final class IrCssAttributes {
  const IrCssAttributes({
    required this.mode,
    required this.scale,
    required this.popover,
  });

  factory IrCssAttributes.fromJson(Map<String, Object?> json) =>
      IrCssAttributes(
        mode: (json['mode'] as String),
        scale: (json['scale'] as String),
        popover: (json['popover'] as String),
      );

  final String mode;

  final String scale;

  final String popover;
}

final class IrCssModeVariantsItem {
  const IrCssModeVariantsItem({
    required this.name,
    required this.mode,
    required this.others,
  });

  factory IrCssModeVariantsItem.fromJson(Map<String, Object?> json) =>
      IrCssModeVariantsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        mode: (json['mode'] as String),
        others: (json['others'] as List<Object?>)
            .map((item) => (item as String))
            .toList(),
      );

  final Name name;

  final String mode;

  final List<String> others;
}

sealed class IrCssFocusRingTriggersItem {
  const IrCssFocusRingTriggersItem();

  factory IrCssFocusRingTriggersItem.fromJson(Map<String, Object?> json) =>
      json['kind'] == 'pseudo'
      ? IrCssFocusRingTriggersItemPseudo.fromJson(json)
      : json['kind'] == 'attribute'
      ? IrCssFocusRingTriggersItemAttribute.fromJson(json)
      : json['kind'] == 'focusedInside'
      ? IrCssFocusRingTriggersItemFocusedInside.fromJson(json)
      : throw FormatException('names no variant', json['kind']);
}

final class IrCssFocusRingTriggersItemPseudo
    extends IrCssFocusRingTriggersItem {
  const IrCssFocusRingTriggersItemPseudo({required this.pseudo});

  factory IrCssFocusRingTriggersItemPseudo.fromJson(
    Map<String, Object?> json,
  ) => IrCssFocusRingTriggersItemPseudo(pseudo: (json['pseudo'] as String));

  final String pseudo;
}

final class IrCssFocusRingTriggersItemAttribute
    extends IrCssFocusRingTriggersItem {
  const IrCssFocusRingTriggersItemAttribute({required this.attribute});

  factory IrCssFocusRingTriggersItemAttribute.fromJson(
    Map<String, Object?> json,
  ) => IrCssFocusRingTriggersItemAttribute(
    attribute: (json['attribute'] as String),
  );

  final String attribute;
}

final class IrCssFocusRingTriggersItemFocusedInside
    extends IrCssFocusRingTriggersItem {
  const IrCssFocusRingTriggersItemFocusedInside({
    required this.attribute,
    required this.exceptIn,
  });

  factory IrCssFocusRingTriggersItemFocusedInside.fromJson(
    Map<String, Object?> json,
  ) => IrCssFocusRingTriggersItemFocusedInside(
    attribute: (json['attribute'] as String),
    exceptIn: (json['exceptIn'] as String),
  );

  final String attribute;

  final String exceptIn;
}

final class IrCssFocusRing {
  const IrCssFocusRing({required this.variant, required this.triggers});

  factory IrCssFocusRing.fromJson(Map<String, Object?> json) => IrCssFocusRing(
    variant: (json['variant'] as String),
    triggers: (json['triggers'] as List<Object?>)
        .map(
          (item) => IrCssFocusRingTriggersItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
  );

  final String variant;

  final List<IrCssFocusRingTriggersItem> triggers;
}

final class IrCssConcentricPadsItem {
  const IrCssConcentricPadsItem({required this.pad, required this.className});

  factory IrCssConcentricPadsItem.fromJson(Map<String, Object?> json) =>
      IrCssConcentricPadsItem(
        pad: (json['pad'] as num).toDouble(),
        className: (json['className'] as String),
      );

  final double pad;

  final String className;
}

final class IrCssConcentric {
  const IrCssConcentric({
    required this.utility,
    required this.classPrefix,
    required this.nested,
    required this.spacing,
    required this.pads,
    required this.overlayDepths,
  });

  factory IrCssConcentric.fromJson(Map<String, Object?> json) =>
      IrCssConcentric(
        utility: Name.fromJson((json['utility'] as Map<String, Object?>)),
        classPrefix: (json['classPrefix'] as String),
        nested: Name.fromJson((json['nested'] as Map<String, Object?>)),
        spacing: Name.fromJson((json['spacing'] as Map<String, Object?>)),
        pads: (json['pads'] as List<Object?>)
            .map(
              (item) => IrCssConcentricPadsItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
        overlayDepths: (json['overlayDepths'] as int),
      );

  final Name utility;

  final String classPrefix;

  final Name nested;

  final Name spacing;

  final List<IrCssConcentricPadsItem> pads;

  final int overlayDepths;
}

enum IrCssTypographyOrderItem {
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  fontFamilies,
  fontSizeAdjusts,
}

final class IrCssScaleProviderRadiusItem {
  const IrCssScaleProviderRadiusItem({
    required this.variable,
    required this.provider,
    required this.fallback,
  });

  factory IrCssScaleProviderRadiusItem.fromJson(Map<String, Object?> json) =>
      IrCssScaleProviderRadiusItem(
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        provider: Name.fromJson((json['provider'] as Map<String, Object?>)),
        fallback: Dimension.fromJson(
          (json['fallback'] as Map<String, Object?>),
        ),
      );

  final Name variable;

  final Name provider;

  final Dimension fallback;
}

final class IrCssScaleLengthsItem {
  const IrCssScaleLengthsItem({required this.variable, required this.value});

  factory IrCssScaleLengthsItem.fromJson(Map<String, Object?> json) =>
      IrCssScaleLengthsItem(
        variable: Name.fromJson((json['variable'] as Map<String, Object?>)),
        value: Dimension.fromJson((json['value'] as Map<String, Object?>)),
      );

  final Name variable;

  final Dimension value;
}

final class IrCssScale {
  const IrCssScale({
    required this.factor,
    required this.spacing,
    required this.spacingUnit,
    required this.wholePixel,
    required this.cornerRadiusScale,
    required this.providerRadius,
    required this.lengths,
  });

  factory IrCssScale.fromJson(Map<String, Object?> json) => IrCssScale(
    factor: Name.fromJson((json['factor'] as Map<String, Object?>)),
    spacing: Name.fromJson((json['spacing'] as Map<String, Object?>)),
    spacingUnit: Dimension.fromJson(
      (json['spacingUnit'] as Map<String, Object?>),
    ),
    wholePixel: Dimension.fromJson(
      (json['wholePixel'] as Map<String, Object?>),
    ),
    cornerRadiusScale: Name.fromJson(
      (json['cornerRadiusScale'] as Map<String, Object?>),
    ),
    providerRadius: (json['providerRadius'] as List<Object?>)
        .map(
          (item) => IrCssScaleProviderRadiusItem.fromJson(
            (item as Map<String, Object?>),
          ),
        )
        .toList(),
    lengths: (json['lengths'] as List<Object?>)
        .map(
          (item) =>
              IrCssScaleLengthsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
  );

  final Name factor;

  final Name spacing;

  final Dimension spacingUnit;

  final Dimension wholePixel;

  final Name cornerRadiusScale;

  final List<IrCssScaleProviderRadiusItem> providerRadius;

  final List<IrCssScaleLengthsItem> lengths;
}

final class IrCss {
  const IrCss({
    required this.attributes,
    required this.modeVariants,
    required this.focusRing,
    required this.concentric,
    required this.typographyOrder,
    required this.scale,
  });

  factory IrCss.fromJson(Map<String, Object?> json) => IrCss(
    attributes: IrCssAttributes.fromJson(
      (json['attributes'] as Map<String, Object?>),
    ),
    modeVariants: (json['modeVariants'] as List<Object?>)
        .map(
          (item) =>
              IrCssModeVariantsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    focusRing: IrCssFocusRing.fromJson(
      (json['focusRing'] as Map<String, Object?>),
    ),
    concentric: IrCssConcentric.fromJson(
      (json['concentric'] as Map<String, Object?>),
    ),
    typographyOrder: (json['typographyOrder'] as List<Object?>)
        .map((item) => IrCssTypographyOrderItem.values.byName((item as String)))
        .toList(),
    scale: IrCssScale.fromJson((json['scale'] as Map<String, Object?>)),
  );

  final IrCssAttributes attributes;

  final List<IrCssModeVariantsItem> modeVariants;

  final IrCssFocusRing focusRing;

  final IrCssConcentric concentric;

  final List<IrCssTypographyOrderItem> typographyOrder;

  final IrCssScale scale;
}

final class IrMessagesLocalesItemSubtags {
  const IrMessagesLocalesItemSubtags({
    required this.language,
    this.script,
    this.region,
  });

  factory IrMessagesLocalesItemSubtags.fromJson(Map<String, Object?> json) =>
      IrMessagesLocalesItemSubtags(
        language: (json['language'] as String),
        script: json['script'] == null ? null : (json['script'] as String),
        region: json['region'] == null ? null : (json['region'] as String),
      );

  final String language;

  final String? script;

  final String? region;
}

final class IrMessagesLocalesItem {
  const IrMessagesLocalesItem({
    required this.language,
    required this.tag,
    required this.name,
    required this.catalog,
    required this.subtags,
  });

  factory IrMessagesLocalesItem.fromJson(Map<String, Object?> json) =>
      IrMessagesLocalesItem(
        language: (json['language'] as String),
        tag: (json['tag'] as String),
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        catalog: Name.fromJson((json['catalog'] as Map<String, Object?>)),
        subtags: IrMessagesLocalesItemSubtags.fromJson(
          (json['subtags'] as Map<String, Object?>),
        ),
      );

  final String language;

  final String tag;

  final Name name;

  final Name catalog;

  final IrMessagesLocalesItemSubtags subtags;
}

final class IrMessagesCatalogsItem {
  const IrMessagesCatalogsItem({required this.name, required this.groups});

  factory IrMessagesCatalogsItem.fromJson(Map<String, Object?> json) =>
      IrMessagesCatalogsItem(
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        groups: (json['groups'] as List<Object?>)
            .map((item) => (item as String))
            .toList(),
      );

  final Name name;

  final List<String> groups;
}

enum IrMessagesEntriesItemParametersItemType { string, number }

final class IrMessagesEntriesItemParametersItem {
  const IrMessagesEntriesItemParametersItem({
    required this.name,
    required this.type,
  });

  factory IrMessagesEntriesItemParametersItem.fromJson(
    Map<String, Object?> json,
  ) => IrMessagesEntriesItemParametersItem(
    name: (json['name'] as String),
    type: IrMessagesEntriesItemParametersItemType.values.byName(
      (json['type'] as String),
    ),
  );

  final String name;

  final IrMessagesEntriesItemParametersItemType type;
}

sealed class IrMessagesEntriesItemTextsItemPartsItem {
  const IrMessagesEntriesItemTextsItemPartsItem();

  factory IrMessagesEntriesItemTextsItemPartsItem.fromJson(
    Map<String, Object?> json,
  ) => json['kind'] == 'text'
      ? IrMessagesEntriesItemTextsItemPartsItemText.fromJson(json)
      : json['kind'] == 'argument'
      ? IrMessagesEntriesItemTextsItemPartsItemArgument.fromJson(json)
      : throw FormatException('names no variant', json['kind']);
}

final class IrMessagesEntriesItemTextsItemPartsItemText
    extends IrMessagesEntriesItemTextsItemPartsItem {
  const IrMessagesEntriesItemTextsItemPartsItemText({required this.text});

  factory IrMessagesEntriesItemTextsItemPartsItemText.fromJson(
    Map<String, Object?> json,
  ) => IrMessagesEntriesItemTextsItemPartsItemText(
    text: (json['text'] as String),
  );

  final String text;
}

final class IrMessagesEntriesItemTextsItemPartsItemArgument
    extends IrMessagesEntriesItemTextsItemPartsItem {
  const IrMessagesEntriesItemTextsItemPartsItemArgument({
    required this.argument,
  });

  factory IrMessagesEntriesItemTextsItemPartsItemArgument.fromJson(
    Map<String, Object?> json,
  ) => IrMessagesEntriesItemTextsItemPartsItemArgument(
    argument: (json['argument'] as String),
  );

  final String argument;
}

final class IrMessagesEntriesItemTextsItem {
  const IrMessagesEntriesItemTextsItem({
    required this.language,
    required this.parts,
  });

  factory IrMessagesEntriesItemTextsItem.fromJson(Map<String, Object?> json) =>
      IrMessagesEntriesItemTextsItem(
        language: (json['language'] as String),
        parts: (json['parts'] as List<Object?>)
            .map(
              (item) => IrMessagesEntriesItemTextsItemPartsItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
      );

  final String language;

  final List<IrMessagesEntriesItemTextsItemPartsItem> parts;
}

final class IrMessagesEntriesItem {
  const IrMessagesEntriesItem({
    required this.id,
    required this.path,
    required this.name,
    required this.parameters,
    required this.texts,
  });

  factory IrMessagesEntriesItem.fromJson(Map<String, Object?> json) =>
      IrMessagesEntriesItem(
        id: (json['id'] as String),
        path: (json['path'] as List<Object?>)
            .map((item) => (item as String))
            .toList(),
        name: Name.fromJson((json['name'] as Map<String, Object?>)),
        parameters: (json['parameters'] as List<Object?>)
            .map(
              (item) => IrMessagesEntriesItemParametersItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
        texts: (json['texts'] as List<Object?>)
            .map(
              (item) => IrMessagesEntriesItemTextsItem.fromJson(
                (item as Map<String, Object?>),
              ),
            )
            .toList(),
      );

  final String id;

  final List<String> path;

  final Name name;

  final List<IrMessagesEntriesItemParametersItem> parameters;

  final List<IrMessagesEntriesItemTextsItem> texts;
}

final class IrMessages {
  const IrMessages({
    required this.fallback,
    required this.locales,
    required this.catalogs,
    required this.entries,
  });

  factory IrMessages.fromJson(Map<String, Object?> json) => IrMessages(
    fallback: (json['fallback'] as String),
    locales: (json['locales'] as List<Object?>)
        .map(
          (item) =>
              IrMessagesLocalesItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    catalogs: (json['catalogs'] as List<Object?>)
        .map(
          (item) =>
              IrMessagesCatalogsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    entries: (json['entries'] as List<Object?>)
        .map(
          (item) =>
              IrMessagesEntriesItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
  );

  final String fallback;

  final List<IrMessagesLocalesItem> locales;

  final List<IrMessagesCatalogsItem> catalogs;

  final List<IrMessagesEntriesItem> entries;
}

final class Ir {
  const Ir({
    required this.version,
    required this.packages,
    required this.targets,
    required this.placeholders,
    required this.modes,
    required this.enums,
    required this.color,
    required this.state,
    required this.shadows,
    required this.componentColors,
    required this.componentShadows,
    required this.motion,
    required this.radius,
    required this.size,
    required this.spacing,
    required this.typography,
    required this.fonts,
    required this.paletteModel,
    required this.css,
    required this.messages,
  });

  factory Ir.fromJson(Map<String, Object?> json) => Ir(
    version: json['version'] == 1
        ? 1
        : throw FormatException(
            'is not the value the schema fixes',
            json['version'],
          ),
    packages: IrPackages.fromJson((json['packages'] as Map<String, Object?>)),
    targets: IrTargets.fromJson((json['targets'] as Map<String, Object?>)),
    placeholders: IrPlaceholders.fromJson(
      (json['placeholders'] as Map<String, Object?>),
    ),
    modes: (json['modes'] as List<Object?>)
        .map((item) => IrModesItem.fromJson((item as Map<String, Object?>)))
        .toList(),
    enums: (json['enums'] as List<Object?>)
        .map((item) => IrEnumsItem.fromJson((item as Map<String, Object?>)))
        .toList(),
    color: IrColor.fromJson((json['color'] as Map<String, Object?>)),
    state: IrState.fromJson((json['state'] as Map<String, Object?>)),
    shadows: (json['shadows'] as List<Object?>)
        .map((item) => Shadow.fromJson((item as Map<String, Object?>)))
        .toList(),
    componentColors: (json['componentColors'] as List<Object?>)
        .map(
          (item) =>
              IrComponentColorsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    componentShadows: (json['componentShadows'] as List<Object?>)
        .map(
          (item) =>
              IrComponentShadowsItem.fromJson((item as Map<String, Object?>)),
        )
        .toList(),
    motion: (json['motion'] as List<Object?>)
        .map((item) => IrMotionItem.fromJson((item as Map<String, Object?>)))
        .toList(),
    radius: (json['radius'] as List<Object?>)
        .map((item) => DimensionToken.fromJson((item as Map<String, Object?>)))
        .toList(),
    size: (json['size'] as List<Object?>)
        .map((item) => DimensionToken.fromJson((item as Map<String, Object?>)))
        .toList(),
    spacing: (json['spacing'] as List<Object?>)
        .map((item) => DimensionToken.fromJson((item as Map<String, Object?>)))
        .toList(),
    typography: IrTypography.fromJson(
      (json['typography'] as Map<String, Object?>),
    ),
    fonts: IrFonts.fromJson((json['fonts'] as Map<String, Object?>)),
    paletteModel: IrPaletteModel.fromJson(
      (json['paletteModel'] as Map<String, Object?>),
    ),
    css: IrCss.fromJson((json['css'] as Map<String, Object?>)),
    messages: IrMessages.fromJson((json['messages'] as Map<String, Object?>)),
  );

  final int version;

  final IrPackages packages;

  final IrTargets targets;

  final IrPlaceholders placeholders;

  final List<IrModesItem> modes;

  final List<IrEnumsItem> enums;

  final IrColor color;

  final IrState state;

  final List<Shadow> shadows;

  final List<IrComponentColorsItem> componentColors;

  final List<IrComponentShadowsItem> componentShadows;

  final List<IrMotionItem> motion;

  final List<DimensionToken> radius;

  final List<DimensionToken> size;

  final List<DimensionToken> spacing;

  final IrTypography typography;

  final IrFonts fonts;

  final IrPaletteModel paletteModel;

  final IrCss css;

  final IrMessages messages;
}
