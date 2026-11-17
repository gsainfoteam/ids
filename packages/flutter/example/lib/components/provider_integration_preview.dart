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
  bool purpleBrand = false;
  bool childOverride = false;
  bool darkDefault = false;
  double radius = 10;

  @override
  Widget build(BuildContext context) {
    final translations = Translations.of(context);

    return IdsProvider(
      theme: IdsTheme(primary: purpleBrand ? purple : blue, radius: radius),
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
                    onPressed: () => setState(() => purpleBrand = !purpleBrand),
                    child: const Text('Change primary'),
                  ),
                  TextButton(
                    onPressed: () =>
                        setState(() => radius = radius == 10 ? 18 : 10),
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
                    onPressed: () => setState(() => darkDefault = !darkDefault),
                    child: const Text('Change default mode'),
                  ),
                ],
              ),
              const ScopeReadout(name: 'Parent'),
              IdsProviderScope(
                theme: childOverride
                    ? const IdsThemeOverrides(
                        radius: 2,
                        cornerShape: IdsCornerShape.squircle,
                      )
                    : null,
                translation: childOverride
                    ? AppLocale.en.buildSync().ids
                    : null,
                locale: childOverride ? const Locale('fr') : null,
                child: const ScopeReadout(name: 'Child'),
              ),
              IdsProviderScope(
                defaultMode: darkDefault ? IdsMode.dark : IdsMode.light,
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
    final ids = IdsProvider.of(context);
    final text = ids.textStyle(
      IdsTypography.bodyB3Regular,
      color: ids.colors.textOnPrimarySoft,
    );

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: DecoratedBox(
        decoration: ShapeDecoration(
          color: ids.colors.bgPrimarySoft,
          shape: ids.shape(),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Label(child: Text('${widget.name} Aa Wi 0123 한글')),
              Text(
                '${widget.name}: count $count, radius ${ids.radius.standard}, locale ${ids.locale}, corner ${ids.cornerShape.name}',
                style: text,
              ),
              Text(
                '${ids.translation?.spinnerLabel ?? IdsMessages.ko.spinnerLabel} / ${ids.translation?.dialogClose ?? IdsMessages.ko.dialogClose}',
                style: text,
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
    final ids = IdsProvider.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Default scope: ${ids.mode.name}'),
        TextButton(
          onPressed: () => ids.setMode(IdsMode.dark),
          child: const Text('Select dark'),
        ),
      ],
    );
  }
}
