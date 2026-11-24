import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

const _shortcuts = [
  'Mod+K',
  'Mod+Shift+P',
  'Alt+Enter',
  'Control+Alt+Delete',
  'Meta+E',
];

const _platforms = [
  ('mac', TargetPlatform.macOS),
  ('windows', TargetPlatform.windows),
  ('linux', TargetPlatform.linux),
];

final kbdUseCases = [
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 16,
          children: [
            const Text('Platform × Shortcut'),
            Table(
              defaultVerticalAlignment: TableCellVerticalAlignment.middle,
              children: [
                TableRow(
                  children: [
                    const SizedBox.shrink(),
                    for (final shortcut in _shortcuts) Text(shortcut),
                  ],
                ),
                for (final (label, platform) in _platforms)
                  TableRow(
                    children: [
                      Text(label),
                      for (final shortcut in _shortcuts)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: IdsKbd(keys: shortcut, platform: platform),
                        ),
                    ],
                  ),
              ],
            ),
            const Text('Size'),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                IdsKbd(child: 'K', size: size),
                IdsKbd(
                  keys: 'Enter',
                  platform: TargetPlatform.macOS,
                  size: size,
                ),
                IdsKbd(keys: 'Escape', size: size),
                IdsKbd(
                  keys: 'Mod+K',
                  platform: TargetPlatform.macOS,
                  size: size,
                ),
                IdsKbd(
                  keys: 'Mod+K',
                  platform: TargetPlatform.windows,
                  size: size,
                ),
              ]),
            const Text('Surface'),
            galleryRow('text', [
              Text(context.strings.demo.kbdSample.toOpenSearch),
              IdsKbd(keys: 'Mod+K', platform: TargetPlatform.macOS),
              Text(context.strings.demo.kbdSample.pressThisKey),
            ]),
            galleryRow('button', [
              IdsButton(
                onPressed: () {},
                trailing: const IdsKbd(
                  keys: 'Mod+S',
                  platform: TargetPlatform.macOS,
                ),
                child: Text(context.strings.demo.kbdSample.save),
              ),
              IdsButton(
                onPressed: () {},
                variant: IdsVariant.outline,
                trailing: const IdsKbd(
                  keys: 'Mod+K',
                  platform: TargetPlatform.windows,
                ),
                child: Text(context.strings.demo.kbdSample.search),
              ),
              IdsButton(
                onPressed: () {},
                size: IdsSize.tiny,
                variant: IdsVariant.soft,
                trailing: const IdsKbd(
                  keys: 'Enter',
                  platform: TargetPlatform.macOS,
                  size: IdsSize.tiny,
                ),
                child: Text(context.strings.demo.kbdSample.send),
              ),
            ]),
            galleryRow('glyph text', const [
              IdsKbd(child: '⌘K'),
              IdsKbd(child: '⇧⌘P'),
              IdsKbd(child: 'Ctrl+C'),
            ]),
          ],
        ),
      ),
      width: 920,
    ),
  ),
];
