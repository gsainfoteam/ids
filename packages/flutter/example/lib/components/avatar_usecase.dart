import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _names = [
  'Alice Kim',
  'ada lovelace king',
  '류현승',
  '홍 길동',
  'Émile Zola',
  '(주)아크메',
  '🦊 Fox',
  '  ',
];

class _Code extends StatelessWidget {
  const _Code(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Text(
    text,
    style: TextStyle(
      inherit: false,
      color: ids.IdsProvider.of(context).colors.onSurface,
      fontFamily: 'monospace',
      fontFamilyFallback: const ['Menlo', 'Consolas'],
      fontSize: ids.IdsTypography.bodyB3Regular.fontSize,
      height: ids.IdsTypography.bodyB3Regular.height,
    ),
  );
}

final avatarUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final shape = dropdown(context, 'shape', ids.AvatarShape.values);
      final size = dropdown(context, 'size', ids.IdsSize.values);
      return ids.Avatar(
        image: portrait(210),
        name: 'Alice Kim',
        shape: shape,
        size: size,
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Shape × Size',
          children: [
            ShowcaseMatrix(
              rows: ids.IdsSize.values,
              columns: ids.AvatarShape.values,
              builder: (size, shape) => Row(
                mainAxisSize: MainAxisSize.min,
                spacing: 8,
                children: [
                  ids.Avatar(
                    image: portrait(shape == ids.AvatarShape.circle ? 210 : 30),
                    name: 'Alice Kim',
                    shape: shape,
                    size: size,
                  ),
                  ids.Avatar(name: 'Alice Kim', shape: shape, size: size),
                  ids.Avatar(name: '류현승', shape: shape, size: size),
                  ids.Avatar(semanticLabel: '이름 없음', shape: shape, size: size),
                ],
              ),
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Fallback',
          description: '이미지가 없거나 깨지면 이름의 이니셜, 이름도 없으면 사람 아이콘을 그립니다.',
          children: [
            ShowcaseRow(
              label: 'image',
              children: [ids.Avatar(image: portrait(210), name: 'Alice Kim')],
            ),
            const ShowcaseRow(
              label: 'broken',
              children: [
                ids.Avatar(image: brokenImage, name: 'Bob Lee'),
                ids.Avatar(image: brokenImage, name: '류현승'),
              ],
            ),
            const ShowcaseRow(
              label: 'no name',
              children: [ids.Avatar(semanticLabel: '알 수 없는 사용자')],
            ),
            const ShowcaseRow(
              label: 'custom',
              children: [
                ids.Avatar(
                  name: 'Acme',
                  shape: ids.AvatarShape.square,
                  fallback: Icon(Icons.business),
                ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Custom size',
          description: '크기를 바꿔도 이니셜이 비율에 맞게 커집니다.',
          children: [
            ShowcaseRow(
              label: 'className',
              children: [
                const SizedBox.square(
                  dimension: 64,
                  child: ids.Avatar(name: 'Alice Kim'),
                ),
                const SizedBox.square(
                  dimension: 80,
                  child: ids.Avatar(name: '류현승'),
                ),
                SizedBox.square(
                  dimension: 80,
                  child: ids.Avatar(image: portrait(210), name: 'Alice Kim'),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Loading Status',
    builder: (context) => const _LoadingStatus(),
  ),
  WidgetbookUseCase(
    name: 'Fallback',
    builder: (context) => const ids.Avatar(image: brokenImage, name: '류현승'),
  ),
  WidgetbookUseCase(
    name: 'Decorative',
    builder: (context) => Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 8,
      children: [
        ids.Avatar(
          image: portrait(210),
          name: 'Alice Kim',
          excludeFromSemantics: true,
          size: ids.IdsSize.tiny,
        ),
        const Text('Alice Kim', style: ids.IdsTypography.bodyB3Medium),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Initials',
    builder: (context) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 8,
      children: [
        for (final name in _names)
          Row(
            mainAxisSize: MainAxisSize.min,
            spacing: 12,
            children: [
              ids.Avatar(
                name: name,
                semanticLabel: name.trim().isEmpty ? '빈 이름' : name.trim(),
                size: ids.IdsSize.tiny,
              ),
              _Code('"$name" → "${ids.initialsOf(name)}"'),
            ],
          ),
      ],
    ),
  ),
];

class _LoadingStatus extends StatefulWidget {
  const _LoadingStatus();

  @override
  State<_LoadingStatus> createState() => _LoadingStatusState();
}

class _LoadingStatusState extends State<_LoadingStatus> {
  ImageProvider _image = portrait(210);
  final _log = <ids.AvatarStatus>[];

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: 16,
    children: [
      DecoratedBox(
        position: DecorationPosition.foreground,
        decoration: ShapeDecoration(
          shape: CircleBorder(
            side: _log.lastOrNull == ids.AvatarStatus.loaded
                ? BorderSide(
                    color: ids.IdsProvider.of(context).colors.bgSuccess,
                    width: 2,
                    strokeAlign: BorderSide.strokeAlignOutside,
                  )
                : BorderSide.none,
          ),
        ),
        child: ids.Avatar(
          image: _image,
          name: 'Alice Kim',
          onStatusChange: (status) => setState(() => _log.add(status)),
        ),
      ),
      Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 8,
        children: [
          StandInButton(
            size: ids.IdsSize.tiny,
            variant: ids.IdsVariant.outline,
            onPressed: () => setState(() => _image = brokenImage),
            child: const Text('깨진 이미지로'),
          ),
          StandInButton(
            size: ids.IdsSize.tiny,
            variant: ids.IdsVariant.outline,
            onPressed: () => setState(() => _image = portrait(140)),
            child: const Text('다른 사진으로'),
          ),
        ],
      ),
      Semantics(
        label: '상태 기록',
        child: _Code(_log.map((status) => status.name).join(' → ')),
      ),
    ],
  );
}
