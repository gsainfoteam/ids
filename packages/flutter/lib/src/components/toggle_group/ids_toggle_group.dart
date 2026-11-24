import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import '../field/ids_field.dart';
import '../group/ids_group.dart';
import 'toggle_group_scope.dart';

typedef _ToggleItem<T extends Object> = ({
  T value,
  bool disabled,
  VoidCallback activate,
});

class IdsToggleGroup<T extends Object> extends StatefulWidget {
  const IdsToggleGroup({
    super.key,
    T? defaultValue,
    ValueChanged<T?>? onValueChange,
    FormFieldSetter<T>? onSaved,
    FormFieldValidator<T>? validator,
    this.orientation = Axis.horizontal,
    this.attached = true,
    this.size,
    this.variant,
    this.disabled = false,
    this.loop = true,
    this.required = false,
    this.semanticLabel,
    this.focusNode,
    required this.children,
  }) : multiple = false,
       _controlled = false,
       _singleValue = defaultValue,
       _values = null,
       _onValueChange = onValueChange,
       _onValuesChange = null,
       _onSaved = onSaved,
       _onValuesSaved = null,
       _validator = validator,
       _valuesValidator = null;

  const IdsToggleGroup.controlled({
    super.key,
    required T? value,
    ValueChanged<T?>? onValueChange,
    FormFieldSetter<T>? onSaved,
    FormFieldValidator<T>? validator,
    this.orientation = Axis.horizontal,
    this.attached = true,
    this.size,
    this.variant,
    this.disabled = false,
    this.loop = true,
    this.required = false,
    this.semanticLabel,
    this.focusNode,
    required this.children,
  }) : multiple = false,
       _controlled = true,
       _singleValue = value,
       _values = null,
       _onValueChange = onValueChange,
       _onValuesChange = null,
       _onSaved = onSaved,
       _onValuesSaved = null,
       _validator = validator,
       _valuesValidator = null;

  const IdsToggleGroup.multiple({
    super.key,
    List<T>? value,
    List<T>? defaultValue,
    ValueChanged<List<T>>? onValueChange,
    FormFieldSetter<List<T>>? onSaved,
    FormFieldValidator<List<T>>? validator,
    this.orientation = Axis.horizontal,
    this.attached = true,
    this.size,
    this.variant,
    this.disabled = false,
    this.loop = true,
    this.required = false,
    this.semanticLabel,
    this.focusNode,
    required this.children,
  }) : multiple = true,
       _controlled = value != null,
       _singleValue = null,
       _values = value ?? defaultValue,
       _onValueChange = null,
       _onValuesChange = onValueChange,
       _onSaved = null,
       _onValuesSaved = onSaved,
       _validator = null,
       _valuesValidator = validator,
       assert(value == null || defaultValue == null);

  List<T> get _selection => switch (_singleValue) {
    final value? => [value],
    null => _values ?? const [],
  };

  final bool multiple;
  final bool _controlled;
  final T? _singleValue;
  final List<T>? _values;
  final ValueChanged<T?>? _onValueChange;
  final ValueChanged<List<T>>? _onValuesChange;
  final FormFieldSetter<T>? _onSaved;
  final FormFieldSetter<List<T>>? _onValuesSaved;
  final FormFieldValidator<T>? _validator;
  final FormFieldValidator<List<T>>? _valuesValidator;
  final Axis orientation;
  final bool attached;
  final IdsSize? size;
  final IdsVariant? variant;
  final bool disabled;
  final bool loop;
  final bool required;
  final String? semanticLabel;
  final FocusNode? focusNode;
  final List<Widget> children;

  static Widget separator({Key? key, Widget? child}) =>
      IdsGroupSeparator(key: key, child: child);

  @override
  State<IdsToggleGroup<T>> createState() => _IdsToggleGroupState<T>();
}

