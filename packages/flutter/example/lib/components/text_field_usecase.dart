import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final textFieldUseCases = [
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(context, const _Gallery(), width: 850),
  ),
  WidgetbookUseCase(
    name: 'Field integration',
    builder: (context) => themed(
      context,
      Builder(
        builder: (context) => Form(
          child: Builder(
            builder: (context) => SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: 16,
                children: [
                  const Text('Variant × Size'),
                  const Row(
                    spacing: 12,
                    children: [
                      SizedBox(width: 70),
                      Expanded(child: Text('outline')),
                      Expanded(child: Text('soft')),
                      Expanded(child: Text('ghost')),
                    ],
                  ),
                  for (final size in IdsSize.values)
                    Row(
                      spacing: 12,
                      children: [
                        SizedBox(width: 70, child: Text(size.name)),
                        for (final variant in [
                          IdsVariant.outline,
                          IdsVariant.soft,
                          IdsVariant.ghost,
                        ])
                          Expanded(
                            child: IdsTextField(
                              size: size,
                              variant: variant,
                              semanticLabel: '${variant.name} ${size.name}',
                              placeholder: '이름',
                            ),
                          ),
                      ],
                    ),
                  const Text('States and interaction'),
                  const IdsField(
                    required: true,
                    children: [
                      IdsFieldLabel(child: Text('검색')),
                      IdsTextField(
                        defaultValue: '인포팀',
                        clearable: true,
                        placeholder: '검색어를 입력하세요',
                        leading: Icon(Icons.search),
                      ),
                    ],
                  ),
                  const IdsField(
                    size: IdsSize.tiny,
                    invalid: true,
                    children: [
                      IdsFieldLabel(child: Text('이메일')),
                      IdsTextField(
                        variant: IdsVariant.soft,
                        defaultValue: 'info',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      IdsFieldError(child: Text('이메일 주소를 확인해 주세요.')),
                    ],
                  ),
                  const IdsTextField(
                    disabled: true,
                    semanticLabel: '사이트',
                    variant: IdsVariant.ghost,
                    placeholder: '이 필드는 비활성화되어 있습니다.',
                  ),
                  const IdsTextField(
                    semanticLabel: '읽기 전용',
                    defaultValue: '읽기 전용',
                    readOnly: true,
                  ),
                  IdsButton(
                    onPressed: () => Form.of(context).reset(),
                    variant: IdsVariant.outline,
                    child: const Text('초기화'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      width: 680,
    ),
  ),
];

const _variants = [IdsVariant.outline, IdsVariant.soft, IdsVariant.ghost];

class _Gallery extends StatefulWidget {
  const _Gallery();

  @override
  State<_Gallery> createState() => _GalleryState();
}

class _GalleryState extends State<_Gallery> {
  static const _shareUrl = 'https://gistory.me/ids';
  bool _copied = false;
  bool _favorite = false;
  Timer? _copyTimer;

  Future<void> _copy() async {
    await Clipboard.setData(const ClipboardData(text: _shareUrl));
    if (!mounted) return;
    _copyTimer?.cancel();
    setState(() => _copied = true);
    _copyTimer = Timer(
      const Duration(milliseconds: 1500),
      () => setState(() => _copied = false),
    );
  }

  @override
  void dispose() {
    _copyTimer?.cancel();
    super.dispose();
  }

  Widget _field(IdsTextField child, {double width = 224}) =>
      SizedBox(width: width, child: child);

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 14,
      children: [
        const Text('Variant × Size'),
        galleryRow('', [
          for (final variant in _variants)
            SizedBox(width: 224, child: Text(variant.name)),
        ]),
        for (final size in IdsSize.values)
          galleryRow(size.name, [
            for (final variant in _variants)
              _field(
                IdsTextField(
                  size: size,
                  variant: variant,
                  semanticLabel: '${variant.name} ${size.name}',
                  placeholder: '이름',
                ),
              ),
          ]),
        const Text('States'),
        galleryRow('empty', [
          _field(const IdsTextField(placeholder: '이름', semanticLabel: '비어 있음')),
        ]),
        galleryRow('filled', [
          _field(const IdsTextField(defaultValue: '인포팀', semanticLabel: '채움')),
        ]),
        galleryRow('invalid', [
          _field(
            const IdsTextField(
              defaultValue: '인포팀!',
              invalid: true,
              semanticLabel: '잘못됨',
            ),
          ),
          _field(
            const IdsTextField(
              defaultValue: '인포팀!',
              invalid: true,
              variant: IdsVariant.soft,
              semanticLabel: '잘못됨 soft',
            ),
          ),
        ]),
        galleryRow('disabled', [
          _field(
            const IdsTextField(
              defaultValue: '인포팀',
              disabled: true,
              semanticLabel: '비활성',
            ),
          ),
        ]),
        galleryRow('readOnly', [
          _field(
            const IdsTextField(
              defaultValue: '인포팀',
              readOnly: true,
              semanticLabel: '읽기 전용',
            ),
          ),
        ]),
        const Text('Composition'),
        galleryRow('leading icon', [
          _field(
            const IdsTextField(
              placeholder: '검색',
              semanticLabel: '검색',
              leading: Icon(Icons.search),
            ),
            width: 288,
          ),
          _field(
            const IdsTextField(
              placeholder: '검색',
              semanticLabel: '검색 tiny',
              size: IdsSize.tiny,
              leading: Icon(Icons.search),
            ),
          ),
        ]),
        galleryRow('Clear', [
          _field(
            const IdsTextField(
              defaultValue: '인포팀',
              semanticLabel: '지우기 예시',
              clearable: true,
              leading: Icon(Icons.search),
            ),
            width: 288,
          ),
          _field(
            const IdsTextField(
              defaultValue: '인포팀',
              semanticLabel: '지우기 tiny',
              size: IdsSize.tiny,
              clearable: true,
            ),
          ),
        ]),
        galleryRow('prefix · suffix', [
          _field(
            const IdsTextField(
              defaultValue: 'gistory',
              semanticLabel: '주소',
              leading: Text('https://'),
              trailing: Text('.me'),
            ),
            width: 288,
          ),
          _field(
            const IdsTextField(
              placeholder: '아이디',
              semanticLabel: '아이디',
              trailing: Text('@gm.gist.ac.kr'),
            ),
            width: 288,
          ),
        ]),
        galleryRow('buttons', [
          _field(
            IdsTextField(
              defaultValue: _shareUrl,
              readOnly: true,
              semanticLabel: '공유 링크',
              trailing: SizedBox.square(
                dimension: 28,
                child: IdsIconButton(
                  icon: Icon(_copied ? Icons.check : Icons.copy),
                  semanticLabel: _copied ? '복사됨' : '복사',
                  onPressed: _copy,
                ),
              ),
            ),
            width: 288,
          ),
          _field(
            IdsTextField(
              placeholder: '북마크 이름',
              semanticLabel: '북마크',
              trailing: SizedBox.square(
                dimension: 28,
                child: IdsIconButton(
                  icon: Icon(_favorite ? Icons.star : Icons.star_border),
                  semanticLabel: _favorite ? '즐겨찾기 해제' : '즐겨찾기',
                  onPressed: () => setState(() => _favorite = !_favorite),
                ),
              ),
            ),
            width: 288,
          ),
        ]),
        galleryRow('text button', [
          _field(
            IdsTextField(
              placeholder: '검색어',
              semanticLabel: '범위 검색',
              trailing: IdsButton(
                variant: IdsVariant.ghost,
                size: IdsSize.tiny,
                trailing: const Icon(Icons.expand_more),
                onPressed: () {},
                child: const Text('전체'),
              ),
            ),
            width: 288,
          ),
        ]),
        galleryRow('shortcut', [
          _field(
            const IdsTextField(
              placeholder: '빠른 검색',
              semanticLabel: '빠른 검색',
              leading: Icon(Icons.search),
              trailing: IdsKbd(child: '⌘K'),
            ),
            width: 288,
          ),
        ]),
        galleryRow('email', [
          _field(
            const IdsTextField(
              placeholder: 'name@example.com',
              semanticLabel: '이메일',
              keyboardType: TextInputType.emailAddress,
              leading: Icon(Icons.mail_outline),
            ),
            width: 288,
          ),
          _field(
            const IdsTextField(
              placeholder: 'username',
              semanticLabel: '사용자 이름',
              variant: IdsVariant.soft,
              leading: Icon(Icons.alternate_email),
            ),
            width: 288,
          ),
        ]),
      ],
    ),
  );
}
