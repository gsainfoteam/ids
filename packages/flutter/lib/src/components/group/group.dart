import 'package:flutter/widgets.dart';

import '../divider/divider.dart';

class Group extends StatelessWidget {
  const Group({
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

  static Group? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_GroupScope>()?.group;

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
      child: _GroupScope(
        group: this,
        child: orientation == Axis.horizontal
            ? IntrinsicHeight(child: flex)
            : IntrinsicWidth(child: flex),
      ),
    );
  }
}

class GroupSeparator extends StatelessWidget {
  const GroupSeparator({super.key});

  @override
  Widget build(BuildContext context) {
    final group = Group.maybeOf(context);
    assert(
      group != null,
      'GroupSeparator must be rendered inside a Group.',
    );
    return Divider(
      orientation: group!.orientation == Axis.horizontal
          ? Axis.vertical
          : Axis.horizontal,
    );
  }
}

class _GroupScope extends InheritedWidget {
  const _GroupScope({required this.group, required super.child});

  final Group group;

  @override
  bool updateShouldNotify(_GroupScope old) =>
      old.group.orientation != group.orientation;
}
