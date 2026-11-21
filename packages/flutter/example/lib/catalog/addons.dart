import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../i18n/translations.g.dart';
import 'palettes.dart';
import 'strings.dart';

typedef IdsThemeSetting = ({IdsTheme theme, IdsMode mode});

const _derived = 'derived';

class IdsThemeAddon extends WidgetbookAddon<IdsThemeSetting> {
  IdsThemeAddon() : super(name: 'IDS theme');

  static final _statuses = {
    'harmonized': IdsStatus.harmonized,
    'fixed': IdsStatus.fixed,
  };

  @override
  List<Field> get fields => [
    ObjectDropdownField<IdsMode>(
      name: 'mode',
      values: IdsMode.values,
      initialValue: IdsMode.light,
      labelBuilder: (mode) => mode.name,
    ),
    ObjectDropdownField<String>(
      name: 'primary',
      values: paletteSeeds.keys.toList(),
      initialValue: 'blue',
    ),
    ObjectDropdownField<String>(
      name: 'secondary',
      values: [_derived, ...paletteSeeds.keys],
      initialValue: _derived,
    ),
    ObjectDropdownField<String>(
      name: 'tertiary',
      values: [_derived, ...paletteSeeds.keys],
      initialValue: _derived,
    ),
    ObjectDropdownField<IdsNeutral>(
      name: 'neutral',
      values: IdsNeutral.values,
      initialValue: IdsNeutral.pure,
      labelBuilder: (neutral) => neutral.name,
    ),
    ObjectDropdownField<String>(
      name: 'status',
      values: _statuses.keys.toList(),
      initialValue: 'harmonized',
    ),
    ObjectDropdownField<IdsCornerShape>(
      name: 'corner',
      values: IdsCornerShape.values,
      initialValue: IdsCornerShape.round,
      labelBuilder: (shape) => shape.name,
    ),
  ];

  @override
  IdsThemeSetting valueFromQueryGroup(Map<String, String> group) => (
    theme: IdsTheme(
      primary: paletteSeeds[valueOf<String>('primary', group)]!,
      secondary: paletteSeeds[valueOf<String>('secondary', group)],
      tertiary: paletteSeeds[valueOf<String>('tertiary', group)],
      neutral: valueOf<IdsNeutral>('neutral', group)!,
      status: _statuses[valueOf<String>('status', group)]!,
      cornerShape: valueOf<IdsCornerShape>('corner', group)!,
    ),
    mode: valueOf<IdsMode>('mode', group)!,
  );

  @override
  Widget buildUseCase(
    BuildContext context,
    Widget child,
    IdsThemeSetting setting,
  ) => IdsProvider(
    theme: setting.theme,
    mode: setting.mode,
    child: _Canvas(child: child),
  );
}

class IdsLocaleAddon extends WidgetbookAddon<AppLocale> {
  IdsLocaleAddon() : super(name: 'Locale');

  @override
  List<Field> get fields => [
    ObjectDropdownField<AppLocale>(
      name: 'locale',
      values: AppLocale.values,
      initialValue: AppLocale.ko,
      labelBuilder: (locale) => locale.languageCode,
    ),
  ];

  @override
  AppLocale valueFromQueryGroup(Map<String, String> group) =>
      valueOf<AppLocale>('locale', group)!;

  @override
  Widget buildUseCase(BuildContext context, Widget child, AppLocale setting) =>
      IdsProviderScope(
        locale: setting.flutterLocale,
        translation: setting.translations.ids,
        child: ExampleStrings(locale: setting, child: child),
      );
}

class _Canvas extends StatelessWidget {
  const _Canvas({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    return Material(
      color: ids.colors.bgBase,
      textStyle: ids.textStyle(
        IdsTypography.bodyB3Regular,
        color: ids.colors.textNeutralStrong,
      ),
      child: Padding(
        padding: EdgeInsets.all(ids.dimension(32)),
        child: Align(alignment: AlignmentDirectional.topStart, child: child),
      ),
    );
  }
}
