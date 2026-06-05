import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsItem extends StatelessWidget {
  const IdsItem({
    super.key,
    required this.children,
    this.onPressed,
  });

  final List<Widget> children;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: children,
      ),
    );

    if (onPressed != null) {
      return GestureDetector(onTap: onPressed, child: content);
    }
    return content;
  }
}

class IdsItemLeading extends StatelessWidget {
  const IdsItemLeading({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: IconTheme(
        data: IconThemeData(color: theme.onSurface, size: 20),
        child: child,
      ),
    );
  }
}

class IdsItemContent extends StatelessWidget {
  const IdsItemContent({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: children,
      ),
    );
  }
}

class IdsItemTitle extends StatelessWidget {
  const IdsItemTitle(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Text(
      data,
      style: IdsTypography.label.copyWith(
        color: theme.onSurface,
        leadingDistribution: TextLeadingDistribution.even,
      ),
    );
  }
}

class IdsItemDescription extends StatelessWidget {
  const IdsItemDescription(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Text(
        data,
        style: IdsTypography.caption.copyWith(
          color: theme.onMuted,
          leadingDistribution: TextLeadingDistribution.even,
        ),
      ),
    );
  }
}

class IdsItemTrailing extends StatelessWidget {
  const IdsItemTrailing({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Padding(
      padding: const EdgeInsets.only(left: 12),
      child: IconTheme(
        data: IconThemeData(color: theme.onMuted, size: 20),
        child: child,
      ),
    );
  }
}
