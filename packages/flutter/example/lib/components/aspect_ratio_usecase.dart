import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _ratios = [
  ('1:1', 1.0),
  ('4:3', 4 / 3),
  ('16:9', 16 / 9),
  ('21:9', 21 / 9),
  ('3:4', 3 / 4),
];

final _picture = PaintedImage('aspect-ratio-picture', const Size(600, 200), (
  canvas,
  size,
) {
  final frame = Offset.zero & size;
  canvas
    ..drawRect(
      frame,
      Paint()
        ..shader = const LinearGradient(
          colors: [Color(0xFF2563EB), Color(0xFFFF4500)],
        ).createShader(frame),
    )
    ..drawCircle(
      const Offset(300, 100),
      60,
      Paint()..color = const Color(0xCCFFFFFF),
    );
});

Widget _pictureFitted(BoxFit fit) =>
    Image(image: _picture, fit: fit, semanticLabel: '그라데이션');

final aspectRatioUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final ratio = context.knobs.double.input(
        label: 'ratio',
        initialValue: 16 / 9,
      );
      return SizedBox(
        width: 320,
        child: ids.AspectRatio(
          ratio: math.max(0.1, ratio),
          child: const _Tile('비율을 지키는 영역'),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Ratio',
          description: '폭이 같아도 높이는 비율을 따릅니다.',
          children: [
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final (label, ratio) in _ratios)
                  SizedBox(
                    width: 160,
                    child: ids.AspectRatio(ratio: ratio, child: _Tile(label)),
                  ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Media',
          description:
              'img와 video는 칸을 채우고 넘치는 부분은 잘립니다(cover). 자식에 클래스를 주면 그 클래스가 이깁니다.',
          children: [
            ShowcaseRow(
              label: 'cover (default)',
              children: [
                SizedBox(
                  width: 160,
                  child: _Rounded(
                    child: ids.AspectRatio(child: _pictureFitted(BoxFit.cover)),
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'object-contain',
              children: [
                SizedBox(
                  width: 160,
                  child: _Rounded(
                    muted: true,
                    child: ids.AspectRatio(
                      child: _pictureFitted(BoxFit.contain),
                    ),
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
    name: 'Responsive',
    builder: (context) => const _Responsive(),
  ),
  WidgetbookUseCase(
    name: 'Media Fills',
    builder: (context) => SizedBox(
      width: 240,
      child: _Rounded(
        child: ids.AspectRatio(child: _pictureFitted(BoxFit.cover)),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Intrinsic Content',
    builder: (context) => const SizedBox(
      width: 240,
      child: _Rounded(
        muted: true,
        child: ids.AspectRatio(
          child: OverflowBox(
            alignment: Alignment.topCenter,
            minHeight: 384,
            maxHeight: 384,
            child: Padding(
              padding: EdgeInsets.all(12),
              child: Align(
                alignment: AlignmentDirectional.topStart,
                child: Text(
                  '콘텐츠가 커도 바깥 정사각형 비율은 그대로입니다.',
                  style: ids.IdsTypography.bodyB3Regular,
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
];

class _Tile extends StatelessWidget {
  const _Tile(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = ids.IdsProvider.of(context).colors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.bgPrimarySoft,
        borderRadius: BorderRadius.circular(
          ids.IdsProvider.of(context).radius.standard,
        ),
      ),
      child: Center(
        child: Text(
          label,
          style: ids.IdsTypography.bodyB3Medium.copyWith(
            color: theme.textOnPrimarySoft,
          ),
        ),
      ),
    );
  }
}

class _Rounded extends StatelessWidget {
  const _Rounded({this.muted = false, required this.child});

  final bool muted;
  final Widget child;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: BorderRadius.circular(
      ids.IdsProvider.of(context).radius.standard,
    ),
    child: muted
        ? ColoredBox(
            color: ids.IdsProvider.of(context).colors.bgNeutralSoft,
            child: child,
          )
        : child,
  );
}

class _Responsive extends StatefulWidget {
  const _Responsive();

  @override
  State<_Responsive> createState() => _ResponsiveState();
}

class _ResponsiveState extends State<_Responsive> {
  var _compact = false;

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: 16,
    children: [
      StandInButton(
        variant: ids.IdsVariant.outline,
        onPressed: () => setState(() => _compact = !_compact),
        child: const Text('폭 바꾸기'),
      ),
      SizedBox(
        width: _compact ? 160 : 320,
        child: const ids.AspectRatio(ratio: 16 / 9, child: _Tile('16:9')),
      ),
    ],
  );
}
