import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

T _dropdown<T extends Enum>(
  BuildContext context,
  String label,
  List<T> options,
) => context.knobs.object.dropdown(
  label: label,
  options: options,
  labelBuilder: (value) => value.name,
);

final cardUseCases = [
  WidgetbookUseCase(
    name: 'Regions',
    builder: (context) {
      final variant = _dropdown(context, 'Variant', ids.CardVariant.values);
      final size = _dropdown(context, 'Size', ids.IdsSize.values);
      final dividers = context.knobs.boolean(label: 'Dividers');
      return themed(
        context,
        ids.Card(
          variant: variant,
          size: size,
          children: [
            ids.CardHeader(
              divider: dividers,
              children: const [
                ids.CardTitle(child: Text('새 프로젝트 만들기')),
                ids.CardDescription(child: Text('프로젝트 정보를 입력해 주세요.')),
                ids.CardAction(child: ids.Badge(content: Text('초안'))),
              ],
            ),
            const ids.CardContent(
              child: Text('이름, 설명, 공개 범위를 정하면 팀원을 초대할 수 있습니다.'),
            ),
            ids.CardFooter(
              divider: dividers,
              children: const [
                ids.AvatarGroup(
                  size: ids.IdsSize.tiny,
                  max: 3,
                  children: [
                    ids.Avatar(name: '김지스트'),
                    ids.Avatar(name: 'Alice Kim'),
                    ids.Avatar(name: 'Bob Lee'),
                    ids.Avatar(name: '류현승'),
                  ],
                ),
                Text('4명 참여'),
              ],
            ),
          ],
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Media',
    builder: (context) => themed(
      context,
      ids.Card(
        children: [
          ids.CardMedia(
            child: ids.AspectRatio(
              ratio: 16 / 9,
              child: Image.network(
                'https://picsum.photos/seed/ids-card/640/360',
                fit: BoxFit.cover,
              ),
            ),
          ),
          const ids.CardHeader(
            children: [
              ids.CardTitle(child: Text('바다 앞 오두막')),
              ids.CardDescription(child: Text('1박 ₩128,000')),
            ],
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Pressable',
    builder: (context) {
      final disabled = context.knobs.boolean(label: 'Disabled');
      return themed(context, _PressCount(disabled: disabled));
    },
  ),
];

class _PressCount extends StatefulWidget {
  const _PressCount({required this.disabled});

  final bool disabled;

  @override
  State<_PressCount> createState() => _PressCountState();
}

class _PressCountState extends State<_PressCount> {
  var _opened = 0;

  @override
  Widget build(BuildContext context) => ids.Card(
    disabled: widget.disabled,
    onPressed: () => setState(() => _opened++),
    children: [
      const ids.CardHeader(
        children: [
          ids.CardTitle(child: Text('디자인 시스템 회의록')),
          ids.CardDescription(child: Text('카드 어디를 눌러도 열립니다.')),
        ],
      ),
      ids.CardFooter(children: [Text('$_opened번 열었어요')]),
    ],
  );
}
