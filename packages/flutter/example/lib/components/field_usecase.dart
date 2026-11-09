import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

ids.Field _emailField({
  ids.IdsSize size = ids.IdsSize.standard,
  bool required = true,
  bool disabled = false,
  bool invalid = false,
}) => ids.Field(
  size: size,
  required: required,
  disabled: disabled,
  invalid: invalid,
  children: const [
    ids.FieldLabel(child: Text('이메일')),
    ids.FieldDescription(child: Text('안내를 받을 이메일 주소입니다.')),
    _EmailInput(),
    ids.FieldHint(child: Text('예시 주소이며 실제로 발송되지 않습니다.')),
    ids.FieldError(child: Text('올바른 이메일 주소를 입력해 주세요.')),
  ],
);

class _EmailInput extends StatelessWidget {
  const _EmailInput();

  @override
  Widget build(BuildContext context) {
    final theme = ids.ThemeProvider.of(context);
    final field = ids.Field.maybeOf(context)!;
    final tiny = field.size == ids.IdsSize.tiny;
    final icon = tiny ? 14.0 : 16.0;
    return Container(
      height: tiny ? 32 : 44,
      padding: EdgeInsetsDirectional.only(start: tiny ? 10 : 12, end: 4),
      decoration: BoxDecoration(
        color: theme.surface,
        border: Border.all(color: field.invalid ? theme.danger : theme.border),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        spacing: tiny ? 6 : 8,
        children: [
          Icon(Icons.mail_outline, size: icon, color: theme.onMuted),
          const Expanded(child: Text('hello@ids.example')),
          SizedBox.square(
            dimension: tiny ? 24 : 28,
            child: Icon(Icons.close, size: icon, color: theme.onMuted),
          ),
        ],
      ),
    );
  }
}

final fieldUseCases = [
  WidgetbookUseCase(
    name: 'Default',
    builder: (context) => themed(
      context,
      _emailField(
        size: context.knobs.object.dropdown(
          label: 'Size',
          options: ids.IdsSize.values,
          labelBuilder: (s) => s.name,
        ),
        required: context.knobs.boolean(label: 'Required', initialValue: true),
        disabled: context.knobs.boolean(label: 'Disabled'),
        invalid: context.knobs.boolean(label: 'Invalid'),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'States',
    builder: (context) => themed(
      context,
      Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 32,
        children: [
          _emailField(),
          _emailField(disabled: true),
          _emailField(invalid: true),
        ],
      ),
    ),
  ),
];
