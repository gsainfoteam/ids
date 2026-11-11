import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final emptyUseCases = [
  WidgetbookUseCase(
    name: 'Variants',
    builder: (context) {
      final variant = dropdown(context, 'Variant', ids.EmptyVariant.values);
      final size = dropdown(context, 'Size', ids.IdsSize.values);
      final align = dropdown(context, 'Align', ids.EmptyAlign.values);
      final media = dropdown(context, 'Media', ids.EmptyMediaVariant.values);
      return themed(
        context,
        ids.Empty(
          variant: variant,
          size: size,
          align: align,
          children: [
            ids.EmptyMedia(
              variant: media,
              child: const Icon(Icons.folder_open_outlined),
            ),
            const ids.EmptyTitle(headingLevel: 2, child: Text('아직 프로젝트가 없습니다')),
            const ids.EmptyDescription(
              child: Text('첫 프로젝트를 만들어 팀원과 함께 시작해 보세요.'),
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Default media',
    builder: (context) => themed(
      context,
      const Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: [
          ids.Empty(
            size: ids.IdsSize.tiny,
            children: [ids.EmptyTitle(child: Text('받은 메시지가 없습니다'))],
          ),
          ids.Empty(
            size: ids.IdsSize.tiny,
            children: [
              ids.EmptyMedia(hidden: true),
              ids.EmptyTitle(child: Text('표시할 항목이 없습니다')),
            ],
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'In a card',
    builder: (context) => themed(
      context,
      const ids.Card(
        children: [
          ids.CardHeader(children: [ids.CardTitle(child: Text('최근 활동'))]),
          ids.CardContent(
            child: ids.Empty(
              variant: ids.EmptyVariant.soft,
              size: ids.IdsSize.tiny,
              children: [
                ids.EmptyMedia(child: Icon(Icons.history)),
                ids.EmptyTitle(child: Text('아직 활동이 없습니다')),
                ids.EmptyDescription(child: Text('팀원이 글을 올리면 여기에 보입니다.')),
              ],
            ),
          ),
        ],
      ),
    ),
  ),
];
