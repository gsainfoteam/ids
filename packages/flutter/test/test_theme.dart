import 'package:flutter/painting.dart';
import 'package:ids_flutter/ids.dart';

const _primary = IdsThemeColor.seed(Color(0xFF155DFC));

const testTheme = IdsTheme(primary: _primary);

const scaledTheme = IdsTheme(primary: _primary, scale: 1.5);

const roundedTheme = IdsTheme(primary: _primary, radius: 14);

const alternateTheme = IdsTheme(primary: IdsThemeColor.seed(Color(0xFF418501)));
