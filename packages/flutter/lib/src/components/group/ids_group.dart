import 'package:flutter/widgets.dart';

import '../divider/ids_divider.dart';

class IdsGroup extends StatelessWidget {
  const IdsGroup({
    super.key,
    this.orientation = Axis.horizontal,
    this.attached = true,
    this.semanticLabel,
    required this.children,
  });

  final Axis orientation;
  final bool attached;
  final String? semanticLabel;
  final List<Widget> children;

  static const _gap = 8.0;

  static IdsGroup? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsGroupScope>()?.group;

  @override
  Widget build(BuildContext context) {
    final flex = Flex(
      direction: orientation,
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: attached ? 0 : _gap,
      children: children,
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: _IdsGroupScope(
        group: this,
        child: orientation == Axis.horizontal
            ? IntrinsicHeight(child: flex)
            : IntrinsicWidth(child: flex),
      ),
    );
  }
}

class IdsGroupSeparator extends StatelessWidget {
  const IdsGroupSeparator({super.key});

  @override
  Widget build(BuildContext context) {
    final group = IdsGroup.maybeOf(context);
    assert(
      group != null,
      'IdsGroupSeparator must be rendered inside an IdsGroup.',
    );
    return IdsDivider(
      orientation: group!.orientation == Axis.horizontal
          ? Axis.vertical
          : Axis.horizontal,
    );
  }
}

class _IdsGroupScope extends InheritedWidget {
  const _IdsGroupScope({required this.group, required super.child});

  final IdsGroup group;

  @override
  bool updateShouldNotify(_IdsGroupScope old) =>
      old.group.orientation != group.orientation;
}
