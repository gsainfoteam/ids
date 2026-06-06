import 'package:flutter/widgets.dart';
import 'package:flutter/services.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

enum IdsCardVariant { outline, elevated, filled, ghost }

enum IdsCardSize { sm, md, lg }

class IdsCard extends StatelessWidget {
  const IdsCard({
    super.key,
    required this.child,
    this.variant = IdsCardVariant.outline,
    this.size = IdsCardSize.md,
    this.onPressed,
    this.interactive = false,
  });

  final Widget child;
  final IdsCardVariant variant;
  final IdsCardSize size;
  final VoidCallback? onPressed;
  final bool interactive;

  double get _radius => switch (size) {
    IdsCardSize.sm => 10,
    IdsCardSize.md => 16,
    IdsCardSize.lg => 24,
  };

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final decoration = BoxDecoration(
      color: switch (variant) {
        IdsCardVariant.filled => theme.muted,
        IdsCardVariant.ghost => null,
        _ => theme.surface,
      },
      borderRadius: BorderRadius.circular(_radius),
      border: variant == IdsCardVariant.outline
          ? Border.all(color: theme.outline)
          : null,
      boxShadow: variant == IdsCardVariant.elevated
          ? [
              BoxShadow(
                color: const Color(0xFF000000).withValues(alpha: 0.12),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ]
          : null,
    );

    final card = AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      decoration: decoration,
      child: child,
    );

    if (onPressed == null) return card;

    return Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
        SingleActivator(LogicalKeyboardKey.space): ActivateIntent(),
      },
      child: Actions(
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) {
              onPressed?.call();
              return null;
            },
          ),
        },
        child: FocusableActionDetector(
          enabled: onPressed != null,
          child: Semantics(
            button: true,
            enabled: true,
            child: GestureDetector(
              onTap: onPressed,
              behavior: HitTestBehavior.opaque,
              child: card,
            ),
          ),
        ),
      ),
    );
  }
}

class IdsCardHeader extends StatelessWidget {
  const IdsCardHeader({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: children,
      ),
    );
  }
}

class IdsCardTitle extends StatelessWidget {
  const IdsCardTitle(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Text(
      data,
      style: IdsTypography.title.copyWith(
        color: theme.onSurface,
        leadingDistribution: TextLeadingDistribution.even,
      ),
    );
  }
}

class IdsCardDescription extends StatelessWidget {
  const IdsCardDescription(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Text(
      data,
      style: IdsTypography.caption.copyWith(
        color: theme.onMuted,
        leadingDistribution: TextLeadingDistribution.even,
      ),
    );
  }
}

class IdsCardContent extends StatelessWidget {
  const IdsCardContent({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.all(16), child: child);
  }
}

class IdsCardFooter extends StatelessWidget {
  const IdsCardFooter({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: child,
    );
  }
}
