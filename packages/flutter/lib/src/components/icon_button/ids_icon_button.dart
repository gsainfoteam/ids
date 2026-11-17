import 'package:flutter/widgets.dart';

import '../../../tokens/ids_enums.dart';
import '../../interaction/button_control.dart';
import '../../interaction/ids_interactive.dart';

class IdsIconButton extends ButtonControl {
  const IdsIconButton({
    super.key,
    required Widget icon,
    required String super.semanticLabel,
    super.onPressed,
    super.variant = IdsVariant.ghost,
    super.size = IdsSize.standard,
    super.colorScheme = IdsColorScheme.primary,
    super.disabled = false,
    super.busy = false,
    super.focusableWhenDisabled = false,
    super.focusNode,
    super.autofocus = false,
    super.onInteractionChange,
  }) : super(child: icon, square: true);

  const IdsIconButton.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) icon,
    required String super.semanticLabel,
    super.onPressed,
    super.variant = IdsVariant.ghost,
    super.size = IdsSize.standard,
    super.colorScheme = IdsColorScheme.primary,
    super.disabled = false,
    super.busy = false,
    super.focusableWhenDisabled = false,
    super.focusNode,
    super.autofocus = false,
    super.onInteractionChange,
  }) : super(builder: icon, square: true);
}
