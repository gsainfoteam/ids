import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

const _members = [
  ids.Avatar(name: '김지스트'),
  ids.Avatar(name: 'Alice Kim'),
  ids.Avatar(name: 'Bob Lee'),
  ids.Avatar(name: '류현승'),
  ids.Avatar(name: 'Carol Park'),
  ids.Avatar(name: 'Dave Choi'),
];

T _dropdown<T extends Enum>(
  BuildContext context,
  String label,
  List<T> options,
) => context.knobs.object.dropdown(
  label: label,
  options: options,
  labelBuilder: (value) => value.name,
);

final avatarGroupUseCases = [
  WidgetbookUseCase(
    name: 'Overflow',
    builder: (context) {
      final max = context.knobs.int.slider(
        label: 'Max',
        initialValue: 3,
        min: 1,
        max: _members.length,
      );
      return themed(
        context,
        Center(
          child: ids.AvatarGroup(
            max: max,
            layout: _dropdown(context, 'Layout', ids.AvatarGroupLayout.values),
            stacking: _dropdown(
              context,
              'Stacking',
              ids.AvatarGroupStacking.values,
            ),
            size: _dropdown(context, 'Size', ids.IdsSize.values),
            shape: _dropdown(context, 'Shape', ids.AvatarShape.values),
            semanticLabel: '회의 참석자',
            children: _members,
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Total',
    builder: (context) => themed(
      context,
      const Center(
        child: ids.AvatarGroup(
          total: 128,
          semanticLabel: '프로젝트 멤버',
          children: [
            ids.Avatar(name: '김지스트'),
            ids.Avatar(name: 'Alice Kim'),
            ids.Avatar(name: 'Bob Lee'),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Custom overflow',
    builder: (context) => themed(
      context,
      Center(
        child: ids.AvatarGroup(
          max: 2,
          overflowFirst: true,
          overflowBuilder: (count) => Text('$count+'),
          overflowLabel: (count) => '그 밖의 $count명',
          semanticLabel: '리뷰어',
          children: _members,
        ),
      ),
    ),
  ),
];
