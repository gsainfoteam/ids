import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../../catalog/palettes.dart';
import '../../catalog/showcase.dart';
import '../../catalog/strings.dart';
import '../../i18n/translations.g.dart';
import 'provider_integration_preview.dart';
import 'provider_preview.dart';

final provider = WidgetbookComponent(
  name: 'IdsProvider',
  useCases: [
    WidgetbookUseCase(
      name: 'Playground',
      builder: (context) {
        final primary = context.knobs.object.dropdown(
          label: 'primary',
          options: paletteSeeds.keys.toList(),
          initialOption: 'blue',
        );
        final secondary = context.knobs.object.dropdown(
          label: 'secondary',
          options: ['derived', ...paletteSeeds.keys],
        );
        final tertiary = context.knobs.object.dropdown(
          label: 'tertiary',
          options: ['derived', ...paletteSeeds.keys],
        );
        final neutral = context.knobs.object.segmented(
          label: 'neutral',
          options: IdsNeutral.values,
          labelBuilder: (value) => value.name,
        );
        final status = context.knobs.object.segmented(
          label: 'status',
          options: [IdsStatus.harmonized, IdsStatus.fixed],
          labelBuilder: (value) =>
              value == IdsStatus.fixed ? 'fixed' : 'harmonized',
        );
        final radius = context.knobs.double.slider(
          label: 'radius',
          initialValue: 10,
          min: 0,
          max: 18,
        );
        final cornerShape = context.knobs.object.segmented(
          label: 'cornerShape',
          options: IdsCornerShape.values,
          labelBuilder: (value) => value.name,
        );
        final scale = context.knobs.double.slider(
          label: 'scale',
          initialValue: 1,
          min: 0.75,
          max: 1.5,
          divisions: 6,
        );
        final mode = context.knobs.object.segmented(
          label: 'mode',
          options: IdsMode.values,
          labelBuilder: (value) => value.name,
        );
        final translation = context.knobs.objectOrNull.segmented(
          label: 'translation',
          description: context.strings.notes.provider.translation,
          options: AppLocale.values,
          labelBuilder: (value) => value.languageCode,
        );
        final locale = context.knobs.object.segmented(
          label: 'locale',
          options: AppLocale.values,
          labelBuilder: (value) => value.languageCode,
        );
        final textScale = context.knobs.doubleOrNull.slider(
          label: 'MediaQuery textScaler',
          initialValue: 1,
          min: 1,
          max: 3,
          divisions: 4,
        );
        return ProviderPreview(
          theme: IdsTheme(
            primary: paletteSeeds[primary]!,
            secondary: paletteSeeds[secondary],
            tertiary: paletteSeeds[tertiary],
            neutral: neutral,
            status: status,
            radius: radius,
            cornerShape: cornerShape,
            scale: scale,
          ),
          mode: mode,
          translation: translation?.translations.ids,
          locale: locale.flutterLocale,
          textScale: textScale,
        );
      },
    ),
    WidgetbookUseCase(
      name: 'Usage',
      builder: (context) => IdsProvider(
        theme: appTheme,
        child: Builder(
          builder: (context) {
            final ids = IdsProvider.of(context);
            return Text(
              context.strings.demo.specimen,
              style: ids.textStyle(
                IdsTypography.bodyB3Regular,
                color: ids.colors.textPrimary,
              ),
            );
          },
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Gallery',
      builder: (context) => Showcase(
        children: [
          ShowcaseSection(
            title: 'Family × Mode',
            description: context.strings.notes.provider.familyByMode,
            children: [
              ShowcaseMatrix(
                rows: IdsColorRoles.families,
                columns: const [IdsMode.light, IdsMode.dark],
                builder: (family, mode) => IdsProviderScope(
                  mode: mode,
                  child: Builder(
                    builder: (context) {
                      final ids = IdsProvider.of(context);
                      return ColoredBox(
                        color: ids.colors.bgBase,
                        child: Padding(
                          padding: EdgeInsets.all(ids.dimension(8)),
                          child: SizedBox(
                            width: ids.dimension(360),
                            child: FamilySwatch(
                              family: family,
                              colors: ids.colors,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
    WidgetbookUseCase(
      name: 'Nest scopes',
      builder: (context) => Example(
        description: context.strings.examples.provider.nestScopes,
        child: NestedProviderPreview(
          mode: IdsProvider.of(context).resolvedMode,
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Connect slang translations',
      builder: (context) => Example(
        description: context.strings.examples.provider.connectSlang,
        child: TranslationProvider(child: const ProviderIntegration()),
      ),
    ),
  ],
);

final providerChecks = WidgetbookComponent(
  name: 'IdsProvider',
  useCases: [
    WidgetbookUseCase(
      name: 'Text scale 3 does not overflow',
      builder: (context) => ProviderPreview(
        theme: appTheme,
        mode: IdsProvider.of(context).mode,
        textScale: 3,
      ),
    ),
  ],
);
