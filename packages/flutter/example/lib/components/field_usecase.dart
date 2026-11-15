import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

IdsField _emailField({
  IdsSize size = IdsSize.standard,
  bool required = true,
  bool disabled = false,
  bool invalid = false,
}) => IdsField(
  size: size,
  required: required,
  disabled: disabled,
  invalid: invalid,
  children: const [
    IdsFieldLabel(child: Text('이메일')),
    IdsFieldDescription(child: Text('안내를 받을 이메일 주소입니다.')),
    _EmailInput(),
    IdsFieldHint(child: Text('예시 주소이며 실제로 발송되지 않습니다.')),
    IdsFieldError(child: Text('올바른 이메일 주소를 입력해 주세요.')),
  ],
);

class _EmailInput extends StatelessWidget {
  const _EmailInput();

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context).theme;
    final field = IdsField.maybeOf(context)!;
    final tiny = field.size == IdsSize.tiny;
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
          options: IdsSize.values,
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
