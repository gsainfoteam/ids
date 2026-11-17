import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _variants = [
  ids.IdsVariant.solid,
  ids.IdsVariant.soft,
  ids.IdsVariant.outline,
  ids.IdsVariant.ghost,
];

Widget _spinnerInText(String text, TextStyle style) => DefaultTextStyle.merge(
  style: style,
  child: Row(
    mainAxisSize: MainAxisSize.min,
    children: [const ids.Spinner(), Text(' $text')],
  ),
);

final spinnerUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final size = context.knobs.objectOrNull.dropdown(
        label: 'size',
        options: ids.IdsSize.values,
        labelBuilder: (size) => size.name,
        defaultToNull: true,
      );
      final decorative = context.knobs.boolean(label: 'decorative');
      final label = context.knobs.stringOrNull(
        label: 'aria-label',
        defaultToNull: true,
      );
      return ids.Spinner(
        size: size,
        decorative: decorative,
        semanticLabel: label,
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Size',
          description:
              'size를 주지 않으면 주변 글자 크기를 따릅니다. standard와 tiny는 아이콘 토큰 크기입니다.',
          children: [
            ShowcaseRow(
              label: 'auto',
              children: [
                _spinnerInText('b1', ids.IdsTypography.bodyB1Regular),
                _spinnerInText('b3', ids.IdsTypography.bodyB3Regular),
                _spinnerInText('c1', ids.IdsTypography.captionC1Regular),
              ],
            ),
            const ShowcaseRow(
              label: 'standard',
              children: [ids.Spinner(size: ids.IdsSize.standard)],
            ),
            const ShowcaseRow(
              label: 'tiny',
              children: [ids.Spinner(size: ids.IdsSize.tiny)],
            ),
            ShowcaseRow(
              label: 'className',
              children: [
                IconTheme.merge(
                  data: const IconThemeData(size: 32),
                  child: const ids.Spinner(),
                ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Button × Size',
          description: '컨트롤 안에서는 그 컨트롤의 아이콘 크기가 되고 글자색을 따릅니다.',
          children: [
            ShowcaseMatrix(
              rows: ids.IdsSize.values,
              columns: _variants,
              builder: (size, variant) => StandInButton(
                size: size,
                variant: variant,
                onPressed: null,
                icon: const ids.Spinner(),
                child: const Text('저장 중'),
              ),
            ),
            ShowcaseRow(
              label: 'IconButton',
              children: [
                for (final size in ids.IdsSize.values)
                  StandInIconButton(
                    size: size,
                    disabled: true,
                    icon: const ids.Spinner(),
                    label: '저장 중',
                  ),
              ],
            ),
          ],
        ),
        ShowcaseSection(
          title: 'Color',
          description: '색은 currentColor입니다.',
          children: [
            const ShowcaseRow(
              label: 'on-surface',
              children: [ids.Spinner(size: ids.IdsSize.standard)],
            ),
            ShowcaseRow(
              label: 'primary',
              children: [
                Builder(
                  builder: (context) => IconTheme.merge(
                    data: IconThemeData(
                      color: ids.IdsProvider.of(context).colors.textPrimary,
                    ),
                    child: const ids.Spinner(size: ids.IdsSize.standard),
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'on-muted',
              children: [
                Builder(
                  builder: (context) => IconTheme.merge(
                    data: IconThemeData(
                      color: ids.IdsProvider.of(context).colors.textNeutral,
                    ),
                    child: const ids.Spinner(size: ids.IdsSize.standard),
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
    name: 'Follows Control',
    builder: (context) => Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: [
        const StandInButton(
          onPressed: null,
          icon: ids.Spinner(),
          child: Text('저장 중'),
        ),
        const StandInButton(
          size: ids.IdsSize.tiny,
          onPressed: null,
          icon: ids.Spinner(),
          child: Text('저장 중'),
        ),
        const StandInIconButton(
          size: ids.IdsSize.tiny,
          icon: ids.Spinner(),
          label: '새로고침 중',
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Follows Field',
    builder: (context) => const _FollowsField(),
  ),
  WidgetbookUseCase(
    name: 'Announcement',
    builder: (context) => const _Announcement(),
  ),
  WidgetbookUseCase(
    name: 'Silent Inside Controls',
    builder: (context) => Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: [
        const StandInButton(
          onPressed: null,
          icon: ids.Spinner(),
          child: Text('저장 중'),
        ),
        const StandInIconButton(
          disabled: true,
          icon: ids.Spinner(),
          label: '동기화 중',
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Decorative',
    builder: (context) => const Row(
      mainAxisSize: MainAxisSize.min,
      spacing: 8,
      children: [ids.Spinner(decorative: true), Text('파일을 올리는 중입니다')],
    ),
  ),
];

class _FollowsField extends StatefulWidget {
  const _FollowsField();

  @override
  State<_FollowsField> createState() => _FollowsFieldState();
}

class _FollowsFieldState extends State<_FollowsField> {
  final _controller = TextEditingController(text: 'infoteam');

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ids.Field(
    size: ids.IdsSize.tiny,
    children: [
      const ids.FieldLabel(child: Text('아이디')),
      StandInTextField(controller: _controller),
      const ids.FieldHint(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 4,
          children: [ids.Spinner(), Text('사용할 수 있는지 확인하는 중')],
        ),
      ),
    ],
  );
}

class _Announcement extends StatefulWidget {
  const _Announcement();

  @override
  State<_Announcement> createState() => _AnnouncementState();
}

class _AnnouncementState extends State<_Announcement> {
  bool _loading = false;

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: 16,
    children: [
      StandInButton(
        variant: ids.IdsVariant.outline,
        onPressed: () => setState(() => _loading = !_loading),
        child: Text(_loading ? '멈추기' : '불러오기'),
      ),
      if (_loading)
        IconTheme.merge(
          data: IconThemeData(color: ids.IdsProvider.of(context).colors.textNeutral),
          child: const ids.Spinner(semanticLabel: '댓글을 불러오는 중'),
        )
      else
        const Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [Icon(Icons.check_outlined, size: 16), Text('준비됨')],
        ),
    ],
  );
}
