import 'package:flutter/widgets.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../divider/ids_divider.dart';

@immutable
class IdsGroupData {
  const IdsGroupData({
    required this.orientation,
    required this.attached,
    this.size,
  });

  final Axis orientation;
  final bool attached;
  final IdsSize? size;

  @override
  bool operator ==(Object other) =>
      other is IdsGroupData &&
      other.orientation == orientation &&
      other.attached == attached &&
      other.size == size;

  @override
  int get hashCode => Object.hash(orientation, attached, size);
}

class IdsGroup extends StatelessWidget {
  const IdsGroup({
    super.key,
    this.orientation = Axis.horizontal,
    this.attached = true,
    this.size,
    this.semanticLabel,
    required this.children,
  });

  final Axis orientation;
  final bool attached;
  final IdsSize? size;
  final String? semanticLabel;
  final List<Widget> children;

  static const _gap = 8.0;

  static IdsGroupData? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsGroupScope>()?.data;

  @override
  Widget build(BuildContext context) {
    final flex = Flex(
      direction: orientation,
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: attached ? 0 : IdsProvider.of(context).dimension(_gap),
      children: children,
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: _IdsGroupScope(
        data: IdsGroupData(
          orientation: orientation,
          attached: attached,
          size: size ?? maybeOf(context)?.size,
        ),
        child: orientation == Axis.horizontal
            ? IntrinsicHeight(child: flex)
            : IntrinsicWidth(child: flex),
      ),
    );
  }
}

class IdsGroupSeparator extends StatelessWidget {
  const IdsGroupSeparator({super.key});

  static const _spacedLength = 20.0;
  static const _spacedTinyLength = 16.0;

  @override
  Widget build(BuildContext context) {
    final group = IdsGroup.maybeOf(context);
    assert(
      group != null,
      'IdsGroupSeparator must be rendered inside an IdsGroup.',
    );
    final horizontalGroup = group!.orientation == Axis.horizontal;
    final divider = IdsDivider(
      orientation: horizontalGroup ? Axis.vertical : Axis.horizontal,
    );
    if (group.attached) return divider;

    final length = IdsProvider.of(
      context,
    ).dimension(group.size == IdsSize.tiny ? _spacedTinyLength : _spacedLength);
    return Center(
      child: SizedBox(
        width: horizontalGroup ? null : length,
        height: horizontalGroup ? length : null,
        child: divider,
      ),
    );
  }
}

class _IdsGroupScope extends InheritedWidget {
  const _IdsGroupScope({required this.data, required super.child});

  final IdsGroupData data;

  @override
  bool updateShouldNotify(_IdsGroupScope old) => old.data != data;
}
