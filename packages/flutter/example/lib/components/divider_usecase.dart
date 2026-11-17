import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

class _Panel extends StatelessWidget {
  const _Panel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Container(
    width: 96,
    alignment: Alignment.center,
    decoration: BoxDecoration(
      color: ids.IdsProvider.of(context).colors.bgNeutralSoft,
      borderRadius: BorderRadius.circular(
        ids.IdsProvider.of(context).radius.standard,
      ),
    ),
    child: Text(text, style: ids.IdsTypography.bodyB3Regular),
  );
}

final dividerUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final orientation = dropdown(context, 'orientation', Axis.values);
      final decorative = context.knobs.boolean(label: 'decorative');
      final children = context.knobs.string(
        label: 'children',
        initialValue: '또는',
      );
      return SizedBox(
        width: 320,
        height: 128,
        child: Center(
          child: ids.Divider(
            orientation: orientation,
            decorative: decorative,
            child: children.isEmpty ? null : Text(children),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        const ShowcaseSection(
          title: 'Horizontal',
          children: [
            ShowcaseRow(
              label: 'plain',
              children: [SizedBox(width: 288, child: ids.Divider())],
            ),
            ShowcaseRow(
              label: 'label · center',
              children: [
                SizedBox(width: 288, child: ids.Divider(child: Text('또는'))),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Vertical',
          description: 'flex 행 안에서는 행 높이만큼 늘어납니다.',
          children: [
            ShowcaseRow(
              label: 'plain',
              children: [
                SizedBox(
                  height: 32,
                  child: DefaultTextStyle.merge(
                    style: ids.IdsTypography.bodyB3Regular,
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      spacing: 12,
                      children: [
                        Text('계정'),
                        ids.Divider(orientation: Axis.vertical),
                        Text('설정'),
                        ids.Divider(orientation: Axis.vertical),
                        Text('로그아웃'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const ShowcaseRow(
              label: 'label',
              children: [
                SizedBox(
                  height: 128,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: 24,
                    children: [
                      _Panel('이메일'),
                      ids.Divider(
                        orientation: Axis.vertical,
                        child: Text('또는'),
                      ),
                      _Panel('소셜 로그인'),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'In context',
          children: [
            ShowcaseRow(
              label: 'login',
              children: [
                SizedBox(
                  width: 288,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: 16,
                    children: [
                      StandInButton(
                        onPressed: () {},
                        child: const Text('이메일로 계속'),
                      ),
                      const ids.Divider(child: Text('또는')),
                      StandInButton(
                        variant: ids.IdsVariant.outline,
                        onPressed: () {},
                        child: const Text('Google로 계속'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'toolbar',
              children: [
                SizedBox(
                  height: 36,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    spacing: 4,
                    children: [
                      StandInButton(
                        size: ids.IdsSize.tiny,
                        variant: ids.IdsVariant.ghost,
                        onPressed: () {},
                        child: const Text('잘라내기'),
                      ),
                      StandInButton(
                        size: ids.IdsSize.tiny,
                        variant: ids.IdsVariant.ghost,
                        onPressed: () {},
                        child: const Text('복사'),
                      ),
                      const SizedBox(
                        height: 16,
                        child: ids.Divider(
                          orientation: Axis.vertical,
                          decorative: true,
                        ),
                      ),
                      StandInButton(
                        size: ids.IdsSize.tiny,
                        variant: ids.IdsVariant.ghost,
                        onPressed: () {},
                        child: const Text('붙여넣기'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Labelled',
    builder: (context) =>
        const SizedBox(width: 288, child: ids.Divider(child: Text('또는'))),
  ),
  WidgetbookUseCase(
    name: 'Vertical',
    builder: (context) => const SizedBox(
      height: 40,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: [
          Text('왼쪽'),
          ids.Divider(orientation: Axis.vertical),
          Text('오른쪽'),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Decorative',
    builder: (context) => const SizedBox(
      height: 32,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: [
          Text('계정'),
          ids.Divider(orientation: Axis.vertical, decorative: true),
          Text('설정'),
        ],
      ),
    ),
  ),
];
