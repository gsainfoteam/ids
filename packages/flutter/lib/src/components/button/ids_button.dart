import 'package:flutter/widgets.dart';

import '../group/ids_group.dart';

import '../../interaction/button_control.dart';
import '../../interaction/ids_interactive.dart';
import '../../../tokens/ids_enums.dart';

class IdsButton extends StatelessWidget implements IdsGroupedControl {
  const IdsButton({
    super.key,
    required Widget this.child,
    this.onPressed,
    this.leading,
    this.trailing,
    this.variant,
    this.size,
    this.colorScheme = IdsColorScheme.primary,
    this.disabled = false,
    this.busy = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.onInteractionChange,
  }) : builder = null;

  const IdsButton.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) this.builder,
    this.onPressed,
    this.leading,
    this.trailing,
    this.variant,
    this.size,
    this.colorScheme = IdsColorScheme.primary,
    this.disabled = false,
    this.busy = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.onInteractionChange,
  }) : child = null;

  final Widget? child;
  final Widget Function(BuildContext, IdsInteractiveState)? builder;
  final VoidCallback? onPressed;
  final Widget? leading;
  final Widget? trailing;
  final IdsVariant? variant;
  final IdsSize? size;
  final IdsColorScheme colorScheme;
  final bool disabled;
  final bool busy;
  final bool focusableWhenDisabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final ValueChanged<IdsInteractiveState>? onInteractionChange;

  @override
  Widget build(BuildContext context) => ButtonControl(
    builder: builder,
    onPressed: onPressed,
    leading: leading,
    trailing: trailing,
    variant: variant ?? IdsGroup.variantOf(context) ?? IdsVariant.solid,
    size: size ?? IdsGroup.sizeOf(context) ?? IdsSize.standard,
    colorScheme: colorScheme,
    disabled: disabled,
    busy: busy,
    focusableWhenDisabled: focusableWhenDisabled,
    focusNode: focusNode,
    autofocus: autofocus,
    semanticLabel: semanticLabel,
    onInteractionChange: onInteractionChange,
    child: child,
  );
}