class _IdsToggleGroupState<T extends Object> extends State<IdsToggleGroup<T>>
    implements ToggleGroupOwner {
  final _form = GlobalKey<FormFieldState<List<T>>>();
  final _rootFocus = FocusNode();
  final _items = <FocusNode, _ToggleItem<T>>{};
  FocusNode? _lastFocused;
  bool _updateScheduled = false;

  FocusNode get _focus => widget.focusNode ?? _rootFocus;
  bool get _disabled => widget.disabled || (_field?.disabled ?? false);
  bool get _required => widget.required || (_field?.required ?? false);
  IdsField? _field;
  FieldControlBinding? _fieldControl;

  List<T> get _selected => widget._controlled
      ? widget._selection
      : _form.currentState?.value ?? widget._selection;

  Iterable<FocusNode> get _enabled =>
      _items.keys.where((node) => !(_items[node]!.disabled || _disabled));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _field = IdsField.maybeOf(context);
    _fieldControl = bindFieldControl(context, _focus, _fieldControl);
  }

  @override
  void register(
    FocusNode focus,
    Object value,
    bool disabled,
    VoidCallback activate,
  ) {
    final next = (value: value as T, disabled: disabled, activate: activate);
    if (_items[focus] == next) return;
    if (!_items.containsKey(focus)) focus.addListener(_rememberFocus);
    _items[focus] = next;
    _scheduleUpdate();
  }

  @override
  void unregister(FocusNode focus) {
    if (_items.remove(focus) == null) return;
    focus.removeListener(_rememberFocus);
    if (_lastFocused == focus) _lastFocused = null;
    _scheduleUpdate();
  }

  void _rememberFocus() {
    final focus = FocusManager.instance.primaryFocus;
    if (!widget.multiple ||
        !_items.containsKey(focus) ||
        _lastFocused == focus) {
      return;
    }
    _lastFocused = focus;
    _scheduleUpdate();
  }

  void _scheduleUpdate() {
    if (_updateScheduled) return;
    _updateScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateScheduled = false;
      if (mounted) setState(() {});
    });
  }

  @override
  void didUpdateWidget(IdsToggleGroup<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.focusNode != widget.focusNode) {
      _fieldControl = bindFieldControl(context, _focus, _fieldControl);
    }
    if (!widget._controlled ||
        _form.currentState?.hasError != true ||
        listEquals(oldWidget._selection, widget._selection)) {
      return;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final field = _form.currentState;
      if (mounted && field != null && field.hasError) field.validate();
    });
  }

  @override
  void dispose() {
    for (final focus in _items.keys) {
      focus.removeListener(_rememberFocus);
    }
    _fieldControl?.dispose();
    _rootFocus.dispose();
    super.dispose();
  }

  void _change(List<T> next) {
    if (_disabled || listEquals(_selected, next)) return;
    final value = List<T>.unmodifiable(next);
    _form.currentState!.didChange(value);
    widget._onValueChange?.call(value.firstOrNull);
    widget._onValuesChange?.call(value);
  }

  @override
  void toggle(Object value) {
    final item = value as T;
    if (!widget.multiple) {
      final alreadySelected = _selected.contains(item);
      if (!alreadySelected || !_required) {
        _change(alreadySelected ? const [] : [item]);
      }
      return;
    }

    final next = _selected.toSet();
    if (!next.add(item)) next.remove(item);
    final known = _items.values.map((item) => item.value).toSet();
    _change([
      ...known.where(next.contains),
      ...next.where((value) => !known.contains(value)),
    ]);
  }

  FocusNode? _tabStop(List<T> selected) {
    if (widget.multiple) {
      return _enabled.contains(_lastFocused)
          ? _lastFocused
          : _enabled.firstOrNull;
    }
    for (final focus in _enabled) {
      if (selected.contains(_items[focus]!.value)) return focus;
    }
    return _enabled.firstOrNull;
  }

  void _onFocus(bool focused) {
    if (focused && _focus.hasPrimaryFocus) _tabStop(_selected)?.requestFocus();
  }

  KeyEventResult _onKey(BuildContext context, KeyEvent event) {
    final keyboard = HardwareKeyboard.instance;
    if (_disabled ||
        event is! KeyDownEvent && event is! KeyRepeatEvent ||
        keyboard.isControlPressed ||
        keyboard.isAltPressed ||
        keyboard.isMetaPressed ||
        keyboard.isShiftPressed) {
      return KeyEventResult.ignored;
    }
    final enabled = _enabled.toList();
    final index = enabled.indexWhere((node) => node.hasPrimaryFocus);
    if (index < 0) return KeyEventResult.ignored;
    final horizontal =
        !widget.multiple || widget.orientation == Axis.horizontal;
    final vertical = !widget.multiple || widget.orientation == Axis.vertical;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final delta = switch (event.logicalKey) {
      LogicalKeyboardKey.arrowLeft when horizontal => rtl ? 1 : -1,
      LogicalKeyboardKey.arrowRight when horizontal => rtl ? -1 : 1,
      LogicalKeyboardKey.arrowUp when vertical => -1,
      LogicalKeyboardKey.arrowDown when vertical => 1,
      _ => 0,
    };
    final next = switch (event.logicalKey) {
      LogicalKeyboardKey.home => 0,
      LogicalKeyboardKey.end => enabled.length - 1,
      _ when delta != 0 && widget.loop => (index + delta) % enabled.length,
      _ when delta != 0 => (index + delta).clamp(0, enabled.length - 1),
      _ => null,
    };
    if (next == null) return KeyEventResult.ignored;
    if (next == index) return KeyEventResult.handled;
    final target = enabled[next];
    target.requestFocus();
    final item = _items[target]!;
    if (!widget.multiple && !_selected.contains(item.value)) item.activate();
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    final label = widget.semanticLabel ?? IdsField.controlLabelOf(context);
    return FormField<List<T>>(
      key: _form,
      initialValue: List<T>.unmodifiable(widget._selection),
      enabled: !_disabled,
      autovalidateMode: AutovalidateMode.onUserInteractionIfError,
      onSaved: (_) {
        widget._onSaved?.call(_selected.firstOrNull);
        widget._onValuesSaved?.call(_selected);
      },
      validator: (input) {
        if (_disabled) return null;
        final value = widget._controlled ? widget._selection : input!;
        if (_required && value.isEmpty) {
          return scope.messages.checkboxGroupRequired;
        }
        return widget.multiple
            ? widget._valuesValidator?.call(value)
            : widget._validator?.call(value.firstOrNull);
      },
      builder: (form) {
        final selected = _selected;
        final invalid = form.hasError || (_field?.invalid ?? false);
        _fieldControl?.setInvalid(!_disabled && form.hasError);
        final group = Focus(
          focusNode: _focus,
          skipTraversal: true,
          canRequestFocus: !_disabled,
          onFocusChange: _onFocus,
          onKeyEvent: (_, event) => _onKey(context, event),
          child: Semantics(
            container: true,
            explicitChildNodes: true,
            role: widget.multiple ? null : SemanticsRole.radioGroup,
            label: label,
            enabled: !_disabled,
            validationResult: invalid
                ? SemanticsValidationResult.invalid
                : SemanticsValidationResult.none,
            child: ToggleGroupScope(
              owner: this,
              selected: selected,
              tabStop: _tabStop(selected),
              disabled: _disabled,
              invalid: invalid,
              multiple: widget.multiple,
              child: IdsGroup(
                orientation: widget.orientation,
                attached: widget.attached,
                size: widget.size ?? _field?.size,
                variant: widget.variant,
                decorativeSeparator: !widget.multiple,
                children: widget.children,
              ),
            ),
          ),
        );
        final error = form.errorText;
        final hasFieldError =
            _field?.children.any((child) => child is IdsFieldError) ?? false;
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: scope.dimension(4),
          children: [
            group,
            if (error != null && !hasFieldError)
              Semantics(
                liveRegion: true,
                child: Text(
                  error,
                  style: scope.textStyle(
                    IdsTypography.captionC1Regular,
                    color: scope.colors.textDanger,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
