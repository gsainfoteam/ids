import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

const _variants = [
  IdsVariant.ghost,
  IdsVariant.outline,
  IdsVariant.soft,
  IdsVariant.solid,
  IdsVariant.glossy,
];
const _schemes = [
  IdsColorScheme.primary,
  IdsColorScheme.secondary,
  IdsColorScheme.tertiary,
  IdsColorScheme.neutral,
  IdsColorScheme.danger,
  IdsColorScheme.success,
  IdsColorScheme.warning,
  IdsColorScheme.info,
];

final iconToggleUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final variant = context.knobs.object.dropdown(
        label: 'Variant',
        options: _variants,
      );
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
      );
      final scheme = context.knobs.object.dropdown(
        label: 'Color scheme',
        options: _schemes,
      );
      final disabled = context.knobs.boolean(label: 'Disabled');
      final pressed = context.knobs.boolean(label: 'Default pressed');
      final focusableWhenDisabled = context.knobs.boolean(
        label: 'Focusable when disabled',
      );
      return themed(
        context,
        Center(
          child: IdsIconToggle(
            key: ValueKey(pressed),
            variant: variant,
            size: size,
            colorScheme: scheme,
            disabled: disabled,
            defaultPressed: pressed,
            focusableWhenDisabled: focusableWhenDisabled,
            semanticLabel: context.strings.demo.iconToggleSample.favorite,
            icon: const _Glyph('star'),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 12,
          children: [
            const Text('Variant × Pressed'),
            Text(
              context.strings.demo.iconToggleSample.theoffstateisunderstated,
            ),
            _headings(),
            for (final pressed in [false, true])
              galleryRow(pressed ? 'on' : 'off', [
                for (final variant in _variants)
                  IdsIconToggle(
                    variant: variant,
                    defaultPressed: pressed,
                    semanticLabel: context.strings.demo.iconToggleSample.bold,
                    icon: const _Glyph('bold'),
                  ),
              ]),
            const Text('Variant × Size (pressed)'),
            _headings(),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                for (final variant in _variants)
                  SizedBox(
                    width: 36,
                    child: Center(
                      child: IdsIconToggle(
                        variant: variant,
                        size: size,
                        defaultPressed: true,
                        semanticLabel:
                            context.strings.demo.iconToggleSample.italic,
                        icon: const _Glyph('italic'),
                      ),
                    ),
                  ),
              ]),
            const Text('Color scheme (pressed)'),
            _headings(),
            for (final colorScheme in _schemes)
              galleryRow(colorScheme.name, [
                for (final variant in _variants)
                  IdsIconToggle(
                    variant: variant,
                    colorScheme: colorScheme,
                    defaultPressed: true,
                    semanticLabel: colorScheme.name,
                    icon: const _Glyph('star'),
                  ),
              ]),
            const Text('States'),
            galleryRow('disabled', [
              IdsIconToggle(
                disabled: true,
                semanticLabel: context.strings.demo.iconToggleSample.favorite,
                icon: _Glyph('star'),
              ),
              IdsIconToggle(
                disabled: true,
                defaultPressed: true,
                semanticLabel: context.strings.demo.iconToggleSample.favorite,
                icon: _Glyph('star'),
              ),
              IdsIconToggle(
                variant: IdsVariant.outline,
                disabled: true,
                defaultPressed: true,
                semanticLabel: context.strings.demo.iconToggleSample.favorite,
                icon: _Glyph('star'),
              ),
            ]),
            galleryRow('state icon', [
              IdsIconToggle.builder(
                semanticLabel: context.strings.demo.iconToggleSample.like,
                defaultPressed: true,
                icon: (_, state) =>
                    _Glyph(state.pressed ? 'heart' : 'heart-outline'),
              ),
              IdsIconToggle.builder(
                semanticLabel: context.strings.demo.iconToggleSample.like,
                icon: (_, state) =>
                    _Glyph(state.pressed ? 'heart' : 'heart-outline'),
              ),
            ]),
          ],
        ),
      ),
      width: 490,
    ),
  ),
  WidgetbookUseCase(
    name: 'Accessible labels',
    builder: (context) => themed(
      context,
      Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            IdsIconToggle(icon: _Glyph('pin'), semanticLabel: 'Pin'),
            IdsIconToggle(icon: _Glyph('bold'), semanticLabel: 'Bold'),
            IdsIconToggle(
              icon: _Glyph('list', label: 'List'),
              semanticLabel: context.strings.demo.iconToggleSample.listView,
            ),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'State icon',
    builder: (context) => themed(
      context,
      Center(
        child: Builder(
          builder: (context) {
            final colors = IdsProvider.of(context).colors;
            return IdsIconToggle.builder(
              semanticLabel: context.strings.demo.iconToggleSample.like,
              variant: IdsVariant.soft,
              colorScheme: IdsColorScheme.danger,
              style: (state, base) => state.pressed
                  ? ShapeDecoration(
                      color: Color.lerp(
                        colors.bgDangerSoft,
                        colors.bgDangerSolid,
                        IdsStateOpacity.tintHover,
                      ),
                      shape: base.shape,
                    )
                  : base,
              icon: (_, state) =>
                  _Glyph(state.pressed ? 'heart' : 'heart-outline'),
            );
          },
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Controlled',
    builder: (context) {
      var grid = false;
      return themed(
        context,
        StatefulBuilder(
          builder: (context, setState) => Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              spacing: 12,
              children: [
                IdsIconToggle(
                  variant: IdsVariant.outline,
                  pressed: grid,
                  onPressedChange: (next) => setState(() => grid = next),
                  semanticLabel: context.strings.demo.iconToggleSample.gridView,
                  icon: _Glyph(grid ? 'grid' : 'list'),
                ),
                Text(
                  grid
                      ? context.strings.demo.iconToggleSample.grid
                      : context.strings.demo.iconToggleSample.list,
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Square',
    builder: (context) => themed(
      context,
      Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            IdsIconToggle(
              variant: IdsVariant.outline,
              icon: _Glyph('star'),
              semanticLabel: context.strings.demo.iconToggleSample.star,
            ),
            IdsIconToggle(
              variant: IdsVariant.outline,
              defaultPressed: true,
              icon: _Glyph('star'),
              semanticLabel: context.strings.demo.iconToggleSample.star,
            ),
            IdsIconToggle(
              size: IdsSize.tiny,
              icon: _Glyph('star'),
              semanticLabel: context.strings.demo.iconToggleSample.star,
            ),
          ],
        ),
      ),
    ),
  ),
];

class _Glyph extends StatelessWidget {
  const _Glyph(this.name, {this.label});

  final String name;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);
    return SvgPicture.asset(
      'assets/icon_toggle/$name.svg',
      width: theme.size,
      height: theme.size,
      colorFilter: ColorFilter.mode(theme.color!, BlendMode.srcIn),
      semanticsLabel: label,
      excludeFromSemantics: label == null,
    );
  }
}

Widget _headings() => galleryRow('', [
  for (final variant in _variants)
    SizedBox(
      width: 36,
      child: FittedBox(fit: BoxFit.scaleDown, child: Text(variant.name)),
    ),
]);
