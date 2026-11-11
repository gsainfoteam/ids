import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' show Icons;
import 'package:flutter/widgets.dart';

import '../../../theme/ids_radius.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_typography.dart';
import 'avatar_scope.dart';

enum AvatarShape { circle, square }

enum AvatarStatus { loading, loaded, error }

final _hangul = RegExp('[ㄱ-ㆎ가-힣]');
final _letter = RegExp(r'[\p{L}\p{N}]', unicode: true);

String _firstLetter(String word) =>
    word.characters.firstWhere(_letter.hasMatch, orElse: () => '');

String initialsOf(String name) {
  final words = name.trim().split(RegExp(r'\s+'));
  final first = words.first;
  if (first.isEmpty) return '';
  if (_hangul.hasMatch(first)) return _firstLetter(first);
  return words.take(2).map(_firstLetter).join().toUpperCase();
}

class Avatar extends StatefulWidget {
  const Avatar({
    super.key,
    this.image,
    this.name,
    this.semanticLabel,
    this.excludeFromSemantics = false,
    this.shape,
    this.size,
    this.fallback,
    this.fallbackDelay = const Duration(milliseconds: 600),
    this.onStatusChange,
  });

  final ImageProvider? image;
  final String? name;
  final String? semanticLabel;
  final bool excludeFromSemantics;
  final AvatarShape? shape;
  final IdsSize? size;
  final Widget? fallback;
  final Duration fallbackDelay;
  final ValueChanged<AvatarStatus>? onStatusChange;

  @override
  State<Avatar> createState() => _AvatarState();
}

class _AvatarState extends State<Avatar> {
  static const _sizes = {IdsSize.standard: 40.0, IdsSize.tiny: 24.0};
  static const _squareRadii = {
    IdsSize.standard: IdsRadius.standard,
    IdsSize.tiny: IdsRadius.indicator,
  };
  static const _ringAlpha = 0.08;
  static const _initialsFactor = 0.4;
  static const _minInitialsSize = 10.0;
  static const _iconFactor = 0.62;

  AvatarStatus? _status;
  Timer? _delay;
  bool _waited = false;

  String? get _label => [
    widget.semanticLabel,
    widget.name,
  ].where((label) => label?.trim().isNotEmpty ?? false).firstOrNull;

  bool get _waitedEnough => widget.fallbackDelay <= Duration.zero || _waited;

  @override
  void initState() {
    super.initState();
    _warnWithoutLabel();
    _startLoading();
  }

