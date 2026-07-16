import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';

class IdsAvatar extends StatelessWidget {
  const IdsAvatar({
    super.key,
    this.src,
    this.name,
    this.size = IdsSize.standard,
  });

  final String? src;
  final String? name;
  final IdsSize size;

  double get _diameter => switch (size) {
    IdsSize.tiny => 32,
    IdsSize.standard => 40,
  };

  double get _fontSize => switch (size) {
    IdsSize.tiny => 12,
    IdsSize.standard => 14,
  };

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    final letters = parts.map((w) => w[0]).join().toUpperCase();
    final maxLen = parts.length > 1 ? 2 : 1;
    return letters.substring(0, letters.length < maxLen ? letters.length : maxLen);
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
        (name != null && name!.trim().isNotEmpty) ? _getInitials(name!) : '?',
        style: TextStyle(
          color: theme.onMuted,
          fontSize: _fontSize,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
