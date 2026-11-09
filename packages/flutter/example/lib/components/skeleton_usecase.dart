import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

ids.SkeletonAnimation _animationKnob(BuildContext context) =>
    context.knobs.object.dropdown(
      label: 'Animation',
      options: ids.SkeletonAnimation.values,
      labelBuilder: (a) => a.name,
    );

final skeletonUseCases = [
  WidgetbookUseCase(
    name: 'Shapes',
    builder: (context) {
      final animation = _animationKnob(context);
      return themed(
        context,
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 16,
          children: [
            ids.Skeleton(animation: animation),
            ids.Skeleton(shape: ids.SkeletonShape.circle, animation: animation),
            ids.Skeleton(
              shape: ids.SkeletonShape.text,
              lines: 3,
              style: ids.IdsTypography.bodyB3Regular,
              animation: animation,
            ),
            ids.AspectRatio(
              ratio: 16 / 9,
              child: ids.Skeleton(animation: animation),
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Row',
    builder: (context) {
      final animation = _animationKnob(context);
      return themed(
        context,
        Row(
          spacing: 12,
          children: [
            ids.Skeleton(shape: ids.SkeletonShape.circle, animation: animation),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: 4,
                children: [
                  ids.Skeleton(
                    shape: ids.SkeletonShape.text,
                    style: ids.IdsTypography.bodyB3Medium,
                    animation: animation,
                  ),
                  ids.Skeleton(
                    shape: ids.SkeletonShape.text,
                    lines: 2,
                    style: ids.IdsTypography.bodyB3Regular,
                    animation: animation,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Wrapping',
    builder: (context) {
      final loading = context.knobs.boolean(
        label: 'Loading',
        initialValue: true,
      );
      final animation = _animationKnob(context);
      return themed(
        context,
        Row(
          spacing: 12,
          children: [
            ids.Skeleton(
              loading: loading,
              shape: ids.SkeletonShape.circle,
              animation: animation,
              child: const CircleAvatar(radius: 20, child: Text('김')),
            ),
            Expanded(
              child: ids.Skeleton(
                loading: loading,
                animation: animation,
                child: const Text('김지스트님이 글을 올렸습니다.'),
              ),
            ),
          ],
        ),
      );
    },
  ),
];
