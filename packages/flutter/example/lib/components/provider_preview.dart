import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';

import '../ids_theme.dart';

class ProviderPreview extends StatelessWidget {
  const ProviderPreview({
    super.key,
    required this.theme,
    required this.palette,
    required this.mode,
    this.translation,
    this.locale = const Locale('ko', 'KR'),
    this.textScale,
  });

  final IdsThemeData theme;
  final IdsPalette palette;
  final IdsMode mode;
  final IdsMessages? translation;
  final Locale locale;
  final double? textScale;

  @override
  Widget build(BuildContext context) {
    final child = IdsProvider(
      theme: theme,
      palette: palette,
      mode: mode,
      translation: translation,
      locale: locale,
      child: Builder(
        builder: (context) {
          final scope = IdsProvider.of(context);
          final resolved = scope.theme;
          final sans = resolved.textStyle(IdsTypography.bodyB3Regular);
          final mono = resolved.textStyle(
            IdsTypography.bodyB3Regular,
            mono: true,
          );
          return Material(
            color: resolved.surface,
            textStyle: Theme.of(
              context,
            ).textTheme.bodyMedium!.copyWith(color: resolved.onSurface),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: SizedBox(
                  width: 360,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: 16,
                    children: [
                      Material(
                        color: Theme.of(context).scaffoldBackgroundColor,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              const Text('Service text: Aa Wi 0123'),
                              const Icon(Icons.language),
                              Text(
                                'Service locale: ${Localizations.localeOf(context)}',
                              ),
                            ],
                          ),
                        ),
                      ),
                      Text('IDS locale: ${scope.locale}'),
                      Text(
                        'Mode: ${scope.mode.name} → ${scope.resolvedMode.name}',
                      ),
                      Text(
                        'Text scale: ${MediaQuery.textScalerOf(context).scale(16) / 16}',
                      ),
                      const IdsLabel(
                        required: true,
                        child: Text('IDS sans: Aa Wi 0123 한글'),
                      ),
                      Text(
                        'IDS mono: Aa Wi 0123',
                        style: mono.copyWith(color: resolved.onSurface),
                      ),
                      Text(
                        'Sans: ${sans.fontFamily}',
                        style: TextStyle(color: resolved.onSurface),
                      ),
                      Text(
                        'Mono: ${mono.fontFamily}',
                        style: TextStyle(color: resolved.onSurface),
                      ),
                      for (final role in [
                        ('primary', resolved.primary, resolved.onPrimary),
                        ('secondary', resolved.secondary, resolved.onSecondary),
                        ('neutral', resolved.muted, resolved.onMuted),
                        (
                          'danger',
                          resolved.danger,
                          resolved.resolve('on-danger'),
                        ),
                        (
                          'success',
                          resolved.resolve('success'),
                          resolved.resolve('on-success'),
                        ),
                        (
                          'warning',
                          resolved.resolve('warning'),
                          resolved.resolve('on-warning'),
                        ),
                        (
                          'info',
                          resolved.resolve('info'),
                          resolved.resolve('on-info'),
                        ),
                      ])
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: ShapeDecoration(
                            color: role.$2,
                            shape: resolved.shape(),
                          ),
                          child: Text(
                            '${role.$1}: ${role.$2.toARGB32().toRadixString(16)}',
                            style: resolved.textStyle(
                              IdsTypography.bodyB3Regular,
                              color: role.$3,
                            ),
                          ),
                        ),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: ShapeDecoration(
                          shape: resolved.shape(
                            side: BorderSide(color: resolved.outline, width: 2),
                          ),
                        ),
                        child: Text(
                          'accent / outline',
                          style: resolved.textStyle(
                            IdsTypography.bodyB3Regular,
                            color: resolved.accent,
                          ),
                        ),
                      ),
                      IconTheme(
                        data: IconThemeData(color: resolved.accent, size: 24),
                        child: const IdsSpinner(),
                      ),
                      Text(
                        scope.translation?.spinnerLabel ??
                            IdsMessages.ko.spinnerLabel,
                        style: resolved.textStyle(
                          IdsTypography.bodyB3Regular,
                          color: resolved.onSurface,
                        ),
                      ),
                      const IdsDivider(),
                      Text(
                        scope.translation?.dialogClose ??
                            IdsMessages.ko.dialogClose,
                        style: resolved.textStyle(
                          IdsTypography.captionC1Regular,
                          color: resolved.onSurface,
                        ),
                      ),
                      IconTheme(
                        data: IconThemeData(color: resolved.accent),
                        child: const IdsSpinner(decorative: true),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
    return textScale == null
        ? child
        : MediaQuery(
            data: MediaQuery.of(
              context,
            ).copyWith(textScaler: TextScaler.linear(textScale!)),
            child: child,
          );
  }
}

class NestedProviderPreview extends StatelessWidget {
  const NestedProviderPreview({super.key, required this.mode});

  final IdsMode mode;

  @override
  Widget build(BuildContext context) => IdsProvider(
    theme: appTheme,
    defaultPalette: brandPalette,
    mode: mode,
    child: Material(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          spacing: 16,
          children: [
            const Text('Service text stays outside IDS styling'),
            const ScopePreview(name: 'Parent'),
            const IdsProvider(child: ScopePreview(name: 'Inherited child')),
            const IdsProvider(
              defaultPalette: purplePalette,
              child: ScopePreview(name: 'Isolated child'),
            ),
            const ScopePreview(name: 'Sibling'),
          ],
        ),
      ),
    ),
  );
}

class ScopePreview extends StatelessWidget {
  const ScopePreview({super.key, required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    final theme = scope.theme;
    return Container(
      width: 360,
      padding: const EdgeInsets.all(16),
      color: theme.secondary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: [
          IdsLabel(child: Text(name)),
          Text(
            '${scope.palette == brandPalette ? 'Blue' : 'Purple'} / ${scope.resolvedMode.name}',
            style: theme.textStyle(
              IdsTypography.bodyB3Regular,
              color: theme.onSecondary,
            ),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: theme.primary,
              foregroundColor: theme.onPrimary,
            ),
            onPressed: () => scope.setColor(
              scope.palette == brandPalette ? purplePalette : brandPalette,
            ),
            child: Text('Change $name palette'),
          ),
        ],
      ),
    );
  }
}
