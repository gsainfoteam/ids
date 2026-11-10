import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';

class IdsLabel extends StatelessWidget {
  const IdsLabel({
    super.key,
    this.size = IdsSize.standard,
    this.required = false,
    this.disabled = false,
    required this.child,
  });

  final IdsSize size;
  final bool required;
  final bool disabled;
  final Widget child;

  static const _asteriskLiftToPretendard = (1041 - 725) / 2048;

  @override
  Widget build(BuildContext context) {
    final theme = IdsProvider.of(context).theme;
    final style = switch (size) {
      IdsSize.standard => IdsTypography.bodyB3Regular,
      IdsSize.tiny => IdsTypography.captionC1Regular,
    };

    return Opacity(
      opacity: disabled ? 0.5 : 1,
      child: DefaultTextStyle(
        style: theme.textStyle(style, color: theme.onSurface),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: theme.dimension(4),
          children: [
            Flexible(child: child),
            if (required)
              ExcludeSemantics(
                child: Transform.translate(
                  offset: Offset(
                    0,
                    -MediaQuery.textScalerOf(context).scale(style.fontSize!) *
                        _asteriskLiftToPretendard,
                  ),
                  child: Text('*', style: TextStyle(color: theme.danger)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
