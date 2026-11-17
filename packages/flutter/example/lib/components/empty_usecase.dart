import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _variants = [
  ids.EmptyVariant.ghost,
  ids.EmptyVariant.soft,
  ids.EmptyVariant.outline,
];

const _cities = ['서울', '부산', '광주', '대전', '제주'];

final _illustration = PaintedImage(
  'empty-illustration',
  const Size(160, 112),
  (canvas, size) => canvas
    ..drawOval(
      Rect.fromCenter(center: const Offset(80, 102), width: 120, height: 16),
      Paint()..color = const Color(0xFFE5E7EB),
    )
    ..drawPath(
      Path()
        ..moveTo(28, 30)
        ..relativeLineTo(40, 0)
        ..relativeLineTo(10, 10)
        ..relativeLineTo(54, 0)
        ..relativeLineTo(0, 54)
        ..lineTo(28, 94)
        ..close(),
      Paint()..color = const Color(0xFFC7D2FE),
    )
    ..drawRect(
      const Rect.fromLTRB(28, 48, 132, 94),
      Paint()..color = const Color(0xFFA5B4FC),
    )
    ..drawCircle(
      const Offset(118, 22),
      10,
      Paint()..color = const Color(0xFFFDE68A),
    ),
);

final emptyUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) => ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 448),
      child: ids.Empty(
        variant: dropdown(context, 'variant', _variants),
        size: dropdown(context, 'size', ids.IdsSize.values),
        align: dropdown(context, 'align', ids.EmptyAlign.values),
        children: [
          const ids.EmptyMedia(child: Icon(Icons.folder_open_outlined)),
          const ids.EmptyTitle(child: Text('아직 프로젝트가 없습니다')),
          const ids.EmptyDescription(
            child: Text('첫 프로젝트를 만들어 팀원과 함께 시작해 보세요.'),
          ),
          ids.EmptyActions(
            children: [
              StandInButton(
                onPressed: () {},
                icon: const Icon(Icons.add_outlined),
                child: const Text('프로젝트 만들기'),
              ),
              StandInButton(
                variant: ids.IdsVariant.outline,
                onPressed: () {},
                child: const Text('가져오기'),
              ),
            ],
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Variant × Size',
          children: [
            ShowcaseMatrix(
              rows: ids.IdsSize.values,
              columns: _variants,
              builder: (size, variant) => SizedBox(
                width: 288,
                child: ids.Empty(
                  variant: variant,
                  size: size,
                  children: [
                    ids.EmptyTitle(child: Text(variant.name)),
                    ids.EmptyDescription(child: Text('size ${size.name}')),
                    ids.EmptyActions(
                      children: [
                        StandInButton(
                          size: size,
                          onPressed: () {},
                          child: const Text('만들기'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Media',
          description:
              'Empty.Media가 없으면 inbox 아이콘을 soft 칸에 그립니다. 아이콘은 soft와 outline 칸에, 일러스트는 ghost로 그대로 둡니다.',
          children: [
            ShowcaseMatrix(
              rows: ids.IdsSize.values,
              columns: ids.EmptyMediaVariant.values,
              builder: (size, variant) => SizedBox(
                width: 224,
                child: ids.Empty(
                  size: size,
                  children: [
                    ids.EmptyMedia(
                      variant: variant,
                      child: const Icon(Icons.search_outlined),
                    ),
                    const ids.EmptyTitle(child: Text('검색 결과 없음')),
                  ],
                ),
              ),
            ),
            const ShowcaseRow(
              label: 'default',
              children: [
                SizedBox(
                  width: 224,
                  child: ids.Empty(
                    children: [ids.EmptyTitle(child: Text('받은 메시지가 없습니다'))],
                  ),
                ),
                SizedBox(
                  width: 224,
                  child: ids.Empty(
                    variant: ids.EmptyVariant.soft,
                    children: [ids.EmptyTitle(child: Text('받은 메시지가 없습니다'))],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'illustration',
              children: [
                SizedBox(
                  width: 288,
                  child: ids.Empty(
                    variant: ids.EmptyVariant.outline,
                    children: [
                      ids.EmptyMedia(
                        variant: ids.EmptyMediaVariant.ghost,
                        child: Image(
                          image: _illustration,
                          width: 160,
                          height: 112,
                          excludeFromSemantics: true,
                        ),
                      ),
                      const ids.EmptyTitle(child: Text('이 폴더는 비어 있습니다')),
                      const ids.EmptyDescription(
                        child: Text('파일을 끌어다 놓거나 업로드 버튼을 누르세요.'),
                      ),
                      ids.EmptyActions(
                        children: [
                          StandInButton(
                            onPressed: () {},
                            icon: const Icon(Icons.file_upload_outlined),
                            child: const Text('파일 업로드'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const ShowcaseRow(
              label: 'hidden',
              children: [
                SizedBox(
                  width: 224,
                  child: ids.Empty(
                    variant: ids.EmptyVariant.outline,
                    size: ids.IdsSize.tiny,
                    children: [
                      ids.EmptyMedia(hidden: true),
                      ids.EmptyTitle(child: Text('표시할 항목이 없습니다')),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Align',
          children: [
            ShowcaseRow(
              children: [
                for (final align in ids.EmptyAlign.values)
                  SizedBox(
                    width: 288,
                    child: ids.Empty(
                      variant: ids.EmptyVariant.outline,
                      align: align,
                      children: [
                        const ids.EmptyMedia(child: Icon(Icons.group_outlined)),
                        ids.EmptyTitle(child: Text('align ${align.name}')),
                        const ids.EmptyDescription(
                          child: Text('팀원을 초대하면 여기에 표시됩니다.'),
                        ),
                        ids.EmptyActions(
                          children: [
                            StandInButton(
                              onPressed: () {},
                              child: const Text('초대하기'),
                            ),
                          ],
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
    name: 'In Card',
    builder: (context) => SizedBox(
      width: 384,
      child: ids.Card(
        children: [
          const ids.CardHeader(
            children: [
              ids.CardTitle(headingLevel: 2, child: Text('최근 활동')),
              ids.CardDescription(child: Text('팀원이 남긴 기록을 모아 봅니다.')),
            ],
          ),
          ids.CardContent(
            child: ids.Empty(
              variant: ids.EmptyVariant.soft,
              size: ids.IdsSize.tiny,
              children: [
                const ids.EmptyTitle(
                  headingLevel: 3,
                  child: Text('아직 활동이 없습니다'),
                ),
                const ids.EmptyDescription(
                  child: Text('문서를 만들거나 댓글을 남기면 여기에 쌓입니다.'),
                ),
                ids.EmptyActions(
                  children: [
                    StandInButton(
                      size: ids.IdsSize.tiny,
                      onPressed: () {},
                      child: const Text('문서 만들기'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Table Empty State',
    builder: (context) => Builder(
      builder: (context) {
        final theme = ids.ThemeProvider.of(context);
        final heading = ids.IdsTypography.bodyB3Regular.copyWith(
          color: theme.onMuted,
          fontWeight: FontWeight.w500,
        );
        return ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 576),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text('구성원', style: ids.IdsTypography.bodyB3Semibold),
              ),
              Table(
                children: [
                  TableRow(
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: theme.border)),
                    ),
                    children: [
                      for (final column in const ['이름', '이메일', '역할'])
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          child: Text(column, style: heading),
                        ),
                    ],
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: ids.Empty(
                  size: ids.IdsSize.tiny,
                  children: [
                    const ids.EmptyMedia(child: Icon(Icons.group_outlined)),
                    const ids.EmptyTitle(child: Text('구성원이 없습니다')),
                    const ids.EmptyDescription(
                      child: Text('새 구성원을 초대해 시작하세요.'),
                    ),
                    ids.EmptyActions(
                      children: [
                        StandInButton(
                          size: ids.IdsSize.tiny,
                          onPressed: () {},
                          child: const Text('초대하기'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    ),
  ),
  WidgetbookUseCase(
    name: 'List Empty State',
    builder: (context) => const _ListEmptyState(),
  ),
];

class _ListEmptyState extends StatefulWidget {
  const _ListEmptyState();

  @override
  State<_ListEmptyState> createState() => _ListEmptyStateState();
}

class _ListEmptyStateState extends State<_ListEmptyState> {
  final _query = TextEditingController();

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final matches = _cities
        .where((city) => city.contains(_query.text.trim()))
        .toList();
    return SizedBox(
      width: 320,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: [
          StandInTextField(
            controller: _query,
            onChanged: (_) => setState(() {}),
            placeholder: '도시 검색',
            icon: Icons.search_outlined,
          ),
          if (matches.isNotEmpty)
            ids.ItemGroup(
              semanticLabel: '도시',
              children: [
                for (final city in matches)
                  ids.Item(
                    size: ids.IdsSize.tiny,
                    children: [
                      ids.ItemContent(
                        children: [ids.ItemTitle(child: Text(city))],
                      ),
                    ],
                  ),
              ],
            )
          else
            ids.Empty(
              size: ids.IdsSize.tiny,
              children: [
                const ids.EmptyMedia(child: Icon(Icons.search_outlined)),
                const ids.EmptyTitle(child: Text('검색 결과가 없습니다')),
                const ids.EmptyDescription(child: Text('다른 검색어로 시도해 보세요.')),
                ids.EmptyActions(
                  children: [
                    StandInButton(
                      size: ids.IdsSize.tiny,
                      variant: ids.IdsVariant.outline,
                      onPressed: () => setState(_query.clear),
                      child: const Text('검색어 지우기'),
                    ),
                  ],
                ),
              ],
            ),
        ],
      ),
    );
  }
}
