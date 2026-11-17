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
      final primary = context.knobs.object.dropdown(
        label: 'Primary',
        options: [blue, purple],
        labelBuilder: (value) => value == blue ? 'blue' : 'purple',
      );
      final neutral = context.knobs.object.dropdown(
        label: 'Neutral',
        options: IdsNeutral.values,
        labelBuilder: (value) => value.name,
      );
      final status = context.knobs.object.dropdown(
        label: 'Status',
        options: [IdsStatus.harmonized, IdsStatus.fixed],
        labelBuilder: (value) => value.toString(),
      );
      final radius = context.knobs.double.slider(
        label: 'Radius',
        initialValue: 10,
        min: 0,
        max: 18,
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
        theme: IdsTheme(
          primary: primary,
          neutral: neutral,
          status: status,
          radius: radius,
          cornerShape: corner,
        ),
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
