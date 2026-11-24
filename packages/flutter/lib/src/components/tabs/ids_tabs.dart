import 'dart:ui' show SemanticsRole;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_sizes.dart';
import '../../../tokens/ids_typography.dart';
import '../../interaction/control_surface.dart';
import '../../interaction/control_tokens.dart';
import '../../interaction/ids_interactive.dart';
import '../../interaction/control_color_states.dart';

part 'tabs_list.dart';
part 'tabs_trigger.dart';
part 'tabs_content.dart';

enum IdsTabsAppearance { underline, pill, enclosed }

enum IdsTabsActivationMode { automatic, manual }

typedef IdsTabsState<T extends Object> = ({
  T? value,
  Axis orientation,
  IdsTabsAppearance appearance,
  IdsSize size,
});

typedef IdsTabsTriggerState<T extends Object> = ({
  T value,
  bool selected,
  IdsInteractiveState interaction,
});

typedef IdsTabsContentState<T extends Object> = ({T value, bool selected});
typedef _TabItem<T extends Object> = ({T value, bool disabled, String? label});

class IdsTabs<T extends Object> extends StatefulWidget {
  const IdsTabs({
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.orientation = Axis.horizontal,
    this.appearance = IdsTabsAppearance.underline,
    this.variant,
    this.size = IdsSize.standard,
    this.colorScheme = IdsColorScheme.primary,
    this.activationMode = IdsTabsActivationMode.automatic,
    this.loop = true,
    required List<Widget> this.children,
  }) : builder = null,
       assert(value == null || defaultValue == null),
       assert(variant == null || appearance == IdsTabsAppearance.pill),
       assert(
         colorScheme == IdsColorScheme.primary ||
             colorScheme == IdsColorScheme.secondary ||
             colorScheme == IdsColorScheme.tertiary,
       );

  const IdsTabs.builder({
    super.key,
    this.value,
    this.defaultValue,
    this.onValueChange,
    this.orientation = Axis.horizontal,
    this.appearance = IdsTabsAppearance.underline,
    this.variant,
    this.size = IdsSize.standard,
    this.colorScheme = IdsColorScheme.primary,
    this.activationMode = IdsTabsActivationMode.automatic,
    this.loop = true,
    required List<Widget> Function(BuildContext, IdsTabsState<T>) this.builder,
  }) : children = null,
       assert(value == null || defaultValue == null),
       assert(variant == null || appearance == IdsTabsAppearance.pill),
       assert(
         colorScheme == IdsColorScheme.primary ||
             colorScheme == IdsColorScheme.secondary ||
             colorScheme == IdsColorScheme.tertiary,
       );

  final T? value;
  final T? defaultValue;
  final ValueChanged<T>? onValueChange;
  final Axis orientation;
  final IdsTabsAppearance appearance;
  final IdsVariant? variant;
  final IdsSize size;
  final IdsColorScheme colorScheme;
  final IdsTabsActivationMode activationMode;
  final bool loop;
  final List<Widget>? children;
  final List<Widget> Function(BuildContext, IdsTabsState<T>)? builder;

  @override
  State<IdsTabs<T>> createState() => _IdsTabsState<T>();
}

class _IdsTabsState<T extends Object> extends State<IdsTabs<T>> {
  final _items = <FocusNode, _TabItem<T>>{};
  late T? _uncontrolled = widget.defaultValue;
  bool _updatePending = false;
  int _itemsRevision = 0;

  Iterable<FocusNode> get _enabled =>
      _items.keys.where((item) => !_items[item]!.disabled);

  T? get _selected =>
      widget.value ?? _uncontrolled ?? _items[_enabled.firstOrNull]?.value;

  void _register(FocusNode focus, Object value, bool disabled, String? label) {
    final item = (value: value as T, disabled: disabled, label: label);
    if (_items[focus] == item) return;
    _items[focus] = item;
    _itemsRevision++;
    _scheduleUpdate();
  }

  void _unregister(FocusNode focus) {
    if (_items.remove(focus) == null) return;
    _itemsRevision++;
    _scheduleUpdate();
  }

