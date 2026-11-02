import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import '../label/ids_label.dart';

class IdsField extends StatelessWidget {
  const IdsField({
    super.key,
    this.size = IdsSize.standard,
    this.required = false,
    this.disabled = false,
    this.invalid = false,
    required this.children,
  });

  final IdsSize size;
  final bool required;
  final bool disabled;
  final bool invalid;
  final List<Widget> children;

  static const _gap = 8.0;

  static IdsField? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsFieldScope>()?.field;

  static IdsField _of(BuildContext context, String part) {
    final field = maybeOf(context);
    assert(field != null, '$part must be rendered inside an IdsField.');
    return field!;
  }

  @override
  Widget build(BuildContext context) {
    final style = switch (size) {
      IdsSize.standard => IdsTypography.bodyB3Regular,
      IdsSize.tiny => IdsTypography.captionC1Regular,
    };

    return _IdsFieldScope(
      field: this,
      child: DefaultTextStyle(
        style: style.copyWith(color: ThemeProvider.of(context).onSurface),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: _gap,
          children: [
            for (final child in children)
              if (!(invalid ? child is IdsFieldHint : child is IdsFieldError))
                child,
          ],
        ),
      ),
    );
  }
}

class IdsFieldLabel extends StatelessWidget {
  const IdsFieldLabel({super.key, this.required, required this.child});

  final bool? required;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final field = IdsField._of(context, 'IdsFieldLabel');
    return Align(
      alignment: AlignmentDirectional.centerStart,
      child: IdsLabel(
        size: field.size,
        required: required ?? field.required,
        disabled: field.disabled,
        invalid: field.invalid,
        child: child,
      ),
    );
  }
}

class IdsFieldDescription extends StatelessWidget {
  const IdsFieldDescription({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    IdsField._of(context, 'IdsFieldDescription');
    return _tinted(context, ThemeProvider.of(context).onMuted, child);
  }
}

class IdsFieldHint extends StatelessWidget {
  const IdsFieldHint({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    IdsField._of(context, 'IdsFieldHint');
    return _tinted(context, ThemeProvider.of(context).onMuted, child);
  }
}

class IdsFieldError extends StatelessWidget {
  const IdsFieldError({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    IdsField._of(context, 'IdsFieldError');
    return _tinted(context, ThemeProvider.of(context).danger, child);
  }
}

Widget _tinted(BuildContext context, Color color, Widget child) =>
    DefaultTextStyle(
      style: DefaultTextStyle.of(context).style.copyWith(color: color),
      child: child,
    );

class _IdsFieldScope extends InheritedWidget {
  const _IdsFieldScope({required this.field, required super.child});

  final IdsField field;

  @override
  bool updateShouldNotify(_IdsFieldScope old) =>
      old.field.size != field.size ||
      old.field.required != field.required ||
      old.field.disabled != field.disabled ||
      old.field.invalid != field.invalid;
}
