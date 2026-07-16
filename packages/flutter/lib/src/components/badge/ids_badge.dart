import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';

class IdsBadge extends StatelessWidget {
  const IdsBadge(
    this.data, {
    super.key,
    this.variant = IdsVariant.soft,
    this.size = IdsSize.tiny,
  });

  final String data;
  final IdsVariant variant;
  final IdsSize size;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    final (bg, fg, border) = switch (variant) {
      IdsVariant.solid => (theme.primary, theme.onPrimary, null),
      IdsVariant.soft => (theme.secondary, theme.onSecondary, null),
      IdsVariant.outline => (null, theme.onSurface, theme.outline),
      IdsVariant.ghost => (null, theme.onSurface, null),
    };

    final (hPad, vPad, fontSize) = switch (size) {
      IdsSize.tiny => (8.0, 2.0, 12.0),
      IdsSize.standard => (10.0, 2.0, 14.0),
    };

    return Container(
      padding: EdgeInsets.symmetric(horizontal: hPad, vertical: vPad),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: border != null ? Border.all(color: border) : null,
      ),
      child: Text(
        data,
        style: TextStyle(
          color: fg,
          fontSize: fontSize,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
