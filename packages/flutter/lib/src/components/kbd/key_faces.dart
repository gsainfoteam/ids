import 'package:flutter/material.dart';

import '../../../messages/ids_messages.dart';

typedef KbdFace = ({List<String> parts, String label});

bool isMacKbd(TargetPlatform platform) =>
    platform == TargetPlatform.macOS || platform == TargetPlatform.iOS;

IconData? _iconData(String glyph) => const {
  '⌘': Icons.keyboard_command_key,
  '⌃': Icons.keyboard_control_key,
  '⌥': Icons.keyboard_option_key,
  '↩': Icons.keyboard_return,
  '⏎': Icons.keyboard_return,
  '↵': Icons.keyboard_return,
  '⌫': Icons.backspace_outlined,
  '⌦': Icons.backspace_outlined,
  '␣': Icons.space_bar,
  '⇥': Icons.keyboard_tab,
  '⇪': Icons.keyboard_capslock,
  '↑': Icons.arrow_upward,
  '↓': Icons.arrow_downward,
  '←': Icons.arrow_back,
  '→': Icons.arrow_forward,
  '↖': Icons.north_west,
  '↘': Icons.south_east,
}[glyph];

Widget? kbdIcon(String glyph, {required double size, required Color color}) {
  if (glyph == '⇧') {
    return CustomPaint(size: Size.square(size), painter: _ShiftPainter(color));
  }
  final data = _iconData(glyph);
  if (data == null) return null;
  final icon = Icon(data, size: size, color: color);
  return glyph == '⌦' ? Transform.flip(flipX: true, child: icon) : icon;
}

class _ShiftPainter extends CustomPainter {
  const _ShiftPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 12);
    final outline = Path()
      ..moveTo(6, 1.4)
      ..lineTo(11, 6.6)
      ..lineTo(8, 6.6)
      ..lineTo(8, 10.6)
      ..lineTo(4, 10.6)
      ..lineTo(4, 6.6)
      ..lineTo(1, 6.6)
      ..close();
    canvas.drawPath(
      outline,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.1
        ..strokeJoin = StrokeJoin.round,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(_ShiftPainter oldDelegate) => color != oldDelegate.color;
}

const _aliases = {
  'ctrl': 'control',
  'cmd': 'meta',
  'command': 'meta',
  'win': 'meta',
  'windows': 'meta',
  'super': 'meta',
  'option': 'alt',
  'esc': 'escape',
  'return': 'enter',
  'del': 'delete',
  'spacebar': 'space',
  'up': 'arrowup',
  'down': 'arrowdown',
  'left': 'arrowleft',
  'right': 'arrowright',
};

({String glyph, String key})? _key(String name, TargetPlatform platform) {
  final mac = isMacKbd(platform);
  final match = switch (name) {
    'meta' when mac => ('⌘', 'command'),
    'meta' when platform == TargetPlatform.windows => ('Win', 'windows'),
    'meta' => ('Super', 'super'),
    'control' => (mac ? '⌃' : 'Ctrl', 'control'),
    'alt' => mac ? ('⌥', 'option') : ('Alt', 'alt'),
    'shift' => (mac ? '⇧' : 'Shift', 'shift'),
    'enter' => mac ? ('↩', 'return') : ('Enter', 'enter'),
    'backspace' => mac ? ('⌫', 'macDelete') : ('Backspace', 'backspace'),
    'delete' => mac ? ('⌦', 'forwardDelete') : ('Del', 'delete'),
    'escape' => ('Esc', 'escape'),
    'space' => ('Space', 'space'),
    'tab' => (mac ? '⇥' : 'Tab', 'tab'),
    'capslock' => (mac ? '⇪' : 'Caps Lock', 'capsLock'),
    'arrowup' => ('↑', 'up'),
    'arrowdown' => ('↓', 'down'),
    'arrowleft' => ('←', 'left'),
    'arrowright' => ('→', 'right'),
    'pageup' => (mac ? '⇞' : 'PgUp', 'pageUp'),
    'pagedown' => (mac ? '⇟' : 'PgDn', 'pageDown'),
    'home' => (mac ? '↖' : 'Home', 'home'),
    'end' => (mac ? '↘' : 'End', 'end'),
    'fn' => ('fn', 'fn'),
    _ => null,
  };
  return match == null ? null : (glyph: match.$1, key: match.$2);
}

