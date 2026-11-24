import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../checkbox/ids_checkbox.dart';
import '../field/ids_field.dart';
import 'checkbox_group_scope.dart';

typedef IdsCheckboxGroupState<T extends Object> = ({
  List<T> value,
  Axis orientation,
  bool disabled,
  bool readOnly,
  bool required,
  bool invalid,
});

class IdsCheckboxGroup<T extends Object> extends StatefulWidget {
  const IdsCheckboxGroup({
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.onSaved,
    this.validator,
    this.orientation = Axis.vertical,
    this.size,
    this.variant,
    this.disabled = false,
    this.readOnly = false,
    this.required = false,
    this.requiredMessage,
    this.invalid = false,
    this.semanticLabel,
    this.focusNode,
    this.style,
    required List<Widget> this.children,
  }) : builder = null,
       assert(value == null || defaultValue == null);

  const IdsCheckboxGroup.builder({
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.onSaved,
    this.validator,
    this.orientation = Axis.vertical,
    this.size,
    this.variant,
    this.disabled = false,
    this.readOnly = false,
    this.required = false,
    this.requiredMessage,
    this.invalid = false,
    this.semanticLabel,
    this.focusNode,
    this.style,
    required List<Widget> Function(BuildContext, IdsCheckboxGroupState<T>)
    this.builder,
  }) : children = null,
       assert(value == null || defaultValue == null);

  final List<T>? value;
  final List<T>? defaultValue;
  final ValueChanged<List<T>>? onValueChange;
  final FormFieldSetter<List<T>>? onSaved;
  final FormFieldValidator<List<T>>? validator;
  final Axis orientation;
  final IdsSize? size;
  final IdsVariant? variant;
  final bool disabled;
  final bool readOnly;
  final bool required;
  final String? requiredMessage;
  final bool invalid;
  final String? semanticLabel;
  final FocusNode? focusNode;
  final List<Widget>? children;
  final List<Widget> Function(BuildContext, IdsCheckboxGroupState<T>)? builder;
  final Widget Function(BuildContext, IdsCheckboxGroupState<T>, Widget)? style;

  @override
  State<IdsCheckboxGroup<T>> createState() => _IdsCheckboxGroupState<T>();
}

class IdsCheckboxGroupItem<T extends Object> extends IdsCheckbox {
  const IdsCheckboxGroupItem({
    super.key,
    required T super.value,
    super.onCheckedChange,
    super.variant,
    super.size,
    super.disabled,
    super.readOnly,
    super.required,
    super.invalid,
    super.focusNode,
    super.autofocus,
    super.label,
    super.semanticLabel,
    super.child,
    super.builder,
    super.style,
  });

  @override
  T get value => super.value! as T;
}

class IdsCheckboxGroupAll extends StatelessWidget {
  const IdsCheckboxGroupAll({
    super.key,
    this.variant,
    this.size,
    this.disabled = false,
    this.readOnly = false,
    this.required = false,
    this.invalid = false,
    this.focusNode,
    this.autofocus = false,
    this.label,
    this.semanticLabel,
    this.child,
    this.builder,
    this.style,
  }) : assert(child == null || builder == null);

  final IdsVariant? variant;
  final IdsSize? size;
  final bool disabled;
  final bool readOnly;
  final bool required;
  final bool invalid;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? label;
  final String? semanticLabel;
  final Widget? child;
  final Widget Function(BuildContext context, IdsCheckboxState state)? builder;
  final ShapeDecoration Function(IdsCheckboxState state, ShapeDecoration base)?
  style;

  @override
  Widget build(BuildContext context) {
    final group = CheckboxGroupScope.maybeOf(context);
    assert(
      group != null,
      'IdsCheckboxGroupAll must be inside IdsCheckboxGroup.',
    );
    return IdsCheckbox(
      checked: group!.all,
      disabled: disabled || group.disabled,
      readOnly: readOnly || group.readOnly,
      required: required,
      invalid: invalid || group.invalid,
      variant: variant ?? group.variant,
      size: size ?? group.size,
      onCheckedChange: group.owner.setAll,
      focusNode: focusNode,
      autofocus: autofocus,
      label: label,
      semanticLabel: semanticLabel,
      builder: builder,
      style: style,
      child: child,
    );
  }
}

typedef _Item<T extends Object> = ({T value, bool disabled});

