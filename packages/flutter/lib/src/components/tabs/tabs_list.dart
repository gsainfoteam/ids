part of 'ids_tabs.dart';

class IdsTabsList extends StatelessWidget {
  const IdsTabsList({
    super.key,
    this.stretch = false,
    this.semanticLabel,
    required this.children,
  });

  final bool stretch;
  final String? semanticLabel;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final state = _TabsScope.of(context).state;
    final theme = IdsProvider.of(context);
    final horizontal = state.orientation == Axis.horizontal;
    final pill = state.appearance == IdsTabsAppearance.pill;
    final border = BorderSide(color: theme.colors.borderNeutral);
    final stretchTabs = stretch && horizontal;
    final layout = Flex(
      direction: state.orientation,
      mainAxisSize: stretchTabs ? MainAxisSize.max : MainAxisSize.min,
      crossAxisAlignment: horizontal
          ? CrossAxisAlignment.end
          : CrossAxisAlignment.stretch,
      spacing: pill ? theme.dimension(4) : 0,
      children: [
        for (final child in children)
          if (stretchTabs && child is! Flexible)
            Expanded(child: child)
          else
            child,
      ],
    );
    return Semantics(
      container: true,
      explicitChildNodes: true,
      role: SemanticsRole.tabBar,
      label: semanticLabel,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: pill
              ? null
              : horizontal
              ? Border(bottom: border)
              : BorderDirectional(end: border),
        ),
        child: horizontal ? layout : IntrinsicWidth(child: layout),
      ),
    );
  }
}
