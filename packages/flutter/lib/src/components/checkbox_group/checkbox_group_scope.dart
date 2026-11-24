import 'package:flutter/widgets.dart';

import '../../../tokens/ids_enums.dart';
import '../checkbox/ids_checkbox.dart' show IdsCheckedState;

class CheckboxGroupScope extends InheritedWidget {
  const CheckboxGroupScope({
    super.key,
    required this.owner,
    required this.value,
    required this.all,
    required this.disabled,
    required this.readOnly,
    required this.invalid,
    this.size,
    this.variant,
    required super.child,
  });

  final CheckboxGroupOwner owner;
  final List<Object> value;
  final IdsCheckedState all;
  final bool disabled;
  final bool readOnly;
  final bool invalid;
  final IdsSize? size;
  final IdsVariant? variant;

  static CheckboxGroupScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<CheckboxGroupScope>();

  @override
  bool updateShouldNotify(CheckboxGroupScope old) =>
      old.owner != owner ||
      old.value != value ||
      old.all != all ||
      old.disabled != disabled ||
      old.readOnly != readOnly ||
      old.invalid != invalid ||
      old.size != size ||
      old.variant != variant;
}

abstract interface class CheckboxGroupOwner {
  void register(FocusNode focus, Object value, bool disabled);
  void unregister(FocusNode focus);
  void toggle(Object value, bool checked);
  void setAll(bool checked);
}
