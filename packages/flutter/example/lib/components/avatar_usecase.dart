import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

ids.AvatarShape _shapeKnob(BuildContext context) =>
    context.knobs.object.dropdown(
      label: 'Shape',
      options: ids.AvatarShape.values,
      labelBuilder: (s) => s.name,
    );

ids.IdsSize _sizeKnob(BuildContext context) => context.knobs.object.dropdown(
  label: 'Size',
  options: ids.IdsSize.values,
  labelBuilder: (s) => s.name,
);

final avatarUseCases = [
  WidgetbookUseCase(
    name: 'Fallback',
    builder: (context) {
      final shape = _shapeKnob(context);
      final size = _sizeKnob(context);
      return themed(
        context,
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ids.Avatar(name: '김지스트', shape: shape, size: size),
            ids.Avatar(name: 'Alice Kim', shape: shape, size: size),
            ids.Avatar(semanticLabel: '알 수 없는 사용자', shape: shape, size: size),
            ids.Avatar(
              name: 'GIST',
              shape: shape,
              size: size,
              fallback: const Icon(Icons.business),
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Image',
    builder: (context) {
      final shape = _shapeKnob(context);
      final size = _sizeKnob(context);
      return themed(
        context,
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ids.Avatar(
              image: const NetworkImage(
                'https://picsum.photos/seed/ids-avatar/160',
              ),
              name: 'Alice Kim',
              shape: shape,
              size: size,
            ),
            ids.Avatar(
              image: const NetworkImage('https://picsum.photos/broken'),
              name: 'Alice Kim',
              shape: shape,
              size: size,
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Custom size',
    builder: (context) => themed(
      context,
      const Row(
        spacing: 12,
        children: [
          SizedBox.square(dimension: 56, child: ids.Avatar(name: 'Alice Kim')),
          SizedBox.square(dimension: 80, child: ids.Avatar(name: '김지스트')),
        ],
      ),
    ),
  ),
];
