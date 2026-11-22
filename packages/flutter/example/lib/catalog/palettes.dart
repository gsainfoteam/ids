import 'package:flutter/painting.dart';
import 'package:ids_flutter/ids.dart';

const paletteSeeds = <String, IdsThemeColor>{
  'red': IdsThemeColor.seed(Color(0xFFFB2C36)),
  'orange': IdsThemeColor.seed(Color(0xFFFF5722)),
  'amber': IdsThemeColor.seed(Color(0xFFFE9A00)),
  'yellow': IdsThemeColor.seed(Color(0xFFF0B100)),
  'lime': IdsThemeColor.seed(Color(0xFF7CCF00)),
  'green': IdsThemeColor.seed(Color(0xFF22C53E)),
  'emerald': IdsThemeColor.seed(Color(0xFF00BC7D)),
  'teal': IdsThemeColor.seed(Color(0xFF00BBA7)),
  'cyan': IdsThemeColor.seed(Color(0xFF00B8DB)),
  'sky': IdsThemeColor.seed(Color(0xFF00A6F4)),
  'blue': blue,
  'indigo': IdsThemeColor.seed(Color(0xFF615FFF)),
  'violet': IdsThemeColor.seed(Color(0xFF8E51FF)),
  'purple': purple,
  'fuchsia': IdsThemeColor.seed(Color(0xFFE12AFB)),
  'pink': IdsThemeColor.seed(Color(0xFFF6339A)),
  'rose': IdsThemeColor.seed(Color(0xFFFF2056)),
};

const blue = IdsThemeColor.seed(Color(0xFF2B7FFF));

const purple = IdsThemeColor.seed(Color(0xFFAD46FF));

const appTheme = IdsTheme(primary: blue);
