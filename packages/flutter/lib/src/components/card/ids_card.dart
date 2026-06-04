import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';

class IdsCard extends StatelessWidget {
  const IdsCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: theme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.outline),
      ),
      child: child,
    );
  }
}
