import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import '../field/ids_field.dart';
import 'key_faces.dart';

class IdsKbd extends StatelessWidget {
  const IdsKbd({
    super.key,
    this.child,
    this.keys,
    this.size,
    this.platform,
    this.labels = const {},
    this.separator,
  }) : assert((child == null) != (keys == null));

  final String? child;
  final String? keys;
  final IdsSize? size;
  final TargetPlatform? platform;
  final Map<String, String> labels;
  final Widget? separator;

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    final theme = scope.resolved;
    final tiny = (size ?? IdsField.maybeOf(context)?.size) == IdsSize.tiny;
    final platform = this.platform ?? defaultTargetPlatform;
    final color =
        DefaultTextStyle.of(context).style.color ?? theme.colors.onSurface;
    final faces = keys == null
        ? [kbdText(child!, platform, scope.translation, labels)]
        : kbdKeys(keys!, platform, scope.translation, labels);
    final height = theme.dimension(tiny ? 16 : 20);
    final captions = theme.textStyle(
      tiny ? IdsTypography.captionC2Medium : IdsTypography.captionC1Medium,
      color: color,
    );
    final joiner =
        separator ??
        (isMacKbd(platform)
            ? null
            : Text(
                '+',
                style: theme.textStyle(
                  tiny
                      ? IdsTypography.captionC2Regular
                      : IdsTypography.captionC1Regular,
                  color: color.withValues(alpha: color.a * .6),
                ),
              ));
    return Semantics(
      label: faces.map((face) => face.label).join(' '),
      excludeSemantics: true,
      child: Wrap(
        spacing: theme.dimension(4),
        runSpacing: theme.dimension(4),
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (final (index, face) in faces.indexed) ...[
            if (index > 0 && joiner != null) joiner,
            DecoratedBox(
              decoration: ShapeDecoration(
                color: color.withValues(alpha: color.a * .10),
                shape: theme.shape(radius: theme.radius.indicator),
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minWidth: height,
                  minHeight: height,
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: theme.dimension(tiny ? 2 : 4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    spacing: theme.dimension(2),
                    children: [
                      for (final part in face.parts)
                        if (kbdIcon(
                              part,
                              color: color,
                              size: theme.dimension(tiny ? 10 : 12),
                            )
                            case final icon?)
                          icon
                        else
                          Text(part, style: captions),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
