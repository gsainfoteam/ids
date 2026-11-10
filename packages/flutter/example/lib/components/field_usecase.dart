import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

class EmailFieldPreview extends StatelessWidget {
  const EmailFieldPreview({
    super.key,
    this.size = IdsSize.standard,
    this.required = true,
    this.disabled = false,
    this.invalid = false,
  });

  final IdsSize size;
  final bool required;
  final bool disabled;
  final bool invalid;

  @override
  Widget build(BuildContext context) => IdsField(
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
}

class _EmailInput extends StatelessWidget {
  const _EmailInput();

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context).theme;
    final field = IdsField.maybeOf(context)!;
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(theme.radius.standard),
      borderSide: BorderSide(
        color: field.invalid ? theme.danger : theme.border,
      ),
    );
    return TextFormField(
      initialValue: 'hello@ids.example',
      enabled: !field.disabled,
      keyboardType: TextInputType.emailAddress,
      style: DefaultTextStyle.of(context).style,
      cursorColor: theme.accent,
      decoration: InputDecoration(
        labelText: 'Email address',
        labelStyle: TextStyle(color: theme.onMuted),
        isDense: field.size == IdsSize.tiny,
        prefixIcon: Icon(Icons.mail_outline, color: theme.onMuted),
        filled: true,
        fillColor: theme.surface,
        border: border,
        enabledBorder: border,
        disabledBorder: border,
        focusedBorder: border.copyWith(
          borderSide: BorderSide(
            color: field.invalid ? theme.danger : theme.accent,
            width: 2,
          ),
        ),
      ),
    );
  }
}

final fieldUseCases = [
  WidgetbookUseCase(
    name: 'Default',
    builder: (context) => themed(
      context,
      EmailFieldPreview(
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
          EmailFieldPreview(),
          EmailFieldPreview(disabled: true),
          EmailFieldPreview(invalid: true),
        ],
      ),
    ),
  ),
];
