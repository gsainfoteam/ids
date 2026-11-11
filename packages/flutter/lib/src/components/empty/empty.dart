import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' show Icons;
import 'package:flutter/widgets.dart';

import '../../../theme/ids_radius.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';

enum EmptyVariant { outline, soft, ghost }

enum EmptyMediaVariant { soft, outline, ghost }

enum EmptyAlign { center, start }

class Empty extends StatefulWidget {
  const Empty({
    super.key,
    this.variant = EmptyVariant.outline,
    this.size = IdsSize.standard,
    this.align = EmptyAlign.center,
    this.children = const [],
  });

  final EmptyVariant variant;
  final IdsSize size;
  final EmptyAlign align;
  final List<Widget> children;

  @override
  State<Empty> createState() => _EmptyState();
}

class _EmptyState extends State<Empty> {
  static const _paddings = {IdsSize.standard: 32.0, IdsSize.tiny: 16.0};

  bool get _hasTitle => widget.children.any((child) => child is EmptyTitle);

  @override
  void initState() {
    super.initState();
    _warnWithoutTitle();
  }

  @override
  void didUpdateWidget(Empty oldWidget) {
    super.didUpdateWidget(oldWidget);
    final hadTitle = oldWidget.children.any((child) => child is EmptyTitle);
    if (hadTitle != _hasTitle) _warnWithoutTitle();
  }

  void _warnWithoutTitle() {
    if (kDebugMode && !_hasTitle) {
      debugPrint('[IDS] Empty: give it an EmptyTitle.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final centered = widget.align == EmptyAlign.center;
    final outline = widget.variant == EmptyVariant.outline;
    final pad = _paddings[widget.size]! + (outline ? _DashedOutline._width : 0);
    final radius = BorderRadius.circular(IdsRadius.container);

    final body = Padding(
      padding: EdgeInsets.all(pad),
      child: Align(
        alignment: centered
            ? Alignment.topCenter
            : AlignmentDirectional.topStart,
        heightFactor: 1,
        child: DefaultTextStyle.merge(
          style: TextStyle(color: theme.onSurface),
          textAlign: centered ? TextAlign.center : TextAlign.start,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: centered
                ? CrossAxisAlignment.center
                : CrossAxisAlignment.start,
            children: [
              if (!widget.children.any((child) => child is EmptyMedia))
                const EmptyMedia(),
              ...widget.children,
            ],
          ),
        ),
      ),
    );

    return _EmptyScope(
      size: widget.size,
      variant: widget.variant,
      align: widget.align,
      child: switch (widget.variant) {
        EmptyVariant.outline => CustomPaint(
          foregroundPainter: _DashedOutline(color: theme.border),
          child: body,
        ),
        EmptyVariant.soft => DecoratedBox(
          decoration: BoxDecoration(color: theme.muted, borderRadius: radius),
          child: body,
        ),
        EmptyVariant.ghost => body,
      },
    );
  }
}

class EmptyMedia extends StatelessWidget {
  const EmptyMedia({
    super.key,
    this.variant = EmptyMediaVariant.soft,
    this.hidden = false,
    this.child,
  });

  final EmptyMediaVariant variant;
  final bool hidden;
  final Widget? child;

  static const _boxes = {IdsSize.standard: 48.0, IdsSize.tiny: 40.0};
  static const _icons = {IdsSize.standard: 24.0, IdsSize.tiny: 20.0};
  static const _gaps = {IdsSize.standard: 16.0, IdsSize.tiny: 12.0};

  @override
  Widget build(BuildContext context) {
    final scope = _EmptyScope.of(context, 'EmptyMedia');
    if (hidden) return const SizedBox.shrink();
    final theme = ThemeProvider.of(context);
    final glyph =
        child ?? const ExcludeSemantics(child: Icon(Icons.inbox_outlined));
    final radius = BorderRadius.circular(IdsRadius.standard);

    final media = switch (variant) {
      EmptyMediaVariant.ghost => IconTheme.merge(
        data: IconThemeData(size: _boxes[scope.size], color: theme.onMuted),
        child: glyph,
      ),
      EmptyMediaVariant.soft || EmptyMediaVariant.outline => SizedBox.square(
        dimension: _boxes[scope.size],
        child: ClipRRect(
          borderRadius: radius,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: variant == EmptyMediaVariant.soft
                  ? (scope.variant == EmptyVariant.soft
                        ? theme.surface
                        : theme.muted)
                  : null,
              border: variant == EmptyMediaVariant.outline
                  ? Border.all(color: theme.border)
                  : null,
              borderRadius: radius,
            ),
            child: IconTheme.merge(
              data: IconThemeData(
                size: _icons[scope.size],
                color: theme.onSurface,
              ),
              child: glyph is Image ? glyph : Center(child: glyph),
            ),
          ),
        ),
      ),
    };

