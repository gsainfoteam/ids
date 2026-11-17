import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

final _photo = PaintedImage('card-photo', const Size(640, 360), (canvas, size) {
  final frame = Offset.zero & size;
  canvas
    ..drawRect(
      frame,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF9CC9FF), Color(0xFFE8F1FF)],
        ).createShader(frame),
    )
    ..drawCircle(
      const Offset(500, 90),
      42,
      Paint()..color = const Color(0xFFFFD66B),
    )
    ..drawPath(
      Path()..addPolygon(const [
        Offset(0, 260),
        Offset(150, 150),
        Offset(260, 230),
        Offset(380, 120),
        Offset(520, 240),
        Offset(640, 170),
        Offset(640, 360),
        Offset(0, 360),
      ], true),
      Paint()..color = const Color(0xFF5A8F6B),
    )
    ..drawPath(
      Path()..addPolygon(const [
        Offset(0, 300),
        Offset(200, 220),
        Offset(360, 290),
        Offset(520, 230),
        Offset(640, 280),
        Offset(640, 360),
        Offset(0, 360),
      ], true),
      Paint()..color = const Color(0xFF3F6F50),
    );
});

final _media = ids.CardMedia(
  child: ids.AspectRatio(
    ratio: 16 / 9,
    child: Image(image: _photo, excludeFromSemantics: true),
  ),
);

Widget _newProject({
  ids.CardVariant variant = ids.CardVariant.outline,
  ids.IdsSize size = ids.IdsSize.standard,
  VoidCallback? onPressed,
  bool disabled = false,
}) => SizedBox(
  width: 320,
  child: ids.Card(
    variant: variant,
    size: size,
    onPressed: onPressed,
    disabled: disabled,
    children: [
      const ids.CardHeader(
        children: [
          ids.CardTitle(child: Text('새 프로젝트 만들기')),
          ids.CardDescription(child: Text('프로젝트 정보를 입력해주세요.')),
        ],
      ),
      const ids.CardContent(child: Text('이름과 설명을 채우면 바로 시작할 수 있습니다.')),
      ids.CardFooter(
        children: [
          const Spacer(),
          StandInButton(
            variant: ids.IdsVariant.ghost,
            onPressed: () {},
            child: const Text('취소'),
          ),
          StandInButton(onPressed: () {}, child: const Text('만들기')),
        ],
      ),
    ],
  ),
);

Widget _photoBook({
  ids.CardVariant variant = ids.CardVariant.outline,
  VoidCallback? onPressed,
  bool disabled = false,
}) => SizedBox(
  width: 256,
  child: ids.Card(
    variant: variant,
    onPressed: onPressed,
    disabled: disabled,
    children: [
      _media,
      const ids.CardHeader(
        children: [
          ids.CardTitle(child: Text('산책로 사진집')),
          ids.CardDescription(child: Text('₩24,000')),
        ],
      ),
      ids.CardFooter(
        children: [
          Expanded(
            child: StandInButton(onPressed: () {}, child: const Text('장바구니')),
          ),
        ],
      ),
    ],
  ),
);

final cardUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final variant = dropdown(context, 'variant', ids.CardVariant.values);
      final size = dropdown(context, 'size', ids.IdsSize.values);
      final interactive = context.knobs.boolean(label: 'interactive');
      final disabled = context.knobs.boolean(label: 'disabled');
      return _newProject(
        variant: variant,
        size: size,
        onPressed: interactive ? () {} : null,
        disabled: disabled,
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
              columns: ids.CardVariant.values,
              builder: (size, variant) => SizedBox(
                width: 224,
                child: ids.Card(
                  variant: variant,
                  size: size,
                  children: [
                    ids.CardHeader(
                      children: [
                        ids.CardTitle(child: Text(variant.name)),
                        ids.CardDescription(child: Text('size ${size.name}')),
                        ids.CardAction(
                          child: const StandInIconButton(
                            icon: Icon(Icons.more_horiz_outlined),
                            label: '더보기',
                            size: ids.IdsSize.tiny,
                          ),
                        ),
                      ],
                    ),
                    const ids.CardContent(child: Text('본문')),
                    ids.CardFooter(
                      children: [
                        StandInButton(
                          size: ids.IdsSize.tiny,
                          onPressed: () {},
                          child: const Text('확인'),
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
              'Card.Media는 가장자리까지 채우고, 닿는 모서리는 카드의 둥근 모서리를 따릅니다. outline의 테두리는 가리지 않습니다.',
          children: [
            ShowcaseRow(
              label: 'first',
              children: [
                _photoBook(),
                _photoBook(variant: ids.CardVariant.soft),
              ],
            ),
            ShowcaseRow(
              label: 'middle · last',
              children: [
                SizedBox(
                  width: 256,
                  child: ids.Card(
                    children: [
                      const ids.CardHeader(
                        children: [
                          ids.CardTitle(child: Text('주말 산책')),
                          ids.CardDescription(child: Text('사진 3장')),
                        ],
                      ),
                      _media,
                      ids.CardFooter(
                        children: [
                          StandInButton(
                            size: ids.IdsSize.tiny,
                            variant: ids.IdsVariant.ghost,
                            onPressed: () {},
                            icon: const Icon(Icons.favorite_border_outlined),
                            child: const Text('좋아요'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 256,
                  child: ids.Card(
                    children: [
                      const ids.CardHeader(
                        children: [ids.CardTitle(child: Text('마지막에 오는 사진'))],
                      ),
                      _media,
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Sections',
          description:
              'Header에 border-b, Footer에 border-t를 주면 카드 너비만큼 구분선이 그어지고 간격이 맞춰집니다.',
          children: [
            ShowcaseRow(
              label: 'dividers',
              children: [
                SizedBox(
                  width: 288,
                  child: ids.Card(
                    children: [
                      const ids.CardHeader(
                        divider: true,
                        children: [
                          ids.CardTitle(child: Text('알림 설정')),
                          ids.CardDescription(child: Text('받을 알림을 고릅니다.')),
                        ],
                      ),
                      const ids.CardContent(child: Text('메일, 푸시, 문자')),
                      ids.CardFooter(
                        divider: true,
                        children: [
                          const Spacer(),
                          StandInButton(
                            size: ids.IdsSize.tiny,
                            onPressed: () {},
                            child: const Text('저장'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const ShowcaseRow(
              label: 'stat',
              children: [
                SizedBox(
                  width: 256,
                  child: ids.Card(
                    children: [
                      ids.CardHeader(
                        children: [
                          ids.CardDescription(child: Text('이번 달 매출')),
                          ids.CardTitle(
                            child: Text(
                              '₩12,345,678',
                              style: ids.IdsTypography.headlineH4Bold,
                            ),
                          ),
                          ids.CardAction(
                            child: StandInChip(
                              size: ids.IdsSize.tiny,
                              child: Text('+12.5%'),
                            ),
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
          title: 'Interactive',
          children: [
            ShowcaseRow(
              label: 'onClick',
              children: [
                _photoBook(onPressed: () {}),
                _photoBook(onPressed: () {}, disabled: true),
              ],
            ),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Anatomy',
    builder: (context) => SizedBox(
      width: 320,
      child: ids.Card(
        children: [
          ids.CardHeader(
            children: [
              const ids.CardTitle(child: Text('팀 초대')),
              const ids.CardDescription(
                child: Text('링크를 가진 사람은 누구나 들어올 수 있습니다.'),
              ),
              ids.CardAction(
                child: StandInButton(
                  size: ids.IdsSize.tiny,
                  variant: ids.IdsVariant.outline,
                  onPressed: () {},
                  child: const Text('링크 복사'),
                ),
              ),
            ],
          ),
          const ids.CardContent(
            child: Row(
              spacing: 8,
              children: [
                ids.Avatar(name: 'Alice Kim', size: ids.IdsSize.tiny),
                Text('Alice Kim 외 3명'),
              ],
            ),
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Media Bleed',
    builder: (context) => Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: [
        _photoBook(),
        _photoBook(variant: ids.CardVariant.soft),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Interactive',
    builder: (context) => const _Interactive(),
  ),
  WidgetbookUseCase(
    name: 'Link Card',
    builder: (context) => SizedBox(
      width: 288,
      child: ids.Card(
        onPressed: () {},
        children: const [
          ids.CardHeader(
            children: [
              ids.CardTitle(child: Text('디자인 리뷰')),
              ids.CardDescription(child: Text('회의록 보기')),
            ],
          ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Disabled',
    builder: (context) => _newProject(onPressed: () {}, disabled: true),
  ),
];

class _Interactive extends StatefulWidget {
  const _Interactive();

  @override
  State<_Interactive> createState() => _InteractiveState();
}

class _InteractiveState extends State<_Interactive> {
  var _liked = 0;

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: 12,
    children: [
      SizedBox(
        width: 288,
        child: ids.Card(
          onPressed: () {},
          children: [
            const ids.CardHeader(
              children: [
                ids.CardTitle(child: Text('디자인 리뷰')),
                ids.CardDescription(child: Text('오늘 오후 3시, 회의실 B')),
              ],
            ),
            ids.CardFooter(
              children: [
                StandInButton(
                  size: ids.IdsSize.tiny,
                  variant: ids.IdsVariant.outline,
                  onPressed: () => setState(() => _liked++),
                  icon: const Icon(Icons.favorite_border_outlined),
                  child: const Text('관심'),
                ),
              ],
            ),
          ],
        ),
      ),
      Semantics(label: '관심 수', child: Text('$_liked')),
    ],
  );
}
