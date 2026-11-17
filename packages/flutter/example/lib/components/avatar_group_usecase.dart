import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

final _members = <Widget>[
  ids.Avatar(image: portrait(210), name: 'Alice Kim'),
  ids.Avatar(image: portrait(30), name: 'Bob Lee'),
  const ids.Avatar(name: 'Carol Park'),
  ids.Avatar(image: portrait(140), name: '류현승'),
  const ids.Avatar(name: 'Eve Choi'),
];

Widget _onBackground(String label, {Color? color, Gradient? gradient}) =>
    ShowcaseRow(
      label: label,
      children: [
        Builder(
          builder: (context) => Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color,
              gradient: gradient,
              borderRadius: BorderRadius.circular(
                ids.IdsProvider.of(context).radius.standard,
              ),
            ),
            child: ids.AvatarGroup(
              max: 4,
              semanticLabel: label,
              children: _members,
            ),
          ),
        ),
      ],
    );

final avatarGroupUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) => ids.AvatarGroup(
      layout: dropdown(context, 'layout', ids.AvatarGroupLayout.values),
      stacking: dropdown(context, 'stacking', ids.AvatarGroupStacking.values),
      size: dropdown(context, 'size', ids.IdsSize.values),
      shape: dropdown(context, 'shape', ids.AvatarShape.values),
      max: context.knobs.intOrNull.input(label: 'max', initialValue: 3),
      total: context.knobs.intOrNull.input(label: 'total', defaultToNull: true),
      semanticLabel: '회의 참석자',
      children: _members,
    ),
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Builder(
      builder: (context) {
        final theme = ids.IdsProvider.of(context).colors;
        return Showcase(
          children: [
            ShowcaseSection(
              title: 'Layout × Size',
              children: [
                ShowcaseMatrix(
                  rows: ids.IdsSize.values,
                  columns: ids.AvatarGroupLayout.values,
                  builder: (size, layout) => ids.AvatarGroup(
                    layout: layout,
                    size: size,
                    max: 3,
                    semanticLabel: '${layout.name} ${size.name}',
                    children: _members,
                  ),
                ),
              ],
            ),
            ShowcaseSection(
              title: 'Stacking',
              description: '어느 쪽 아바타가 위에 오는지 정합니다.',
              children: [
                ShowcaseRow(
                  label: 'first-on-top',
                  children: [
                    ids.AvatarGroup(
                      semanticLabel: 'first-on-top',
                      children: _members.sublist(0, 4),
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'last-on-top',
                  children: [
                    ids.AvatarGroup(
                      stacking: ids.AvatarGroupStacking.lastOnTop,
                      semanticLabel: 'last-on-top',
                      children: _members.sublist(0, 4),
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'square',
                  children: [
                    ids.AvatarGroup(
                      shape: ids.AvatarShape.square,
                      semanticLabel: 'square',
                      children: _members.sublist(0, 4),
                    ),
                    ids.AvatarGroup(
                      shape: ids.AvatarShape.square,
                      size: ids.IdsSize.tiny,
                      semanticLabel: 'square tiny',
                      children: _members.sublist(0, 4),
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'rtl',
                  children: [
                    Directionality(
                      textDirection: TextDirection.rtl,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        spacing: 24,
                        children: [
                          ids.AvatarGroup(
                            max: 3,
                            semanticLabel: 'rtl',
                            children: _members,
                          ),
                          ids.AvatarGroup(
                            shape: ids.AvatarShape.square,
                            stacking: ids.AvatarGroupStacking.lastOnTop,
                            semanticLabel: 'rtl square',
                            children: _members.sublist(0, 3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            ShowcaseSection(
              title: 'Any background',
              description: '겹친 쪽은 투명하게 오려내므로 어떤 배경에서도 틈이 배경색 그대로 보입니다.',
              children: [
                _onBackground('muted', color: theme.bgNeutralSoft),
                _onBackground('primary', color: theme.bgPrimary),
                _onBackground(
                  'gradient',
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFFE12AFB),
                      Color(0xFFFFD230),
                      Color(0xFF00D492),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseSection(
              title: 'Overflow',
              children: [
                ShowcaseRow(
                  label: 'max 2',
                  children: [
                    ids.AvatarGroup(
                      max: 2,
                      semanticLabel: 'max 2',
                      children: _members,
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'total 128',
                  children: [
                    ids.AvatarGroup(
                      total: 128,
                      semanticLabel: 'total 128',
                      children: _members.sublist(0, 3),
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'custom',
                  children: [
                    ids.AvatarGroup(
                      max: 2,
                      overflowFirst: true,
                      overflowBuilder: (count) => SizedBox.expand(
                        child: ColoredBox(
                          color: theme.bgPrimary,
                          child: Center(
                            child: Text(
                              '$count+',
                              style: TextStyle(color: theme.textOnPrimary),
                            ),
                          ),
                        ),
                      ),
                      semanticLabel: 'custom overflow',
                      children: _members,
                    ),
                  ],
                ),
              ],
            ),
          ],
        );
      },
    ),
  ),
  WidgetbookUseCase(
    name: 'Overflow',
    builder: (context) =>
        ids.AvatarGroup(max: 3, semanticLabel: '회의 참석자', children: _members),
  ),
  WidgetbookUseCase(
    name: 'Total',
    builder: (context) => ids.AvatarGroup(
      total: 128,
      semanticLabel: '회의 참석자',
      children: _members.sublist(0, 3),
    ),
  ),
  WidgetbookUseCase(
    name: 'Stacking',
    builder: (context) =>
        ids.AvatarGroup(max: 3, semanticLabel: '회의 참석자', children: _members),
  ),
  WidgetbookUseCase(
    name: 'Last On Top',
    builder: (context) => ids.AvatarGroup(
      max: 3,
      stacking: ids.AvatarGroupStacking.lastOnTop,
      semanticLabel: '회의 참석자',
      children: _members,
    ),
  ),
  WidgetbookUseCase(
    name: 'Size From Group',
    builder: (context) => const ids.AvatarGroup(
      size: ids.IdsSize.tiny,
      shape: ids.AvatarShape.square,
      semanticLabel: '크기 전파',
      children: [
        ids.Avatar(name: 'Alice Kim'),
        ids.Avatar(
          name: 'Bob Lee',
          size: ids.IdsSize.standard,
          shape: ids.AvatarShape.circle,
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Custom Overflow',
    builder: (context) => ids.AvatarGroup(
      max: 2,
      overflowFirst: true,
      overflowBuilder: (count) => Text('$count+'),
      overflowLabel: (count) => 'and $count more',
      semanticLabel: 'Reviewers',
      children: _members,
    ),
  ),
];