    return Padding(
      padding: EdgeInsets.only(bottom: _gaps[scope.size]!),
      child: media,
    );
  }
}

class EmptyTitle extends StatelessWidget {
  const EmptyTitle({super.key, this.headingLevel, required this.child});

  final int? headingLevel;
  final Widget child;

  static const _styles = {
    IdsSize.standard: IdsTypography.subtitleS2Semibold,
    IdsSize.tiny: IdsTypography.bodyB3Semibold,
  };

  @override
  Widget build(BuildContext context) {
    final title = DefaultTextStyle.merge(
      style: _styles[_EmptyScope.of(context, 'EmptyTitle').size],
      child: child,
    );
    return headingLevel == null
        ? title
        : Semantics(header: true, headingLevel: headingLevel, child: title);
  }
}

class EmptyDescription extends StatelessWidget {
  const EmptyDescription({super.key, required this.child});

  final Widget child;

  static const _styles = {
    IdsSize.standard: IdsTypography.bodyB3Regular,
    IdsSize.tiny: IdsTypography.captionC1Regular,
  };
  static const _gaps = {IdsSize.standard: 4.0, IdsSize.tiny: 2.0};
  static const _maxWidth = 384.0;

  @override
  Widget build(BuildContext context) {
    final size = _EmptyScope.of(context, 'EmptyDescription').size;
    return Padding(
      padding: EdgeInsets.only(top: _gaps[size]!),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: DefaultTextStyle.merge(
          style: _styles[size]!.copyWith(
            color: ThemeProvider.of(context).onMuted,
          ),
          child: child,
        ),
      ),
    );
  }
}

class EmptyActions extends StatelessWidget {
  const EmptyActions({super.key, this.children = const []});

  final List<Widget> children;

  static const _gaps = {IdsSize.standard: 20.0, IdsSize.tiny: 12.0};
  static const _spacing = 8.0;

  @override
  Widget build(BuildContext context) {
    final scope = _EmptyScope.of(context, 'EmptyActions');
    return Padding(
      padding: EdgeInsets.only(top: _gaps[scope.size]!),
      child: Wrap(
        spacing: _spacing,
        runSpacing: _spacing,
        alignment: scope.align == EmptyAlign.center
            ? WrapAlignment.center
            : WrapAlignment.start,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: children,
      ),
    );
  }
}

class _EmptyScope extends InheritedWidget {
  const _EmptyScope({
    required this.size,
    required this.variant,
    required this.align,
    required super.child,
  });

  final IdsSize size;
  final EmptyVariant variant;
  final EmptyAlign align;

  static const _fallback = _EmptyScope(
    size: IdsSize.standard,
    variant: EmptyVariant.outline,
    align: EmptyAlign.center,
    child: SizedBox.shrink(),
  );

  static _EmptyScope of(BuildContext context, String part) {
    final scope = context.dependOnInheritedWidgetOfExactType<_EmptyScope>();
    assert(scope != null, '[IDS] $part: must be used inside Empty.');
    return scope ?? _fallback;
  }

  @override
  bool updateShouldNotify(_EmptyScope oldWidget) =>
      size != oldWidget.size ||
      variant != oldWidget.variant ||
      align != oldWidget.align;
}

class _DashedOutline extends CustomPainter {
  const _DashedOutline({required this.color});

  static const _dash = 3.0;
  static const _gap = 2.0;
  static const _width = 1.0;

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final inset = _width / 2;
    final outline = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          (Offset.zero & size).deflate(inset),
          const Radius.circular(IdsRadius.container - _width / 2),
        ),
      );
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = _width;
    for (final metric in outline.computeMetrics()) {
      for (var start = 0.0; start < metric.length; start += _dash + _gap) {
        canvas.drawPath(
          metric.extractPath(start, math.min(start + _dash, metric.length)),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_DashedOutline oldDelegate) => color != oldDelegate.color;
}
