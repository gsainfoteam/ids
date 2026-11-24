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
    this.decorativeSeparator = false,
  });

  final Axis orientation;
  final bool attached;
  final IdsSize? size;
  final bool decorativeSeparator;

  @override
  bool operator ==(Object other) =>
      other is IdsGroupData &&
      other.orientation == orientation &&
      other.attached == attached &&
      other.size == size &&
      other.decorativeSeparator == decorativeSeparator;

  @override
  int get hashCode =>
      Object.hash(orientation, attached, size, decorativeSeparator);
}

abstract interface class IdsGroupedControl {}

class IdsGroup extends StatelessWidget {
  const IdsGroup({
    super.key,
    this.orientation = Axis.horizontal,
    this.attached = true,
    this.semanticLabel,
    this.size,
    this.variant,
    this.decorativeSeparator = false,
    required this.children,
  });

  final Axis orientation;
  final bool attached;
  final String? semanticLabel;
  final IdsSize? size;
  final IdsVariant? variant;
  final bool decorativeSeparator;
  final List<Widget> children;

  static const _gap = 8.0;

  static Widget reset({required Widget child}) => _IdsGroupScope(
    group: null,
    size: null,
    variant: null,
    child: IdsGroupItem(
      orientation: Axis.horizontal,
      attached: false,
      roundStart: true,
      roundEnd: true,
      child: child,
    ),
  );

  static IdsGroupData? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsGroupScope>()?.group;

  static IdsSize? sizeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsGroupScope>()?.size;

  static IdsVariant? variantOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_IdsGroupScope>()?.variant;

  @override
  Widget build(BuildContext context) {
    final nested = children.any((child) => child is IdsGroup);
    final joined = attached && !nested;
    final inheritedVariant = variant ?? variantOf(context);
    final theme = IdsProvider.of(context);
    final flex = Flex(
      direction: orientation,
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: joined ? 0 : theme.dimension(_gap),
      children: [
        for (final (index, child) in children.indexed)
          IdsGroupItem(
            key: child.key == null ? null : ValueKey(child.key),
            orientation: orientation,
            attached: joined,
            roundStart: !joined || index == 0,
            roundEnd: !joined || index == children.length - 1,
            child: orientation == Axis.horizontal && child is IdsGroupedControl
                ? Align(
                    alignment: AlignmentDirectional.topStart,
                    widthFactor: 1,
                    heightFactor: 1,
                    child: child,
                  )
                : child,
          ),
      ],
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: _IdsGroupScope(
        group: IdsGroupData(
          orientation: orientation,
          attached: attached,
          size: size ?? sizeOf(context),
          decorativeSeparator: decorativeSeparator,
        ),
        size: size ?? sizeOf(context),
        variant: inheritedVariant,
        child: orientation == Axis.horizontal
            ? IntrinsicHeight(child: flex)
            : IntrinsicWidth(child: flex),
      ),
    );
  }
}

class IdsGroupSeparator extends StatelessWidget {
  const IdsGroupSeparator({super.key, this.child});

  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final group = IdsGroup.maybeOf(context);
    assert(
      group != null,
      'IdsGroupSeparator must be rendered inside an IdsGroup.',
    );
    final vertical = group!.orientation == Axis.horizontal;
    final divider = IdsDivider(
      orientation: vertical ? Axis.vertical : Axis.horizontal,
      decorative: group.decorativeSeparator,
      child: child,
    );
    if (group.attached || child != null) return divider;
    final extent = IdsProvider.of(
      context,
    ).dimension(IdsGroup.sizeOf(context) == IdsSize.tiny ? 16 : 20);
    return Center(
      child: SizedBox(
        height: vertical ? extent : null,
        width: vertical ? null : extent,
        child: divider,
      ),
    );
  }
}

class IdsGroupItem extends InheritedWidget {
  const IdsGroupItem({
    super.key,
    required this.orientation,
    required this.attached,
    required this.roundStart,
    required this.roundEnd,
    required super.child,
  });

  final Axis orientation;
  final bool attached;
  final bool roundStart;
  final bool roundEnd;

  static IdsGroupItem? of(BuildContext context) {
    final item = context.dependOnInheritedWidgetOfExactType<IdsGroupItem>();
    return item?.attached == true ? item : null;
  }

  BorderRadiusGeometry corners(double radius) {
    final start = Radius.circular(roundStart ? radius : 0);
    final end = Radius.circular(roundEnd ? radius : 0);
    return orientation == Axis.horizontal
        ? BorderRadiusDirectional.only(
            topStart: start,
            bottomStart: start,
            topEnd: end,
            bottomEnd: end,
          )
        : BorderRadius.only(
            topLeft: start,
            topRight: start,
            bottomLeft: end,
            bottomRight: end,
          );
  }

  @override
  bool updateShouldNotify(IdsGroupItem old) =>
      orientation != old.orientation ||
      attached != old.attached ||
      roundStart != old.roundStart ||
      roundEnd != old.roundEnd;
}

class _IdsGroupScope extends InheritedWidget {
  const _IdsGroupScope({
    required this.group,
    required this.size,
    required this.variant,
    required super.child,
  });

  final IdsGroupData? group;
  final IdsSize? size;
  final IdsVariant? variant;

  @override
  bool updateShouldNotify(_IdsGroupScope old) =>
      old.group?.orientation != group?.orientation ||
      old.group?.attached != group?.attached ||
      old.group?.decorativeSeparator != group?.decorativeSeparator ||
      old.size != size ||
      old.variant != variant;
}