  @override
  void didUpdateWidget(Avatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.image != oldWidget.image) _startLoading();
    if (widget.name != oldWidget.name ||
        widget.semanticLabel != oldWidget.semanticLabel ||
        widget.excludeFromSemantics != oldWidget.excludeFromSemantics) {
      _warnWithoutLabel();
    }
  }

  @override
  void dispose() {
    _delay?.cancel();
    super.dispose();
  }

  void _warnWithoutLabel() {
    if (kDebugMode && !widget.excludeFromSemantics && _label == null) {
      debugPrint(
        '[IDS] Avatar: pass name or semanticLabel so it has an accessible name, '
        'or excludeFromSemantics when it is decorative.',
      );
    }
  }

  void _startLoading() {
    _delay?.cancel();
    _waited = false;
    if (widget.image == null) {
      _report(AvatarStatus.error);
      return;
    }
    _report(AvatarStatus.loading);
    if (widget.fallbackDelay > Duration.zero) {
      _delay = Timer(
        widget.fallbackDelay,
        () => setState(() => _waited = true),
      );
    }
  }

  void _report(AvatarStatus status) {
    if (status == _status) return;
    _status = status;
    final notify = widget.onStatusChange;
    if (notify == null) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _status == status) notify(status);
    });
  }

  Widget _fallback(double width, Color color) {
    final initials = widget.name == null ? '' : initialsOf(widget.name!);
    return _WithoutTextScaling(
      child: DefaultTextStyle(
        style: IdsTypography.bodyB3Medium.copyWith(
          fontSize: math.max(_minInitialsSize, width * _initialsFactor),
          height: 1,
          color: color,
        ),
        child: IconTheme(
          data: IconThemeData(size: width * _iconFactor, color: color),
          child: Center(
            child:
                widget.fallback ??
                (initials.isEmpty
                    ? const Icon(Icons.person)
                    : Text(initials, maxLines: 1, softWrap: false)),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final scope = AvatarScope.maybeOf(context);
    final size = widget.size ?? scope?.size ?? IdsSize.standard;
    final circle =
        (widget.shape ?? scope?.shape ?? AvatarShape.circle) ==
        AvatarShape.circle;
    ShapeBorder outline([BorderSide side = BorderSide.none]) => circle
        ? CircleBorder(side: side)
        : RoundedRectangleBorder(
            side: side,
            borderRadius: BorderRadius.circular(_squareRadii[size]!),
          );

    final cutout = scope?.cutout;
    final surface = Container(
      clipBehavior: Clip.antiAlias,
      decoration: ShapeDecoration(color: theme.muted, shape: outline()),
      foregroundDecoration: ShapeDecoration(
        shape: outline(
          BorderSide(color: theme.onSurface.withValues(alpha: _ringAlpha)),
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final fallback = _fallback(constraints.maxWidth, theme.onMuted);
          final image = widget.image;
          if (image == null) return fallback;
          return Image(
            key: ValueKey(image),
            image: image,
            fit: BoxFit.cover,
            excludeFromSemantics: true,
            frameBuilder: (_, child, frame, _) {
              if (frame == null) {
                return _waitedEnough ? fallback : const SizedBox.shrink();
              }
              _report(AvatarStatus.loaded);
              return child;
            },
            errorBuilder: (_, _, _) {
              _report(AvatarStatus.error);
              return fallback;
            },
          );
        },
      ),
    );

    final avatar = SizedBox.square(
      dimension: _sizes[size],
      child: Align(
        alignment: AlignmentDirectional.topStart,
        child: AspectRatio(
          aspectRatio: 1,
          child: ClipPath(
            clipBehavior: cutout == null ? Clip.none : Clip.antiAlias,
            clipper: cutout == null
                ? null
                : _CutoutClipper(
                    left:
                        (cutout == AvatarCutout.start) !=
                        (Directionality.of(context) == TextDirection.rtl),
                    overlap: scope!.overlap,
                    circle: circle,
                    radius: _squareRadii[size]!,
                  ),
            child: surface,
          ),
        ),
      ),
    );

    if (widget.excludeFromSemantics) return ExcludeSemantics(child: avatar);
    return Semantics(
      image: true,
      label: _label,
      excludeSemantics: true,
      child: avatar,
    );
  }
}

class _WithoutTextScaling extends StatelessWidget {
  const _WithoutTextScaling({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.maybeOf(context);
    if (media == null) return child;
    return MediaQuery(
      data: media.copyWith(textScaler: TextScaler.noScaling),
      child: child,
    );
  }
}

class _CutoutClipper extends CustomClipper<Path> {
  const _CutoutClipper({
    required this.left,
    required this.overlap,
    required this.circle,
    required this.radius,
  });

  static const _gap = 2.0;

  final bool left;
  final double overlap;
  final bool circle;
  final double radius;

  @override
  Path getClip(Size size) {
    final neighbour = Rect.fromLTWH(
      left ? overlap - size.width : size.width - overlap,
      0,
      size.width,
      size.height,
    ).inflate(_gap);
    final hole = circle
        ? (Path()..addOval(neighbour))
        : (Path()..addRRect(
            RRect.fromRectAndRadius(neighbour, Radius.circular(radius + _gap)),
          ));
    return Path.combine(
      PathOperation.difference,
      Path()..addRect(Offset.zero & size),
      hole,
    );
  }

  @override
  bool shouldReclip(_CutoutClipper old) =>
      left != old.left ||
      overlap != old.overlap ||
      circle != old.circle ||
      radius != old.radius;
}
