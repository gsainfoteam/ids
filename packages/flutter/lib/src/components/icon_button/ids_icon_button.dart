import 'package:flutter/widgets.dart';

import '../group/ids_group.dart';

import '../../../tokens/ids_enums.dart';
import '../../interaction/button_control.dart';
import '../../interaction/ids_interactive.dart';

class IdsIconButton extends StatelessWidget implements IdsGroupedControl {
  const IdsIconButton({
    super.key,
    required Widget icon,
    this.onPressed,
    this.variant,
    this.size,
    this.colorScheme = IdsColorScheme.primary,
    this.disabled = false,
    this.busy = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    required this.semanticLabel,
    this.onInteractionChange,
  }) : _icon = icon,
       _builder = null;

  const IdsIconButton.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) icon,
    this.onPressed,
    this.variant,
    this.size,
    this.colorScheme = IdsColorScheme.primary,
    this.disabled = false,
    this.busy = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    required this.semanticLabel,
    this.onInteractionChange,
  }) : _icon = null,
       _builder = icon;

  final Widget? _icon;
  final Widget Function(BuildContext, IdsInteractiveState)? _builder;
  final VoidCallback? onPressed;
  final IdsVariant? variant;
  final IdsSize? size;
  final IdsColorScheme colorScheme;
  final bool disabled;
  final bool busy;
  final bool focusableWhenDisabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String semanticLabel;
  final ValueChanged<IdsInteractiveState>? onInteractionChange;

  @override
  Widget build(BuildContext context) => ButtonControl(
    builder: _builder,
    square: true,
    onPressed: onPressed,
    variant: variant ?? IdsGroup.variantOf(context) ?? IdsVariant.ghost,
    size: size ?? IdsGroup.sizeOf(context) ?? IdsSize.standard,
    colorScheme: colorScheme,
    disabled: disabled,
    busy: busy,
    focusableWhenDisabled: focusableWhenDisabled,
    focusNode: focusNode,
    autofocus: autofocus,
    semanticLabel: semanticLabel,
    onInteractionChange: onInteractionChange,
    child: _icon,
  );
}
