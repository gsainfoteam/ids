import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../i18n/translations.g.dart';
import '../ids_theme.dart';

final providerIntegrationUseCases = [
  WidgetbookUseCase(
    name: 'Service integration',
    builder: (context) =>
        TranslationProvider(child: const ProviderIntegration()),
  ),
];

class ProviderIntegration extends StatefulWidget {
  const ProviderIntegration({super.key});

  @override
  State<ProviderIntegration> createState() => _ProviderIntegrationState();
}

class _ProviderIntegrationState extends State<ProviderIntegration> {
  int font = 0;
  bool purple = false;
  bool childOverride = false;
  bool defaults = false;
  double radius = 10;

  @override
  Widget build(BuildContext context) {
    final translations = Translations.of(context);
    final theme = IdsThemeData(
      radius: radius,
      fontFamily: switch (font) {
        1 => 'App Poppins',
        2 => 'Poppins',
        _ => IdsTypography.sansFontFamily,
      },
      fontPackage: font == 2 ? 'widgetbook' : null,
    );
    return IdsProvider(
      theme: theme,
      palette: purple ? purplePalette : brandPalette,
      translation: translations.ids,
      locale: Locale(LocaleSettings.currentLocale.languageCode),
      child: Material(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 8,
                children: [
                  TextButton(
                    onPressed: () => setState(() => purple = !purple),
                    child: const Text('Change palette'),
                  ),
                  TextButton(
                    onPressed: () => setState(() => font = (font + 1) % 3),
                    child: const Text('Change font'),
                  ),
                  TextButton(
                    onPressed: () =>
                        setState(() => radius = radius == 10 ? 24 : 10),
                    child: const Text('Change radius'),
                  ),
                  TextButton(
                    onPressed: () => LocaleSettings.setLocale(
                      LocaleSettings.currentLocale == AppLocale.ko
                          ? AppLocale.en
                          : AppLocale.ko,
                    ),
                    child: const Text('Change language'),
                  ),
                  TextButton(
                    onPressed: () =>
                        setState(() => childOverride = !childOverride),
                    child: const Text('Toggle child override'),
                  ),
                  TextButton(
                    onPressed: () => setState(() => defaults = !defaults),
                    child: const Text('Change defaults'),
                  ),
                ],
              ),
              const ScopeReadout(name: 'Parent'),
              IdsProvider(
                theme: childOverride
                    ? const IdsThemeData(radius: 2, fontFamily: 'App Poppins')
                    : null,
                translation: childOverride
                    ? AppLocale.en.buildSync().ids
                    : null,
                locale: childOverride ? const Locale('fr') : null,
                child: const ScopeReadout(name: 'Child'),
              ),
              IdsProvider(
                defaultPalette: defaults ? purplePalette : brandPalette,
                defaultMode: defaults ? IdsMode.dark : IdsMode.light,
                child: const DefaultReadout(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ScopeReadout extends StatefulWidget {
  const ScopeReadout({super.key, required this.name});
  final String name;

  @override
  State<ScopeReadout> createState() => _ScopeReadoutState();
}

class _ScopeReadoutState extends State<ScopeReadout> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    final theme = scope.theme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: DecoratedBox(
        decoration: ShapeDecoration(
          color: theme.secondary,
          shape: theme.shape(),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IdsLabel(child: Text('${widget.name} Aa Wi 0123 한글')),
              Text(
                '${widget.name}: count $count, radius ${theme.radius.standard}, locale ${scope.locale}, font ${theme.textStyle(IdsTypography.bodyB3Regular).fontFamily}',
                style: theme.textStyle(
                  IdsTypography.bodyB3Regular,
                  color: theme.onSecondary,
                ),
              ),
              Text(
                '${scope.translation?.spinnerLabel ?? IdsMessages.ko.spinnerLabel} / ${scope.translation?.dialogClose ?? IdsMessages.ko.dialogClose}',
                style: theme.textStyle(
                  IdsTypography.bodyB3Regular,
                  color: theme.onSecondary,
                ),
              ),
              TextButton(
                onPressed: () => setState(() => count++),
                child: Text('Increment ${widget.name}'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class DefaultReadout extends StatelessWidget {
  const DefaultReadout({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Default scope: ${scope.palette == brandPalette ? 'blue' : 'purple'} / ${scope.mode.name}',
        ),
        TextButton(
          onPressed: () {
            scope.setColor(purplePalette);
            scope.setMode(IdsMode.dark);
          },
          child: const Text('Select purple and dark'),
        ),
      ],
    );
  }
}
