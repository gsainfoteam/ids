import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

@immutable
class InteractiveState {
  const InteractiveState({
    this.hovered = false,
    this.active = false,
    this.focused = false,
    this.focusVisible = false,
    this.pressed = false,
    this.disabled = false,
  });

  final bool hovered;

  final bool active;

  final bool focused;

  final bool focusVisible;

  final bool pressed;

  final bool disabled;

  @override
  bool operator ==(Object other) =>
      other is InteractiveState &&
      other.hovered == hovered &&
      other.active == active &&
      other.focused == focused &&
      other.focusVisible == focusVisible &&
      other.pressed == pressed &&
      other.disabled == disabled;

  @override
  int get hashCode =>
      Object.hash(hovered, active, focused, focusVisible, pressed, disabled);

  @override
  String toString() =>
      'InteractiveState(hovered: $hovered, active: $active, focused: $focused, '
      'focusVisible: $focusVisible, pressed: $pressed, disabled: $disabled)';
}

class Interactive extends StatefulWidget {
  const Interactive({
    super.key,
    required this.builder,
    this.onPressed,
    this.disabled = false,
    this.pressed = false,
    this.onInteractionChange,
    this.focusNode,
    this.autofocus = false,
  });

  final Widget Function(BuildContext context, InteractiveState state) builder;

  final VoidCallback? onPressed;

  final bool disabled;
  final bool pressed;

  final ValueChanged<InteractiveState>? onInteractionChange;

  final FocusNode? focusNode;
  final bool autofocus;

  @override
  State<Interactive> createState() => _InteractiveState();
}

class _InteractiveState extends State<Interactive> {
  bool _hovered = false;
  bool _active = false;
  bool _focused = false;
  bool _focusVisible = false;

  bool _pointerFocus = false;
  bool _spaceHeld = false;
  bool _primary = false;
  FocusNode? _listened;

  int? _pointerDownHere;
  int? _pointerTakenByDescendant;

  bool get _pressBelongsToDescendant =>
      _pointerDownHere != null && _pointerDownHere == _pointerTakenByDescendant;

  FocusNode? _internalNode;
  FocusNode get _node => widget.focusNode ?? (_internalNode ??= FocusNode());

  InteractiveState? _reported;

  InteractiveState get _state => InteractiveState(
    hovered: _hovered,
    active: _active,
    focused: _focused,
    focusVisible: _focusVisible,
    pressed: widget.pressed,
    disabled: widget.disabled,
  );

  @override
  void initState() {
    super.initState();
    _listenTo(_node);
    _reportAfterFrame();
  }

  @override
  void didUpdateWidget(Interactive oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_node != _listened) _listenTo(_node);
    if (widget.disabled == oldWidget.disabled &&
        widget.pressed == oldWidget.pressed) {
      return;
    }
    if (widget.disabled) {
      _active = false;
      _hovered = false;
    }
    _reportAfterFrame();
  }

  @override
  void dispose() {
    _listened?.removeListener(_handlePrimaryFocus);
    _internalNode?.dispose();
    super.dispose();
  }

  void _set(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
    _report();
  }

  void _report() {
    final state = _state;
    if (state == _reported) return;
    _reported = state;
    widget.onInteractionChange?.call(state);
  }

  void _reportAfterFrame() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _report();
    });
  }

  void _descendantTookPointer(int pointer) {
    _pointerTakenByDescendant = pointer;
    _tellAncestorsPointerIsTaken(pointer);
  }

  void _tellAncestorsPointerIsTaken(int pointer) => context
      .findAncestorStateOfType<_InteractiveState>()
      ?._descendantTookPointer(pointer);

  static void _ignorePress() {}

  void _listenTo(FocusNode node) {
    _listened?.removeListener(_handlePrimaryFocus);
    _listened = node..addListener(_handlePrimaryFocus);
    _primary = node.hasPrimaryFocus;
  }

  void _handlePrimaryFocus() {
    final primary = _node.hasPrimaryFocus;
    if (primary == _primary) return;
    _primary = primary;
    final visible =
        primary &&
        !_pointerFocus &&
        FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
    _pointerFocus = false;
    _set(() => _focusVisible = visible);
  }

  void _handleFocusChange(bool focused) {
    _set(() {
      _focused = focused;
      if (!focused) _active = false;
    });
    if (!focused) _spaceHeld = false;
  }

  KeyEventResult _handleKey(FocusNode node, KeyEvent event) {
    final key = event.logicalKey;
    final enter =
        key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.numpadEnter;
    if (widget.disabled ||
        !node.hasPrimaryFocus ||
        !(enter || key == LogicalKeyboardKey.space)) {
      return KeyEventResult.ignored;
    }
    if (event is KeyDownEvent) {
      if (!enter) _spaceHeld = true;
      _set(() => _active = true);
      if (enter) widget.onPressed?.call();
    } else if (event is KeyUpEvent) {
      _set(() => _active = false);
      if (!enter && _spaceHeld) widget.onPressed?.call();
      _spaceHeld = false;
    }
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final enabled = !widget.disabled;
    return Focus(
      focusNode: _node,
      autofocus: widget.autofocus,
      canRequestFocus: enabled,
      onFocusChange: _handleFocusChange,
      onKeyEvent: _handleKey,
      child: MouseRegion(
        onEnter: (event) {
          if (enabled && event.kind == PointerDeviceKind.mouse) {
            _set(() => _hovered = true);
          }
        },
        onExit: (event) {
          if (event.kind == PointerDeviceKind.mouse) {
            _set(() {
              _hovered = false;
              _active = false;
            });
          }
        },
        child: Listener(
          onPointerDown: (event) {
            _pointerDownHere = event.pointer;
            _tellAncestorsPointerIsTaken(event.pointer);
          },
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: enabled
                ? (_) {
                    if (!_pressBelongsToDescendant) {
                      _pointerFocus = true;
                      _node.requestFocus();
                    }
                    _set(() => _active = true);
                  }
                : null,
            onTapUp: enabled ? (_) => _set(() => _active = false) : null,
            onTapCancel: enabled
                ? () {
                    if (_active) _set(() => _active = false);
                  }
                : null,
            onTap: enabled ? widget.onPressed : _ignorePress,
            excludeFromSemantics: !enabled,
            child: widget.builder(context, _state),
          ),
        ),
      ),
    );
  }
}
