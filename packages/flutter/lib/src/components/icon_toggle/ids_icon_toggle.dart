import 'package:flutter/widgets.dart';

import '../../interaction/ids_interactive.dart';
import '../toggle/ids_toggle.dart';

class IdsIconToggle extends IdsToggle {
  const IdsIconToggle({
    super.key,
    required Widget icon,
    super.pressed,
    super.defaultPressed,
    super.onPressedChange,
    super.onPressed,
    super.variant,
    super.size,
    super.colorScheme,
    super.value,
    super.disabled,
    super.focusableWhenDisabled,
    super.focusNode,
    super.autofocus,
    required String semanticLabel,
    super.onInteractionChange,
    super.style,
  }) : super(semanticLabel: semanticLabel, child: icon);

  const IdsIconToggle.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) icon,
    super.pressed,
    super.defaultPressed,
    super.onPressedChange,
    super.onPressed,
    super.variant,
    super.size,
    super.colorScheme,
    super.value,
    super.disabled,
    super.focusableWhenDisabled,
    super.focusNode,
    super.autofocus,
    required String semanticLabel,
    super.onInteractionChange,
    super.style,
  }) : super.builder(semanticLabel: semanticLabel, builder: icon);

  @override
  bool get square => true;
}
