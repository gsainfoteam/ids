import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
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
                              placeholder:
                                  context.strings.demo.textFieldSample.name,
                            ),
                          ),
                      ],
                    ),
                  const Text('States and interaction'),
                  IdsField(
                    required: true,
                    children: [
                      IdsFieldLabel(
                        child: Text(
                          context.strings.demo.textFieldSample.search,
                        ),
                      ),
                      IdsTextField(
                        defaultValue:
                            context.strings.demo.textFieldSample.infoteamText,
                        clearable: true,
                        placeholder: context
                            .strings
                            .demo
                            .textFieldSample
                            .enterASearchTerm,
                        leading: Icon(Icons.search),
                      ),
                    ],
                  ),
                  IdsField(
                    size: IdsSize.tiny,
                    invalid: true,
                    children: [
                      IdsFieldLabel(
                        child: Text(context.strings.demo.textFieldSample.email),
                      ),
                      IdsTextField(
                        variant: IdsVariant.soft,
                        defaultValue: 'info',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      IdsFieldError(
                        child: Text(
                          context
                              .strings
                              .demo
                              .textFieldSample
                              .checkYourEmailAddress,
                        ),
                      ),
                    ],
                  ),
                  IdsTextField(
                    disabled: true,
                    semanticLabel: context.strings.demo.textFieldSample.site,
                    variant: IdsVariant.ghost,
                    placeholder: context
                        .strings
                        .demo
                        .textFieldSample
                        .thisFieldIsDisabled,
                  ),
                  IdsTextField(
                    semanticLabel:
                        context.strings.demo.textFieldSample.readOnly,
                    defaultValue: context.strings.demo.textFieldSample.readOnly,
                    readOnly: true,
                  ),
                  IdsButton(
                    onPressed: () => Form.of(context).reset(),
                    variant: IdsVariant.outline,
                    child: Text(context.strings.demo.textFieldSample.reset),
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
                  placeholder: context.strings.demo.textFieldSample.name,
                ),
              ),
          ]),
        const Text('States'),
        galleryRow('empty', [
          _field(
            IdsTextField(
              placeholder: context.strings.demo.textFieldSample.name,
              semanticLabel: context.strings.demo.textFieldSample.empty,
            ),
          ),
        ]),
        galleryRow('filled', [
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteamText,
              semanticLabel: context.strings.demo.textFieldSample.filled,
            ),
          ),
        ]),
        galleryRow('invalid', [
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteam,
              invalid: true,
              semanticLabel: context.strings.demo.textFieldSample.invalid,
            ),
          ),
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteam,
              invalid: true,
              variant: IdsVariant.soft,
              semanticLabel: context.strings.demo.textFieldSample.invalidSoft,
            ),
          ),
        ]),
        galleryRow('disabled', [
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteamText,
              disabled: true,
              semanticLabel: context.strings.demo.textFieldSample.disabled,
            ),
          ),
        ]),
        galleryRow('readOnly', [
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteamText,
              readOnly: true,
              semanticLabel: context.strings.demo.textFieldSample.readOnly,
            ),
          ),
        ]),
        const Text('Composition'),
        galleryRow('leading icon', [
          _field(
            IdsTextField(
              placeholder: context.strings.demo.textFieldSample.search,
              semanticLabel: context.strings.demo.textFieldSample.search,
              leading: Icon(Icons.search),
            ),
            width: 288,
          ),
          _field(
            IdsTextField(
              placeholder: context.strings.demo.textFieldSample.search,
              semanticLabel: context.strings.demo.textFieldSample.tinySearch,
              size: IdsSize.tiny,
              leading: Icon(Icons.search),
            ),
          ),
        ]),
        galleryRow('Clear', [
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteamText,
              semanticLabel: context.strings.demo.textFieldSample.clearExample,
              clearable: true,
              leading: Icon(Icons.search),
            ),
            width: 288,
          ),
          _field(
            IdsTextField(
              defaultValue: context.strings.demo.textFieldSample.infoteamText,
              semanticLabel: context.strings.demo.textFieldSample.tinyClear,
              size: IdsSize.tiny,
              clearable: true,
            ),
          ),
        ]),
        galleryRow('prefix · suffix', [
          _field(
            IdsTextField(
              defaultValue: 'gistory',
              semanticLabel: context.strings.demo.textFieldSample.address,
              leading: Text('https://'),
              trailing: Text('.me'),
            ),
            width: 288,
          ),
          _field(
            IdsTextField(
              placeholder: context.strings.demo.textFieldSample.userID,
              semanticLabel: context.strings.demo.textFieldSample.userID,
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
              semanticLabel: context.strings.demo.textFieldSample.shareLink,
              trailing: SizedBox.square(
                dimension: 28,
                child: IdsIconButton(
                  icon: Icon(_copied ? Icons.check : Icons.copy),
                  semanticLabel: _copied
                      ? context.strings.demo.textFieldSample.copied
                      : context.strings.demo.textFieldSample.copy,
                  onPressed: _copy,
                ),
              ),
            ),
            width: 288,
          ),
          _field(
            IdsTextField(
              placeholder: context.strings.demo.textFieldSample.bookmarkName,
              semanticLabel: context.strings.demo.textFieldSample.bookmark,
              trailing: SizedBox.square(
                dimension: 28,
                child: IdsIconButton(
                  icon: Icon(_favorite ? Icons.star : Icons.star_border),
                  semanticLabel: _favorite
                      ? context.strings.demo.textFieldSample.removeFromFavorites
                      : context.strings.demo.textFieldSample.favorite,
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
              placeholder: context.strings.demo.textFieldSample.searchTerm,
              semanticLabel: context.strings.demo.textFieldSample.searchRange,
              trailing: IdsButton(
                variant: IdsVariant.ghost,
                size: IdsSize.tiny,
                trailing: const Icon(Icons.expand_more),
                onPressed: () {},
                child: Text(context.strings.demo.textFieldSample.all),
              ),
            ),
            width: 288,
          ),
        ]),
        galleryRow('shortcut', [
          _field(
            IdsTextField(
              placeholder: context.strings.demo.textFieldSample.quickSearch,
              semanticLabel: context.strings.demo.textFieldSample.quickSearch,
              leading: Icon(Icons.search),
              trailing: IdsKbd(child: '⌘K'),
            ),
            width: 288,
          ),
        ]),
        galleryRow('email', [
          _field(
            IdsTextField(
              placeholder: 'name@example.com',
              semanticLabel: context.strings.demo.textFieldSample.email,
              keyboardType: TextInputType.emailAddress,
              leading: Icon(Icons.mail_outline),
            ),
            width: 288,
          ),
          _field(
            IdsTextField(
              placeholder: 'username',
              semanticLabel: context.strings.demo.textFieldSample.username,
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
