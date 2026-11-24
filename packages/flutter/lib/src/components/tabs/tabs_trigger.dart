part of 'ids_tabs.dart';

class IdsTabsTrigger<T extends Object> extends StatefulWidget {
  const IdsTabsTrigger({
    super.key,
    required this.value,
    this.disabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.leading,
    this.onPressed,
    this.style,
    required Widget this.child,
  }) : builder = null;

  const IdsTabsTrigger.builder({
    super.key,
    required this.value,
    this.disabled = false,
    this.focusNode,
    this.autofocus = false,
    this.semanticLabel,
    this.leading,
    this.onPressed,
    this.style,
    required Widget Function(BuildContext, IdsTabsTriggerState<T>) this.builder,
  }) : child = null;

  final T value;
  final bool disabled;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? semanticLabel;
  final Widget? leading;
  final VoidCallback? onPressed;
  final ShapeDecoration Function(IdsTabsTriggerState<T>, ShapeDecoration)?
  style;
  final Widget? child;
  final Widget Function(BuildContext, IdsTabsTriggerState<T>)? builder;

  @override
  State<IdsTabsTrigger<T>> createState() => _IdsTabsTriggerState<T>();
}

class _IdsTabsTriggerState<T extends Object> extends State<IdsTabsTrigger<T>> {
  final _localFocus = FocusNode();
  _IdsTabsState<Object>? _owner;
  FocusNode? _registered;

  FocusNode get _focus => widget.focusNode ?? _localFocus;

  void _register() {
    final owner = _TabsScope.of(context).owner;
    if (owner != _owner || _focus != _registered) {
      if (_registered case final focus?) _owner?._unregister(focus);
      _owner = owner;
      _registered = _focus;
    }
    final label =
        widget.semanticLabel ??
        switch (widget.child) {
          Text text =>
            text.semanticsLabel ?? text.data ?? text.textSpan?.toPlainText(),
          _ => null,
        };
    owner._register(_focus, widget.value, widget.disabled, label);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _register();
  }

  @override
  void didUpdateWidget(IdsTabsTrigger<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    _register();
  }

