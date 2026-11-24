part of 'ids_tabs.dart';

class IdsTabsContent<T extends Object> extends StatelessWidget {
  const IdsTabsContent({
    super.key,
    required this.value,
    this.forceMount = false,
    this.semanticLabel,
    this.focusNode,
    this.skipTraversal = false,
    required Widget this.child,
  }) : builder = null;

  const IdsTabsContent.builder({
    super.key,
    required this.value,
    this.forceMount = false,
    this.semanticLabel,
    this.focusNode,
    this.skipTraversal = false,
    required Widget Function(BuildContext, IdsTabsContentState<T>) this.builder,
  }) : child = null;

  final T value;
  final bool forceMount;
  final String? semanticLabel;
  final FocusNode? focusNode;
  final bool skipTraversal;
  final Widget? child;
  final Widget Function(BuildContext, IdsTabsContentState<T>)? builder;

  @override
  Widget build(BuildContext context) {
    final scope = _TabsScope.of(context);
    final state = scope.state;
    final selected = state.value == value;
    if (!selected && !forceMount) return const SizedBox.shrink();
    final theme = IdsProvider.of(context);
    final horizontal = state.orientation == Axis.horizontal;
    final spacing = theme.dimension(state.size == IdsSize.tiny ? 12 : 16);
    final content = Padding(
      padding: EdgeInsetsDirectional.only(
        top: horizontal ? spacing : 0,
        start: horizontal ? 0 : spacing,
      ),
      child: Semantics(
        container: true,
        role: SemanticsRole.tabPanel,
        label:
            semanticLabel ??
            scope.owner._items.values
                .where((item) => item.value == value)
                .firstOrNull
                ?.label,
        child: Focus(
          focusNode: focusNode,
          skipTraversal: skipTraversal,
          child: Builder(
            builder: (context) => ListenableBuilder(
              listenable: Focus.of(context),
              builder: (context, child) {
                final focusVisible =
                    Focus.of(context).hasPrimaryFocus &&
                    FocusManager.instance.highlightMode ==
                        FocusHighlightMode.traditional;
                return CustomPaint(
                  foregroundPainter: ControlFocusRing(
                    theme.resolved.shape(),
                    theme.colors.borderPrimary.withValues(
                      alpha: focusVisible ? .4 : 0,
                    ),
                  ),
                  child: child,
                );
              },
              child: DefaultTextStyle(
                style: theme.textStyle(
                  state.size == IdsSize.tiny
                      ? IdsTypography.captionC1Regular
                      : IdsTypography.bodyB3Regular,
                  color: theme.colors.textOnSurface,
                ),
                child:
                    child ??
                    builder!(context, (value: value, selected: selected)),
              ),
            ),
          ),
        ),
      ),
    );
    if (!forceMount) return content;
    return Offstage(
      offstage: !selected,
      child: TickerMode(
        enabled: selected,
        child: ExcludeFocus(excluding: !selected, child: content),
      ),
    );
  }
}
