import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';

class IdsLabel extends StatelessWidget {
  const IdsLabel({
    super.key,
    this.size = IdsSize.standard,
    this.required = false,
    this.disabled = false,
    this.invalid = false,
    required this.child,
  });

  final IdsSize size;
  final bool required;
  final bool disabled;
  final bool invalid;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final style = switch (size) {
      IdsSize.standard => IdsTypography.bodyB3Regular,
      IdsSize.tiny => IdsTypography.captionC1Regular,
    };

    return Opacity(
      opacity: disabled ? 0.5 : 1,
      child: DefaultTextStyle(
        style: style.copyWith(color: invalid ? theme.danger : theme.onSurface),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 4,
          children: [
            Flexible(child: child),
            if (required)
              ExcludeSemantics(
                child: Text('*', style: TextStyle(color: theme.danger)),
              ),
          ],
        ),
      ),
    );
  }
}
