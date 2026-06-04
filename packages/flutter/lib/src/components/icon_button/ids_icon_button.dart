import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';

class IdsIconButton extends StatelessWidget {
  const IdsIconButton({
    super.key,
    required this.icon,
    this.variant = IdsVariant.ghost,
    this.size = IdsSize.md,
    this.disabled = false,
    this.onPressed,
    required this.label,
  });

  /// Icon builder that receives the foreground color and icon size.
  /// Usage: `icon: (color, size) => HugeIcon(icon: HugeIcons.strokeRoundedBookmark01, color: color, size: size)`
  final Widget Function(Color color, double size) icon;
  final IdsVariant variant;
  final IdsSize size;
  final bool disabled;
  final VoidCallback? onPressed;
  final String label;

  double get _dimension => switch (size) {
    IdsSize.sm || IdsSize.xs => 32,
    IdsSize.md => 40,
    _ => 48,
  };

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    final (bg, fg, border) = switch (variant) {
      IdsVariant.solid => (theme.primary, theme.onPrimary, null),
      IdsVariant.soft => (theme.secondary, theme.onSecondary, null),
      IdsVariant.outline => (null, theme.primary, theme.primary),
      IdsVariant.ghost => (null, theme.primary, null),
    };

    final d = _dimension;

    return Semantics(
      label: label,
      button: true,
      enabled: !disabled && onPressed != null,
      child: AnimatedOpacity(
        opacity: disabled ? 0.4 : 1.0,
        duration: IdsMotion.fast,
        child: GestureDetector(
          onTap: disabled ? null : onPressed,
          child: Container(
            width: d,
            height: d,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(12),
              border: border != null ? Border.all(color: border) : null,
            ),
            alignment: Alignment.center,
            child: icon(fg, d * 0.5),
          ),
        ),
      ),
    );
  }
}
