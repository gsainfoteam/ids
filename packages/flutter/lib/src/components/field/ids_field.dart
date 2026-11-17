import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import '../label/ids_label.dart';

class IdsField extends StatefulWidget {
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

  static IdsField? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsFieldScope>()?.field;

  static VoidCallback? bindControl(BuildContext context, FocusNode node) {
    final scope = context.dependOnInheritedWidgetOfExactType<_IdsFieldScope>();
    if (scope == null) return null;
    scope.controls.add(node);
    return () => scope.controls.remove(node);
  }

  static String? controlLabelOf(BuildContext context) {
    final field = maybeOf(context);
    for (final child in field?.children ?? const <Widget>[]) {
      if (child is IdsFieldLabel && child.child is Text) {
        final label = child.child as Text;
        return label.semanticsLabel ??
            label.data ??
            label.textSpan?.toPlainText();
      }
    }
    return null;
  }

  static IdsField _of(BuildContext context, String part) {
    final field = maybeOf(context);
    assert(field != null, '$part must be rendered inside an IdsField.');
    return field!;
  }

  @override
  State<IdsField> createState() => _IdsFieldState();
}

class _IdsFieldState extends State<IdsField> {
  final _controls = <FocusNode>{};

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context);
    final style = switch (widget.size) {
      IdsSize.standard => IdsTypography.bodyB3Regular,
      IdsSize.tiny => IdsTypography.captionC1Regular,
    };

    return _IdsFieldScope(
      field: widget,
      controls: _controls,
      child: Opacity(
        opacity: widget.disabled ? 0.5 : 1,
        child: DefaultTextStyle(
          style: theme.textStyle(style, color: theme.colors.onSurface),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: theme.dimension(8),
            children: [
              for (final child in widget.children)
                if (!(widget.invalid
                    ? child is IdsFieldHint
                    : child is IdsFieldError))
                  child,
            ],
          ),
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
      child: GestureDetector(
        excludeFromSemantics: true,
        onTap: field.disabled
            ? null
            : () {
                final controls = context
                    .getInheritedWidgetOfExactType<_IdsFieldScope>()!
                    .controls;
                for (final node in controls) {
                  if (node.canRequestFocus) {
                    node.requestFocus();
                    break;
                  }
                }
              },
        child: IdsLabel(
          size: field.size,
          required: required ?? field.required,
          invalid: field.invalid,
          child: child,
        ),
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
    return _tinted(context, IdsProvider.of(context).colors.textNeutral, child);
  }
}

class IdsFieldHint extends StatelessWidget {
  const IdsFieldHint({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (IdsField._of(context, 'IdsFieldHint').invalid) {
      return const SizedBox.shrink();
    }
    return _tinted(context, IdsProvider.of(context).colors.textNeutral, child);
  }
}

class IdsFieldError extends StatelessWidget {
  const IdsFieldError({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!IdsField._of(context, 'IdsFieldError').invalid) {
      return const SizedBox.shrink();
    }
    return _tinted(context, IdsProvider.of(context).colors.textDanger, child);
  }
}

Widget _tinted(BuildContext context, Color color, Widget child) {
  return DefaultTextStyle(
    style: DefaultTextStyle.of(context).style.copyWith(color: color),
    child: child,
  );
}

class _IdsFieldScope extends InheritedWidget {
  const _IdsFieldScope({
    required this.field,
    required this.controls,
    required super.child,
  });

  final IdsField field;
  final Set<FocusNode> controls;

  @override
  bool updateShouldNotify(_IdsFieldScope old) =>
      old.field.size != field.size ||
      old.field.required != field.required ||
      old.field.disabled != field.disabled ||
      old.field.invalid != field.invalid ||
      old.field.children != field.children;
}
