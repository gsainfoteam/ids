import 'package:flutter/widgets.dart';

import '../../theme/ids_provider.dart';
import '../../tokens/ids_enums.dart';
import '../../tokens/ids_motion.dart';
import '../../tokens/ids_sizes.dart';
import '../../tokens/ids_typography.dart';
import 'control_surface.dart';
import 'ids_interactive.dart';

class ButtonControl extends StatelessWidget {
  const ButtonControl({
    super.key,
    this.child,
    this.builder,
    this.leading,
    this.trailing,
    required this.variant,
    required this.size,
    required this.colorScheme,
    required this.disabled,
    required this.busy,
    required this.focusableWhenDisabled,
    this.focusNode,
    required this.autofocus,
    this.semanticLabel,
    this.onInteractionChange,
    this.onPressed,
    this.square = false,
  });

  final bool square;
  final Widget? child;
  final Widget Function(BuildContext, IdsInteractiveState)? builder;
  final VoidCallback? onPressed;
  final Widget? leading;
  final Widget? trailing;
  final IdsVariant variant;
  final IdsSize size;
  final IdsColorScheme colorScheme;
  final bool disabled;
  final bool busy;
  final bool focusableWhenDisabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final ValueChanged<IdsInteractiveState>? onInteractionChange;

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context).resolved;
    final tiny = size == IdsSize.tiny;
    final height = theme.dimension(
      tiny ? IdsSizes.controlTiny : IdsSizes.controlStandard,
    );
    final padding = theme.dimension(tiny ? 12 : 16);
    final iconPadding = theme.dimension(tiny ? 10 : 12);
    final iconSize = theme.dimension(
      tiny ? IdsSizes.iconTiny : IdsSizes.iconStandard,
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
        button: true,
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
              );
              return ExcludeSemantics(
                excluding: semanticLabel != null,
                child: Opacity(
                  opacity: state.disabled ? .5 : 1,
                  child: TweenAnimationBuilder<Color?>(
                    tween: ColorTween(end: surface.focusColor),
                    duration: duration,
                    curve: curve,
                    builder: (context, color, child) => CustomPaint(
                      foregroundPainter: ControlFocusRing(theme, color!),
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
                      decoration: surface.decoration,
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
              );
            },
          ),
        ),
      ),
    );
  }
}