class _IdsCheckboxGroupState<T extends Object>
    extends State<IdsCheckboxGroup<T>>
    implements CheckboxGroupOwner {
  final _form = GlobalKey<FormFieldState<List<T>>>();
  final _localFocus = FocusNode();
  final _items = <FocusNode, _Item<T>>{};
  FieldControlBinding? _fieldControl;
  bool _registrationScheduled = false;

  FocusNode get _focus => widget.focusNode ?? _localFocus;
  List<T> get _value =>
      widget.value ??
      _form.currentState?.value ??
      widget.defaultValue ??
      const [];
  Iterable<T> get _enabled =>
      _items.values.where((item) => !item.disabled).map((item) => item.value);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _fieldControl = bindFieldControl(context, _focus, _fieldControl);
  }

  @override
  void didUpdateWidget(IdsCheckboxGroup<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!listEquals(widget.value, oldWidget.value) &&
        _form.currentState?.hasError == true) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final field = _form.currentState;
        if (mounted && field != null && field.hasError) field.validate();
      });
    }
    if (oldWidget.focusNode != widget.focusNode) {
      _fieldControl = bindFieldControl(context, _focus, _fieldControl);
    }
  }

  @override
  void dispose() {
    _fieldControl?.dispose();
    _localFocus.dispose();
    super.dispose();
  }

  @override
  void register(FocusNode focus, Object value, bool disabled) {
    final entry = (value: value as T, disabled: disabled);
    if (_items[focus] == entry) return;
    _items[focus] = entry;
    _scheduleRegistration();
  }

  @override
  void unregister(FocusNode focus) {
    if (_items.remove(focus) != null) _scheduleRegistration();
  }

  void _scheduleRegistration() {
    if (_registrationScheduled) return;
    _registrationScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _registrationScheduled = false;
      if (mounted) setState(() {});
    });
  }

  void _change(Set<T> next) {
    final before = _value.toSet();
    if (widget.disabled || widget.readOnly || setEquals(before, next)) return;
    final value = List<T>.unmodifiable(next);
    _form.currentState!.didChange(value);
    widget.onValueChange?.call(value);
  }

  @override
  void toggle(Object value, bool checked) {
    final next = _value.toSet();
    if (checked) {
      next.add(value as T);
    } else {
      next.remove(value);
    }
    _change(next);
  }

  @override
  void setAll(bool checked) {
    final next = _value.toSet();
    if (checked) {
      next.addAll(_enabled);
    } else {
      next.removeAll(_enabled);
    }
    _change(next);
  }

  void _forwardFocus(bool focused) {
    if (!focused || !_focus.hasPrimaryFocus) return;
    final selected = _value.toSet();
    FocusNode? first;
    for (final entry in _items.entries) {
      if (entry.value.disabled) continue;
      first ??= entry.key;
      if (!selected.contains(entry.value.value)) continue;
      entry.key.requestFocus();
      return;
    }
    first?.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context);
    final field = IdsField.maybeOf(context);
    final disabled = widget.disabled || (field?.disabled ?? false);
    final required = widget.required || (field?.required ?? false);
    final label = widget.semanticLabel ?? IdsField.controlLabelOf(context);
    final requiredMessage =
        widget.requiredMessage ?? theme.messages.checkboxGroupRequired;

    return FormField<List<T>>(
      key: _form,
      initialValue: List.unmodifiable(
        widget.value ?? widget.defaultValue ?? const [],
      ),
      enabled: !disabled,
      autovalidateMode: AutovalidateMode.onUserInteractionIfError,
      onSaved: widget.onSaved == null
          ? null
          : (value) => widget.onSaved!(widget.value ?? value),
      validator: (input) {
        if (disabled || widget.readOnly) return null;
        final value = widget.value ?? input!;
        if (required && value.isEmpty) return requiredMessage;
        return widget.validator?.call(value);
      },
      builder: (form) {
        final value = widget.value ?? form.value!;
        final invalid =
            widget.invalid || (field?.invalid ?? false) || form.hasError;
        _fieldControl?.setInvalid(
          !disabled && (form.hasError || widget.invalid),
        );
        final enabled = _enabled.toSet();
        final selected = enabled.where(value.contains).length;
        final all = selected == 0
            ? IdsCheckedState.unchecked
            : selected == enabled.length
            ? IdsCheckedState.checked
            : IdsCheckedState.indeterminate;
        final state = (
          value: value,
          orientation: widget.orientation,
          disabled: disabled,
          readOnly: widget.readOnly,
          required: required,
          invalid: invalid,
        );
        return Focus(
          focusNode: _focus,
          canRequestFocus: !disabled,
          skipTraversal: true,
          onFocusChange: _forwardFocus,
          child: Semantics(
            container: true,
            label: label,
            enabled: !disabled,
            readOnly: widget.readOnly,
            explicitChildNodes: true,
            child: CheckboxGroupScope(
              owner: this,
              value: value,
              all: all,
              disabled: disabled,
              readOnly: widget.readOnly,
              invalid: invalid,
              size: widget.size,
              variant: widget.variant,
              child: Builder(
                builder: (context) {
                  final group = Wrap(
                    direction: widget.orientation,
                    spacing: theme.dimension(
                      widget.orientation == Axis.horizontal ? 24 : 12,
                    ),
                    runSpacing: theme.dimension(12),
                    crossAxisAlignment: widget.orientation == Axis.horizontal
                        ? WrapCrossAlignment.center
                        : WrapCrossAlignment.start,
                    children:
                        widget.children ?? widget.builder!(context, state),
                  );
                  return widget.style?.call(context, state, group) ?? group;
                },
              ),
            ),
          ),
        );
      },
    );
  }
}
