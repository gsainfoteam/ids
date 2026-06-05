import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsCard extends StatelessWidget {
  const IdsCard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.outline),
      ),
      child: child,
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
    return Padding(
      padding: const EdgeInsets.all(16),
      child: child,
    );
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
