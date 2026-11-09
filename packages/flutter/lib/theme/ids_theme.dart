import 'package:flutter/widgets.dart';
import '../tokens/ids_enums.dart';
import '../tokens/ids_color_tokens.dart';

class IdsTheme {
  const IdsTheme({required this.color, required this.mode});

  final IdsColor color;
  final IdsMode mode;

  Color resolve(String token) =>
      IdsTokens.resolve(color: color, mode: mode, token: token);

  Color get primary => resolve('primary');
  Color get onPrimary => resolve('on-primary');
  Color get secondary => resolve('secondary');
  Color get onSecondary => resolve('on-secondary');
  Color get accent => resolve('accent');
  Color get outline => resolve('outline');

  Color get success => resolve('success');
  Color get onSuccess => resolve('on-success');
  Color get successStrong => resolve('success-strong');
  Color get warning => resolve('warning');
  Color get onWarning => resolve('on-warning');
  Color get warningStrong => resolve('warning-strong');
  Color get danger => resolve('danger');
  Color get onDanger => resolve('on-danger');
  Color get dangerStrong => resolve('danger-strong');
  Color get info => resolve('info');
  Color get onInfo => resolve('on-info');
  Color get infoStrong => resolve('info-strong');

  Color get surface => resolve('surface');
  Color get onSurface => resolve('on-surface');
  Color get muted => resolve('muted');
  Color get mutedHover => resolve('muted-hover');
  Color get onMuted => resolve('on-muted');
  Color get border => resolve('border');

  bool get isDark => mode == IdsMode.dark;
}
