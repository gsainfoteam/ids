import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../../../messages/ids_messages.dart';
import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';

class IdsSpinner extends StatefulWidget {
  const IdsSpinner({
    super.key,
    this.size,
    this.semanticLabel,
    this.decorative = false,
  });

  final IdsSize? size;
  final String? semanticLabel;
  final bool decorative;

  @override
  State<IdsSpinner> createState() => _IdsSpinnerState();
}

class _IdsSpinnerState extends State<IdsSpinner>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  static const _sizes = {IdsSize.standard: 16.0, IdsSize.tiny: 14.0};
  static const _turn = Duration(seconds: 1);
  static const _announceDelay = Duration(milliseconds: 100);

  late final _controller = AnimationController(vsync: this, duration: _turn);
  late final Timer _announceTimer;
  bool _announced = false;
  bool? _reducedMotion;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _announceTimer = Timer(
      _announceDelay,
      () => setState(() => _announced = true),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();
  }

  @override
  void didChangeAccessibilityFeatures() => _syncMotion();

  void _syncMotion() {
    final reduced =
        (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ||
        View.of(context).platformDispatcher.accessibilityFeatures.reduceMotion;
    if (reduced == _reducedMotion) return;
    setState(() {
      _reducedMotion = reduced;
      _controller.repeat(reverse: reduced);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _announceTimer.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final icon = IconTheme.of(context);
    final scope = IdsProvider.maybeOf(context);
    final t = scope?.translation;
    final ko = IdsMessages.ko;
    final inheritedIcon = context
        .dependOnInheritedWidgetOfExactType<IconTheme>();
    final color =
        inheritedIcon?.data.color ?? scope?.theme.onSurface ?? icon.color!;
    final size = _sizes[widget.size] ?? icon.size!;
    final arc = CustomPaint(
      size: Size.square(scope?.theme.dimension(size) ?? size),
      painter: _ArcPainter(
        color.withValues(alpha: color.a * (icon.opacity ?? 1)),
      ),
    );
    final spinning = _reducedMotion!
        ? FadeTransition(
            opacity: _controller.drive(
              Tween(
                begin: 1.0,
                end: 0.5,
              ).chain(CurveTween(curve: const Cubic(0.4, 0, 0.6, 1))),
            ),
            child: arc,
          )
        : RotationTransition(turns: _controller, child: arc);

    if (widget.decorative) return spinning;
    return Semantics(
      liveRegion: true,
      label: _announced
          ? widget.semanticLabel ?? t?.spinnerLabel ?? ko.spinnerLabel
          : null,
      child: spinning,
    );
  }
}

class _ArcPainter extends CustomPainter {
  const _ArcPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final unit = size.width / 24;
    final circle = Rect.fromCircle(
      center: size.center(Offset.zero),
      radius: 9 * unit,
    );
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3 * unit;

    canvas.drawOval(
      circle,
      stroke..color = color.withValues(alpha: color.a * 0.2),
    );
    canvas.drawArc(
      circle,
      -math.pi / 2,
      math.pi / 2,
      false,
      stroke
        ..color = color
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_ArcPainter old) => old.color != color;
}
