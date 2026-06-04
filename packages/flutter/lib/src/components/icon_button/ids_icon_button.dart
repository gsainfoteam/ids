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

  final Widget icon;
  final IdsVariant variant;
  final IdsSize size;
  final bool disabled;
  final VoidCallback? onPressed;
  final String label;

  double get _size => switch (size) {
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
      IdsVariant.outline => (null, theme.onSurface, theme.outline),
      IdsVariant.ghost => (null, theme.onSurface, null),
    };

    final d = _size;

    return Semantics(
      label: label,
      button: true,
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
            child: IconTheme(
              data: IconThemeData(color: fg, size: d * 0.5),
              child: icon,
            ),
          ),
        ),
      ),
    );
  }
}
