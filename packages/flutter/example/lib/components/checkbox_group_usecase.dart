import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

const _skills = [
  ('js', 'JavaScript'),
  ('ts', 'TypeScript'),
  ('py', 'Python'),
  ('rs', 'Rust'),
];
String _selectionError(BuildContext context) =>
    context.strings.demo.checkboxGroupSample.selectAtLeastOneOption;

final checkboxGroupUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final orientation = context.knobs.object.dropdown(
        label: 'Orientation',
        options: Axis.values,
        initialOption: Axis.vertical,
      );
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
      );
      final variant = context.knobs.object.dropdown(
        label: 'Variant',
        options: const [IdsVariant.outline, IdsVariant.soft],
      );
      return themed(
        context,
        Center(
          child: _skillsGroup(
            context,
            orientation: orientation,
            size: size,
            variant: variant,
            defaultValue: const ['ts'],
            disabled: context.knobs.boolean(label: 'Disabled'),
            readOnly: context.knobs.boolean(label: 'Read only'),
            required: context.knobs.boolean(label: 'Required'),
            invalid: context.knobs.boolean(label: 'Invalid'),
          ),
        ),
        width: 560,
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
            const Text('Orientation × Size'),
            galleryRow('', const [
              SizedBox(width: 102, child: Text('vertical')),
              Text('horizontal'),
            ]),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                SizedBox(width: 102, child: _skillsGroup(context, size: size)),
                _skillsGroup(context, size: size, orientation: Axis.horizontal),
              ]),
            const Text('States'),
            galleryRow('soft', [
              _skillsGroup(
                context,
                orientation: Axis.horizontal,
                variant: IdsVariant.soft,
                defaultValue: const ['ts'],
              ),
            ]),
            galleryRow('invalid', [
              _skillsGroup(
                context,
                orientation: Axis.horizontal,
                invalid: true,
                defaultValue: const ['ts'],
              ),
            ]),
            galleryRow('disabled', [
              _skillsGroup(
                context,
                orientation: Axis.horizontal,
                disabled: true,
                defaultValue: const ['ts'],
              ),
            ]),
            galleryRow('readOnly', [
              _skillsGroup(
                context,
                orientation: Axis.horizontal,
                readOnly: true,
                defaultValue: const ['ts'],
              ),
            ]),
            const Text('Composition'),
            galleryRow('select all', [_selectAll(context)]),
            galleryRow('grid', [
              IdsCheckboxGroup(
                semanticLabel: context
                    .strings
                    .demo
                    .checkboxGroupSample
                    .technologiesOfInterest,
                defaultValue: const ['py'],
                children: [
                  for (final start in [0, 2])
                    Wrap(
                      spacing: 24,
                      children: [
                        for (final skill in _skills.skip(start).take(2))
                          SizedBox(width: 110, child: _item(skill)),
                      ],
                    ),
                ],
              ),
            ]),
            galleryRow('Field', [
              SizedBox(
                width: 240,
                child: IdsField(
                  children: [
                    IdsFieldLabel(
                      child: Text(
                        context
                            .strings
                            .demo
                            .checkboxGroupSample
                            .technologiesOfInterest,
                      ),
                    ),
                    IdsFieldDescription(
                      child: Text(
                        context
                            .strings
                            .demo
                            .checkboxGroupSample
                            .youCanSelectMoreThanOne,
                      ),
                    ),
                    _skillsGroup(context, defaultValue: const ['js']),
                  ],
                ),
              ),
            ]),
          ],
        ),
      ),
      width: 680,
    ),
  ),
  WidgetbookUseCase(
    name: 'Select all',
    builder: (context) => themed(context, Center(child: _selectAll(context))),
  ),
  WidgetbookUseCase(
    name: 'Keyboard',
    builder: (context) => themed(
      context,
      Center(child: _skillsGroup(context, defaultValue: const ['ts'])),
    ),
  ),
  WidgetbookUseCase(
    name: 'Native form',
    builder: (context) =>
        themed(context, const Center(child: _CheckboxGroupForm())),
  ),
  WidgetbookUseCase(
    name: 'Custom form validation',
    builder: (context) => themed(
      context,
      const Center(child: _CheckboxGroupForm(customValidation: true)),
    ),
  ),
  WidgetbookUseCase(
    name: 'Read only',
    builder: (context) => themed(
      context,
      Center(
        child: _skillsGroup(
          context,
          defaultValue: const ['ts'],
          readOnly: true,
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Plain children',
    builder: (context) => themed(
      context,
      Center(
        child: IdsCheckboxGroup<String>(
          semanticLabel: context.strings.demo.checkboxGroupSample.notifications,
          defaultValue: const ['mail'],
          children: [
            IdsCheckboxGroupAll(
              label: context.strings.demo.checkboxGroupSample.allItems,
            ),
            IdsCheckbox(
              value: 'mail',
              label: context.strings.demo.checkboxGroupSample.mail,
            ),
            IdsCheckbox(
              value: 'push',
              label: context.strings.demo.checkboxGroupSample.pushNotifications,
            ),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'State style',
    builder: (context) => themed(
      context,
      Center(
        child: IdsCheckboxGroup<String>(
          semanticLabel:
              context.strings.demo.checkboxGroupSample.technologiesOfInterest,
          defaultValue: const ['ts'],
          style: (context, state, child) {
            final theme = IdsProvider.of(context);
            return DecoratedBox(
              decoration: BoxDecoration(
                color: state.value.length > 1
                    ? theme.colors.bgPrimarySoft
                    : null,
              ),
              child: Padding(
                padding: EdgeInsets.all(theme.dimension(12)),
                child: child,
              ),
            );
          },
          children: [for (final skill in _skills) _item(skill)],
        ),
      ),
    ),
  ),
];

class _CheckboxGroupForm extends StatefulWidget {
  const _CheckboxGroupForm({this.customValidation = false});

  final bool customValidation;

  @override
  State<_CheckboxGroupForm> createState() => _CheckboxGroupFormState();
}

class _CheckboxGroupFormState extends State<_CheckboxGroupForm> {
  final _form = GlobalKey<FormState>();
  final _focus = FocusNode();
  String _submitted = '';

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  void _submit() {
    final form = _form.currentState!;
    if (form.validate()) {
      form.save();
    } else {
      _focus.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context);
    final custom = widget.customValidation;
    return Form(
      key: _form,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: [
          IdsField(
            required: !custom,
            children: [
              IdsFieldLabel(
                child: Text(
                  context
                      .strings
                      .demo
                      .checkboxGroupSample
                      .technologiesOfInterest,
                ),
              ),
              IdsCheckboxGroup(
                focusNode: _focus,
                validator: custom
                    ? (values) =>
                          values!.isEmpty ? _selectionError(context) : null
                    : null,
                onSaved: (values) => setState(() {
                  final selected = values ?? const <String>[];
                  _submitted = custom
                      ? selected.join(', ')
                      : jsonEncode([
                          for (final skill in _skills)
                            if (selected.contains(skill.$1))
                              ['skills', skill.$1],
                        ]);
                }),
                children: [for (final skill in _skills) _item(skill)],
              ),
              if (custom) IdsFieldError(child: Text(_selectionError(context))),
            ],
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: [
              IdsButton(
                onPressed: _submit,
                child: Text(
                  custom
                      ? context.strings.demo.checkboxGroupSample.save
                      : context.strings.demo.checkboxGroupSample.submit,
                ),
              ),
              if (!custom)
                IdsButton(
                  variant: IdsVariant.outline,
                  onPressed: () => _form.currentState!.reset(),
                  child: Text(context.strings.demo.checkboxGroupSample.reset),
                ),
            ],
          ),
          Semantics(
            label: custom
                ? context.strings.demo.checkboxGroupSample.saveResult
                : context.strings.demo.checkboxGroupSample.submissionResult,
            liveRegion: true,
            child: Text(
              _submitted,
              style: custom
                  ? null
                  : theme.textStyle(
                      IdsTypography.bodyB3Regular,
                      color: theme.colors.textOnSurface,
                      mono: true,
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

Widget _skillsGroup(
  BuildContext context, {
  Axis orientation = Axis.vertical,
  IdsSize? size,
  IdsVariant? variant,
  List<String> defaultValue = const ['js', 'rs'],
  bool invalid = false,
  bool disabled = false,
  bool readOnly = false,
  bool required = false,
}) => IdsCheckboxGroup(
  semanticLabel:
      context.strings.demo.checkboxGroupSample.technologiesOfInterest,
  orientation: orientation,
  size: size,
  variant: variant,
  defaultValue: defaultValue,
  invalid: invalid,
  disabled: disabled,
  readOnly: readOnly,
  required: required,
  children: [for (final skill in _skills) _item(skill, disabled: disabled)],
);

Widget _selectAll(BuildContext context) => IdsCheckboxGroup<String>(
  semanticLabel:
      context.strings.demo.checkboxGroupSample.technologiesOfInterest,
  defaultValue: const ['js'],
  children: [
    IdsCheckboxGroupAll(
      label: context.strings.demo.checkboxGroupSample.selectAll,
      builder: (_, _) => const IdsCheckboxIndicator(),
      style: (state, base) => state.checked
          ? ShapeDecoration(
              color: base.color,
              shape: CircleBorder(side: (base.shape as OutlinedBorder).side),
              shadows: base.shadows,
            )
          : base,
    ),
    Padding(
      padding: const EdgeInsetsDirectional.only(start: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: [
          for (final skill in _skills)
            IdsCheckboxGroupItem<String>(
              value: skill.$1,
              label: skill.$1 == 'rs'
                  ? context.strings.demo.checkboxGroupSample.skillComingSoon(
                      skill: skill.$2,
                    )
                  : skill.$2,
              disabled: skill.$1 == 'rs',
            ),
        ],
      ),
    ),
  ],
);

Widget _item((String, String) skill, {bool disabled = false}) =>
    IdsCheckboxGroupItem(value: skill.$1, label: skill.$2, disabled: disabled);
