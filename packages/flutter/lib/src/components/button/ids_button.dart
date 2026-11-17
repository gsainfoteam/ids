import 'package:flutter/widgets.dart';

import '../../interaction/button_control.dart';
import '../../interaction/ids_interactive.dart';
import '../../../tokens/ids_enums.dart';

class IdsButton extends ButtonControl {
  const IdsButton({
    super.key,
    required Widget super.child,
    super.onPressed,
    super.leading,
    super.trailing,
    super.variant = IdsVariant.solid,
    super.size = IdsSize.standard,
    super.colorScheme = IdsColorScheme.primary,
    super.disabled = false,
    super.busy = false,
    super.focusableWhenDisabled = false,
    super.focusNode,
    super.autofocus = false,
    super.semanticLabel,
    super.onInteractionChange,
  });

  const IdsButton.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) super.builder,
    super.onPressed,
    super.leading,
    super.trailing,
    super.variant = IdsVariant.solid,
    super.size = IdsSize.standard,
    super.colorScheme = IdsColorScheme.primary,
    super.disabled = false,
    super.busy = false,
    super.focusableWhenDisabled = false,
    super.focusNode,
    super.autofocus = false,
    super.semanticLabel,
    super.onInteractionChange,
  });
}
