import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

enum IdsDialogSize { sm, md, lg, xl, full }

class IdsDialog extends StatelessWidget {
  const IdsDialog({
    super.key,
    required this.open,
    required this.children,
    this.onOpenChanged,
    this.size = IdsDialogSize.md,
    this.dismissible = true,
  });

  final bool open;
  final List<Widget> children;
  final ValueChanged<bool>? onOpenChanged;
  final IdsDialogSize size;
  final bool dismissible;

  double get _maxWidth => switch (size) {
    IdsDialogSize.sm => 320,
    IdsDialogSize.md => 420,
    IdsDialogSize.lg => 560,
    IdsDialogSize.xl => 720,
    IdsDialogSize.full => double.infinity,
  };

  @override
  Widget build(BuildContext context) {
    if (!open) return const SizedBox.shrink();
    final theme = ThemeProvider.of(context);

    return Positioned.fill(
      child: Stack(
        children: [
          GestureDetector(
            onTap: dismissible ? () => onOpenChanged?.call(false) : null,
            child: Container(color: const Color(0x99000000)),
          ),
          Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: _maxWidth),
              child: Container(
                margin: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: theme.surface,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF000000).withValues(alpha: 0.2),
                      blurRadius: 24,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: children,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class IdsDialogHeader extends StatelessWidget {
  const IdsDialogHeader({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: children,
      ),
    );
  }
}

class IdsDialogTitle extends StatelessWidget {
  const IdsDialogTitle(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Text(
      data,
      style: IdsTypography.title.copyWith(
        color: theme.onSurface,
        fontWeight: FontWeight.w700,
        leadingDistribution: TextLeadingDistribution.even,
      ),
      textAlign: TextAlign.center,
    );
  }
}

class IdsDialogContent extends StatelessWidget {
  const IdsDialogContent({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      child: child,
    );
  }
}

class IdsDialogFooter extends StatelessWidget {
  const IdsDialogFooter({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Container(
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: theme.outline)),
      ),
      child: Row(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) Container(width: 1, height: 48, color: theme.outline),
            Expanded(child: children[i]),
          ],
        ],
      ),
    );
  }
}
