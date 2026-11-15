import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../i18n/translations.g.dart';
import '../ids_theme.dart';
import 'provider_preview.dart';

final providerUseCases = [
  WidgetbookUseCase(
    name: 'Runtime theme and slang',
    builder: (context) {
      final radius = context.knobs.double.slider(
        label: 'Radius',
        initialValue: 10,
        min: 0,
        max: 24,
      );
      final corner = context.knobs.object.dropdown(
        label: 'Corner shape',
        options: IdsCornerShape.values,
        labelBuilder: (value) => value.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        labelBuilder: (value) => value.name,
      );
      final purple = context.knobs.boolean(label: 'Purple palette');
      final font = context.knobs.object.dropdown(
        label: 'Service font (macOS)',
        options: ['IDS default', 'Helvetica', 'Times'],
      );
      final courier = context.knobs.boolean(label: 'Service mono (Courier)');
      final language = context.knobs.object.dropdown(
        label: 'Translation',
        options: ['Korean', 'English', 'None'],
      );
      final englishLocale = context.knobs.boolean(label: 'English IDS locale');
      final scale = context.knobs.object.dropdown(
        label: 'Text scale (MediaQuery)',
        options: ['System', '1.0', '2.0', '3.0'],
      );
      return ProviderPreview(
        theme: IdsThemeData(
          radius: radius,
          cornerShape: corner,
          fontFamily: font == 'IDS default'
              ? IdsTypography.sansFontFamily
              : font,
          monoFontFamily: courier ? 'Courier' : 'monospace',
        ),
        palette: purple ? purplePalette : brandPalette,
        mode: mode,
        translation: language == 'None'
            ? null
            : (language == 'English' ? AppLocale.en : AppLocale.ko)
                  .buildSync()
                  .ids,
        locale: Locale(englishLocale ? 'en' : 'ko'),
        textScale: double.tryParse(scale),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Nested scopes',
    builder: (context) => NestedProviderPreview(
      mode: context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        labelBuilder: (value) => value.name,
      ),
    ),
  ),
];
