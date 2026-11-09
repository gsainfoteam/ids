import 'package:flutter/widgets.dart';

import '../../../theme/ids_radius.dart';
import '../../../theme/theme_provider.dart';

enum SkeletonShape { rect, circle, text }

enum SkeletonAnimation { pulse, wave, none }

class Skeleton extends StatefulWidget {
  const Skeleton({
    super.key,
    this.shape = SkeletonShape.rect,
    this.lines = 1,
    this.animation = SkeletonAnimation.pulse,
    this.style,
    this.loading,
    this.child,
  });

  final SkeletonShape shape;
  final int lines;
  final SkeletonAnimation animation;
  final TextStyle? style;
  final bool? loading;
  final Widget? child;

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton>
    with SingleTickerProviderStateMixin {
  static const _cycle = Duration(seconds: 2);
  static const _rectHeight = 16.0;
  static const _circleSize = 40.0;
  static const _shortLineFactor = 0.6;

  late final _controller = AnimationController(vsync: this, duration: _cycle);

  bool get _busy => widget.child == null || (widget.loading ?? true);

  bool get _moving =>
      _busy &&
      widget.animation != SkeletonAnimation.none &&
      !(MediaQuery.maybeDisableAnimationsOf(context) ?? false);

  void _syncMotion() {
    if (!_moving) {
      _controller.value = 0;
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _syncMotion();
  }

  @override
  void didUpdateWidget(Skeleton oldWidget) {
    super.didUpdateWidget(oldWidget);
    _syncMotion();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget _paint({required bool circle, required double radius, Widget? child}) {
    final theme = ThemeProvider.of(context);
    return CustomPaint(
      painter: _SkeletonPainter(
        progress: _controller,
        animation: _moving ? widget.animation : SkeletonAnimation.none,
        visible: _busy,
        circle: circle,
        radius: radius,
        base: theme.muted,
        highlight: theme.mutedHover,
        direction: Directionality.maybeOf(context) ?? TextDirection.ltr,
      ),
      child: child,
    );
  }

  Widget _wrap(Widget child) => _paint(
    circle: widget.shape == SkeletonShape.circle,
    radius: IdsRadius.standard,
    child: ExcludeSemantics(
      excluding: _busy,
      child: ExcludeFocus(
        excluding: _busy,
        child: IgnorePointer(
          ignoring: _busy,
          child: Opacity(opacity: _busy ? 0 : 1, child: child),
        ),
      ),
    ),
  );

  Widget _text() {
    final style = DefaultTextStyle.of(context).style.merge(widget.style);
    final scaler =
        MediaQuery.maybeTextScalerOf(context) ?? TextScaler.noScaling;
    final measure = TextPainter(
      text: TextSpan(style: style),
      textDirection: TextDirection.ltr,
      textScaler: scaler,
    );
    final lineHeight = measure.preferredLineHeight;
    measure.dispose();
    final barHeight = scaler.scale(style.fontSize ?? 14);
    final count = widget.lines < 1 ? 1 : widget.lines;

    return SizedBox(
      width: double.infinity,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var index = 0; index < count; index++)
            SizedBox(
              height: lineHeight,
              child: Align(
                alignment: AlignmentDirectional.centerStart,
                child: FractionallySizedBox(
                  widthFactor: count > 1 && index == count - 1
                      ? _shortLineFactor
                      : 1,
                  child: SizedBox(
                    height: barHeight,
                    child: _paint(circle: false, radius: IdsRadius.indicator),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final child = widget.child;
    if (child != null) return _wrap(child);

    return switch (widget.shape) {
      SkeletonShape.rect => SizedBox(
        width: double.infinity,
        height: _rectHeight,
        child: _paint(circle: false, radius: IdsRadius.standard),
      ),
      SkeletonShape.circle => SizedBox.square(
        dimension: _circleSize,
        child: _paint(circle: true, radius: 0),
      ),
      SkeletonShape.text => _text(),
    };
  }
}

class _SkeletonPainter extends CustomPainter {
  _SkeletonPainter({
    required this.progress,
    required this.animation,
    required this.visible,
    required this.circle,
    required this.radius,
    required this.base,
    required this.highlight,
    required this.direction,
  }) : super(repaint: progress);

  static const _pulseCurve = Cubic(0.4, 0, 0.6, 1);
  static const _waveShare = 0.6;
  static const _bandFactor = 0.5;

  final Animation<double> progress;
  final SkeletonAnimation animation;
  final bool visible;
  final bool circle;
  final double radius;
  final Color base;
  final Color highlight;
  final TextDirection direction;

  Path _outline(Size size) {
    final bounds = Offset.zero & size;
    return circle
        ? (Path()..addOval(
            Rect.fromCircle(
              center: bounds.center,
              radius: size.shortestSide / 2,
            ),
          ))
        : (Path()..addRRect(
            RRect.fromRectAndRadius(bounds, Radius.circular(radius)),
          ));
  }

  Color _pulseColor(double t) {
    final rising = t < 0.5;
    final eased = _pulseCurve.transform(rising ? t * 2 : (t - 0.5) * 2);
    return rising
        ? Color.lerp(base, highlight, eased)!
        : Color.lerp(highlight, base, eased)!;
  }

  void _paintBand(Canvas canvas, Size size, Path outline) {
    final t = progress.value;
    if (t >= _waveShare) return;
    final position = -1 + 3 * Curves.easeInOut.transform(t / _waveShare);
    final width = size.width * _bandFactor;
    final start = width * position;
    final left = direction == TextDirection.ltr
        ? start
        : size.width - start - width;
    final band = Rect.fromLTWH(left, 0, width, size.height);
    final clear = highlight.withValues(alpha: 0);
    canvas
      ..save()
      ..clipPath(outline)
      ..drawRect(
        band,
        Paint()
          ..shader = LinearGradient(
            colors: [clear, highlight, clear],
          ).createShader(band),
      )
      ..restore();
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (!visible) return;
    final outline = _outline(size);
    final pulsing = animation == SkeletonAnimation.pulse;
    canvas.drawPath(
      outline,
      Paint()..color = pulsing ? _pulseColor(progress.value) : base,
    );
    if (animation == SkeletonAnimation.wave) {
      _paintBand(canvas, size, outline);
    }
  }

  @override
  bool shouldRepaint(_SkeletonPainter old) => true;
}
