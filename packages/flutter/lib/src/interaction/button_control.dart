import 'package:flutter/widgets.dart';

import '../../theme/ids_provider.dart';
import '../../tokens/ids_enums.dart';
import '../../tokens/ids_motion.dart';
import '../../tokens/ids_sizes.dart';
import '../../tokens/ids_typography.dart';
import '../components/group/ids_group.dart';
import 'control_surface.dart';
import 'ids_interactive.dart';

class ButtonControl extends StatelessWidget {
  const ButtonControl({
    super.key,
    this.child,
    this.builder,
    this.style,
    this.leading,
    this.trailing,
    required this.variant,
    required this.size,
    required this.colorScheme,
    required this.disabled,
    this.invalid = false,
    required this.busy,
    required this.focusableWhenDisabled,
    this.focusNode,
    required this.autofocus,
    this.semanticLabel,
    this.onInteractionChange,
    this.onPressed,
    this.square = false,
    this.dimensions,
    this.radius,
    this.pressScale = 1,
    this.pressed,
    this.radio = false,
    this.skipTraversal = false,
  });

  final bool square;
  final ({double height, double padding, double iconPadding, double iconSize})?
  dimensions;
  final double? radius;
  final double pressScale;
  final bool? pressed;
  final bool radio;
  final bool skipTraversal;
  final Widget? child;
  final Widget Function(BuildContext, IdsInteractiveState)? builder;
  final ShapeDecoration Function(IdsInteractiveState, ShapeDecoration)? style;
  final VoidCallback? onPressed;
  final Widget? leading;
  final Widget? trailing;
  final IdsVariant variant;
  final IdsSize size;
  final IdsColorScheme colorScheme;
  final bool disabled;
  final bool invalid;
  final bool busy;
  final bool focusableWhenDisabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final ValueChanged<IdsInteractiveState>? onInteractionChange;

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context).resolved;
    final groupItem = IdsGroupItem.of(context);
    final direction = Directionality.of(context);
    final tiny = size == IdsSize.tiny;
    final height = theme.dimension(
      dimensions?.height ??
          (tiny ? IdsSizes.controlTiny : IdsSizes.controlStandard),
    );
    final padding = theme.dimension(dimensions?.padding ?? (tiny ? 12 : 16));
    final iconPadding = theme.dimension(
      dimensions?.iconPadding ?? (tiny ? 10 : 12),
    );
    final iconSize = theme.dimension(
      dimensions?.iconSize ??
          (tiny ? IdsSizes.iconTiny : IdsSizes.iconStandard),
    );
    final gap = theme.dimension(tiny ? 6 : 8);
    final textStyle =
        (tiny ? IdsTypography.captionC1Medium : IdsTypography.bodyB3Medium)
            .copyWith(leadingDistribution: TextLeadingDistribution.even);
    final reducedMotion =
        (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ||
        View.of(context).platformDispatcher.accessibilityFeatures.reduceMotion;
    final duration = reducedMotion ? Duration.zero : IdsMotion.fast;
    const curve = Cubic(.4, 0, .2, 1);
    final isDisabled = disabled || onPressed == null;

    return MergeSemantics(
      child: Semantics(
        container: true,
        button: !radio,
        checked: radio ? pressed : null,
        inMutuallyExclusiveGroup: radio ? true : null,
        toggled: radio ? null : pressed,
        enabled: !isDisabled,
        label: semanticLabel,
        liveRegion: busy,
        child: MouseRegion(
          cursor: busy
              ? SystemMouseCursors.progress
              : isDisabled
              ? SystemMouseCursors.forbidden
              : SystemMouseCursors.click,
          child: IdsInteractive(
            onPressed: onPressed,
            pressed: pressed ?? false,
            skipTraversal: skipTraversal,
            disabled: isDisabled,
            focusableWhenDisabled: focusableWhenDisabled,
            focusNode: focusNode,
            autofocus: autofocus,
            onInteractionChange: onInteractionChange,
            builder: (context, state) {
              final surface = controlSurface(
                theme,
                variant,
                colorScheme,
                state,
                corners: groupItem?.corners(theme.radius.standard),
                radius: radius == null ? null : theme.dimension(radius!),
                toggle: pressed != null,
                invalid: invalid,
              );
              final decoration = ControlShapeDecoration(
                style?.call(state, surface.decoration) ?? surface.decoration,
              );
              return ExcludeSemantics(
                excluding: semanticLabel != null,
                child: Opacity(
                  opacity: state.disabled
                      ? .5
                      : variant != IdsVariant.transparent
                      ? 1
                      : state.active
                      ? .4
                      : state.hovered
                      ? .7
                      : 1,
                  child: AnimatedScale(
                    scale: !reducedMotion && state.active ? pressScale : 1,
                    duration: duration,
                    curve: curve,
                    child: TweenAnimationBuilder<Color?>(
                      tween: ColorTween(end: surface.focusColor),
                      duration: duration,
                      curve: curve,
                      builder: (context, color, child) => CustomPaint(
                        foregroundPainter: ControlFocusRing(
                          decoration.shape,
                          color!,
                          direction: direction,
                        ),
                        child: child,
                      ),
                      child: AnimatedContainer(
                        duration: duration,
                        curve: curve,
                        constraints: square
                            ? BoxConstraints.tightFor(
                                width: height,
                                height: height,
                              )
                            : BoxConstraints(minHeight: height),
                        decoration: decoration,
                        padding: square
                            ? EdgeInsets.zero
                            : EdgeInsetsDirectional.only(
                                start: leading == null ? padding : iconPadding,
                                end: trailing == null ? padding : iconPadding,
                              ),
                        child: AnimatedDefaultTextStyle(
                          duration: duration,
                          curve: curve,
                          style: theme.textStyle(
                            textStyle,
                            color: surface.foreground,
                          ),
                          softWrap: false,
                          overflow: TextOverflow.ellipsis,
                          child: Builder(
                            builder: (context) => IconTheme(
                              data: IconThemeData(
                                size: iconSize,
                                color: DefaultTextStyle.of(context).style.color,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                spacing: gap,
                                children: [
                                  if (leading case final icon?)
                                    ExcludeSemantics(child: icon),
                                  Flexible(
                                    child:
                                        child ??
                                        Builder(
                                          builder: (context) =>
                                              builder!(context, state),
                                        ),
                                  ),
                                  if (trailing case final icon?)
                                    ExcludeSemantics(child: icon),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
