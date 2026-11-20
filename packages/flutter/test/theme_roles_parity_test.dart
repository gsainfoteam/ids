import 'dart:convert';
import 'dart:io';

import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Color _color(String hex) =>
    Color(int.parse(hex.substring(1), radix: 16) | 0xFF000000);

String _hex(Color color) =>
    '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';

Map<String, dynamic> _readJson(String path) =>
    jsonDecode(File(path).readAsStringSync()) as Map<String, dynamic>;

void main() {
  final fixture = _readJson('../core/tests/fixtures/theme-roles.json');
  final roles = (fixture['roles'] as List).cast<String>();
  final components = (fixture['components'] as List).cast<String>();

  test('the fixture lists every Dart color role', () {
    expect(roles, IdsColorRoles.all);
  });

  test('the fixture lists every Dart component color', () {
    expect(
      components,
      IdsComponentTokens.colorRoles[IdsMode.light]!.keys.toList(),
    );
  });

  for (final theme
      in (fixture['themes'] as List).cast<Map<String, dynamic>>()) {
    final name = '${theme['primary']}, ${theme['neutral']}, ${theme['status']}';

    test('$name resolves the roles ids-react resolves', () {
      final resolved = IdsTheme(
        primary: IdsThemeColor.seed(_color(theme['seed'] as String)),
        neutral: IdsNeutral.values.byName(theme['neutral'] as String),
        status: theme['status'] == 'fixed'
            ? IdsStatus.fixed
            : IdsStatus.harmonized,
      );

      for (final mode in [IdsMode.light, IdsMode.dark]) {
        final resolvedInMode = IdsResolvedTheme(theme: resolved, mode: mode);
        final colors = resolvedInMode.colors;
        final componentColors = resolvedInMode.componentColors.tokens;
        expect(
          {for (final role in roles) role: _hex(colors[role])},
          {
            for (final (index, role) in roles.indexed)
              role: (theme[mode.name] as List)[index],
          },
          reason: mode.name,
        );
        expect(
          {
            for (final token in components)
              token: _hex(componentColors[token]!),
          },
          {
            for (final (index, token) in components.indexed)
              token:
                  ((theme['components'] as Map<String, dynamic>)[mode.name]
                      as List)[index],
          },
          reason: '${mode.name} component tokens',
        );
      }
    });
  }
}
