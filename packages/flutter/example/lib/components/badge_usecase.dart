import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _colorSchemes = [
  ids.IdsColorScheme.danger,
  ids.IdsColorScheme.neutral,
  ids.IdsColorScheme.primary,
  ids.IdsColorScheme.success,
  ids.IdsColorScheme.warning,
  ids.IdsColorScheme.info,
];

class _Box extends StatelessWidget {
  const _Box({this.radius = ids.IdsRadius.standard});

  final double radius;

  @override
  Widget build(BuildContext context) => Container(
    width: 40,
    height: 40,
    decoration: BoxDecoration(
      color: ids.ThemeProvider.of(context).muted,
      borderRadius: BorderRadius.circular(radius),
    ),
  );
}

final badgeUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final variant = dropdown(context, 'variant', ids.BadgeVariant.values);
      final colorScheme = dropdown(context, 'colorScheme', _colorSchemes);
      final placement = dropdown(
        context,
        'placement',
        ids.BadgePlacement.values,
      );
      final shape = context.knobs.objectOrNull.dropdown(
        label: 'shape',
        options: ids.BadgeShape.values,
        labelBuilder: (shape) => shape.name,
      );
      final size = dropdown(context, 'size', ids.IdsSize.values);
      final content = context.knobs.int.input(
        label: 'content',
        initialValue: 3,
      );
      final max = context.knobs.int.input(label: 'max', initialValue: 99);
      final dot = context.knobs.boolean(label: 'dot');
      final showZero = context.knobs.boolean(label: 'showZero');
      final invisible = context.knobs.boolean(label: 'invisible');
      const bell = Icon(Icons.notifications_outlined, size: 28);
      return dot
          ? ids.Badge.dot(
              invisible: invisible,
              placement: placement,
              shape: shape,
              variant: variant,
              colorScheme: colorScheme,
              size: size,
              child: bell,
            )
          : ids.Badge.count(
              count: content,
              max: max,
              showZero: showZero,
              invisible: invisible,
              placement: placement,
              shape: shape,
              variant: variant,
              colorScheme: colorScheme,
              size: size,
              child: bell,
            );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Variant × Color scheme',
          children: [
            ShowcaseMatrix(
              rows: _colorSchemes,
              columns: ids.BadgeVariant.values,
              builder: (colorScheme, variant) => Row(
                mainAxisSize: MainAxisSize.min,
                spacing: 24,
                children: [
                  ids.Badge.count(
                    count: 5,
                    variant: variant,
                    colorScheme: colorScheme,
                  ),
                  ids.Badge.count(
                    count: 128,
                    variant: variant,
                    colorScheme: colorScheme,
                  ),
                  ids.Badge.count(
                    count: 7,
                    variant: variant,
                    colorScheme: colorScheme,
                    child: const _Box(),
                  ),
                  ids.Badge.dot(
                    variant: variant,
                    colorScheme: colorScheme,
                    child: const _Box(),
                  ),
                ],
              ),
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Placement',
          description: '모서리 위치는 논리 방향입니다. end는 오른쪽에서 왼쪽으로 쓰는 문서에서 왼쪽입니다.',
          children: [
            for (final direction in [TextDirection.ltr, TextDirection.rtl])
              ShowcaseRow(
                label: direction.name,
                children: [
                  Directionality(
                    textDirection: direction,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        spacing: 40,
                        children: [
                          for (final placement in ids.BadgePlacement.values)
                            ids.Badge.count(
                              count: 9,
                              placement: placement,
                              child: const _Box(),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
        const ShowcaseSection(
          title: 'Shape',
          description: '둥근 대상에는 원의 가장자리로 당겨 붙습니다. Avatar는 모양을 알아서 알려 줍니다.',
          children: [
            ShowcaseRow(
              label: 'avatar',
              children: [
                ids.Badge.count(count: 3, child: ids.Avatar(name: 'Alice Kim')),
                ids.Badge.dot(
                  colorScheme: ids.IdsColorScheme.success,
                  placement: ids.BadgePlacement.bottomEnd,
                  semanticLabel: '온라인',
                  child: ids.Avatar(name: 'Bob Lee'),
                ),
                ids.Badge.dot(
                  colorScheme: ids.IdsColorScheme.success,
                  placement: ids.BadgePlacement.bottomEnd,
                  semanticLabel: '온라인',
                  child: ids.Avatar(
                    name: 'Acme',
                    shape: ids.AvatarShape.square,
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'circular',
              children: [
                ids.Badge.count(
                  count: 2,
                  shape: ids.BadgeShape.circular,
                  child: _Box(radius: 20),
                ),
              ],
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'Size',
          children: [
            ShowcaseRow(
              label: 'standard',
              children: [
                ids.Badge.count(
                  count: 3,
                  child: Icon(Icons.notifications_outlined, size: 28),
                ),
                ids.Badge.dot(
                  child: Icon(Icons.notifications_outlined, size: 28),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'tiny',
              children: [
                ids.Badge.count(
                  count: 3,
                  size: ids.IdsSize.tiny,
                  child: Icon(Icons.notifications_outlined, size: 20),
                ),
                ids.Badge.dot(
                  size: ids.IdsSize.tiny,
                  child: Icon(Icons.notifications_outlined, size: 20),
                ),
              ],
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'Standalone',
          description: 'children 없이 쓰면 제자리에 그립니다.',
          children: [
            ShowcaseRow(
              label: 'inline',
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  spacing: 8,
                  children: [
                    Icon(Icons.inbox_outlined, size: 20),
                    Text('받은 편지함', style: ids.IdsTypography.bodyB3Medium),
                    ids.Badge.count(
                      count: 12,
                      variant: ids.BadgeVariant.soft,
                      colorScheme: ids.IdsColorScheme.primary,
                      size: ids.IdsSize.tiny,
                    ),
                  ],
                ),
              ],
            ),
            ShowcaseRow(
              label: 'icon',
              children: [
                ids.Badge(
                  content: Row(
                    mainAxisSize: MainAxisSize.min,
                    spacing: 2,
                    children: [Icon(Icons.check_outlined), Text('완료')],
                  ),
                  variant: ids.BadgeVariant.soft,
                  colorScheme: ids.IdsColorScheme.success,
                ),
                ids.Badge(
                  content: Row(
                    mainAxisSize: MainAxisSize.min,
                    spacing: 2,
                    children: [Icon(Icons.check_outlined), Text('완료')],
                  ),
                  variant: ids.BadgeVariant.soft,
                  colorScheme: ids.IdsColorScheme.success,
                  size: ids.IdsSize.tiny,
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Count',
    builder: (context) => const Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 32,
      children: [
        ids.Badge.count(
          count: 99,
          child: Icon(Icons.notifications_outlined, size: 28),
        ),
        ids.Badge.count(
          count: 100,
          child: Icon(Icons.notifications_outlined, size: 28),
        ),
        ids.Badge.count(
          count: 1200,
          max: 999,
          child: Icon(Icons.notifications_outlined, size: 28),
        ),
        ids.Badge.count(
          count: 0,
          child: Icon(Icons.notifications_outlined, size: 28),
        ),
        ids.Badge.count(
          count: 0,
          showZero: true,
          child: Icon(Icons.notifications_outlined, size: 28),
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Accessibility',
    builder: (context) => const _Accessibility(),
  ),
  WidgetbookUseCase(
    name: 'On Avatar',
    builder: (context) => const Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 24,
      children: [
        ids.Badge.count(count: 3, child: ids.Avatar(name: 'Alice Kim')),
        ids.Badge.count(
          count: 3,
          shape: ids.BadgeShape.rectangular,
          child: ids.Avatar(name: 'Alice Kim'),
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Invisible',
    builder: (context) => const _Invisible(),
  ),
];

class _Accessibility extends StatefulWidget {
  const _Accessibility();

  @override
  State<_Accessibility> createState() => _AccessibilityState();
}

class _AccessibilityState extends State<_Accessibility> {
  int _unread = 3;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    spacing: 24,
    children: [
      ids.Badge.count(
        count: _unread,
        semanticLabel: '읽지 않은 메일 $_unread통',
        child: StandInButton(
          variant: ids.IdsVariant.outline,
          onPressed: () {},
          icon: const Icon(Icons.mail_outlined),
          child: const Text('받은 편지함'),
        ),
      ),
      ids.Badge.count(
        count: _unread,
        size: ids.IdsSize.tiny,
        child: const StandInIconButton(
          icon: Icon(Icons.notifications_outlined),
          label: '알림',
        ),
      ),
      StandInButton(
        size: ids.IdsSize.tiny,
        onPressed: () => setState(() => _unread++),
        child: const Text('새 메일'),
      ),
      StandInButton(
        size: ids.IdsSize.tiny,
        variant: ids.IdsVariant.outline,
        onPressed: () => setState(() => _unread = 0),
        child: const Text('모두 읽음'),
      ),
    ],
  );
}

class _Invisible extends StatefulWidget {
  const _Invisible();

  @override
  State<_Invisible> createState() => _InvisibleState();
}

class _InvisibleState extends State<_Invisible> {
  bool _online = true;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    spacing: 16,
    children: [
      ids.Badge.dot(
        invisible: !_online,
        colorScheme: ids.IdsColorScheme.success,
        placement: ids.BadgePlacement.bottomEnd,
        semanticLabel: _online ? '온라인' : '오프라인',
        child: const ids.Avatar(name: 'Alice Kim'),
      ),
      StandInButton(
        size: ids.IdsSize.tiny,
        variant: ids.IdsVariant.outline,
        onPressed: () => setState(() => _online = !_online),
        child: Text(_online ? '오프라인으로' : '온라인으로'),
      ),
    ],
  );
}
