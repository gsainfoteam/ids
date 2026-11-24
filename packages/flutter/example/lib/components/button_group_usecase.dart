import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

final buttonGroupUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
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
        options: IdsVariant.values,
        initialOption: IdsVariant.outline,
      );
      final attached = context.knobs.boolean(
        label: 'Attached',
        initialValue: true,
      );
      return themed(
        context,
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: _actions(
            context,
            variant: variant,
            orientation: orientation,
            size: size,
            attached: attached,
          ),
        ),
        width: 400,
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
            const Text('Variant'),
            for (final variant in IdsVariant.values)
              galleryRow(variant.name, [
                _actions(context, variant: variant),
                IdsButtonGroup(
                  variant: variant,
                  semanticLabel: context.strings.demo.buttonGroupSample.save,
                  children: [
                    _button(context.strings.demo.buttonGroupSample.save),
                    IdsButtonGroup.separator(),
                    _icon(
                      Icons.keyboard_arrow_down,
                      context.strings.demo.buttonGroupSample.saveOptions,
                    ),
                  ],
                ),
              ]),
            const Text('Size × Orientation'),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                IdsButtonGroup(
                  size: size,
                  variant: IdsVariant.outline,
                  semanticLabel: context.strings.demo.buttonGroupSample.zoom,
                  children: [
                    _icon(
                      Icons.remove,
                      context.strings.demo.buttonGroupSample.decrease,
                    ),
                    _button('100%'),
                    _icon(
                      Icons.add,
                      context.strings.demo.buttonGroupSample.increase,
                    ),
                  ],
                ),
                IdsButtonGroup(
                  size: size,
                  orientation: Axis.vertical,
                  variant: IdsVariant.outline,
                  semanticLabel:
                      context.strings.demo.buttonGroupSample.alignment,
                  children: [
                    _button(context.strings.demo.buttonGroupSample.top),
                    _button(context.strings.demo.buttonGroupSample.center),
                    _button(context.strings.demo.buttonGroupSample.bottom),
                  ],
                ),
              ]),
            const Text('Composition'),
            galleryRow('nested', [
              IdsButtonGroup(
                variant: IdsVariant.outline,
                semanticLabel: context.strings.demo.buttonGroupSample.edit,
                children: [
                  IdsButtonGroup(
                    semanticLabel:
                        context.strings.demo.buttonGroupSample.clipboard,
                    children: [
                      _icon(
                        Icons.content_cut,
                        context.strings.demo.buttonGroupSample.cut,
                      ),
                      _icon(
                        Icons.copy,
                        context.strings.demo.buttonGroupSample.copy,
                      ),
                      _icon(
                        Icons.content_paste,
                        context.strings.demo.buttonGroupSample.paste,
                      ),
                    ],
                  ),
                  IdsButtonGroup(
                    semanticLabel:
                        context.strings.demo.buttonGroupSample.history,
                    children: [
                      _icon(
                        Icons.undo,
                        context.strings.demo.buttonGroupSample.undo,
                      ),
                      _icon(
                        Icons.redo,
                        context.strings.demo.buttonGroupSample.redo,
                      ),
                    ],
                  ),
                ],
              ),
            ]),
            galleryRow('text + field', [
              IdsButtonGroup(
                semanticLabel: context.strings.demo.buttonGroupSample.address,
                children: [
                  const SizedBox(
                    width: 256,
                    child: IdsTextField(
                      placeholder: 'example.com',
                      leading: Text('https://'),
                    ),
                  ),
                  _button(
                    context.strings.demo.buttonGroupSample.go,
                    variant: IdsVariant.outline,
                  ),
                ],
              ),
            ]),
            galleryRow('attached=false', [
              IdsButtonGroup(
                attached: false,
                variant: IdsVariant.outline,
                semanticLabel: context.strings.demo.buttonGroupSample.filter,
                children: [
                  _button(context.strings.demo.buttonGroupSample.all),
                  _button(context.strings.demo.buttonGroupSample.unread),
                  IdsButton(
                    leading: const Icon(Icons.archive),
                    onPressed: () {},
                    child: Text(
                      context.strings.demo.buttonGroupSample.archiveFolder,
                    ),
                  ),
                ],
              ),
            ]),
            galleryRow('rtl', [
              Directionality(
                textDirection: TextDirection.rtl,
                child: IdsButtonGroup(
                  variant: IdsVariant.outline,
                  semanticLabel:
                      context.strings.demo.buttonGroupSample.rightToLeft,
                  children: [
                    _button(context.strings.demo.buttonGroupSample.first),
                    _button(context.strings.demo.buttonGroupSample.second),
                    _button(context.strings.demo.buttonGroupSample.third),
                  ],
                ),
              ),
            ]),
            galleryRow('disabled', [_actions(context, disableMiddle: true)]),
          ],
        ),
      ),
      width: 620,
    ),
  ),
  WidgetbookUseCase(
    name: 'Joined',
    builder: (context) =>
        themed(context, Center(child: _actions(context)), width: 400),
  ),
  WidgetbookUseCase(
    name: 'Size and variant',
    builder: (context) => themed(
      context,
      Center(
        child: IdsButtonGroup(
          size: IdsSize.tiny,
          variant: IdsVariant.outline,
          semanticLabel: context.strings.demo.buttonGroupSample.zoom,
          children: [
            _icon(
              Icons.remove,
              context.strings.demo.buttonGroupSample.decrease,
            ),
            _button('100%'),
            IdsButton(
              size: IdsSize.standard,
              variant: IdsVariant.solid,
              onPressed: () {},
              child: Text(context.strings.demo.buttonGroupSample.custom),
            ),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Separator',
    builder: (context) => themed(
      context,
      Center(
        child: IdsButtonGroup(
          variant: IdsVariant.solid,
          semanticLabel: context.strings.demo.buttonGroupSample.save,
          children: [
            _button(context.strings.demo.buttonGroupSample.save),
            IdsButtonGroup.separator(),
            _icon(
              Icons.keyboard_arrow_down,
              context.strings.demo.buttonGroupSample.saveOptions,
            ),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Labelled separator',
    builder: (context) {
      final decorative = context.knobs.boolean(label: 'Decorative');
      return themed(
        context,
        Center(
          child: IdsButtonGroup(
            orientation: Axis.vertical,
            attached: false,
            decorativeSeparator: decorative,
            variant: IdsVariant.outline,
            semanticLabel: context.strings.demo.buttonGroupSample.fileActions,
            children: [
              _button(context.strings.demo.buttonGroupSample.save),
              IdsButtonGroup.separator(
                child: Text(context.strings.demo.buttonGroupSample.or),
              ),
              _button(context.strings.demo.buttonGroupSample.delete),
            ],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Right to left',
    builder: (context) => themed(
      context,
      Center(
        child: Directionality(
          textDirection: TextDirection.rtl,
          child: IdsButtonGroup(
            variant: IdsVariant.outline,
            semanticLabel: context.strings.demo.buttonGroupSample.rightToLeft,
            children: [
              _button(context.strings.demo.buttonGroupSample.first),
              _button(context.strings.demo.buttonGroupSample.second),
            ],
          ),
        ),
      ),
    ),
  ),
];

Widget _actions(
  BuildContext context, {
  IdsVariant variant = IdsVariant.outline,
  Axis orientation = Axis.horizontal,
  IdsSize? size,
  bool attached = true,
  bool disableMiddle = false,
}) => IdsButtonGroup(
  variant: variant,
  orientation: orientation,
  size: size,
  attached: attached,
  semanticLabel: context.strings.demo.buttonGroupSample.archiveActions,
  children: [
    _button(context.strings.demo.buttonGroupSample.archive),
    _button(
      context.strings.demo.buttonGroupSample.report,
      disabled: disableMiddle,
    ),
    _button(context.strings.demo.buttonGroupSample.snooze),
  ],
);

Widget _button(String text, {bool disabled = false, IdsVariant? variant}) =>
    IdsButton(
      disabled: disabled,
      variant: variant,
      onPressed: () {},
      child: Text(text),
    );

Widget _icon(IconData icon, String label) =>
    IdsIconButton(icon: Icon(icon), semanticLabel: label, onPressed: () {});
