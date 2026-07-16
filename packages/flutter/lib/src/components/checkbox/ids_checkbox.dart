import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';

class IdsCheckbox extends StatelessWidget {
  const IdsCheckbox({
    super.key,
    required this.checked,
    required this.onChanged,
    this.indeterminate = false,
    this.disabled = false,
    this.invalid = false,
    this.size = IdsSize.standard,
    this.semanticLabel,
  });

  final bool checked;
  final ValueChanged<bool>? onChanged;
  final bool indeterminate;
  final bool disabled;
  final bool invalid;
  final IdsSize size;
  final String? semanticLabel;

  double get _dimension => switch (size) {
    IdsSize.tiny => 14,
    IdsSize.standard => 16,
  };

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final active = checked || indeterminate;
    final bg = active ? theme.primary : theme.surface;
    final border = invalid
        ? const Color(0xFFEF4444)
        : (active ? theme.primary : theme.outline);
    final label = indeterminate
        ? '${semanticLabel ?? ''} indeterminate'.trim()
        : semanticLabel;

    return Semantics(
      label: label,
      checked: checked,
      enabled: !disabled && onChanged != null,
      child: GestureDetector(
        onTap: disabled
            ? null
            : () {
                onChanged?.call(indeterminate ? true : !checked);
              },
        child: AnimatedOpacity(
          duration: IdsMotion.fast,
          opacity: disabled ? 0.4 : 1,
          child: AnimatedContainer(
            duration: IdsMotion.fast,
            width: _dimension,
            height: _dimension,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: border),
            ),
            child: active
                ? Text(
                    indeterminate ? '−' : '✓',
                    style: TextStyle(
                      color: theme.onPrimary,
                      fontSize: _dimension * 0.75,
                      height: 1,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                : null,
          ),
        ),
      ),
    );
  }
}
