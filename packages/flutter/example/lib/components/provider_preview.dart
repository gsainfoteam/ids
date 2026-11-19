import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';

import '../ids_theme.dart';

String hexOf(Color color) =>
    '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';

class ProviderPreview extends StatelessWidget {
  const ProviderPreview({
    super.key,
    required this.theme,
    required this.mode,
    this.translation,
    this.locale = const Locale('ko', 'KR'),
    this.textScale,
  });

  final IdsTheme theme;
  final IdsMode mode;
  final IdsMessages? translation;
  final Locale locale;
  final double? textScale;

  @override
  Widget build(BuildContext context) {
    final child = IdsProvider(
      theme: theme,
      mode: mode,
      translation: translation,
      locale: locale,
      child: Builder(
        builder: (context) {
          final ids = IdsProvider.of(context);
          final colors = ids.colors;
          TextStyle body(Color color) =>
              ids.textStyle(IdsTypography.bodyB3Regular, color: color);
          return Material(
            color: colors.bgNeutralSubtlest,
            textStyle: body(colors.textNeutralBold),
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
                      Text('IDS locale: ${ids.locale}'),
                      Text('Mode: ${ids.mode.name} → ${ids.resolvedMode.name}'),
                      Text(
                        'Text scale: ${MediaQuery.textScalerOf(context).scale(16) / 16}',
                      ),
                      const IdsLabel(
                        required: true,
                        child: Text('IDS sans: Aa Wi 0123 한글'),
                      ),
                      Text(
                        'IDS mono: Aa Wi 0123',
                        style: ids.textStyle(
                          IdsTypography.bodyB3Regular,
                          color: colors.textNeutralBold,
                          mono: true,
                        ),
                      ),
                      for (final family in IdsColorRoles.families)
                        _FamilySwatch(family: family, colors: colors),
                      Text(
                        ids.translation?.spinnerLabel ??
                            IdsMessages.ko.spinnerLabel,
                      ),
                      const IdsSpinner(),
                      const IdsDivider(),
                      Text(
                        ids.translation?.dialogClose ??
                            IdsMessages.ko.dialogClose,
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

class _FamilySwatch extends StatelessWidget {
  const _FamilySwatch({required this.family, required this.colors});

  final String family;
  final IdsColors colors;

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    Color role(String name) => colors[name];
    TextStyle on(String name) =>
        ids.textStyle(IdsTypography.bodyB3Medium, color: role(name));
    return Row(
      spacing: 8,
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: ShapeDecoration(
              color: role('bg-$family'),
              shape: ids.shape(),
            ),
            child: Text(
              '$family ${hexOf(role('bg-$family'))}',
              style: on('text-on-$family'),
            ),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: ShapeDecoration(
              color: role('bg-$family-subtle'),
              shape: ids.shape(side: BorderSide(color: role('border-$family'))),
            ),
            child: Text('$family subtle', style: on('text-on-$family-subtle')),
          ),
        ),
        Expanded(child: Text(family, style: on('text-$family'))),
      ],
    );
  }
}

class NestedProviderPreview extends StatelessWidget {
  const NestedProviderPreview({super.key, required this.mode});

  final IdsMode mode;

  @override
  Widget build(BuildContext context) => IdsProvider(
    theme: appTheme,
    defaultMode: mode,
    child: Material(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          spacing: 16,
          children: [
            const Text('Service text stays outside IDS styling'),
            const ScopePreview(name: 'Parent'),
            const IdsProviderScope(
              child: ScopePreview(name: 'Inherited child'),
            ),
            IdsProviderScope(
              theme: const IdsThemeOverrides(primary: purple),
              defaultMode: mode,
              child: const ScopePreview(name: 'Isolated child'),
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
    final ids = IdsProvider.of(context);
    final colors = ids.colors;
    return Container(
      width: 360,
      padding: const EdgeInsets.all(16),
      decoration: ShapeDecoration(
        color: colors.bgPrimarySubtle,
        shape: ids.shape(radius: ids.radius.container),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: [
          IdsLabel(child: Text(name)),
          Text(
            '${ids.theme.primary == blue ? 'Blue' : 'Purple'} / ${ids.resolvedMode.name}',
            style: ids.textStyle(
              IdsTypography.bodyB3Regular,
              color: colors.textOnPrimarySubtle,
            ),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: colors.bgPrimary,
              foregroundColor: colors.textOnPrimary,
            ),
            onPressed: ids.toggleMode,
            child: Text('Toggle $name mode'),
          ),
        ],
      ),
    );
  }
}
