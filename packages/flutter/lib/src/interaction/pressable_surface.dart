import 'package:flutter/widgets.dart';

import '../../theme/ids_theme.dart';
import 'interactive.dart';

abstract final class SurfaceLayer {
  static const _hover = 0.04;
  static const _active = 0.08;
  static const _selected = 0.06;
  static const _selectedHover = 0.10;

  static Color over(
    Color base,
    IdsTheme theme,
    InteractiveState state, {
    bool selected = false,
  }) => Color.alphaBlend(
    theme.onSurface.withValues(
      alpha: switch ((selected, state)) {
        (_, InteractiveState(active: true)) => _active,
        (true, InteractiveState(hovered: true)) => _selectedHover,
        (_, InteractiveState(hovered: true)) => _hover,
        (true, _) => _selected,
        _ => 0,
      },
    ),
    base,
  );
}

abstract final class FocusRing {
  static const _width = 3.0;
  static const _alpha = 0.4;

  static Border around(IdsTheme theme, InteractiveState state) => Border.all(
    color: theme.primary.withValues(alpha: state.focusVisible ? _alpha : 0),
    width: state.focusVisible ? _width : 0,
    strokeAlign: BorderSide.strokeAlignOutside,
  );

  static Color edge(IdsTheme theme, InteractiveState state) =>
      state.focusVisible ? theme.primary : theme.border;
}

class PressableSurface extends StatelessWidget {
  const PressableSurface({
    super.key,
    required this.onPressed,
    this.disabled = false,
    this.selected,
    this.onInteractionChange,
    required this.builder,
  });

  final VoidCallback? onPressed;
  final bool disabled;
  final bool? selected;
  final ValueChanged<InteractiveState>? onInteractionChange;
  final Widget Function(BuildContext context, InteractiveState state) builder;

  static const _disabledOpacity = 0.5;

  @override
  Widget build(BuildContext context) {
    if (onPressed == null) {
      final surface = builder(context, const InteractiveState());
      return selected == null
          ? surface
          : Semantics(container: true, selected: selected, child: surface);
    }
    return Semantics(
      button: true,
      enabled: !disabled,
      selected: selected,
      container: true,
      child: MouseRegion(
        cursor: disabled
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        child: Opacity(
          opacity: disabled ? _disabledOpacity : 1,
          child: Interactive(
            onPressed: onPressed,
            disabled: disabled,
            onInteractionChange: onInteractionChange,
            builder: builder,
          ),
        ),
      ),
    );
  }
}
