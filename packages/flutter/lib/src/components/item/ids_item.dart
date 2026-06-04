import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsItem extends StatelessWidget {
  const IdsItem({
    super.key,
    this.leading,
    required this.title,
    this.description,
    this.trailing,
    this.onPressed,
  });

  final Widget? leading;
  final String title;
  final String? description;
  final Widget? trailing;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    final content = Row(
      children: [
        if (leading != null) ...[
          IconTheme(
            data: IconThemeData(color: theme.onSurface, size: 20),
            child: leading!,
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: IdsTypography.label.copyWith(
                  color: theme.onSurface,
                  leadingDistribution: TextLeadingDistribution.even,
                ),
              ),
              if (description != null) ...[
                const SizedBox(height: 2),
                Text(
                  description!,
                  style: IdsTypography.caption.copyWith(
                    color: theme.onMuted,
                    leadingDistribution: TextLeadingDistribution.even,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (trailing != null) ...[
          const SizedBox(width: 12),
          IconTheme(
            data: IconThemeData(color: theme.onMuted, size: 20),
            child: trailing!,
          ),
        ],
      ],
    );

    if (onPressed != null) {
      return GestureDetector(
        onTap: onPressed,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: content,
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: content,
    );
  }
}
