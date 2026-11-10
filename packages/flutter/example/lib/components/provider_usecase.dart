import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../i18n/translations.g.dart';
import '../ids_theme.dart';

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
      final english = context.knobs.boolean(
        label: 'English',
        initialValue: false,
      );
      final IdsMessages translation = (english ? AppLocale.en : AppLocale.ko)
          .buildSync()
          .ids;
      return IdsProvider(
        theme: IdsThemeData(radius: radius, cornerShape: corner),
        palette: brandPalette,
        mode: mode,
        translation: translation,
        locale: Locale(english ? 'en' : 'ko'),
        child: Builder(
          builder: (context) {
            final scope = IdsProvider.of(context);
            final theme = scope.theme;
            return Material(
              color: theme.surface,
              child: Center(
                child: SizedBox(
                  width: 320,
                  child: DecoratedBox(
                    decoration: ShapeDecoration(
                      color: theme.secondary,
                      shape: theme.shape(side: BorderSide(color: theme.border)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        spacing: 16,
                        children: [
                          const IdsLabel(child: Text('IDS')),
                          IconTheme(
                            data: IconThemeData(
                              color: theme.onSecondary,
                              size: 20,
                            ),
                            child: const IdsSpinner(),
                          ),
                          Text(
                            translation.spinnerLabel ??
                                IdsMessages.ko.spinnerLabel,
                            style: theme.textStyle(
                              IdsTypography.bodyB3Regular,
                              color: theme.onSecondary,
                            ),
                          ),
                          const IdsDivider(),
                          Text(
                            translation.dialogClose ??
                                IdsMessages.ko.dialogClose,
                            style: theme.textStyle(
                              IdsTypography.captionC1Regular,
                              color: theme.onSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      );
    },
  ),
];
