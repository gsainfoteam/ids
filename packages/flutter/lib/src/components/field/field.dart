import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import '../label/label.dart';

class Field extends StatelessWidget {
  const Field({
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

  static const _gaps = {IdsSize.standard: 8.0, IdsSize.tiny: 6.0};

  static Field? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_FieldScope>()?.field;

  static Field _of(BuildContext context, String part) {
    final field = maybeOf(context);
    assert(field != null, '$part must be rendered inside a Field.');
    return field!;
  }

  @override
  Widget build(BuildContext context) {
    final style = switch (size) {
      IdsSize.standard => IdsTypography.bodyB3Regular,
      IdsSize.tiny => IdsTypography.captionC1Regular,
    };

    return _FieldScope(
      field: this,
      child: Opacity(
        opacity: disabled ? 0.5 : 1,
        child: DefaultTextStyle(
          style: style.copyWith(color: ThemeProvider.of(context).onSurface),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: _gaps[size]!,
            children: [
              for (final child in children)
                if (!(invalid ? child is FieldHint : child is FieldError))
                  child,
            ],
          ),
        ),
      ),
    );
  }
}

class FieldLabel extends StatelessWidget {
  const FieldLabel({super.key, this.required, required this.child});

  final bool? required;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final field = Field._of(context, 'FieldLabel');
    return Align(
      alignment: AlignmentDirectional.centerStart,
      child: Label(
        size: field.size,
        required: required ?? field.required,
        child: child,
      ),
    );
  }
}

class FieldDescription extends StatelessWidget {
  const FieldDescription({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    Field._of(context, 'FieldDescription');
    return _tinted(ThemeProvider.of(context).onMuted, child);
  }
}

class FieldHint extends StatelessWidget {
  const FieldHint({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (Field._of(context, 'FieldHint').invalid) {
      return const SizedBox.shrink();
    }
    return _tinted(ThemeProvider.of(context).onMuted, child);
  }
}

class FieldError extends StatelessWidget {
  const FieldError({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!Field._of(context, 'FieldError').invalid) {
      return const SizedBox.shrink();
    }
    return _tinted(ThemeProvider.of(context).danger, child);
  }
}

Widget _tinted(Color color, Widget child) => DefaultTextStyle(
  style: IdsTypography.captionC1Regular.copyWith(color: color),
  child: child,
);

class _FieldScope extends InheritedWidget {
  const _FieldScope({required this.field, required super.child});

  final Field field;

  @override
  bool updateShouldNotify(_FieldScope old) =>
      old.field.size != field.size ||
      old.field.required != field.required ||
      old.field.disabled != field.disabled ||
      old.field.invalid != field.invalid;
}
