import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../interaction/button_control.dart';
import '../../interaction/ids_interactive.dart';
import '../../interaction/control_tokens.dart';
import '../group/ids_group.dart';
import '../spinner/ids_spinner.dart';

import '../../interaction/control_color_states.dart';

enum IdsFloatingPlacement { topLeft, topRight, bottomLeft, bottomRight }

class IdsFloatingButton extends StatelessWidget {
  const IdsFloatingButton({
    super.key,
    required Widget this.child,
    this.onPressed,
    this.leading,
    this.trailing,
    this.variant = IdsVariant.solid,
    this.size = IdsSize.standard,
    this.colorScheme = IdsColorScheme.primary,
    this.placement = IdsFloatingPlacement.bottomRight,
    this.iconOnly,
    this.disabled = false,
    this.busy = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.onInteractionChange,
  }) : builder = null,
       assert(variant != IdsVariant.ghost);

  const IdsFloatingButton.builder({
    super.key,
    required Widget Function(BuildContext, IdsInteractiveState) this.builder,
    this.onPressed,
    this.leading,
    this.trailing,
    this.variant = IdsVariant.solid,
    this.size = IdsSize.standard,
    this.colorScheme = IdsColorScheme.primary,
    this.placement = IdsFloatingPlacement.bottomRight,
    this.iconOnly,
    this.disabled = false,
    this.busy = false,
    this.focusableWhenDisabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.onInteractionChange,
  }) : child = null,
       assert(variant != IdsVariant.ghost);

  final Widget? child;
  final Widget Function(BuildContext, IdsInteractiveState)? builder;
  final VoidCallback? onPressed;
  final Widget? leading;
  final Widget? trailing;
  final IdsVariant variant;
  final IdsSize size;
  final IdsColorScheme colorScheme;
  final IdsFloatingPlacement? placement;
  final bool? iconOnly;
  final bool disabled;
  final bool busy;
  final bool focusableWhenDisabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final ValueChanged<IdsInteractiveState>? onInteractionChange;

  @override
  Widget build(BuildContext context) {
    final square = iconOnly ?? (child is Icon || child is IdsSpinner);
    final tiny = size == IdsSize.tiny;
    final height = tiny ? 44.0 : 56.0;
    final colors = IdsProvider.of(context).colors;
    final button = IdsGroup.reset(
      child: ButtonControl(
        builder: builder,
        onPressed: onPressed,
        leading: leading,
        trailing: trailing,
        variant: variant,
        size: size,
        colorScheme: colorScheme,
        disabled: disabled,
        busy: busy,
        focusableWhenDisabled: focusableWhenDisabled,
        focusNode: focusNode,
        autofocus: autofocus,
        semanticLabel: semanticLabel,
        onInteractionChange: onInteractionChange,
        dimensions: (
          height: height,
          padding: tiny ? 16 : 20,
          iconPadding: tiny ? 12 : 16,
          iconSize: tiny ? 20 : 24,
        ),
        radius: square ? height / 2 : null,
        pressScale: .95,
        style: (state, base) {
          final hovered = state.hovered && !state.active;
          final color = switch (variant) {
            IdsVariant.outline when state.active => colors.bgNeutralSoftHover,
            IdsVariant.outline when hovered => colors.bgNeutralSoft,
            IdsVariant.outline => colors.bgSurface,
            IdsVariant.soft => Color.alphaBlend(base.color!, colors.bgSurface),
            _ => base.color,
          };
          return ShapeDecoration(
            color: color,
            gradient: base.gradient,
            shape: base.shape,
            shadows: hovered ? controlShadowXl : controlShadowLg,
          );
        },
        square: square,
        child: child,
      ),
    );

    final alignment = switch (placement) {
      IdsFloatingPlacement.topLeft => AlignmentDirectional.topStart,
      IdsFloatingPlacement.topRight => AlignmentDirectional.topEnd,
      IdsFloatingPlacement.bottomLeft => AlignmentDirectional.bottomStart,
      IdsFloatingPlacement.bottomRight => AlignmentDirectional.bottomEnd,
      null => null,
    };
    if (alignment == null) return button;
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.all(IdsProvider.of(context).dimension(24)),
        child: Align(alignment: alignment, child: button),
      ),
    );
  }
}
