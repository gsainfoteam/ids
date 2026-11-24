import 'package:flutter/widgets.dart';

import '../../../tokens/ids_enums.dart';
import '../../interaction/button_control.dart';
import '../../interaction/ids_interactive.dart';
import '../group/ids_group.dart';
import '../toggle_group/toggle_group_scope.dart';

class IdsToggle extends StatefulWidget implements IdsGroupedControl {
  const IdsToggle({
    super.key,
    required Widget this.child,
    this.pressed,
    this.defaultPressed,
    this.onPressedChange,
    this.onPressed,
    this.leading,
    this.trailing,
    this.variant,
    this.size,
    this.colorScheme = IdsColorScheme.primary,
    this.value,
    this.disabled = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.onInteractionChange,
    this.style,
  }) : builder = null,
       assert(pressed == null || defaultPressed == null);

  const IdsToggle.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) this.builder,
    this.pressed,
    this.defaultPressed,
    this.onPressedChange,
    this.onPressed,
    this.leading,
    this.trailing,
    this.variant,
    this.size,
    this.colorScheme = IdsColorScheme.primary,
    this.value,
    this.disabled = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.onInteractionChange,
    this.style,
  }) : child = null,
       assert(pressed == null || defaultPressed == null);

  final Widget? child;
  final Widget Function(BuildContext, IdsInteractiveState)? builder;
  final bool? pressed;
  final bool? defaultPressed;
  final ValueChanged<bool>? onPressedChange;
  final VoidCallback? onPressed;
  final Widget? leading;
  final Widget? trailing;
  final IdsVariant? variant;
  final IdsSize? size;
  final IdsColorScheme colorScheme;
  final Object? value;
  final bool disabled;
  final bool focusableWhenDisabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final ValueChanged<IdsInteractiveState>? onInteractionChange;
  final ShapeDecoration Function(IdsInteractiveState, ShapeDecoration)? style;

  @protected
  bool get square => false;

  @protected
  IdsVariant get defaultVariant => IdsVariant.outline;

  @override
  State<IdsToggle> createState() => _IdsToggleState();
}

class _IdsToggleState extends State<IdsToggle> {
  late bool _pressed = widget.defaultPressed ?? false;
  final _localFocus = FocusNode();
  ToggleGroupOwner? _owner;
  FocusNode? _registered;
  FocusNode get _focus => widget.focusNode ?? _localFocus;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _register();
  }

  void _register() {
    final group = ToggleGroupScope.maybeOf(context);
    if (_owner != group?.owner || _registered != _focus) {
      if (_registered case final focus?) _owner?.unregister(focus);
      _owner = group?.owner;
      _registered = group == null ? null : _focus;
    }
    if (widget.value case final value?) {
      group?.owner.register(
        _focus,
        value,
        widget.disabled || group.disabled,
        _activate,
      );
    }
  }

  @override
  void dispose() {
    if (_registered case final focus?) _owner?.unregister(focus);
    _localFocus.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(IdsToggle oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.pressed != null && widget.pressed == null) {
      _pressed = oldWidget.pressed!;
    }
    if (widget.focusNode != oldWidget.focusNode ||
        widget.value != oldWidget.value ||
        widget.disabled != oldWidget.disabled) {
      _register();
    }
  }

  void _activate() {
    widget.onPressed?.call();
    if (_owner case final group?) {
      group.toggle(widget.value!);
      return;
    }
    final next = !(widget.pressed ?? _pressed);
    if (widget.pressed == null) setState(() => _pressed = next);
    widget.onPressedChange?.call(next);
  }

  @override
  Widget build(BuildContext context) {
    final group = ToggleGroupScope.maybeOf(context);
    assert(group == null || widget.value != null);
    assert(
      group == null ||
          (widget.pressed == null &&
              widget.defaultPressed == null &&
              widget.onPressedChange == null),
    );
    final pressed =
        group?.selected.contains(widget.value) ?? widget.pressed ?? _pressed;
    return ButtonControl(
      builder: widget.builder,
      style: widget.style,
      onPressed: _activate,
      pressed: pressed,
      radio: group != null && !group.multiple,
      skipTraversal: group?.tabStop != null && group!.tabStop != _focus,
      square: widget.square,
      leading: widget.leading,
      trailing: widget.trailing,
      variant:
          widget.variant ??
          IdsGroup.variantOf(context) ??
          widget.defaultVariant,
      size: widget.size ?? IdsGroup.sizeOf(context) ?? IdsSize.standard,
      colorScheme: widget.colorScheme,
      invalid: group?.invalid ?? false,
      disabled: widget.disabled || (group?.disabled ?? false),
      busy: false,
      focusableWhenDisabled: widget.focusableWhenDisabled,
      focusNode: _focus,
      autofocus: widget.autofocus,
      semanticLabel: widget.semanticLabel,
      onInteractionChange: widget.onInteractionChange,
      child: widget.child,
    );
  }
}
