import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

const _bell = Icon(Icons.notifications_outlined, size: 28);

final badgeUseCases = [
  WidgetbookUseCase(
    name: 'Count',
    builder: (context) {
      final count = context.knobs.int.input(label: 'Count', initialValue: 3);
      final max = context.knobs.int.input(label: 'Max', initialValue: 99);
      final showZero = context.knobs.boolean(label: 'Show zero');
      final variant = dropdown(context, 'Variant', ids.BadgeVariant.values);
      final colorScheme = dropdown(
        context,
        'Color scheme',
        ids.IdsColorScheme.values,
        initial: ids.IdsColorScheme.danger,
      );
      final size = dropdown(context, 'Size', ids.IdsSize.values);
      final placement = dropdown(
        context,
        'Placement',
        ids.BadgePlacement.values,
      );
      return themed(
        context,
        Center(
          child: ids.Badge.count(
            count: count,
            max: max,
            showZero: showZero,
            variant: variant,
            colorScheme: colorScheme,
            size: size,
            placement: placement,
            semanticLabel: '읽지 않은 알림 $count개',
            child: _bell,
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Avatar',
    builder: (context) {
      final online = context.knobs.boolean(label: 'Online', initialValue: true);
      return themed(
        context,
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: 24,
          children: [
            const ids.Badge.count(count: 3, child: ids.Avatar(name: '김지스트')),
            ids.Badge.dot(
              invisible: !online,
              colorScheme: ids.IdsColorScheme.success,
              placement: ids.BadgePlacement.bottomEnd,
              semanticLabel: online ? '온라인' : '오프라인',
              child: const ids.Avatar(name: 'Alice Kim'),
            ),
            const ids.Badge.dot(
              colorScheme: ids.IdsColorScheme.success,
              placement: ids.BadgePlacement.bottomEnd,
              child: ids.Avatar(name: 'GIST', shape: ids.AvatarShape.square),
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Variants',
    builder: (context) => themed(
      context,
      Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: [
          for (final variant in ids.BadgeVariant.values)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final scheme in ids.IdsColorScheme.values)
                  ids.Badge(
                    variant: variant,
                    colorScheme: scheme,
                    content: Text(scheme.name),
                  ),
              ],
            ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Inline',
    builder: (context) => themed(
      context,
      const Row(
        spacing: 8,
        children: [
          Text('받은 편지함'),
          ids.Badge.count(
            count: 12,
            variant: ids.BadgeVariant.soft,
            colorScheme: ids.IdsColorScheme.primary,
            size: ids.IdsSize.tiny,
          ),
        ],
      ),
    ),
  ),
];
