import 'package:flutter/widgets.dart';
import '../../../tokens/ids_enums.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_spacing.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';

class IdsButton extends StatelessWidget {
  const IdsButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = IdsVariant.solid,
    this.size = IdsSize.md,
    this.disabled = false,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final IdsVariant variant;
  final IdsSize size;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    final (bg, fg, border) = switch (variant) {
      IdsVariant.solid   => (theme.primary,   theme.onPrimary,   null),
      IdsVariant.soft    => (theme.secondary, theme.onSecondary, null),
      IdsVariant.outline => (null,            theme.primary,     theme.primary),
      IdsVariant.ghost   => (null,            theme.primary,     null),
    };

    final (hPad, vPad, textStyle) = switch (size) {
      IdsSize.xs  => (IdsSpacing.sm,     IdsSpacing.xs / 2,  IdsTypography.caption),
      IdsSize.sm  => (IdsSpacing.sm + 2, IdsSpacing.xs,      IdsTypography.label),
      IdsSize.md  => (IdsSpacing.md,     IdsSpacing.sm,      IdsTypography.label),
      IdsSize.lg  => (IdsSpacing.lg - 4, IdsSpacing.sm + 2,  IdsTypography.body),
      IdsSize.xl  => (IdsSpacing.lg,     IdsSpacing.md - 4,  IdsTypography.title),
      IdsSize.xxl => (IdsSpacing.xl,     IdsSpacing.md,      IdsTypography.heading),
    };

    return GestureDetector(
      onTap: disabled ? null : onPressed,
      child: AnimatedOpacity(
        opacity: disabled ? 0.4 : 1.0,
        duration: IdsMotion.fast,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: hPad, vertical: vPad),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(6),
            border: border != null ? Border.all(color: border) : null,
          ),
          child: DefaultTextStyle(
            style: textStyle.copyWith(color: fg, fontWeight: FontWeight.w600),
            child: child,
          ),
        ),
      ),
    );
  }
}
