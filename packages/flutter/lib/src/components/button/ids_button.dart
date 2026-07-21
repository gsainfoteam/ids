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
    this.size = IdsSize.standard,
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
      IdsVariant.soft => (
        theme.primary.withValues(alpha: 0.15),
        theme.primary,
        null,
      ),
      IdsVariant.outline => (null, theme.primary, theme.outline),
      IdsVariant.ghost => (null, theme.primary, null),
    };

    final (height, hPad, textStyle, iconSize) = switch (size) {
      IdsSize.tiny => (32.0, 10.0, IdsTypography.buttonTiny, 16.0),
      IdsSize.standard => (44.0, 16.0, IdsTypography.buttonStandard, 20.0),
    };

    return GestureDetector(
      onTap: disabled ? null : onPressed,
      child: AnimatedOpacity(
        opacity: disabled ? 0.4 : 1.0,
        duration: IdsMotion.fast,
        child: Container(
          height: height,
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