  @override
  void dispose() {
    if (_registered case final focus?) _owner?._unregister(focus);
    _localFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = _TabsScope.of(context);
    final theme = IdsProvider.of(context).resolved;
    final colors = theme.colors;
    final selected = scope.state.value == widget.value;
    final tiny = scope.state.size == IdsSize.tiny;
    final horizontal = scope.state.orientation == Axis.horizontal;
    final pill = scope.state.appearance == IdsTabsAppearance.pill;
    final enclosed = scope.state.appearance == IdsTabsAppearance.enclosed;
    final roles = controlColors(colors, scope.colorScheme);
    final indicatorColor = roles.ring;
    final direction = Directionality.of(context);
    final radius = Radius.circular(theme.radius.standard);
    final enclosedCorners = horizontal
        ? BorderRadius.only(topLeft: radius, topRight: radius)
        : BorderRadiusDirectional.only(topStart: radius, bottomStart: radius);
    final reduced =
        (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ||
        View.of(context).platformDispatcher.accessibilityFeatures.reduceMotion;
    final duration = reduced ? Duration.zero : IdsMotion.fast;
    final mainSize = theme.dimension(
      tiny ? IdsSizes.controlTiny : IdsSizes.controlStandard,
    );
    void select() {
      widget.onPressed?.call();
      scope.owner._select(widget.value);
    }

    return MergeSemantics(
      child: Semantics(
        container: true,
        role: SemanticsRole.tab,
        selected: selected,
        enabled: !widget.disabled,
        label: widget.semanticLabel,
        child: IdsInteractive(
          disabled: widget.disabled,
          focusNode: _focus,
          autofocus: widget.autofocus,
          skipTraversal: scope.tabStop != null && scope.tabStop != _focus,
          onPressed: select,
          builder: (context, interaction) {
            final selectedPill = selected && pill;
            final variant = scope.variant;
            final glossy = selectedPill && variant == IdsVariant.glossy;
            final background = switch (variant) {
              _ when enclosed && selected => colors.bgSurface,
              _ when !pill => null,
              _ when !selectedPill =>
                interaction.active
                    ? colors.bgNeutralSoftHover
                    : interaction.hovered
                    ? colors.bgNeutralSoft
                    : null,
              IdsVariant.outline =>
                theme.isDark ? colors.bgNeutralSoft : colors.bgSurface,
              IdsVariant.soft => roles.soft,
              IdsVariant.solid => roles.fill,
              IdsVariant.ghost => colors.bgNeutralSoftHover,
              IdsVariant.glossy || IdsVariant.transparent => null,
            };
            final outlined =
                selected &&
                (enclosed || (pill && variant == IdsVariant.outline));
            final border = outlined
                ? BorderSide(
                    color: interaction.focusVisible
                        ? colors.borderPrimary
                        : colors.borderNeutral,
                  )
                : glossy
                ? BorderSide(
                    color: interaction.focusVisible
                        ? roles.ring
                        : glossyControlBorder(roles.fill),
                  )
                : BorderSide.none;
            final shape = theme.shape(
              corners: enclosed ? enclosedCorners : null,
              side: border,
            );
            final decoration = ShapeDecoration(
              color: background,
              gradient: glossy
                  ? glossyControlGradient(roles.fill, false, false)
                  : null,
              shape: enclosed ? _EnclosedTabBorder(shape, horizontal) : shape,
              shadows: switch ((selectedPill, variant)) {
                (true, IdsVariant.outline || IdsVariant.solid) =>
                  controlShadowXs,
                (true, IdsVariant.glossy) => controlShadowSm,
                _ => null,
              },
            );
            final foreground = switch ((selectedPill, variant)) {
              (true, IdsVariant.soft) => roles.onSoft,
              (true, IdsVariant.solid || IdsVariant.glossy) => roles.onFill,
              _ when selected || interaction.hovered => colors.textOnSurface,
              _ => colors.textNeutral,
            };
            final state = (
              value: widget.value,
              selected: selected,
              interaction: interaction,
            );
            final styled = widget.style?.call(state, decoration) ?? decoration;
            final content = widget.child ?? widget.builder!(context, state);
            return MouseRegion(
              cursor: widget.disabled
                  ? SystemMouseCursors.forbidden
                  : SystemMouseCursors.click,
              child: Opacity(
                opacity: widget.disabled ? .5 : 1,
                child: CustomPaint(
                  foregroundPainter: ControlFocusRing(
                    styled.shape,
                    colors.borderPrimary.withValues(
                      alpha: interaction.focusVisible ? .4 : 0,
                    ),
                    direction: direction,
                  ),
                  child: Stack(
                    fit: StackFit.passthrough,
                    clipBehavior: Clip.none,
                    children: [
                      AnimatedContainer(
                        height: mainSize,
                        duration: duration,
                        decoration: ControlShapeDecoration(styled),
                        padding: EdgeInsets.symmetric(
                          horizontal: theme.dimension(tiny ? 10 : 12),
                        ),
                        child: DefaultTextStyle(
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textStyle(
                            tiny
                                ? IdsTypography.captionC1Medium
                                : IdsTypography.bodyB3Medium,
                            color: foreground,
                          ),
                          child: IconTheme(
                            data: IconThemeData(
                              size: theme.dimension(
                                tiny
                                    ? IdsSizes.iconTiny
                                    : IdsSizes.iconStandard,
                              ),
                              color: foreground,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: horizontal
                                  ? MainAxisAlignment.center
                                  : MainAxisAlignment.start,
                              spacing: theme.dimension(tiny ? 6 : 8),
                              children: [
                                if (widget.leading case final leading?)
                                  ExcludeSemantics(child: leading),
                                Flexible(
                                  child: widget.semanticLabel != null
                                      ? ExcludeSemantics(child: content)
                                      : content,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      if (selected && !pill && !enclosed)
                        PositionedDirectional(
                          start: horizontal ? 0 : null,
                          end: 0,
                          top: horizontal ? null : 0,
                          bottom: 0,
                          height: horizontal ? theme.dimension(2) : null,
                          width: horizontal ? null : theme.dimension(2),
                          child: IgnorePointer(
                            child: ColoredBox(color: indicatorColor),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _EnclosedTabBorder extends ShapeBorder {
  const _EnclosedTabBorder(this.border, this.horizontal);

  final ShapeBorder border;
  final bool horizontal;

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) =>
      border.getOuterPath(rect, textDirection: textDirection);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) =>
      border.getInnerPath(rect, textDirection: textDirection);

  @override
  ShapeBorder scale(double t) =>
      _EnclosedTabBorder(border.scale(t), horizontal);

  @override
  ShapeBorder? lerpFrom(ShapeBorder? a, double t) {
    if (a is _EnclosedTabBorder && a.horizontal == horizontal) {
      return _EnclosedTabBorder(
        ShapeBorder.lerp(a.border, border, t)!,
        horizontal,
      );
    }
    return super.lerpFrom(a, t);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    if (rect.isEmpty) return;
    final inset = border.dimensions.resolve(textDirection).top;
    final bounds = horizontal
        ? Rect.fromLTRB(rect.left, rect.top, rect.right, rect.bottom - inset)
        : textDirection == TextDirection.rtl
        ? Rect.fromLTRB(rect.left + inset, rect.top, rect.right, rect.bottom)
        : Rect.fromLTRB(rect.left, rect.top, rect.right - inset, rect.bottom);
    canvas.save();
    canvas.clipRect(bounds, doAntiAlias: false);
    border.paint(canvas, rect, textDirection: textDirection);
    canvas.restore();
  }

  @override
  bool operator ==(Object other) =>
      other is _EnclosedTabBorder &&
      other.border == border &&
      other.horizontal == horizontal;

  @override
  int get hashCode => Object.hash(border, horizontal);
}
