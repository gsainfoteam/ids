import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

/// React `useInteractive`의 `InteractiveState`. 원시값 그대로이고 우선순위는 적용하지 않는다.
@immutable
class IdsInteractiveState {
  const IdsInteractiveState({
    this.hovered = false,
    this.active = false,
    this.focused = false,
    this.focusVisible = false,
    this.pressed = false,
    this.disabled = false,
  });

  /// 마우스가 올라가 있다. 터치에는 없다.
  final bool hovered;

  /// 누르는 중. pointer 또는 Enter / Space.
  final bool active;

  /// 시각 효과 없음. 포커스 링은 [focusVisible]에만.
  final bool focused;

  /// 포커스를 얻는 시점에 한 번 정한다. 자기 pointer down으로 얻은 포커스, 터치 입력 뒤의 포커스는 false.
  final bool focusVisible;

  /// 외부 주입. Toggle의 on.
  final bool pressed;

  final bool disabled;

  @override
  bool operator ==(Object other) =>
      other is IdsInteractiveState &&
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
      'IdsInteractiveState(hovered: $hovered, active: $active, focused: $focused, '
      'focusVisible: $focusVisible, pressed: $pressed, disabled: $disabled)';
}

/// 인터랙션 상태만 내보내고 그리지 않는다. 배경 알파·scale·포커스 링·disabled는
/// control surface가 정한다. Semantics도 감싸는 컴포넌트가 넣는다.
class IdsInteractive extends StatefulWidget {
  const IdsInteractive({
    super.key,
    required this.builder,
    this.onPressed,
    this.disabled = false,
    this.pressed = false,
    this.onInteractionChange,
    this.focusNode,
    this.autofocus = false,
  });

  final Widget Function(BuildContext context, IdsInteractiveState state)
  builder;

  /// 탭, Enter(누를 때), Space(뗄 때). 브라우저 `<button>`과 같다.
  final VoidCallback? onPressed;

  final bool disabled;
  final bool pressed;

  /// 상태를 부모에 미러링. controlled가 아니다.
  final ValueChanged<IdsInteractiveState>? onInteractionChange;

  final FocusNode? focusNode;
  final bool autofocus;

  @override
  State<IdsInteractive> createState() => _IdsInteractiveState();
}

class _IdsInteractiveState extends State<IdsInteractive> {
  bool _hovered = false;
  bool _active = false;
  bool _focused = false;
  bool _focusVisible = false;

  /// 자기 pointer down이 요청한 포커스인지. 다음 포커스 변화에서 소비한다.
  bool _pointerFocus = false;

  FocusNode? _internalNode;
  FocusNode get _node => widget.focusNode ?? (_internalNode ??= FocusNode());

  IdsInteractiveState? _reported;

  IdsInteractiveState get _state => IdsInteractiveState(
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
    _reportAfterFrame();
  }

  @override
  void didUpdateWidget(IdsInteractive oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.disabled == oldWidget.disabled &&
        widget.pressed == oldWidget.pressed) {
      return;
    }
    // disabled가 되면 제스처 인식기가 빠져 tap up이 오지 않는다.
    if (widget.disabled) _active = false;
    _reportAfterFrame();
  }

  @override
  void dispose() {
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

  // build 중에 부모 setState를 부르지 않도록 프레임 뒤로 미룬다.
  void _reportAfterFrame() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _report();
    });
  }

  void _handleFocusChange(bool focused) {
    _set(() {
      _focused = focused;
      _focusVisible =
          focused &&
          !_pointerFocus &&
          FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
    });
    _pointerFocus = false;
  }

  KeyEventResult _handleKey(FocusNode node, KeyEvent event) {
    final key = event.logicalKey;
    final enter =
        key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.numpadEnter;
    if (widget.disabled || !(enter || key == LogicalKeyboardKey.space)) {
      return KeyEventResult.ignored;
    }
    if (event is KeyDownEvent) {
      _set(() => _active = true);
      if (enter) widget.onPressed?.call();
    } else if (event is KeyUpEvent) {
      _set(() => _active = false);
      if (!enter) widget.onPressed?.call();
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
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: enabled
              ? (_) {
                  _pointerFocus = true;
                  _node.requestFocus();
                  _set(() => _active = true);
                }
              : null,
          onTapUp: enabled ? (_) => _set(() => _active = false) : null,
          // hover는 MouseRegion이 소유한다. 여기서 끄면 마우스가 올라가 있어도 꺼진다.
          onTapCancel: enabled ? () => _set(() => _active = false) : null,
          onTap: enabled ? widget.onPressed : null,
          child: widget.builder(context, _state),
        ),
      ),
    );
  }
}
