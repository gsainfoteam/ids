import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import '../label/ids_label.dart';

class IdsField extends StatefulWidget {
  const IdsField({
    super.key,
    this.size = IdsSize.standard,
    this.orientation = Axis.vertical,
    this.required = false,
    this.disabled = false,
    this.invalid = false,
    required this.children,
  });

  final IdsSize size;
  final Axis orientation;
  final bool required;
  final bool disabled;
  final bool invalid;
  final List<Widget> children;

  static IdsField? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsFieldScope>()?.field;

  static String? controlLabelOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsFieldScope>()?.label;

  static _IdsFieldScope _of(BuildContext context, String part) {
    final scope = context.dependOnInheritedWidgetOfExactType<_IdsFieldScope>();
    assert(scope != null, '$part must be rendered inside an IdsField.');
    return scope!;
  }

  @override
  State<IdsField> createState() => _IdsFieldState();
}

FieldControlBinding? bindFieldControl(
  BuildContext context,
  FocusNode focus,
  FieldControlBinding? binding,
) {
  final owner = context
      .dependOnInheritedWidgetOfExactType<_IdsFieldScope>()
      ?.owner;
  if (binding?._owner == owner && binding?._focus == focus) return binding;
  binding?.dispose();
  if (owner == null) return null;
  owner._controls[focus] = false;
  return FieldControlBinding._(owner, focus);
}

class FieldControlBinding {
  FieldControlBinding._(this._owner, this._focus);

  final _IdsFieldState _owner;
  final FocusNode _focus;

  void setInvalid(bool invalid) {
    if (_owner._controls[_focus] == invalid) return;
    _owner._controls[_focus] = invalid;
    _owner._scheduleValidationUpdate();
  }

  void dispose() {
    if (_owner._controls.remove(_focus) == true) {
      _owner._scheduleValidationUpdate();
    }
  }
}

String? _controlLabel(List<Widget> children) {
  for (final child in children) {
    if (child is IdsFieldLabel && child.child is Text) {
      final label = child.child as Text;
      return label.semanticsLabel ??
          label.data ??
          label.textSpan?.toPlainText();
    }
  }
  return null;
}

class _IdsFieldState extends State<IdsField> {
  final _controls = <FocusNode, bool>{};
  bool _controlInvalid = false;
  bool _validationUpdateScheduled = false;

  void _scheduleValidationUpdate() {
    if (_validationUpdateScheduled) return;
    _validationUpdateScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _validationUpdateScheduled = false;
      if (!mounted) return;
      final invalid = _controls.values.any((invalid) => invalid);
      if (invalid != _controlInvalid) setState(() => _controlInvalid = invalid);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context);
    final style = switch (widget.size) {
      IdsSize.standard => IdsTypography.bodyB3Regular,
      IdsSize.tiny => IdsTypography.captionC1Regular,
    };

    final invalid = widget.invalid || _controlInvalid;
    return _IdsFieldScope(
      field: widget,
      owner: this,
      invalid: invalid,
      label: _controlLabel(widget.children),
      child: Opacity(
        opacity: widget.disabled ? 0.5 : 1,
        child: DefaultTextStyle(
          style: theme.textStyle(style, color: theme.colors.textNeutralStrong),
          child: Column(
            mainAxisSize: widget.orientation == Axis.horizontal
                ? MainAxisSize.min
                : MainAxisSize.max,
            crossAxisAlignment: widget.orientation == Axis.horizontal
                ? CrossAxisAlignment.start
                : CrossAxisAlignment.stretch,
            spacing: theme.dimension(8),
            children: widget.orientation == Axis.horizontal
                ? [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      spacing: theme.dimension(8),
                      children: [
                        for (final child in widget.children)
                          if (child is! IdsFieldDescription &&
                              child is! IdsFieldHint &&
                              child is! IdsFieldError)
                            Flexible(child: child),
                      ],
                    ),
                    for (final child in widget.children)
                      if (child is IdsFieldDescription ||
                          (invalid
                              ? child is IdsFieldError
                              : child is IdsFieldHint))
                        child,
                  ]
                : [
                    for (final child in widget.children)
                      if (!(invalid
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
    final scope = IdsField._of(context, 'IdsFieldLabel');
    final field = scope.field;
    return Align(
      alignment: AlignmentDirectional.centerStart,
      widthFactor: field.orientation == Axis.horizontal ? 1 : null,
      child: GestureDetector(
        excludeFromSemantics: true,
        onTap: field.disabled
            ? null
            : () {
                for (final node in scope.owner._controls.keys) {
                  if (node.canRequestFocus) {
                    node.requestFocus();
                    break;
                  }
                }
              },
        child: IdsLabel(
          size: field.size,
          required: required ?? field.required,
          invalid: scope.invalid,
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
    required this.owner,
    required this.invalid,
    required this.label,
    required super.child,
  });

  final IdsField field;
  final _IdsFieldState owner;
  final bool invalid;
  final String? label;

  @override
  bool updateShouldNotify(_IdsFieldScope old) =>
      old.field.size != field.size ||
      old.field.required != field.required ||
      old.field.disabled != field.disabled ||
      old.field.invalid != field.invalid ||
      old.invalid != invalid ||
      old.label != label;
}
