import 'package:flutter/material.dart';
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

final toggleUseCases = [
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
      final color = context.knobs.object.dropdown(
        label: 'Color scheme',
        options: _schemes,
      );
      final pressed = context.knobs.boolean(label: 'Default pressed');
      final disabled = context.knobs.boolean(label: 'Disabled');
      final focusableWhenDisabled = context.knobs.boolean(
        label: 'Focusable when disabled',
      );
      return themed(
        context,
        Center(
          child: IdsToggle(
            key: ValueKey(pressed),
            variant: variant,
            size: size,
            colorScheme: color,
            defaultPressed: pressed,
            disabled: disabled,
            focusableWhenDisabled: focusableWhenDisabled,
            child: Text(context.strings.demo.toggleSample.bold),
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
            Text(context.strings.demo.toggleSample.theoffstateisquiet),
            _headings(),
            for (final state in [false, true])
              galleryRow(state ? 'on' : 'off', [
                for (final variant in _variants)
                  _cell(
                    IdsToggle(
                      variant: variant,
                      defaultPressed: state,
                      leading: const Icon(Icons.format_bold),
                      child: Text(context.strings.demo.toggleSample.bold),
                    ),
                  ),
              ]),
            const Text('Variant × Size'),
            _headings(),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                for (final variant in _variants)
                  _cell(
                    IdsToggle(
                      size: size,
                      variant: variant,
                      defaultPressed: true,
                      child: Text(variant.name),
                    ),
                  ),
              ]),
            const Text('Color scheme (pressed)'),
            _headings(),
            for (final colorScheme in _schemes)
              galleryRow(colorScheme.name, [
                for (final variant in _variants)
                  _cell(
                    IdsToggle(
                      variant: variant,
                      colorScheme: colorScheme,
                      defaultPressed: true,
                      leading: const Icon(Icons.star_border),
                      child: Text(colorScheme.name),
                    ),
                  ),
              ]),
            const Text('States'),
            galleryRow('disabled', [
              IdsToggle(
                disabled: true,
                child: Text(context.strings.demo.toggleSample.off),
              ),
              IdsToggle(
                disabled: true,
                defaultPressed: true,
                child: Text(context.strings.demo.toggleSample.on),
              ),
              IdsToggle(
                variant: IdsVariant.outline,
                disabled: true,
                defaultPressed: true,
                child: Text(context.strings.demo.toggleSample.on),
              ),
            ]),
            galleryRow('icon only', [
              IdsToggle(
                semanticLabel: context.strings.demo.toggleSample.bold,
                child: Icon(Icons.format_bold),
              ),
              IdsToggle(
                semanticLabel: context.strings.demo.toggleSample.bold,
                defaultPressed: true,
                child: Icon(Icons.format_bold),
              ),
              IdsToggle(
                semanticLabel: context.strings.demo.toggleSample.bold,
                variant: IdsVariant.outline,
                size: IdsSize.tiny,
                defaultPressed: true,
                child: Icon(Icons.format_bold),
              ),
            ]),
          ],
        ),
      ),
      width: 830,
    ),
  ),
  WidgetbookUseCase(
    name: 'Keyboard',
    builder: (context) => themed(
      context,
      Center(
        child: IdsToggle(child: Text(context.strings.demo.toggleSample.bold)),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Controlled',
    builder: (context) {
      var pressed = false;
      return themed(
        context,
        StatefulBuilder(
          builder: (context, setState) => Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              spacing: 12,
              children: [
                IdsToggle(
                  variant: IdsVariant.outline,
                  pressed: pressed,
                  onPressedChange: (next) => setState(() => pressed = next),
                  semanticLabel: context.strings.demo.toggleSample.showPassword,
                  child: Icon(
                    pressed ? Icons.visibility_off : Icons.visibility,
                  ),
                ),
                Text(
                  pressed ? 'hunter2' : '•••••••',
                  style: IdsProvider.of(context).textStyle(
                    IdsTypography.bodyB3Regular,
                    color: IdsProvider.of(context).colors.textOnSurface,
                    mono: true,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Controlled confirmation',
    builder: (context) {
      var asked = 0;
      return themed(
        context,
        StatefulBuilder(
          builder: (context, setState) => Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              spacing: 12,
              children: [
                IdsToggle(
                  variant: IdsVariant.soft,
                  pressed: true,
                  onPressedChange: (_) {
                    setState(() => asked++);
                  },
                  child: Text(
                    context.strings.demo.toggleSample.muteNotifications,
                  ),
                ),
                Semantics(
                  label: context.strings.demo.toggleSample.confirmationRequest,
                  liveRegion: true,
                  child: Text('$asked'),
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'State children',
    builder: (context) => themed(
      context,
      Center(
        child: Builder(
          builder: (context) => IdsToggle.builder(
            variant: IdsVariant.outline,
            style: (state, base) => state.pressed
                ? ShapeDecoration(
                    color: IdsProvider.of(context).colors.bgInfoSoft,
                    shape: base.shape,
                    shadows: base.shadows,
                  )
                : base,
            builder: (context, state) => Text(
              state.pressed
                  ? context.strings.demo.toggleSample.on
                  : context.strings.demo.toggleSample.off,
            ),
          ),
        ),
      ),
    ),
  ),
];

Widget _headings() => galleryRow('', [
  for (final variant in _variants) _cell(Text(variant.name)),
]);

Widget _cell(Widget child) => SizedBox(
  width: 124,
  child: Align(alignment: AlignmentDirectional.centerStart, child: child),
);
