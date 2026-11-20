import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../../catalog/showcase.dart';
import '../../catalog/strings.dart';

final field = WidgetbookComponent(
  name: 'Field',
  useCases: [
    WidgetbookUseCase(
      name: 'Playground',
      builder: (context) {
        final strings = context.strings.demo.field;
        return SizedBox(
          width: 320,
          child: IdsField(
            size: context.knobs.object.segmented(
              label: 'size',
              options: IdsSize.values,
              labelBuilder: (size) => size.name,
            ),
            required: context.knobs.boolean(label: 'required'),
            disabled: context.knobs.boolean(label: 'disabled'),
            invalid: context.knobs.boolean(label: 'invalid'),
            children: [
              IdsFieldLabel(child: Text(strings.label)),
              IdsFieldDescription(child: Text(strings.description)),
              const _EmailInput(),
              IdsFieldHint(child: Text(strings.hint)),
              IdsFieldError(child: Text(strings.error)),
            ],
          ),
        );
      },
    ),
    WidgetbookUseCase(
      name: 'Usage',
      builder: (context) => SizedBox(
        width: 320,
        child: IdsField(
          children: [
            IdsFieldLabel(child: Text(context.strings.demo.field.label)),
            const _EmailInput(),
          ],
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Gallery',
      builder: (context) {
        final strings = context.strings.demo.field;
        return Showcase(
          children: [
            ShowcaseSection(
              title: 'Size',
              children: [
                for (final size in IdsSize.values)
                  ShowcaseRow(
                    label: size.name,
                    children: [
                      SizedBox(
                        width: 320,
                        child: IdsField(
                          size: size,
                          children: [
                            IdsFieldLabel(child: Text(strings.label)),
                            IdsFieldDescription(
                              child: Text(strings.description),
                            ),
                            const _EmailInput(),
                            IdsFieldHint(child: Text(strings.hint)),
                          ],
                        ),
                      ),
                    ],
                  ),
              ],
            ),
            ShowcaseSection(
              title: 'States',
              children: [
                for (final (label, required, disabled, invalid) in [
                  ('default', false, false, false),
                  ('required', true, false, false),
                  ('invalid', false, false, true),
                  ('disabled', false, true, false),
                ])
                  ShowcaseRow(
                    label: label,
                    children: [
                      SizedBox(
                        width: 320,
                        child: IdsField(
                          required: required,
                          disabled: disabled,
                          invalid: invalid,
                          children: [
                            IdsFieldLabel(child: Text(strings.label)),
                            const _EmailInput(),
                            IdsFieldHint(child: Text(strings.hint)),
                            IdsFieldError(child: Text(strings.error)),
                          ],
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        );
      },
    ),
    WidgetbookUseCase(
      name: 'Report an invalid value',
      builder: (context) {
        final strings = context.strings.demo.field;
        return Example(
          description: context.strings.examples.field.reportAnInvalidValue,
          child: IdsField(
            required: true,
            invalid: true,
            children: [
              IdsFieldLabel(child: Text(strings.label)),
              const _EmailInput(),
              IdsFieldHint(child: Text(strings.hint)),
              IdsFieldError(child: Text(strings.error)),
            ],
          ),
        );
      },
    ),
  ],
);

final fieldChecks = WidgetbookComponent(
  name: 'Field',
  useCases: [
    WidgetbookUseCase(
      name: 'Long label',
      builder: (context) {
        final strings = context.strings.demo.field;
        return SizedBox(
          width: 200,
          child: IdsField(
            required: true,
            children: [
              IdsFieldLabel(child: Text(strings.longLabel)),
              const _EmailInput(),
              IdsFieldHint(child: Text(strings.hint)),
            ],
          ),
        );
      },
    ),
  ],
);

class _EmailInput extends StatelessWidget {
  const _EmailInput();

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    final colors = ids.colors;
    final field = IdsField.maybeOf(context)!;
    final tiny = field.size == IdsSize.tiny;
    final icon = ids.dimension(tiny ? 14 : 16);
    return Container(
      height: ids.dimension(tiny ? 32 : 44),
      padding: EdgeInsetsDirectional.only(
        start: ids.dimension(tiny ? 10 : 12),
        end: ids.dimension(4),
      ),
      decoration: ShapeDecoration(
        color: colors.bgNeutralSubtlest,
        shape: ids.shape(
          side: BorderSide(
            color: field.invalid ? colors.borderDanger : colors.borderNeutral,
          ),
        ),
      ),
      child: Row(
        spacing: ids.dimension(tiny ? 6 : 8),
        children: [
          Icon(Icons.mail_outline, size: icon, color: colors.textNeutral),
          Expanded(child: Text(context.strings.demo.field.value)),
          SizedBox.square(
            dimension: ids.dimension(tiny ? 24 : 28),
            child: Icon(Icons.close, size: icon, color: colors.textNeutral),
          ),
        ],
      ),
    );
  }
}
