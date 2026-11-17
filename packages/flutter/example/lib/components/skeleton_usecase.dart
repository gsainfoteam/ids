import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _members = ['김지스트', '이인포', '박팀장'];

const _memberSkeleton = ids.Item(
  children: [
    ids.ItemMedia(child: ids.Skeleton(shape: ids.SkeletonShape.circle)),
    ids.ItemContent(
      children: [
        FractionallySizedBox(
          widthFactor: 1 / 3,
          child: ids.Skeleton(
            shape: ids.SkeletonShape.text,
            style: ids.IdsTypography.bodyB3Medium,
          ),
        ),
        FractionallySizedBox(
          widthFactor: 1 / 2,
          child: ids.Skeleton(
            shape: ids.SkeletonShape.text,
            style: ids.IdsTypography.bodyB3Regular,
          ),
        ),
      ],
    ),
  ],
);

const _noticeCard = ids.Card(
  children: [
    ids.CardTitle(child: Text('2026 가을 학기 공지')),
    ids.CardDescription(child: Text('수강 신청 일정을 확인하세요.')),
  ],
);

final skeletonUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) => ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 384),
      child: ids.Skeleton(
        shape: dropdown(
          context,
          'shape',
          ids.SkeletonShape.values,
          initial: ids.SkeletonShape.text,
        ),
        lines: context.knobs.int.input(label: 'lines', initialValue: 3),
        animation: dropdown(context, 'animation', ids.SkeletonAnimation.values),
        style: ids.IdsTypography.bodyB3Regular,
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Shape × Animation',
          description:
              'rect 는 16px 높이에 너비를 채우고, circle 은 Avatar 와 같은 40px, text 는 글자 스타일의 줄 높이를 따릅니다.',
          children: [
            ShowcaseMatrix(
              rows: ids.SkeletonShape.values,
              columns: ids.SkeletonAnimation.values,
              builder: (shape, animation) => shape == ids.SkeletonShape.circle
                  ? ids.Skeleton(
                      shape: ids.SkeletonShape.circle,
                      animation: animation,
                    )
                  : SizedBox(
                      width: 160,
                      child: ids.Skeleton(
                        shape: shape,
                        animation: animation,
                        lines: 2,
                        style: ids.IdsTypography.bodyB3Regular,
                      ),
                    ),
            ),
            const ShowcaseRow(
              label: 'wave, rtl',
              children: [
                SizedBox(
                  width: 160,
                  child: Directionality(
                    textDirection: TextDirection.rtl,
                    child: ids.Skeleton(animation: ids.SkeletonAnimation.wave),
                  ),
                ),
              ],
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'Text',
          description:
              '줄마다 그 글자 스타일의 줄 높이 한 칸에 1em 막대를 그립니다. 여러 줄이면 마지막 줄은 60% 입니다.',
          children: [
            ShowcaseRow(
              label: 'subtitle-s2',
              children: [
                SizedBox(
                  width: 192,
                  child: ids.Skeleton(
                    shape: ids.SkeletonShape.text,
                    style: ids.IdsTypography.subtitleS2Semibold,
                  ),
                ),
                SizedBox(
                  width: 192,
                  child: Text(
                    '학기 공지',
                    style: ids.IdsTypography.subtitleS2Semibold,
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'body-b3 × 3',
              children: [
                SizedBox(
                  width: 192,
                  child: ids.Skeleton(
                    shape: ids.SkeletonShape.text,
                    lines: 3,
                    style: ids.IdsTypography.bodyB3Regular,
                  ),
                ),
                SizedBox(
                  width: 192,
                  child: Text(
                    '수강 신청은\n9월 1일 오전 10시에\n열립니다.',
                    style: ids.IdsTypography.bodyB3Regular,
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'caption-c1 × 2',
              children: [
                SizedBox(
                  width: 192,
                  child: ids.Skeleton(
                    shape: ids.SkeletonShape.text,
                    lines: 2,
                    style: ids.IdsTypography.captionC1Regular,
                  ),
                ),
                SizedBox(
                  width: 192,
                  child: Text(
                    '인포팀\n3분 전',
                    style: ids.IdsTypography.captionC1Regular,
                  ),
                ),
              ],
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'Composition',
          description: '카드와 행 모양은 모양을 합성해서 만듭니다. 불러오는 영역에는 앱이 aria-busy 를 둡니다.',
          children: [
            ShowcaseRow(
              label: 'Card',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Card(
                    children: [
                      Row(
                        spacing: 12,
                        children: [
                          ids.Skeleton(shape: ids.SkeletonShape.circle),
                          Expanded(
                            child: ids.Skeleton(
                              shape: ids.SkeletonShape.text,
                              lines: 2,
                              style: ids.IdsTypography.bodyB3Regular,
                            ),
                          ),
                        ],
                      ),
                      ids.AspectRatio(ratio: 16 / 9, child: ids.Skeleton()),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'Item.Group',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.ItemGroup(
                    semanticLabel: '멤버',
                    children: [
                      _memberSkeleton,
                      _memberSkeleton,
                      _memberSkeleton,
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'Wrapping',
          description: 'loading 이면 자식의 크기 그대로 칠하고, 끝나면 같은 구조에서 자식이 보입니다.',
          children: [
            ShowcaseRow(
              label: 'div',
              children: [
                SizedBox(
                  width: 256,
                  child: ids.Skeleton(loading: true, child: _noticeCard),
                ),
                SizedBox(
                  width: 256,
                  child: ids.Skeleton(loading: false, child: _noticeCard),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'Avatar',
              children: [
                ids.Skeleton(
                  loading: true,
                  shape: ids.SkeletonShape.circle,
                  child: ids.Avatar(name: '김지스트'),
                ),
                ids.Skeleton(
                  loading: false,
                  shape: ids.SkeletonShape.circle,
                  child: ids.Avatar(name: '김지스트'),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Wrapping',
    builder: (context) => _LoadingToggle(
      builder: (loading) => SizedBox(
        width: double.infinity,
        child: ids.Skeleton(
          loading: loading,
          child: ids.Card(
            children: [
              const ids.CardHeader(
                children: [
                  ids.CardTitle(child: Text('2026 가을 학기 공지')),
                  ids.CardDescription(child: Text('수강 신청 일정과 유의 사항을 확인하세요.')),
                ],
              ),
              ids.CardFooter(
                children: [
                  StandInButton(
                    size: ids.IdsSize.tiny,
                    onPressed: () {},
                    child: const Text('자세히 보기'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Text Height',
    builder: (context) => const Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 24,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 16,
          children: [
            SizedBox(
              width: 160,
              child: ids.Skeleton(
                shape: ids.SkeletonShape.text,
                lines: 3,
                style: ids.IdsTypography.bodyB3Regular,
              ),
            ),
            Text(
              '수강 신청은\n9월 1일에\n열립니다.',
              style: ids.IdsTypography.bodyB3Regular,
            ),
          ],
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 16,
          children: [
            SizedBox(
              width: 160,
              child: ids.Skeleton(
                shape: ids.SkeletonShape.text,
                style: ids.IdsTypography.subtitleS2Semibold,
              ),
            ),
            Text('학기 공지', style: ids.IdsTypography.subtitleS2Semibold),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Busy Region',
    builder: (context) => _LoadingToggle(
      builder: (loading) => SizedBox(
        width: double.infinity,
        child: ids.ItemGroup(
          semanticLabel: '멤버',
          children: [
            for (final name in _members)
              loading
                  ? _memberSkeleton
                  : ids.Item(
                      children: [
                        ids.ItemMedia(child: ids.Avatar(name: name)),
                        ids.ItemContent(
                          children: [
                            ids.ItemTitle(child: Text(name)),
                            const ids.ItemDescription(child: Text('인포팀')),
                          ],
                        ),
                      ],
                    ),
          ],
        ),
      ),
    ),
  ),
];

class _LoadingToggle extends StatefulWidget {
  const _LoadingToggle({required this.builder});

  final Widget Function(bool loading) builder;

  @override
  State<_LoadingToggle> createState() => _LoadingToggleState();
}

class _LoadingToggleState extends State<_LoadingToggle> {
  var _loading = true;

  @override
  Widget build(BuildContext context) => ConstrainedBox(
    constraints: const BoxConstraints(maxWidth: 384),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: [
        StandInButton(
          variant: ids.IdsVariant.outline,
          onPressed: () => setState(() => _loading = !_loading),
          child: Text(_loading ? '불러오기 끝내기' : '다시 불러오기'),
        ),
        widget.builder(_loading),
      ],
    ),
  );
}