String _label(
  String key,
  IdsMessages? translation,
  Map<String, String> labels,
) {
  String? message(IdsMessages t) => switch (key) {
    'alt' => t.kbdAlt,
    'backspace' => t.kbdBackspace,
    'capsLock' => t.kbdCapsLock,
    'command' => t.kbdCommand,
    'control' => t.kbdControl,
    'delete' => t.kbdDelete,
    'down' => t.kbdDown,
    'end' => t.kbdEnd,
    'enter' => t.kbdEnter,
    'escape' => t.kbdEscape,
    'fn' => t.kbdFn,
    'forwardDelete' => t.kbdForwardDelete,
    'home' => t.kbdHome,
    'left' => t.kbdLeft,
    'macDelete' => t.kbdMacDelete,
    'option' => t.kbdOption,
    'pageDown' => t.kbdPageDown,
    'pageUp' => t.kbdPageUp,
    'return' => t.kbdReturn,
    'right' => t.kbdRight,
    'shift' => t.kbdShift,
    'space' => t.kbdSpace,
    'super' => t.kbdSuper,
    'tab' => t.kbdTab,
    'up' => t.kbdUp,
    'windows' => t.kbdWindows,
    _ => null,
  };
  return labels[key] ??
      message(translation ?? IdsMessages.ko) ??
      message(IdsMessages.ko) ??
      key;
}

List<KbdFace> kbdKeys(
  String keys,
  TargetPlatform platform,
  IdsMessages? translation,
  Map<String, String> labels,
) {
  final mac = isMacKbd(platform);
  final order = mac
      ? const ['control', 'alt', 'shift', 'meta']
      : const ['meta', 'control', 'alt', 'shift'];
  final names = <String>{};
  final other = <String>[];
  final usesPlusKey = keys.trimRight().endsWith('+');
  for (final part
      in keys
          .split('+')
          .map((part) => part.trim())
          .where((part) => part.isNotEmpty)) {
    final lower = part.toLowerCase();
    final name = lower == 'mod'
        ? (mac ? 'meta' : 'control')
        : _aliases[lower] ?? lower;
    if (order.contains(name)) {
      names.add(name);
    } else {
      other.add(part);
    }
  }
  if (usesPlusKey) other.add('+');
  return [
    for (final part in [...order.where(names.contains), ...other])
      _face(part, platform, translation, labels),
  ];
}

KbdFace _face(
  String part,
  TargetPlatform platform,
  IdsMessages? translation,
  Map<String, String> labels,
) {
  final lower = part.toLowerCase();
  final face = _key(_aliases[lower] ?? lower, platform);
  if (face != null) {
    return (parts: [face.glyph], label: _label(face.key, translation, labels));
  }
  final glyph =
      RegExp(r'^(?:Key|Digit)([A-Z0-9])$').firstMatch(part)?.group(1) ??
      (part.length == 1 ? part.toUpperCase() : part);
  return (parts: [glyph], label: glyph);
}

KbdFace kbdText(
  String text,
  TargetPlatform platform,
  IdsMessages? translation,
  Map<String, String> labels,
) {
  final parts = <String>[];
  final spoken = <String>[];
  var plain = StringBuffer();
  for (final rune in text.runes) {
    final glyph = String.fromCharCode(rune);
    final key = switch (glyph) {
      '⌘' => 'command',
      '⌃' => 'control',
      '⌥' => 'option',
      '⇧' => 'shift',
      '↩' || '⏎' => 'return',
      '↵' => 'enter',
      '⌫' => isMacKbd(platform) ? 'macDelete' : 'backspace',
      '⌦' => 'forwardDelete',
      '⎋' => 'escape',
      '⇥' => 'tab',
      '⇪' => 'capsLock',
      '␣' => 'space',
      '↑' => 'up',
      '↓' => 'down',
      '←' => 'left',
      '→' => 'right',
      '⇞' => 'pageUp',
      '⇟' => 'pageDown',
      '↖' => 'home',
      '↘' => 'end',
      _ => null,
    };
    if (key == null) {
      plain.write(glyph);
      continue;
    }
    if (plain.isNotEmpty) {
      parts.add(plain.toString());
      spoken.add(plain.toString());
      plain = StringBuffer();
    }
    parts.add(glyph);
    spoken.add(_label(key, translation, labels));
  }
  if (plain.isNotEmpty) {
    parts.add(plain.toString());
    spoken.add(plain.toString());
  }
  return (parts: parts, label: spoken.join(' '));
}
