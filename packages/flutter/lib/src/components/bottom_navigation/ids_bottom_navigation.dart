import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsBottomNavigationItem {
  const IdsBottomNavigationItem({required this.icon, required this.label});

  final Widget Function(Color color, double size) icon;
  final String label;
}

class IdsBottomNavigation extends StatelessWidget {
  const IdsBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<IdsBottomNavigationItem> items;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.surface,
        border: Border(top: BorderSide(color: theme.outline)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 72,
          child: Row(
            children: [
              for (var i = 0; i < items.length; i++)
                Expanded(
                  child: _IdsBottomNavigationButton(
                    item: items[i],
                    active: i == currentIndex,
                    onTap: () => onTap(i),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _IdsBottomNavigationButton extends StatelessWidget {
  const _IdsBottomNavigationButton({
    required this.item,
    required this.active,
    required this.onTap,
  });

  final IdsBottomNavigationItem item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final color = active ? theme.primary : theme.onMuted;

    return GestureDetector(
      onTap: onTap,
      child: Semantics(
        button: true,
        selected: active,
        label: item.label,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            item.icon(color, 28),
            const SizedBox(height: 4),
            Text(
              item.label,
              style: IdsTypography.caption.copyWith(
                color: color,
                leadingDistribution: TextLeadingDistribution.even,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