  void _scheduleUpdate() {
    if (_updatePending) return;
    _updatePending = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updatePending = false;
      if (mounted) setState(() {});
    });
  }

  void _select(Object value) {
    if (_selected == value) return;
    final next = value as T;
    if (widget.value == null) setState(() => _uncontrolled = next);
    widget.onValueChange?.call(next);
  }

  @override
  void didUpdateWidget(IdsTabs<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != null && widget.value == null) {
      _uncontrolled = oldWidget.value;
    }
  }

  FocusNode? _tabStop(T? value) {
    for (final item in _enabled) {
      if (item.hasPrimaryFocus) return item;
    }
    for (final item in _enabled) {
      if (_items[item]!.value == value) return item;
    }
    return _enabled.firstOrNull;
  }

  KeyEventResult _onKey(BuildContext context, KeyEvent event) {
    final keyboard = HardwareKeyboard.instance;
    if (event is! KeyDownEvent && event is! KeyRepeatEvent ||
        keyboard.isControlPressed ||
        keyboard.isAltPressed ||
        keyboard.isMetaPressed ||
        keyboard.isShiftPressed) {
      return KeyEventResult.ignored;
    }
    final enabled = _enabled.toList();
    final index = enabled.indexWhere((focus) => focus.hasPrimaryFocus);
    if (index < 0) return KeyEventResult.ignored;
    final horizontal = widget.orientation == Axis.horizontal;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final delta = switch (event.logicalKey) {
      LogicalKeyboardKey.arrowLeft when horizontal => rtl ? 1 : -1,
      LogicalKeyboardKey.arrowRight when horizontal => rtl ? -1 : 1,
      LogicalKeyboardKey.arrowUp when !horizontal => -1,
      LogicalKeyboardKey.arrowDown when !horizontal => 1,
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
    final target = enabled[next];
    target.requestFocus();
    if (widget.activationMode == IdsTabsActivationMode.automatic) {
      _select(_items[target]!.value);
    }
    _scheduleUpdate();
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final value = _selected;
    final state = (
      value: value,
      orientation: widget.orientation,
      appearance: widget.appearance,
      size: widget.size,
    );
    return _TabsScope(
      owner: this,
      itemsRevision: _itemsRevision,
      state: state,
      tabStop: _tabStop(value),
      variant: widget.variant ?? IdsVariant.soft,
      colorScheme: widget.colorScheme,
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        includeSemantics: false,
        onKeyEvent: (_, event) => _onKey(context, event),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final horizontal = widget.orientation == Axis.horizontal;
            final children = widget.children ?? widget.builder!(context, state);
            if (horizontal) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: constraints.hasBoundedWidth
                    ? CrossAxisAlignment.stretch
                    : CrossAxisAlignment.start,
                children: children,
              );
            }
            return Row(
              mainAxisSize: constraints.hasBoundedWidth
                  ? MainAxisSize.max
                  : MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final child in children)
                  if (child is IdsTabsContent<Object> &&
                      constraints.hasBoundedWidth)
                    Flexible(
                      key: child.key == null ? null : ValueKey(child.key),
                      flex: child.value == value ? 1 : 0,
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          maxWidth: constraints.maxWidth,
                        ),
                        child: child,
                      ),
                    )
                  else
                    child,
              ],
            );
          },
        ),
      ),
    );
  }
}

class _TabsScope extends InheritedWidget {
  const _TabsScope({
    required this.owner,
    required this.state,
    required this.itemsRevision,
    required this.tabStop,
    required this.variant,
    required this.colorScheme,
    required super.child,
  });

  final _IdsTabsState<Object> owner;
  final IdsTabsState<Object> state;
  final int itemsRevision;
  final FocusNode? tabStop;
  final IdsVariant variant;
  final IdsColorScheme colorScheme;

  static _TabsScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<_TabsScope>();
    assert(scope != null, 'Tabs parts must be inside IdsTabs.');
    return scope!;
  }

  @override
  bool updateShouldNotify(_TabsScope old) =>
      owner != old.owner ||
      state != old.state ||
      itemsRevision != old.itemsRevision ||
      tabStop != old.tabStop ||
      variant != old.variant ||
      colorScheme != old.colorScheme;
}
