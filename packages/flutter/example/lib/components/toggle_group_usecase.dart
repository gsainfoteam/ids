import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

enum _Period { day, week, month, year }

enum _TextFormat { bold, italic, underline, strike }

const _variants = [
  IdsVariant.ghost,
  IdsVariant.outline,
  IdsVariant.soft,
  IdsVariant.solid,
  IdsVariant.glossy,
];

final toggleGroupUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final multiple = context.knobs.boolean(label: 'Multiple');
      final orientation = context.knobs.object.dropdown(
        label: 'Orientation',
        options: Axis.values,
      );
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
      );
      final variant = context.knobs.object.dropdown(
        label: 'Variant',
        options: _variants,
        initialOption: IdsVariant.outline,
      );
      final attached = context.knobs.boolean(
        label: 'Attached',
        initialValue: true,
      );
      final disabled = context.knobs.boolean(label: 'Disabled');
      final required = context.knobs.boolean(label: 'Required');
      final loop = context.knobs.boolean(label: 'Loop', initialValue: true);
      final children = [
        IdsToggle(
          value: 'left',
          child: Text(context.strings.demo.toggleGroupSample.left),
        ),
        IdsToggle(
          value: 'center',
          child: Text(context.strings.demo.toggleGroupSample.center),
        ),
        IdsToggle(
          value: 'right',
          child: Text(context.strings.demo.toggleGroupSample.right),
        ),
      ];
      return themed(
        context,
        Center(
          child: multiple
              ? IdsToggleGroup<String>.multiple(
                  key: const ValueKey(true),
                  orientation: orientation,
                  size: size,
                  variant: variant,
                  attached: attached,
                  disabled: disabled,
                  required: required,
                  loop: loop,
                  semanticLabel:
                      context.strings.demo.toggleGroupSample.alignment,
                  children: children,
                )
              : IdsToggleGroup<String>(
                  key: const ValueKey(false),
                  orientation: orientation,
                  size: size,
                  variant: variant,
                  attached: attached,
                  disabled: disabled,
                  required: required,
                  loop: loop,
                  semanticLabel:
                      context.strings.demo.toggleGroupSample.alignment,
                  children: children,
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
            const Text('Variant × Size'),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                for (final variant in _variants)
                  Column(
                    spacing: 6,
                    children: [
                      Text(variant.name),
                      _alignment(context, size: size, variant: variant),
                    ],
                  ),
              ]),
            const Text('Selection'),
            galleryRow('single', [
              _date(context),
              _alignment(context, variant: IdsVariant.soft),
            ]),
            galleryRow('multiple', [
              _formats(context, IdsVariant.outline),
              _formats(context),
            ]),
            const Text('Layout'),
            galleryRow('vertical', [
              IdsToggleGroup(
                semanticLabel: context.strings.demo.toggleGroupSample.view,
                orientation: Axis.vertical,
                variant: IdsVariant.outline,
                defaultValue: 'list',
                children: [
                  IdsToggle(
                    value: 'list',
                    child: Text(context.strings.demo.toggleGroupSample.list),
                  ),
                  IdsToggle(
                    value: 'grid',
                    child: Text(context.strings.demo.toggleGroupSample.grid),
                  ),
                  IdsToggle(
                    value: 'board',
                    child: Text(context.strings.demo.toggleGroupSample.board),
                  ),
                ],
              ),
            ]),
            galleryRow('full width', [
              IdsToggleGroup(
                semanticLabel: context.strings.demo.toggleGroupSample.sortBy,
                defaultValue: 'new',
                variant: IdsVariant.outline,
                children: [
                  for (final (value, label) in [
                    ('new', context.strings.demo.toggleGroupSample.latest),
                    ('popular', context.strings.demo.toggleGroupSample.popular),
                    (
                      'comments',
                      context.strings.demo.toggleGroupSample.mostDiscussed,
                    ),
                  ])
                    IdsToggle(
                      value: value,
                      child: SizedBox(
                        width: 84,
                        child: Text(label, textAlign: TextAlign.center),
                      ),
                    ),
                ],
              ),
            ]),
            galleryRow('attached=false', [
              IdsToggleGroup.multiple(
                semanticLabel: context.strings.demo.toggleGroupSample.tags,
                attached: false,
                variant: IdsVariant.outline,
                defaultValue: ['react'],
                children: [
                  IdsToggle(value: 'react', child: Text('React')),
                  IdsToggle(value: 'flutter', child: Text('Flutter')),
                  IdsToggle(
                    value: 'design',
                    child: Text(context.strings.demo.toggleGroupSample.design),
                  ),
                ],
              ),
            ]),
            const Text('States'),
            galleryRow('disabled group', [
              _alignment(context, variant: IdsVariant.outline, disabled: true),
            ]),
            galleryRow('disabled item', [_date(context, disableWeek: true)]),
          ],
        ),
      ),
      width: 768,
    ),
  ),
  WidgetbookUseCase(
    name: 'Keyboard',
    builder: (context) => themed(
      context,
      Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 12,
          children: [_date(context), _formats(context, IdsVariant.outline)],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Radio keyboard',
    builder: (context) => themed(
      context,
      Center(
        child: IdsToggleGroup<_Period>(
          semanticLabel: context.strings.demo.toggleGroupSample.period,
          variant: IdsVariant.outline,
          defaultValue: _Period.week,
          children: [
            IdsToggle(
              value: _Period.day,
              child: Text(context.strings.demo.toggleGroupSample.day),
            ),
            IdsToggle(
              value: _Period.week,
              child: Text(context.strings.demo.toggleGroupSample.week),
            ),
            IdsToggle(
              value: _Period.month,
              disabled: true,
              child: Text(context.strings.demo.toggleGroupSample.month),
            ),
            IdsToggle(
              value: _Period.year,
              child: Text(context.strings.demo.toggleGroupSample.year),
            ),
          ],
        ),
      ),
      width: 400,
    ),
  ),
  WidgetbookUseCase(
    name: 'Toolbar keyboard',
    builder: (context) =>
        themed(context, Center(child: _formats(context, IdsVariant.outline))),
  ),
  WidgetbookUseCase(
    name: 'Vertical',
    builder: (context) => themed(
      context,
      Center(
        child: IdsToggleGroup<String>.multiple(
          semanticLabel: context.strings.demo.toggleGroupSample.panel,
          orientation: Axis.vertical,
          variant: IdsVariant.outline,
          defaultValue: ['files'],
          children: [
            IdsToggle(
              value: 'files',
              child: Text(context.strings.demo.toggleGroupSample.file),
            ),
            IdsToggle(
              value: 'search',
              child: Text(context.strings.demo.toggleGroupSample.search),
            ),
            IdsToggle(
              value: 'history',
              child: Text(context.strings.demo.toggleGroupSample.history),
            ),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Right to left',
    builder: (context) => themed(
      context,
      Directionality(
        textDirection: TextDirection.rtl,
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          child: _alignment(context, variant: IdsVariant.outline),
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Controlled',
    builder: (context) {
      String? view = 'list';
      return themed(
        context,
        StatefulBuilder(
          builder: (context, setState) {
            void select(String? next) => setState(() => view = next);
            return Row(
              spacing: 12,
              children: [
                IdsToggleGroup<String>.controlled(
                  semanticLabel: context.strings.demo.toggleGroupSample.view,
                  variant: IdsVariant.outline,
                  value: view,
                  onValueChange: select,
                  children: [
                    IdsToggle(
                      value: 'list',
                      child: Text(context.strings.demo.toggleGroupSample.list),
                    ),
                    IdsToggle(
                      value: 'grid',
                      child: Text(context.strings.demo.toggleGroupSample.grid),
                    ),
                  ],
                ),
                IdsButton(
                  variant: IdsVariant.ghost,
                  onPressed: () => select(null),
                  child: Text(
                    context.strings.demo.toggleGroupSample.clearSelection,
                  ),
                ),
                Semantics(
                  label: context.strings.demo.toggleGroupSample.viewValue,
                  value: '$view',
                  child: Text('$view'),
                ),
              ],
            );
          },
        ),
        width: 520,
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Native form',
    builder: (context) => themed(
      context,
      const Align(
        alignment: AlignmentDirectional.centerStart,
        child: _OrderForm(),
      ),
      width: 480,
    ),
  ),
];

class _OrderForm extends StatefulWidget {
  const _OrderForm();

  @override
  State<_OrderForm> createState() => _OrderFormState();
}

class _OrderFormState extends State<_OrderForm> {
  final _form = GlobalKey<FormState>();
  final _sizeFocus = FocusNode();
  String? _size;
  List<String> _toppings = const [];
  String _result = '';

  @override
  void dispose() {
    _sizeFocus.dispose();
    super.dispose();
  }

  void _submit() {
    final form = _form.currentState!;
    if (!form.validate()) {
      _sizeFocus.requestFocus();
      return;
    }
    form.save();
    setState(
      () => _result = jsonEncode({'size': _size, 'toppings': _toppings}),
    );
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
          IdsToggleGroup<String>(
            semanticLabel: context.strings.demo.toggleGroupSample.size,
            required: true,
            focusNode: _sizeFocus,
            variant: IdsVariant.outline,
            onSaved: (value) => _size = value,
            children: const [
              IdsToggle(value: 's', child: Text('S')),
              IdsToggle(value: 'm', child: Text('M')),
              IdsToggle(value: 'l', child: Text('L')),
            ],
          ),
          IdsToggleGroup.multiple(
            semanticLabel: context.strings.demo.toggleGroupSample.toppings,
            defaultValue: const ['cheese'],
            variant: IdsVariant.outline,
            onSaved: (values) => _toppings = values ?? const [],
            children: [
              IdsToggle(
                value: 'cheese',
                child: Text(context.strings.demo.toggleGroupSample.cheese),
              ),
              IdsToggle(
                value: 'olive',
                child: Text(context.strings.demo.toggleGroupSample.olive),
              ),
              IdsToggle(
                value: 'onion',
                child: Text(context.strings.demo.toggleGroupSample.onion),
              ),
            ],
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 8,
            children: [
              IdsButton(
                onPressed: _submit,
                child: Text(context.strings.demo.toggleGroupSample.order),
              ),
              IdsButton(
                variant: IdsVariant.outline,
                onPressed: () => _form.currentState!.reset(),
                child: Text(context.strings.demo.toggleGroupSample.reset),
              ),
            ],
          ),
          Semantics(
            label: context.strings.demo.toggleGroupSample.orderResult,
            liveRegion: true,
            child: Text(
              _result,
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

Widget _alignment(
  BuildContext context, {
  IdsSize? size,
  IdsVariant? variant,
  bool disabled = false,
}) => IdsToggleGroup(
  semanticLabel: context.strings.demo.toggleGroupSample.alignment,
  defaultValue: 'center',
  size: size,
  variant: variant,
  disabled: disabled,
  children: [
    IdsIconToggle(
      value: 'left',
      semanticLabel: context.strings.demo.toggleGroupSample.alignLeft,
      icon: Icon(Icons.format_align_left),
    ),
    IdsIconToggle(
      value: 'center',
      semanticLabel: context.strings.demo.toggleGroupSample.alignCenter,
      icon: Icon(Icons.format_align_center),
    ),
    IdsIconToggle(
      value: 'right',
      semanticLabel: context.strings.demo.toggleGroupSample.alignRight,
      icon: Icon(Icons.format_align_right),
    ),
  ],
);

Widget _date(BuildContext context, {bool disableWeek = false}) =>
    IdsToggleGroup(
      semanticLabel: context.strings.demo.toggleGroupSample.period,
      defaultValue: disableWeek ? 'day' : 'week',
      variant: IdsVariant.outline,
      children: [
        IdsToggle(
          value: 'day',
          child: Text(context.strings.demo.toggleGroupSample.day),
        ),
        IdsToggle(
          value: 'week',
          disabled: disableWeek,
          child: Text(context.strings.demo.toggleGroupSample.week),
        ),
        IdsToggle(
          value: 'month',
          child: Text(context.strings.demo.toggleGroupSample.month),
        ),
      ],
    );

Widget _formats(BuildContext context, [IdsVariant? variant]) =>
    IdsToggleGroup<_TextFormat>.multiple(
      semanticLabel: context.strings.demo.toggleGroupSample.formatting,
      defaultValue: const [_TextFormat.bold],
      variant: variant,
      children: [
        IdsIconToggle(
          value: _TextFormat.bold,
          semanticLabel: context.strings.demo.toggleGroupSample.bold,
          icon: Icon(Icons.format_bold),
        ),
        IdsIconToggle(
          value: _TextFormat.italic,
          semanticLabel: context.strings.demo.toggleGroupSample.italic,
          icon: Icon(Icons.format_italic),
        ),
        IdsIconToggle(
          value: _TextFormat.underline,
          semanticLabel: context.strings.demo.toggleGroupSample.underline,
          icon: Icon(Icons.format_underlined),
        ),
        IdsToggleGroup.separator(),
        IdsIconToggle(
          value: _TextFormat.strike,
          semanticLabel: context.strings.demo.toggleGroupSample.strikethrough,
          icon: Icon(Icons.strikethrough_s),
        ),
      ],
    );
