import 'package:flutter/painting.dart';

import '../../theme/ids_resolved_theme.dart';

Color outlineControlBackground(IdsResolvedTheme theme) =>
    theme.componentColors.bgControlOutline;

const controlShadowXs = [
  BoxShadow(color: Color(0x0d000000), offset: Offset(0, 1), blurRadius: 2),
];

const controlShadowSm = [
  BoxShadow(color: Color(0x1a000000), offset: Offset(0, 1), blurRadius: 3),
  BoxShadow(
    color: Color(0x1a000000),
    offset: Offset(0, 1),
    blurRadius: 2,
    spreadRadius: -1,
  ),
];

const controlShadowLg = [
  BoxShadow(
    color: Color(0x1a000000),
    offset: Offset(0, 10),
    blurRadius: 15,
    spreadRadius: -3,
  ),
  BoxShadow(
    color: Color(0x1a000000),
    offset: Offset(0, 4),
    blurRadius: 6,
    spreadRadius: -4,
  ),
];

const controlShadowXl = [
  BoxShadow(
    color: Color(0x1a000000),
    offset: Offset(0, 20),
    blurRadius: 25,
    spreadRadius: -5,
  ),
  BoxShadow(
    color: Color(0x1a000000),
    offset: Offset(0, 8),
    blurRadius: 10,
    spreadRadius: -6,
  ),
];
