export function legacyTokenOutputs(legacy) {
const GENERATED = "// GENERATED — do not edit manually";

const slug = (t) => t.path.slice(1).join("-");
const val = (t) => t.$value ?? t.value;
const toCamel = (str) =>
  str.replace(/-([a-zA-Z0-9]+)/g, (_, s) => s.charAt(0).toUpperCase() + s.slice(1));
const enumName = (key) => `Ids${key.charAt(0).toUpperCase() + key.slice(1)}`;
const hexToFlutterColor = (hex) =>
  `const Color(0xFF${hex.replace("#", "").toUpperCase()})`;
const render = (template, vars) =>
  Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{{${k}}}`, v),
    template,
  );

const byCategory = (dictionary, cat) =>
  dictionary.allTokens.filter((t) => t.attributes?.category === cat);

const byPath = (dictionary, key) =>
  dictionary.allTokens.filter((t) => t.path[0] === key);

const buildPalette = (dictionary) => {
  const p = {};
  for (const t of dictionary.allTokens.filter(
    (t) => !t.filePath.includes("semantic"),
  ))
    p[t.path.join(".")] = val(t);
  return p;
};

const NEUTRAL_ROLE_STEPS = legacy.neutralRoleSteps;

const readTypographyEntries = () => legacy.typographyEntries;

const lineHeightAsMultiplier = (lineHeight, fontSize) => {
  const raw = String(lineHeight);
  if (raw.endsWith("px")) return parseFloat(raw) / parseFloat(fontSize);
  return parseFloat(raw);
};

const letterSpacingToPx = (letterSpacing, fontSize) => {
  const raw = String(letterSpacing);
  if (raw.endsWith("em")) return parseFloat(raw) * parseFloat(fontSize);
  return parseFloat(raw);
};

const parseEnums = (dictionary) => {
  const result = {};
  for (const t of dictionary.allTokens.filter((t) => t.path[0] === "ids")) {
    const values = val(t);
    if (Array.isArray(values)) result[t.path[1]] = values;
  }
  return result;
};

const COLOR_ROLES = legacy.colorRoles;

const COLOR_FAMILIES = Object.values(COLOR_ROLES.families).flat();

const NEUTRAL_ONLY_SLOTS = COLOR_ROLES.neutralOnly;

const TEMPLATE_SLOTS = Object.entries(COLOR_ROLES.slots).flatMap(([property, names]) =>
  names.map((name) => ({ property, name, slot: `${property}-${name}` })),
);

const slotsOf = (family) =>
  TEMPLATE_SLOTS.filter(
    ({ slot }) => family === "neutral" || !NEUTRAL_ONLY_SLOTS.includes(slot),
  ).map(({ property, name, slot }) => ({
    property,
    name: name.replaceAll("{family}", family),
    slot: slot.replaceAll("{family}", family),
  }));

const FAMILY_SLOTS = COLOR_FAMILIES.flatMap((family) =>
  slotsOf(family).map((entry) => ({ ...entry, family })),
);

const MODES = ["light", "dark"];

const readTokenFile = (file, key) => Object.entries(legacy.tokenFiles[file][key]);

const SHADOW_STEPS = readTokenFile("shadow.json", "shadow").map(([step, token]) => ({
  step,
  layers: token.$value,
}));

const COMPONENT_TOKENS = readTokenFile("component.json", "component").map(([name, token]) => ({
  name,
  property: name.slice(0, name.indexOf("-")),
  part: name.slice(name.indexOf("-") + 1),
  modes: token.$value,
}));

const COMPONENT_COLORS = COMPONENT_TOKENS.filter(({ property }) => property !== "shadow");

const COMPONENT_SHADOWS = COMPONENT_TOKENS.filter(({ property }) => property === "shadow");

const shadowStepOf = (reference) => reference.match(/^\{shadow\.([^}]+)\}$/)[1];

const T_DART_CLASS = `${GENERATED}

class {{NAME}} {
  {{NAME}}._();

{{MEMBERS}}
}
`;

const T_DART_ABSTRACT_CLASS = `${GENERATED}

import 'package:flutter/material.dart';

abstract final class {{NAME}} {
{{MEMBERS}}
}
`;

const T_DART_ENUM = `enum {{NAME}} {
{{VALUES}},
}`;

const T_DART_TEXT_STYLE = `TextStyle(fontFamily: '{{FONT_FAMILY}}', package: '{{FONT_PACKAGE}}', fontSize: {{FONT_SIZE}}, fontWeight: FontWeight.w{{FONT_WEIGHT}}, height: {{LINE_HEIGHT}}, letterSpacing: {{LETTER_SPACING}})`;

const neutralScale = (dictionary, mode) =>
  byPath(dictionary, "neutral")
    .filter((t) => t.path[1] === mode)
    .sort((a, b) => Number(a.path[2]) - Number(b.path[2]))
    .map(val);

const stateTokens = (dictionary, type) =>
  byCategory(dictionary, "state").filter((t) => (t.$type ?? t.type) === type);

const stateOpacity = (dictionary) =>
  Object.fromEntries(stateTokens(dictionary, "number").map((t) => [toCamel(slug(t)), parseFloat(val(t)) / 100]));

const stateFillColor = (dictionary) => val(stateTokens(dictionary, "color").find((t) => slug(t) === "fill-color"));

const dartEnumsFormatter = ({ dictionary }) => {
  const enums = parseEnums(dictionary);
  const blocks = Object.entries(enums)
    .filter(([key]) => key !== "color")
    .map(([key, values]) => [key, key === "mode" ? [...values, "system"] : values])
    .map(([key, values]) =>
      render(T_DART_ENUM, {
        NAME: enumName(key),
        VALUES: values
          .map(
            (v) =>
              `  ${toCamel(v.replace(/^(\d+)x*/, (_, n) => "x".repeat(Number(n))))}`,
          )
          .join(",\n"),
      }),
    )
    .join("\n\n");
  return `${GENERATED}\n\n${blocks}\n`;
};

const dartList = (values) => `<String>[${values.map((v) => `'${v}'`).join(", ")}]`;

const dartRoleField = (slot) => toCamel(slot);

const T_DART_COLOR_ROLES = `${GENERATED}

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_enums.dart';

abstract final class IdsColorRoles {
{{LISTS}}

  static const neutralScales = <IdsMode, List<Color>>{
{{NEUTRAL_SCALES}}
  };

  static const neutralSteps = <String, int>{
{{NEUTRAL_STEPS}}
  };

  static List<String> slotsOf(String family) => [
    for (final slot in familySlots)
      if (family == 'neutral' || !neutralOnlySlots.contains(slot))
        slot.replaceAll('{family}', family),
  ];
}

abstract final class IdsStateOpacity {
{{STATE_OPACITY}}
}

abstract final class IdsStateLayer {
  static const fillColor = Color({{STATE_FILL_COLOR}});
}

@immutable
class IdsColors {
  const IdsColors({
{{PARAMS}}
  });

  factory IdsColors.fromRoles(Map<String, Color> roles) {
    Color role(String name) =>
        roles[name] ?? (throw ArgumentError.value(name, 'roles', 'is missing'));
    return IdsColors(
{{FROM_ROLES}}
    );
  }

{{FIELDS}}

  Map<String, Color> get roles => {
{{ROLES}}
  };

  Color operator [](String role) =>
      roles[role] ?? (throw ArgumentError.value(role, 'role', 'is not an IDS color role'));

  @override
  bool operator ==(Object other) =>
      other is IdsColors &&
{{EQUALS}};

  @override
  int get hashCode => Object.hashAll(roles.values);
}
`;

const dartColorRolesFormatter = ({ dictionary }) => {
  const allSlots = FAMILY_SLOTS.map(({ slot }) => slot);
  const lists = [
    ...Object.entries(COLOR_ROLES.families).map(
      ([group, families]) => `  static const ${group}Families = ${dartList(families)};`,
    ),
    `  static const families = ${dartList(COLOR_FAMILIES)};`,
    `  static const familySlots = ${dartList(TEMPLATE_SLOTS.map(({ slot }) => slot))};`,
    `  static const neutralOnlySlots = ${dartList(NEUTRAL_ONLY_SLOTS)};`,
    `  static const all = ${dartList(allSlots)};`,
  ];
  const scales = MODES.map(
    (mode) =>
      `    IdsMode.${mode}: [\n${neutralScale(dictionary, mode)
        .map((hex) => `      ${hexToFlutterColor(hex).replace(/^const /, "")},`)
        .join("\n")}\n    ],`,
  );
  const steps = Object.entries(NEUTRAL_ROLE_STEPS).map(
    ([slot, step]) => `    '${slot}': ${step},`,
  );
  return render(T_DART_COLOR_ROLES, {
    LISTS: lists.join("\n"),
    NEUTRAL_SCALES: scales.join("\n"),
    NEUTRAL_STEPS: steps.join("\n"),
    STATE_FILL_COLOR: `0xFF${stateFillColor(dictionary).slice(1).toUpperCase()}`,
    STATE_OPACITY: Object.entries(stateOpacity(dictionary))
      .map(([name, value]) => `  static const double ${name} = ${value};`)
      .join("\n"),
    PARAMS: allSlots.map((slot) => `    required this.${dartRoleField(slot)},`).join("\n"),
    FROM_ROLES: allSlots
      .map((slot) => `      ${dartRoleField(slot)}: role('${slot}'),`)
      .join("\n"),
    FIELDS: allSlots.map((slot) => `  final Color ${dartRoleField(slot)};`).join("\n"),
    ROLES: allSlots.map((slot) => `    '${slot}': ${dartRoleField(slot)},`).join("\n"),
    EQUALS: allSlots
      .map((slot) => `      other.${dartRoleField(slot)} == ${dartRoleField(slot)}`)
      .join(" &&\n"),
  });
};

const dartColor = (hex) => {
  const [r, g, b, a = "ff"] = hex.slice(1).match(/../g);
  return `Color(0x${(a + r + g + b).toUpperCase()})`;
};

const dartBoxShadow = ({ x, y, blur, spread, color }) =>
  `BoxShadow(color: ${dartColor(color)}, offset: Offset(${x}, ${y}), blurRadius: ${blur}, spreadRadius: ${spread})`;

const dartModeMap = (type, entries) =>
  `<IdsMode, Map<String, ${type}>>{\n${MODES.map(
    (mode) =>
      `    IdsMode.${mode}: {\n${entries
        .map(([name, value]) => `      '${name}': ${value(mode)},`)
        .join("\n")}\n    },`,
  ).join("\n")}\n  }`;

const T_DART_COMPONENT_TOKENS = `${GENERATED}

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import 'ids_color_roles.dart';
import 'ids_enums.dart';

abstract final class IdsShadows {
  static const steps = <String, List<BoxShadow>>{
{{SHADOW_STEPS}}
  };
}

abstract final class IdsComponentTokens {
  static const colorRoles = {{COLOR_ROLES}};

  static const shadowSteps = {{SHADOW_TOKENS}};

  static Map<String, T> inMode<T>(Map<IdsMode, Map<String, T>> table, IdsMode mode) =>
      table[mode] ?? (throw ArgumentError.value(mode, 'mode', 'is not light or dark'));
}

@immutable
class IdsComponentColors {
  const IdsComponentColors({
{{COLOR_PARAMS}}
  });

  factory IdsComponentColors.of(IdsColors colors, IdsMode mode) {
    final roles = IdsComponentTokens.inMode(IdsComponentTokens.colorRoles, mode);
    Color token(String name) => colors[roles[name]!];
    return IdsComponentColors(
{{COLOR_FROM}}
    );
  }

{{COLOR_FIELDS}}

  Map<String, Color> get tokens => {
{{COLOR_TOKENS}}
  };

  @override
  bool operator ==(Object other) =>
      other is IdsComponentColors &&
{{COLOR_EQUALS}};

  @override
  int get hashCode => Object.hashAll(tokens.values);
}

@immutable
class IdsComponentShadows {
  const IdsComponentShadows({
{{SHADOW_PARAMS}}
  });

  factory IdsComponentShadows.of(IdsMode mode) {
    final steps = IdsComponentTokens.inMode(IdsComponentTokens.shadowSteps, mode);
    List<BoxShadow> token(String name) => IdsShadows.steps[steps[name]!]!;
    return IdsComponentShadows(
{{SHADOW_FROM}}
    );
  }

{{SHADOW_FIELDS}}

  @override
  bool operator ==(Object other) =>
      other is IdsComponentShadows &&
{{SHADOW_EQUALS}};

  @override
  int get hashCode => Object.hashAll([{{SHADOW_HASH}}]);
}
`;

const dartComponentTokensFormatter = () => {
  const colors = COMPONENT_COLORS.map(({ name }) => [name, toCamel(name)]);
  const shadows = COMPONENT_SHADOWS.map(({ name }) => [name, toCamel(name)]);
  return render(T_DART_COMPONENT_TOKENS, {
    SHADOW_STEPS: SHADOW_STEPS.map(
      ({ step, layers }) =>
        `    '${step}': <BoxShadow>[${layers.map(dartBoxShadow).join(", ")}],`,
    ).join("\n"),
    COLOR_ROLES: dartModeMap(
      "String",
      COMPONENT_COLORS.map(({ name, modes }) => [name, (mode) => `'${modes[mode]}'`]),
    ),
    SHADOW_TOKENS: dartModeMap(
      "String",
      COMPONENT_SHADOWS.map(({ name, modes }) => [name, (mode) => `'${shadowStepOf(modes[mode])}'`]),
    ),
    COLOR_PARAMS: colors.map(([, field]) => `    required this.${field},`).join("\n"),
    COLOR_FROM: colors.map(([name, field]) => `      ${field}: token('${name}'),`).join("\n"),
    COLOR_FIELDS: colors.map(([, field]) => `  final Color ${field};`).join("\n"),
    COLOR_TOKENS: colors.map(([name, field]) => `    '${name}': ${field},`).join("\n"),
    COLOR_EQUALS: colors.map(([, field]) => `      other.${field} == ${field}`).join(" &&\n"),
    SHADOW_PARAMS: shadows.map(([, field]) => `    required this.${field},`).join("\n"),
    SHADOW_FROM: shadows.map(([name, field]) => `      ${field}: token('${name}'),`).join("\n"),
    SHADOW_FIELDS: shadows.map(([, field]) => `  final List<BoxShadow> ${field};`).join("\n"),
    SHADOW_EQUALS: shadows
      .map(([, field]) => `      listEquals(other.${field}, ${field})`)
      .join(" &&\n"),
    SHADOW_HASH: shadows.map(([, field]) => `...${field}`).join(", "),
  });
};

const dartMotionFormatter = ({ dictionary }) =>
  render(T_DART_CLASS, {
    NAME: "IdsMotion",
    MEMBERS: byCategory(dictionary, "motion")
      .map(
        (t) =>
          `  static const Duration ${t.path[1]} = Duration(milliseconds: ${parseFloat(val(t))});`,
      )
      .join("\n"),
  });

const fontStack = (dictionary, name) =>
  val(byPath(dictionary, "font-family").find((t) => t.path[1] === name));

const FAMILIES_FLUTTER_CANNOT_NAME = ["sans-serif", "ui-monospace"];

const bundledFontPath = (fontFamily, fontPackage) => `packages/${fontPackage}/${fontFamily}`;

const flutterFallback = (stack, monoFontFamily, sansFontFamily, fontPackage) => [
  ...new Set(
    stack
      .filter((name) => !FAMILIES_FLUTTER_CANNOT_NAME.includes(name))
      .filter((name) => !monoFontFamily.startsWith(name))
      .map((name) =>
        name.startsWith("Pretendard") ? bundledFontPath(sansFontFamily, fontPackage) : name,
      ),
  ),
];

const dartTypographyFormatter = ({ dictionary }) => {
  const palette = buildPalette(dictionary);
  const [sansFontFamily] = fontStack(dictionary, "sans");
  const [monoFontFamily, ...monoFallback] = fontStack(dictionary, "mono");
  const fontPackage = "ids_flutter";
  const members = [
    `  static const sansFontFamily = '${sansFontFamily}';`,
    `  static const sansFontPackage = '${fontPackage}';`,
    `  static const monoFontFamily = '${bundledFontPath(monoFontFamily, fontPackage)}';`,
    `  static const monoFontFamilyFallback = ${dartList(
      flutterFallback(monoFallback, monoFontFamily, sansFontFamily, fontPackage),
    )};`,
    ...readTypographyEntries(palette).map(
      ({ name, fontSize, fontWeight, lineHeight, letterSpacing }) =>
        `  static const ${toCamel(name)} = ${render(T_DART_TEXT_STYLE, {
          FONT_FAMILY: sansFontFamily,
          FONT_PACKAGE: fontPackage,
          FONT_SIZE: parseFloat(fontSize),
          FONT_WEIGHT: parseInt(fontWeight),
          LINE_HEIGHT: lineHeightAsMultiplier(lineHeight, fontSize),
          LETTER_SPACING: Number(letterSpacingToPx(letterSpacing, fontSize).toFixed(4)),
        })};`,
    ),
  ];
  return render(T_DART_ABSTRACT_CLASS, {
    NAME: "IdsTypography",
    MEMBERS: members.join("\n"),
  });
};

return {
    "../flutter/lib/tokens/ids_enums.dart": dartEnumsFormatter({ dictionary: legacy.jsDictionary }),
    "../flutter/lib/tokens/ids_color_roles.dart": dartColorRolesFormatter({ dictionary: legacy.jsDictionary }),
    "../flutter/lib/tokens/ids_motion.dart": dartMotionFormatter({ dictionary: legacy.jsDictionary }),
    "../flutter/lib/tokens/ids_component_tokens.dart": dartComponentTokensFormatter({ dictionary: legacy.jsDictionary }),
    "../flutter/lib/tokens/ids_typography.dart": dartTypographyFormatter({ dictionary: legacy.jsDictionary }),
  };
}
