import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';

class IdsAvatar extends StatelessWidget {
  const IdsAvatar({
    super.key,
    this.src,
    this.name,
    this.size = IdsSize.md,
  });

  final String? src;
  final String? name;
  final IdsSize size;

  double get _diameter => switch (size) {
    IdsSize.xs => 24,
    IdsSize.sm => 32,
    IdsSize.md => 40,
    IdsSize.lg => 48,
    IdsSize.xl => 64,
    IdsSize.xxl => 80,
  };

  double get _fontSize => switch (size) {
    IdsSize.xs => 10,
    IdsSize.sm => 12,
    IdsSize.md => 14,
    IdsSize.lg => 16,
    IdsSize.xl => 18,
    IdsSize.xxl => 20,
  };

  String _getInitials(String name) {
    return name
        .split(' ')
        .map((w) => w.isNotEmpty ? w[0] : '')
        .join()
        .toUpperCase()
        .substring(0, name.split(' ').length > 1 ? 2 : 1);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final d = _diameter;

    if (src != null) {
      return ClipOval(
        child: Image.network(
          src!,
          width: d,
          height: d,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _fallback(theme, d),
        ),
      );
    }

    return _fallback(theme, d);
  }

  Widget _fallback(dynamic theme, double d) {
    return Container(
      width: d,
      height: d,
      decoration: BoxDecoration(
        color: theme.muted,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        name != null ? _getInitials(name!) : '?',
        style: TextStyle(
          color: theme.onMuted,
          fontSize: _fontSize,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
