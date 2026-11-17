import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _files = ['보고서.pdf', '예산안.xlsx', '회의록.md'];

const _attachments = [
  (
    name: '2026 상반기 예산 집행 결과 보고서 (최종 수정본).pdf',
    size: '2.4 MB',
    thumbnail: false,
  ),
  (name: '현장 사진.jpg', size: '1.2 MB', thumbnail: true),
  (name: '회의록.md', size: '3 KB', thumbnail: false),
];

final _photo = PaintedImage('item-photo', const Size(256, 192), (canvas, size) {
  canvas
    ..scale(size.width / 64)
    ..drawRect(
      const Rect.fromLTWH(0, 0, 64, 48),
      Paint()..color = const Color(0xFF93C5FD),
    )
    ..drawCircle(
      const Offset(46, 14),
      6,
      Paint()..color = const Color(0xFFFDE68A),
    )
    ..drawPath(
      Path()
        ..moveTo(0, 48)
        ..lineTo(22, 20)
        ..relativeLineTo(14, 16)
        ..relativeLineTo(8, -8)
        ..relativeLineTo(20, 20)
        ..close(),
      Paint()..color = const Color(0xFF1D4ED8),
    );
});

Widget _photoImage() =>
    Image(image: _photo, fit: BoxFit.cover, excludeFromSemantics: true);

final itemUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final variant = dropdown(
        context,
        'variant',
        ids.ItemVariant.values,
        initial: ids.ItemVariant.outline,
      );
      final size = dropdown(
        context,
        'size',
        ids.IdsSize.values,
        initial: ids.IdsSize.standard,
      );
      final dense = context.knobs.boolean(label: 'dense');
      final interactive = context.knobs.boolean(label: 'interactive');
      final selected = context.knobs.boolean(label: 'selected');
      final disabled = context.knobs.boolean(label: 'disabled');
      return SizedBox(
        width: 384,
        child: ids.Item(
          variant: variant,
          size: size,
          dense: dense,
          onPressed: interactive ? () {} : null,
          selected: selected,
          disabled: disabled,
          children: [
            const ids.ItemMedia(child: ids.Avatar(name: '김철수')),
            const ids.ItemContent(
              children: [
                ids.ItemTitle(child: Text('김철수')),
                ids.ItemDescription(child: Text('kim@example.com')),
              ],
            ),
            ids.ItemActions(
              children: [
                StandInIconButton(
                  icon: const Icon(Icons.more_vert_outlined),
                  label: '더보기',
                  size: ids.IdsSize.tiny,
                ),
              ],
            ),
          ],
        ),
      );
    },
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
              columns: ids.ItemVariant.values,
              builder: (size, variant) => SizedBox(
                width: 256,
                child: ids.Item(
                  variant: variant,
                  size: size,
                  children: [
                    const ids.ItemMedia(
                      variant: ids.ItemVariant.soft,
                      child: Icon(Icons.notifications_outlined),
                    ),
                    ids.ItemContent(
                      children: [
                        ids.ItemTitle(child: Text(variant.name)),
                        ids.ItemDescription(child: Text('size ${size.name}')),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Dense · Variant × Size',
          children: [
            ShowcaseMatrix(
              rows: ids.IdsSize.values,
              columns: ids.ItemVariant.values,
              builder: (size, variant) => SizedBox(
                width: 256,
                child: ids.Item(
                  variant: variant,
                  size: size,
                  dense: true,
                  children: [
                    const ids.ItemMedia(
                      variant: ids.ItemVariant.soft,
                      child: Icon(Icons.notifications_outlined),
                    ),
                    ids.ItemContent(
                      children: [
                        ids.ItemTitle(child: Text(variant.name)),
                        ids.ItemDescription(
                          child: Text('size ${size.name} · dense'),
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
          children: [
            ShowcaseRow(
              label: 'icon',
              children: [
                for (final variant in ids.ItemVariant.values)
                  SizedBox(
                    width: 224,
                    child: ids.Item(
                      variant: ids.ItemVariant.outline,
                      children: [
                        ids.ItemMedia(
                          variant: variant,
                          child: const Icon(Icons.inbox_outlined),
                        ),
                        ids.ItemContent(
                          children: [
                            ids.ItemTitle(child: Text('media ${variant.name}')),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            ShowcaseRow(
              label: 'image',
              children: [
                for (final variant in const [
                  ids.ItemVariant.soft,
                  ids.ItemVariant.outline,
                ])
                  SizedBox(
                    width: 224,
                    child: ids.Item(
                      variant: ids.ItemVariant.outline,
                      children: [
                        ids.ItemMedia(variant: variant, child: _photoImage()),
                        ids.ItemContent(
                          children: [
                            ids.ItemTitle(child: Text('image ${variant.name}')),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const ShowcaseRow(
              label: 'avatar group',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Item(
                    variant: ids.ItemVariant.outline,
                    children: [
                      ids.ItemMedia(
                        child: ids.AvatarGroup(
                          size: ids.IdsSize.tiny,
                          max: 3,
                          semanticLabel: '채팅 멤버',
                          children: [
                            ids.Avatar(name: 'Alice Kim'),
                            ids.Avatar(name: 'Bob Lee'),
                            ids.Avatar(name: 'Carol Park'),
                            ids.Avatar(name: '류현승'),
                          ],
                        ),
                      ),
                      ids.ItemContent(
                        children: [
                          ids.ItemTitle(child: Text('디자인 시스템')),
                          ids.ItemDescription(child: Text('토큰 정리 끝났습니다')),
                        ],
                      ),
                      ids.ItemActions(children: [ids.Badge.count(count: 3)]),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'two lines',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Item(
                    variant: ids.ItemVariant.outline,
                    children: [
                      const ids.ItemMedia(
                        variant: ids.ItemVariant.soft,
                        child: Icon(Icons.insert_drive_file_outlined),
                      ),
                      const ids.ItemContent(
                        children: [
                          ids.ItemTitle(child: Text('회의록.md')),
                          ids.ItemDescription(
                            child: Text(
                              '설명이 두 줄을 넘으면 말줄임표로 줄고, 미디어는 첫 줄에 맞춰 위에 붙습니다. 이 '
                              '문장은 일부러 길게 썼습니다.',
                            ),
                          ),
                        ],
                      ),
                      ids.ItemContent(
                        children: [
                          Builder(
                            builder: (context) => Text(
                              '2분 전',
                              style: ids.IdsTypography.captionC1Regular
                                  .copyWith(
                                    color: ids.ThemeProvider.of(
                                      context,
                                    ).onMuted,
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const ShowcaseRow(
              label: 'truncate',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Item(
                    variant: ids.ItemVariant.outline,
                    children: [
                      ids.ItemMedia(
                        variant: ids.ItemVariant.soft,
                        child: Icon(Icons.insert_drive_file_outlined),
                      ),
                      ids.ItemContent(
                        children: [
                          ids.ItemTitle(
                            truncate: true,
                            child: Text('2026 상반기 예산 집행 결과 보고서 (최종 수정본).pdf'),
                          ),
                          ids.ItemDescription(child: Text('2.4 MB')),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'States',
          children: [
            ShowcaseRow(
              label: 'interactive',
              children: [
                SizedBox(
                  width: 224,
                  child: ids.Item(
                    onPressed: () {},
                    children: const [
                      ids.ItemMedia(child: Icon(Icons.settings_outlined)),
                      ids.ItemContent(
                        children: [ids.ItemTitle(child: Text('설정'))],
                      ),
                      ids.ItemActions(children: [StandInKbd('⌘,')]),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'selected',
              children: [
                SizedBox(
                  width: 224,
                  child: ids.Item(
                    selected: true,
                    onPressed: () {},
                    children: const [
                      ids.ItemMedia(child: Icon(Icons.home_outlined)),
                      ids.ItemContent(
                        children: [ids.ItemTitle(child: Text('홈'))],
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  width: 224,
                  child: ids.Item(
                    selected: true,
                    variant: ids.ItemVariant.soft,
                    children: [
                      ids.ItemContent(
                        children: [
                          ids.ItemTitle(child: Text('soft · selected')),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'disabled',
              children: [
                SizedBox(
                  width: 224,
                  child: ids.Item(
                    disabled: true,
                    onPressed: () {},
                    children: const [
                      ids.ItemMedia(child: Icon(Icons.dark_mode_outlined)),
                      ids.ItemContent(
                        children: [ids.ItemTitle(child: Text('다크 모드'))],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'Group',
          children: [
            ShowcaseRow(
              children: [
                SizedBox(
                  width: 320,
                  child: ids.ItemGroup(
                    variant: ids.ItemGroupVariant.ghost,
                    semanticLabel: '설정',
                    children: [
                      ids.Item(
                        children: [
                          ids.ItemMedia(
                            child: Icon(Icons.notifications_outlined),
                          ),
                          ids.ItemContent(
                            children: [
                              ids.ItemTitle(child: Text('알림')),
                              ids.ItemDescription(child: Text('새 메시지 알림 받기')),
                            ],
                          ),
                          ids.ItemActions(
                            children: [
                              StandInSwitch(label: '알림', initial: true),
                            ],
                          ),
                        ],
                      ),
                      ids.ItemSeparator(),
                      ids.Item(
                        children: [
                          ids.ItemMedia(child: Icon(Icons.dark_mode_outlined)),
                          ids.ItemContent(
                            children: [ids.ItemTitle(child: Text('다크 모드'))],
                          ),
                          ids.ItemActions(
                            children: [StandInSwitch(label: '다크 모드')],
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
        ShowcaseSection(
          title: 'Group variant',
          children: [
            for (final variant in ids.ItemGroupVariant.values)
              ShowcaseRow(
                label: variant.name,
                children: [
                  SizedBox(
                    width: 288,
                    child: ids.ItemGroup(
                      variant: variant,
                      size: ids.IdsSize.tiny,
                      semanticLabel: variant.name,
                      children: [
                        for (final file in _files)
                          ids.Item(
                            children: [
                              const ids.ItemMedia(
                                child: Icon(Icons.insert_drive_file_outlined),
                              ),
                              ids.ItemContent(
                                children: [ids.ItemTitle(child: Text(file))],
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
    name: 'Group Variant',
    builder: (context) => SizedBox(
      width: 320,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 24,
        children: [
          ids.ItemGroup(
            variant: ids.ItemGroupVariant.bordered,
            semanticLabel: '멤버',
            children: [
              for (final name in const ['김철수', '이영희', '박민수'])
                ids.Item(
                  children: [
                    ids.ItemMedia(child: ids.Avatar(name: name)),
                    ids.ItemContent(
                      children: [ids.ItemTitle(child: Text(name))],
                    ),
                  ],
                ),
            ],
          ),
          ids.ItemGroup(
            variant: ids.ItemGroupVariant.separated,
            dense: true,
            semanticLabel: '첨부 파일',
            children: [
              for (final file in const ['보고서.pdf', '예산안.xlsx'])
                ids.Item(
                  children: [
                    const ids.ItemMedia(
                      variant: ids.ItemVariant.soft,
                      child: Icon(Icons.insert_drive_file_outlined),
                    ),
                    ids.ItemContent(
                      children: [ids.ItemTitle(child: Text(file))],
                    ),
                    ids.ItemActions(
                      children: [
                        StandInIconButton(
                          icon: const Icon(Icons.close_outlined),
                          label: '$file 지우기',
                          size: ids.IdsSize.tiny,
                        ),
                      ],
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Interactive',
    builder: (context) => const _Interactive(),
  ),
  WidgetbookUseCase(
    name: 'Selectable',
    builder: (context) => const _Selectable(),
  ),
  WidgetbookUseCase(
    name: 'Link Row',
    builder: (context) => SizedBox(
      width: 320,
      child: ids.ItemGroup(
        semanticLabel: '자주 찾는 페이지',
        children: [
          for (final (title, description) in const [
            ('공지', '학사, 장학, 행사 소식'),
            ('셔틀', '오늘 운행 시간표'),
          ])
            ids.Item(
              onPressed: () {},
              children: [
                ids.ItemContent(
                  children: [
                    ids.ItemTitle(child: Text(title)),
                    ids.ItemDescription(child: Text(description)),
                  ],
                ),
                const ids.ItemActions(
                  children: [Icon(Icons.chevron_right_outlined)],
                ),
              ],
            ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Navigation',
    builder: (context) => SizedBox(
      width: 224,
      child: ids.ItemGroup(
        variant: ids.ItemGroupVariant.ghost,
        size: ids.IdsSize.tiny,
        semanticLabel: '메뉴',
        children: [
          ids.Item(
            selected: true,
            onPressed: () {},
            children: const [
              ids.ItemMedia(child: Icon(Icons.home_outlined)),
              ids.ItemContent(children: [ids.ItemTitle(child: Text('홈'))]),
            ],
          ),
          ids.Item(
            onPressed: () {},
            children: const [
              ids.ItemMedia(child: Icon(Icons.inbox_outlined)),
              ids.ItemContent(children: [ids.ItemTitle(child: Text('받은 편지함'))]),
              ids.ItemActions(
                children: [
                  ids.Badge.count(
                    count: 12,
                    size: ids.IdsSize.tiny,
                    variant: ids.BadgeVariant.soft,
                    colorScheme: ids.IdsColorScheme.primary,
                  ),
                ],
              ),
            ],
          ),
          const ids.ItemSeparator(),
          ids.Item(
            onPressed: () {},
            children: const [
              ids.ItemMedia(child: Icon(Icons.settings_outlined)),
              ids.ItemContent(children: [ids.ItemTitle(child: Text('설정'))]),
            ],
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Dense',
    builder: (context) => SizedBox(
      width: 320,
      child: ids.ItemGroup(
        dense: true,
        semanticLabel: '첨부 파일',
        children: [
          for (final (index, file) in _attachments.indexed)
            Padding(
              padding: EdgeInsets.only(top: index == 0 ? 0 : 4),
              child: ids.Item(
                variant: ids.ItemVariant.outline,
                children: [
                  ids.ItemMedia(
                    variant: ids.ItemVariant.soft,
                    child: file.thumbnail
                        ? _photoImage()
                        : const Icon(Icons.insert_drive_file_outlined),
                  ),
                  ids.ItemContent(
                    children: [
                      ids.ItemTitle(truncate: true, child: Text(file.name)),
                      ids.ItemDescription(child: Text(file.size)),
                    ],
                  ),
                  ids.ItemActions(
                    children: [
                      StandInIconButton(
                        icon: const Icon(Icons.close_outlined),
                        label: '${file.name} 삭제',
                        size: ids.IdsSize.tiny,
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
];

class _Interactive extends StatefulWidget {
  const _Interactive();

  @override
  State<_Interactive> createState() => _InteractiveState();
}

class _InteractiveState extends State<_Interactive> {
  var _archived = 0;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 384,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 12,
      children: [
        ids.Item(
          variant: ids.ItemVariant.outline,
          onPressed: () {},
          children: [
            const ids.ItemMedia(child: ids.Avatar(name: 'Alice Kim')),
            const ids.ItemContent(
              children: [
                ids.ItemTitle(child: Text('Alice Kim')),
                ids.ItemDescription(child: Text('오늘 회의 자료 보냈어요')),
              ],
            ),
            ids.ItemActions(
              children: [
                StandInIconButton(
                  icon: const Icon(Icons.inbox_outlined),
                  label: '보관',
                  size: ids.IdsSize.tiny,
                  onPressed: () => setState(() => _archived++),
                ),
              ],
            ),
          ],
        ),
        Semantics(label: '보관 수', child: Text('$_archived')),
      ],
    ),
  );
}

class _Selectable extends StatefulWidget {
  const _Selectable();

  @override
  State<_Selectable> createState() => _SelectableState();
}

class _SelectableState extends State<_Selectable> {
  var _selected = _files.first;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 320,
    child: ids.ItemGroup(
      semanticLabel: '파일',
      children: [
        for (final file in _files)
          ids.Item(
            selected: _selected == file,
            onPressed: () => setState(() => _selected = file),
            children: [
              const ids.ItemMedia(
                child: Icon(Icons.insert_drive_file_outlined),
              ),
              ids.ItemContent(children: [ids.ItemTitle(child: Text(file))]),
            ],
          ),
      ],
    ),
  );
}
