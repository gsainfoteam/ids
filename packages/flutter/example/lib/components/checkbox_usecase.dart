import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

const _variants = [IdsVariant.outline, IdsVariant.soft];

final checkboxUseCases = [
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
      final checked = context.knobs.objectOrNull.dropdown(
        label: 'Checked',
        options: IdsCheckedState.values,
        defaultToNull: true,
      );
      return themed(
        context,
        Center(
          child: IdsCheckbox(
            key: ValueKey(checked),
            variant: variant,
            size: size,
            checked: checked,
            semanticLabel: context.strings.demo.checkboxSample.acceptTheTerms,
            disabled: context.knobs.boolean(label: 'Disabled'),
            readOnly: context.knobs.boolean(label: 'Read only'),
            required: context.knobs.boolean(label: 'Required'),
            invalid: context.knobs.boolean(label: 'Invalid'),
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
          spacing: 16,
          children: [
            const Text('Variant × Size'),
            Text(
              context.strings.demo.checkboxSample.eachcellshowsuncheckedchecked,
            ),
            galleryRow('', [
              for (final variant in _variants)
                SizedBox(width: 84, child: Text(variant.name)),
            ]),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                for (final variant in _variants)
                  SizedBox(
                    width: 84,
                    child: _states(variant: variant, size: size),
                  ),
              ]),
            const Text('States'),
            galleryRow('invalid', [_states(invalid: true)]),
            galleryRow('disabled', [_states(disabled: true)]),
            galleryRow('readOnly', [_states(readOnly: true)]),
            const Text('Label'),
            galleryRow('wrap', [
              _labeled(
                context.strings.demo.checkboxSample.iAcceptTheTerms,
                checked: IdsCheckedState.checked,
              ),
            ]),
            galleryRow('htmlFor', [
              _labeled(context.strings.demo.checkboxSample.marketingUpdates),
            ]),
            galleryRow('Field', [
              IdsField(
                orientation: Axis.horizontal,
                children: [
                  IdsFieldLabel(
                    child: Text(
                      context.strings.demo.checkboxSample.keepMeSignedIn,
                    ),
                  ),
                  IdsCheckbox(defaultChecked: IdsCheckedState.checked),
                ],
              ),
            ]),
            const Text('Indicator'),
            galleryRow('asChild', [
              IdsCheckbox(
                defaultChecked: IdsCheckedState.checked,
                semanticLabel: context.strings.demo.checkboxSample.like,
                child: IdsCheckboxIndicator(child: Icon(Icons.favorite)),
              ),
            ]),
            galleryRow('className', [
              Builder(
                builder: (context) {
                  final colors = IdsProvider.of(context).colors;
                  return IdsCheckbox(
                    defaultChecked: IdsCheckedState.checked,
                    semanticLabel:
                        context.strings.demo.checkboxSample.roundCheckbox,
                    style: (state, base) => ShapeDecoration(
                      color: state.checked ? colors.bgSuccessSolid : base.color,
                      shape: const CircleBorder(),
                      shadows: base.shadows,
                    ),
                    child: IdsCheckboxIndicator(
                      child: Icon(
                        Icons.check,
                        color: colors.textOnSuccessSolid,
                      ),
                    ),
                  );
                },
              ),
            ]),
          ],
        ),
      ),
      width: 520,
    ),
  ),
  WidgetbookUseCase(
    name: 'Keyboard',
    builder: (context) => themed(
      context,
      Center(
        child: IdsCheckbox(
          semanticLabel: context.strings.demo.checkboxSample.acceptTheTerms,
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Read only',
    builder: (context) => themed(
      context,
      Center(
        child: IdsCheckbox(
          readOnly: true,
          defaultChecked: IdsCheckedState.checked,
          semanticLabel: context.strings.demo.checkboxSample.readOnly,
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Indeterminate',
    builder: (context) {
      final checked = [true, false, false];
      const names = ['JavaScript', 'TypeScript', 'Rust'];
      return themed(
        context,
        StatefulBuilder(
          builder: (context, setState) {
            final all = checked.every((value) => value);
            final some = checked.any((value) => value);
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: 8,
                children: [
                  _checkboxRow(
                    context.strings.demo.checkboxSample.selectAll,
                    all
                        ? IdsCheckedState.checked
                        : some
                        ? IdsCheckedState.indeterminate
                        : IdsCheckedState.unchecked,
                    (next) => setState(
                      () => checked.fillRange(0, checked.length, next),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsetsDirectional.only(start: 24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      spacing: 8,
                      children: [
                        for (var i = 0; i < names.length; i++)
                          _checkboxRow(
                            names[i],
                            checked[i]
                                ? IdsCheckedState.checked
                                : IdsCheckedState.unchecked,
                            (next) => setState(() => checked[i] = next),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Controlled indeterminate',
    builder: (context) => themed(
      context,
      Center(
        child: IdsCheckbox(
          checked: IdsCheckedState.indeterminate,
          semanticLabel: context
              .strings
              .demo
              .checkboxSample
              .mixedStateControlledByTheParent,
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Custom indicator',
    builder: (context) {
      var like = IdsCheckedState.checked;
      var favorite = IdsCheckedState.indeterminate;
      return themed(
        context,
        StatefulBuilder(
          builder: (context, setState) {
            final theme = IdsProvider.of(context).resolved;
            final colors = theme.colors;
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: 12,
                children: [
                  _checkboxRow(
                    context.strings.demo.checkboxSample.like,
                    like,
                    (next) => setState(() => like = _checkedState(next)),
                    indicator: const IdsCheckboxIndicator(
                      child: Icon(Icons.favorite),
                    ),
                  ),
                  _checkboxRow(
                    context.strings.demo.checkboxSample.favorite,
                    favorite,
                    (next) => setState(() => favorite = _checkedState(next)),
                    style: (state, base) => state.checked
                        ? ShapeDecoration(
                            color: colors.bgSuccessSolid,
                            shape: theme.shape(
                              radius: theme.radius.indicator,
                              side: BorderSide(color: colors.bgSuccessSolid),
                            ),
                            shadows: base.shadows,
                          )
                        : base,
                    indicator: IdsCheckboxIndicator(
                      style: (state, base) => state.checked
                          ? base.copyWith(color: colors.textOnSuccessSolid)
                          : base,
                      builder: (_, state) =>
                          state.indeterminate ? null : const Icon(Icons.star),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Native form',
    builder: (context) =>
        themed(context, const Center(child: _CheckboxForm()), width: 480),
  ),
  WidgetbookUseCase(
    name: 'Controlled form',
    builder: (context) => themed(
      context,
      const Center(child: _ControlledCheckboxForm()),
      width: 360,
    ),
  ),
];

class _ControlledCheckboxForm extends StatefulWidget {
  const _ControlledCheckboxForm();

  @override
  State<_ControlledCheckboxForm> createState() =>
      _ControlledCheckboxFormState();
}

class _ControlledCheckboxFormState extends State<_ControlledCheckboxForm> {
  String get _termsError =>
      context.strings.demo.checkboxSample.youMustAcceptTheTerms;
  final _form = GlobalKey<FormState>();
  final _focus = FocusNode();
  bool _agreed = false;
  String _result = '';

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  void _changeAgreement(bool value) => setState(() => _agreed = value);

  void _submit() {
    final form = _form.currentState!;
    if (form.validate()) {
      form.save();
    } else {
      _focus.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) => Form(
    key: _form,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: [
        IdsField(
          orientation: Axis.horizontal,
          children: [
            IdsFieldLabel(
              child: Text(context.strings.demo.checkboxSample.acceptTheTerms),
            ),
            IdsCheckbox(
              checked: _checkedState(_agreed),
              onCheckedChange: _changeAgreement,
              focusNode: _focus,
              validator: (checked) => checked == true ? null : _termsError,
              onSaved: (_) => setState(
                () => _result =
                    context.strings.demo.checkboxSample.registrationComplete,
              ),
            ),
            IdsFieldError(child: Text(_termsError)),
          ],
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            IdsButton(
              onPressed: _submit,
              child: Text(context.strings.demo.checkboxSample.signUp),
            ),
            IdsButton(
              variant: IdsVariant.outline,
              onPressed: () => _changeAgreement(true),
              child: Text(context.strings.demo.checkboxSample.agreeToAll),
            ),
          ],
        ),
        Semantics(
          label: context.strings.demo.checkboxSample.registrationResult,
          liveRegion: true,
          child: Text(_result),
        ),
      ],
    ),
  );
}

class _CheckboxForm extends StatefulWidget {
  const _CheckboxForm();

  @override
  State<_CheckboxForm> createState() => _CheckboxFormState();
}

class _CheckboxFormState extends State<_CheckboxForm> {
  final _form = GlobalKey<FormState>();
  final _termsFocus = FocusNode();
  final _values = <List<String>>[];
  String _submitted = '';

  @override
  void dispose() {
    _termsFocus.dispose();
    super.dispose();
  }

  void _submit() {
    final form = _form.currentState!;
    if (!form.validate()) {
      _termsFocus.requestFocus();
      return;
    }
    _values.clear();
    form.save();
    setState(() => _submitted = jsonEncode(_values));
  }

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context);
    return Form(
      key: _form,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 16,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: [
              IdsCheckbox(
                required: true,
                focusNode: _termsFocus,
                semanticLabel:
                    context.strings.demo.checkboxSample.iAcceptTheTermsRequired,
                onSaved: (checked) {
                  if (checked == true) _values.add(['terms', 'agreed']);
                },
              ),
              ExcludeSemantics(
                child: IdsLabel(
                  required: true,
                  child: Text(
                    context.strings.demo.checkboxSample.iAcceptTheTermsRequired,
                  ),
                ),
              ),
            ],
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: [
              IdsCheckbox(
                defaultChecked: IdsCheckedState.checked,
                semanticLabel:
                    context.strings.demo.checkboxSample.receiveUpdates,
                onSaved: (checked) {
                  if (checked == true) _values.add(['news', 'on']);
                },
              ),
              ExcludeSemantics(
                child: IdsLabel(
                  child: Text(
                    context.strings.demo.checkboxSample.receiveUpdates,
                  ),
                ),
              ),
            ],
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: [
              IdsButton(
                onPressed: _submit,
                child: Text(context.strings.demo.checkboxSample.submit),
              ),
              IdsButton(
                variant: IdsVariant.outline,
                onPressed: () => _form.currentState!.reset(),
                child: Text(context.strings.demo.checkboxSample.reset),
              ),
            ],
          ),
          Semantics(
            label: context.strings.demo.checkboxSample.submissionResult,
            liveRegion: true,
            child: Text(
              _submitted,
              style: theme.textStyle(
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

Widget _states({
  IdsVariant variant = IdsVariant.outline,
  IdsSize size = IdsSize.standard,
  bool disabled = false,
  bool readOnly = false,
  bool invalid = false,
}) => Row(
  mainAxisSize: MainAxisSize.min,
  spacing: 12,
  children: [
    for (final checked in IdsCheckedState.values)
      IdsCheckbox(
        defaultChecked: checked,
        variant: variant,
        size: size,
        disabled: disabled,
        readOnly: readOnly,
        invalid: invalid,
        semanticLabel: '${variant.name} ${size.name} ${checked.name}',
      ),
  ],
);

Widget _labeled(
  String label, {
  IdsCheckedState checked = IdsCheckedState.unchecked,
}) => StatefulBuilder(
  builder: (context, setState) {
    void change(bool value) => setState(() {
      checked = value ? IdsCheckedState.checked : IdsCheckedState.unchecked;
    });
    return _checkboxRow(label, checked, change);
  },
);

Widget _checkboxRow(
  String label,
  IdsCheckedState checked,
  ValueChanged<bool> change, {
  Widget? indicator,
  ShapeDecoration Function(IdsCheckboxState, ShapeDecoration)? style,
}) => IdsCheckbox(
  checked: checked,
  label: label,
  onCheckedChange: change,
  style: style,
  child: indicator,
);

IdsCheckedState _checkedState(bool checked) =>
    checked ? IdsCheckedState.checked : IdsCheckedState.unchecked;
