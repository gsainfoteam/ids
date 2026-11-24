import 'package:flutter/widgets.dart';

class ToggleGroupScope extends InheritedWidget {
  const ToggleGroupScope({
    super.key,
    required this.owner,
    required this.selected,
    required this.tabStop,
    required this.disabled,
    required this.invalid,
    required this.multiple,
    required super.child,
  });

  final ToggleGroupOwner owner;
  final List<Object> selected;
  final FocusNode? tabStop;
  final bool disabled;
  final bool invalid;
  final bool multiple;

  static ToggleGroupScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<ToggleGroupScope>();

  @override
  bool updateShouldNotify(ToggleGroupScope old) =>
      old.owner != owner ||
      old.selected != selected ||
      old.tabStop != tabStop ||
      old.disabled != disabled ||
      old.invalid != invalid ||
      old.multiple != multiple;
}

abstract interface class ToggleGroupOwner {
  void register(
    FocusNode focus,
    Object value,
    bool disabled,
    VoidCallback activate,
  );
  void unregister(FocusNode focus);
  void toggle(Object value);
}
