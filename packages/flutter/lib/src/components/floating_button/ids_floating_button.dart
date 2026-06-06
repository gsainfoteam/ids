import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';

enum IdsFloatingButtonVariant { solid, surface }

enum IdsFloatingPlacement { topLeft, topRight, bottomLeft, bottomRight }

class IdsFloatingButton extends StatelessWidget {
  const IdsFloatingButton({
    super.key,
    required this.children,
    this.variant = IdsFloatingButtonVariant.solid,
    this.size = IdsSize.lg,
    this.placement = IdsFloatingPlacement.bottomRight,
    this.disabled = false,
    this.onPressed,
    required this.semanticLabel,
  });

  final List<Widget> children;
  final IdsFloatingButtonVariant variant;
  final IdsSize size;
  final IdsFloatingPlacement placement;
  final bool disabled;
  final VoidCallback? onPressed;
  final String semanticLabel;

  Alignment get _alignment => switch (placement) {
    IdsFloatingPlacement.topLeft => Alignment.topLeft,
    IdsFloatingPlacement.topRight => Alignment.topRight,
    IdsFloatingPlacement.bottomLeft => Alignment.bottomLeft,
    IdsFloatingPlacement.bottomRight => Alignment.bottomRight,
  };

  double get _height => switch (size) {
    IdsSize.md || IdsSize.sm || IdsSize.xs => 48,
    IdsSize.lg => 56,
    _ => 64,
  };

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final bg = variant == IdsFloatingButtonVariant.solid
        ? theme.primary
        : theme.surface;
    final fg = variant == IdsFloatingButtonVariant.solid
        ? theme.onPrimary
        : theme.onSurface;
    final border = variant == IdsFloatingButtonVariant.surface
        ? Border.all(color: theme.outline)
        : null;

    final button = Semantics(
      label: semanticLabel,
      button: true,
      enabled: !disabled && onPressed != null,
      child: GestureDetector(
        onTap: disabled ? null : onPressed,
        child: AnimatedOpacity(
          opacity: disabled ? 0.4 : 1,
          duration: IdsMotion.fast,
          child: Container(
            height: _height,
            constraints: BoxConstraints(minWidth: _height),
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(999),
              border: border,
            ),
            child: DefaultTextStyle(
              style: IdsTypography.label.copyWith(
                color: fg,
                fontWeight: FontWeight.w700,
                leadingDistribution: TextLeadingDistribution.even,
              ),
              child: IconTheme(
                data: IconThemeData(color: fg, size: _height * 0.48),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: _withGaps(children),
                ),
              ),
            ),
          ),
        ),
      ),
    );

    return Align(
      alignment: _alignment,
      child: Padding(padding: const EdgeInsets.all(24), child: button),
    );
  }

  List<Widget> _withGaps(List<Widget> widgets) {
    if (widgets.length <= 1) return widgets;
    return [
      for (var i = 0; i < widgets.length; i++) ...[
        if (i > 0) const SizedBox(width: 8),
        widgets[i],
      ],
    ];
  }
}
