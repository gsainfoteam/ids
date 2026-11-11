import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final itemUseCases = [
  WidgetbookUseCase(
    name: 'Row',
    builder: (context) {
      final variant = dropdown(context, 'Variant', ids.ItemVariant.values);
      final size = dropdown(context, 'Size', ids.IdsSize.values);
      final dense = context.knobs.boolean(label: 'Dense');
      final truncate = context.knobs.boolean(label: 'Truncate title');
      return themed(
        context,
        ids.Item(
          variant: variant,
          size: size,
          dense: dense,
          children: [
            const ids.ItemMedia(child: ids.Avatar(name: '김지스트')),
            ids.ItemContent(
              children: [
                ids.ItemTitle(
                  truncate: truncate,
                  child: const Text('김지스트 · 인포팀 디자인 시스템 프로젝트 리드'),
                ),
                const ids.ItemDescription(child: Text('gist@gm.gist.ac.kr')),
              ],
            ),
            const ids.ItemActions(children: [ids.Badge.count(count: 3)]),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Selectable',
    builder: (context) => themed(context, const _Selectable()),
  ),
  WidgetbookUseCase(
    name: 'Group',
    builder: (context) {
      final variant = dropdown(context, 'Variant', ids.ItemGroupVariant.values);
      return themed(
        context,
        ids.ItemGroup(
          variant: variant,
          semanticLabel: '설정',
          children: const [
            ids.Item(
              children: [
                ids.ItemMedia(
                  variant: ids.ItemVariant.soft,
                  child: Icon(Icons.notifications_outlined),
                ),
                ids.ItemContent(
                  children: [
                    ids.ItemTitle(child: Text('알림')),
                    ids.ItemDescription(child: Text('새 메시지 알림 받기')),
                  ],
                ),
              ],
            ),
            ids.Item(
              children: [
                ids.ItemMedia(
                  variant: ids.ItemVariant.soft,
                  child: Icon(Icons.dark_mode_outlined),
                ),
                ids.ItemContent(
                  children: [ids.ItemTitle(child: Text('다크 모드'))],
                ),
                ids.ItemActions(children: [Icon(Icons.chevron_right)]),
              ],
            ),
            ids.Item(
              children: [
                ids.ItemMedia(
                  variant: ids.ItemVariant.soft,
                  child: Icon(Icons.group_outlined),
                ),
                ids.ItemContent(children: [ids.ItemTitle(child: Text('팀원'))]),
                ids.ItemActions(
                  children: [
                    ids.AvatarGroup(
                      size: ids.IdsSize.tiny,
                      max: 2,
                      children: [
                        ids.Avatar(name: '김지스트'),
                        ids.Avatar(name: 'Alice Kim'),
                        ids.Avatar(name: 'Bob Lee'),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
    },
  ),
];

class _Selectable extends StatefulWidget {
  const _Selectable();

  @override
  State<_Selectable> createState() => _SelectableState();
}

class _SelectableState extends State<_Selectable> {
  static const _files = ['회의록.pdf', '디자인 시안.fig', '예산안.xlsx'];
  var _selected = _files.first;

  @override
  Widget build(BuildContext context) => ids.ItemGroup(
    variant: ids.ItemGroupVariant.ghost,
    semanticLabel: '파일',
    children: [
      for (final file in _files)
        ids.Item(
          selected: file == _selected,
          onPressed: () => setState(() => _selected = file),
          children: [
            const ids.ItemMedia(child: Icon(Icons.description_outlined)),
            ids.ItemContent(children: [ids.ItemTitle(child: Text(file))]),
          ],
        ),
    ],
  );
}
