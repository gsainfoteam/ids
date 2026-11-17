import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';

class Label extends StatelessWidget {
  const Label({
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
    final ids = IdsProvider.of(context);
    final style = switch (size) {
      IdsSize.standard => IdsTypography.bodyB3Medium,
      IdsSize.tiny => IdsTypography.captionC1Medium,
    };

    return Opacity(
      opacity: disabled ? 0.5 : 1,
      child: DefaultTextStyle(
        style: ids.textStyle(style, color: ids.colors.onSurface),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: ids.dimension(4),
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
                  child: Text(
                    '*',
                    style: TextStyle(color: ids.colors.textDanger),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
