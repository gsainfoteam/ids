import 'package:flutter/widgets.dart';
import '../../../tokens/ids_enums.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../hstack/ids_hstack.dart';

class IdsButton extends StatelessWidget {
  const IdsButton({
    super.key,
    required this.onPressed,
    required this.children,
    this.variant = IdsVariant.solid,
    this.size = IdsSize.md,
    this.disabled = false,
  });

  final VoidCallback? onPressed;
  final List<Widget> children;
  final IdsVariant variant;
  final IdsSize size;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    final (bg, fg, border) = switch (variant) {
      IdsVariant.solid => (theme.primary, theme.onPrimary, null),
      IdsVariant.soft => (theme.secondary, theme.onSecondary, null),
      IdsVariant.outline => (null, theme.primary, theme.primary),
      IdsVariant.ghost => (null, theme.primary, null),
    };

    final (hPad, textStyle) = switch (size) {
      IdsSize.xs => (8.0, IdsTypography.caption),
      IdsSize.sm => (10.0, IdsTypography.label),
      IdsSize.md => (16.0, IdsTypography.label),
      IdsSize.lg => (20.0, IdsTypography.body),
      IdsSize.xl => (24.0, IdsTypography.title),
      IdsSize.xxl => (32.0, IdsTypography.heading),
    };

    final iconSize = switch (size) {
      IdsSize.xs => 16.0,
      IdsSize.sm => 18.0,
      IdsSize.md => 20.0,
      IdsSize.lg => 22.0,
      IdsSize.xl => 24.0,
      IdsSize.xxl => 28.0,
    };

    return GestureDetector(
      onTap: disabled ? null : onPressed,
      child: AnimatedOpacity(
        opacity: disabled ? 0.4 : 1.0,
        duration: IdsMotion.fast,
        child: Container(
          height: 48,
          padding: EdgeInsets.symmetric(horizontal: hPad),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(12),
            border: border != null ? Border.all(color: border) : null,
          ),
          child: DefaultTextStyle(
            style: textStyle.copyWith(
              color: fg,
              fontWeight: FontWeight.w600,
              leadingDistribution: TextLeadingDistribution.even,
            ),
            child: IconTheme(
              data: IconThemeData(color: fg, size: iconSize),
              child: IdsHStack(
                gap: 8,
                fit: IdsStackFit.content,
                crossAxis: CrossAxis.center,
                children: children,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
