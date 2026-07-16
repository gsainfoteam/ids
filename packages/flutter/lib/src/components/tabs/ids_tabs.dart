import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

class IdsTabItem<T> {
  const IdsTabItem({
    required this.value,
    required this.label,
    required this.child,
    this.disabled = false,
  });

  final T value;
  final String label;
  final Widget child;
  final bool disabled;
}

class IdsTabs<T> extends StatefulWidget {
  const IdsTabs({
    super.key,
    required this.items,
    this.value,
    this.defaultValue,
    this.onChanged,
  });

  final List<IdsTabItem<T>> items;
  final T? value;
  final T? defaultValue;
  final ValueChanged<T>? onChanged;

  @override
  State<IdsTabs<T>> createState() => _IdsTabsState<T>();
}

class _IdsTabsState<T> extends State<IdsTabs<T>> {
  late T? _value =
      widget.defaultValue ??
      (widget.items.isNotEmpty ? widget.items.first.value : null);

  T? get _currentValue => widget.value ?? _value;

  void _select(T value) {
    if (widget.value == null) setState(() => _value = value);
    widget.onChanged?.call(value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final selectedItem = widget.items
        .where((item) => item.value == _currentValue)
        .firstOrNull;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: theme.outline)),
          ),
          child: Row(
            children: [
              for (final item in widget.items)
                Expanded(
                  child: GestureDetector(
                    onTap: item.disabled ? null : () => _select(item.value),
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 150),
                      opacity: item.disabled ? 0.4 : 1,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 16,
                        ),
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: item.value == _currentValue
                                  ? theme.primary
                                  : const Color(0x00000000),
                              width: 2,
                            ),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          item.label,
                          style: IdsTypography.bodyB3Medium.copyWith(
                            color: item.value == _currentValue
                                ? theme.primary
                                : theme.onMuted,
                            leadingDistribution: TextLeadingDistribution.even,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        if (selectedItem != null) selectedItem.child,
      ],
    );
  }
}
