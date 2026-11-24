import 'package:flutter/widgets.dart';
import 'package:flutter/semantics.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../interaction/control_surface.dart';
import '../../interaction/control_tokens.dart';
import '../../interaction/ids_interactive.dart';
import '../checkbox_group/checkbox_group_scope.dart';
import '../field/ids_field.dart';
import '../label/ids_label.dart';

enum IdsCheckedState { unchecked, checked, indeterminate }

typedef IdsCheckboxState = ({
  bool checked,
  bool indeterminate,
  bool disabled,
  bool readOnly,
  bool required,
  bool invalid,
  bool hovered,
  bool active,
  bool focused,
  bool focusVisible,
});

class IdsCheckbox extends StatefulWidget {
  const IdsCheckbox({
    super.key,
    this.checked,
    this.defaultChecked,
    this.onCheckedChange,
    this.onSaved,
    this.validator,
    this.value,
    this.variant,
    this.size,
    this.disabled = false,
    this.readOnly = false,
    this.required = false,
    this.invalid = false,
    this.focusNode,
    this.autofocus = false,
    this.label,
    this.semanticLabel,
    this.child,
    this.builder,
    this.style,
  }) : assert(checked == null || defaultChecked == null),
       assert(child == null || builder == null),
       assert(
         variant == null ||
             variant == IdsVariant.outline ||
             variant == IdsVariant.soft,
       );

  final IdsCheckedState? checked;
  final IdsCheckedState? defaultChecked;
  final ValueChanged<bool>? onCheckedChange;
  final FormFieldSetter<bool>? onSaved;
  final FormFieldValidator<bool>? validator;
  final Object? value;
  final IdsVariant? variant;
  final IdsSize? size;
  final bool disabled;
  final bool readOnly;
  final bool required;
  final bool invalid;
  final FocusNode? focusNode;
  final bool autofocus;
  final String? label;
  final String? semanticLabel;
  final Widget? child;
  final Widget Function(BuildContext context, IdsCheckboxState state)? builder;
  final ShapeDecoration Function(IdsCheckboxState state, ShapeDecoration base)?
  style;

  @override
  State<IdsCheckbox> createState() => _IdsCheckboxState();
}

class _IdsCheckboxState extends State<IdsCheckbox> {
  final _form = GlobalKey<FormFieldState<IdsCheckedState>>();
  late final _localFocus = FocusNode();
  FieldControlBinding? _fieldControl;
  CheckboxGroupOwner? _groupOwner;
  FocusNode? _registeredFocus;

  FocusNode get _focus => widget.focusNode ?? _localFocus;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _bindField();
  }

  @override
  void didUpdateWidget(IdsCheckbox oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.checked != oldWidget.checked &&
        _form.currentState?.hasError == true) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final field = _form.currentState;
        if (mounted && field != null && field.hasError) field.validate();
      });
    }
    if (widget.focusNode != oldWidget.focusNode ||
        widget.value != oldWidget.value ||
        widget.disabled != oldWidget.disabled) {
      _bindField();
    }
  }

  void _bindField() {
    final scope = CheckboxGroupScope.maybeOf(context);
    final group = widget.value == null ? null : scope;
    if (group?.owner != _groupOwner || _focus != _registeredFocus) {
      if (_registeredFocus case final focus?) _groupOwner?.unregister(focus);
      _groupOwner = group?.owner;
      _registeredFocus = group == null ? null : _focus;
    }
    group?.owner.register(
      _focus,
      widget.value!,
      widget.disabled || group.disabled,
    );
    if (scope == null) {
      _fieldControl = bindFieldControl(context, _focus, _fieldControl);
    } else {
      _fieldControl?.dispose();
      _fieldControl = null;
    }
  }

  @override
  void dispose() {
    _fieldControl?.dispose();
    if (_registeredFocus case final focus?) _groupOwner?.unregister(focus);
    _localFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    final theme = scope.resolved;
    final colors = theme.colors;
    final groupScope = CheckboxGroupScope.maybeOf(context);
    final field = IdsField.maybeOf(context);
    final group = widget.value == null ? null : groupScope;
    assert(
      group == null ||
          (widget.checked == null && widget.defaultChecked == null),
    );
    final groupValue = group == null
        ? null
        : group.value.contains(widget.value)
        ? IdsCheckedState.checked
        : IdsCheckedState.unchecked;
    final readOnly = widget.readOnly || (group?.readOnly ?? false);
    final disabled =
        widget.disabled || (group?.disabled ?? field?.disabled ?? false);
    final required =
        widget.required || (groupScope == null && (field?.required ?? false));
    final tiny = (widget.size ?? group?.size ?? field?.size) == IdsSize.tiny;
    final variant = widget.variant ?? group?.variant ?? IdsVariant.outline;
    final size = theme.dimension(tiny ? 14 : 16);
    final iconSize = theme.dimension(tiny ? 12 : 14);
    final reducedMotion =
        (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ||
        View.of(context).platformDispatcher.accessibilityFeatures.reduceMotion;
    final duration = reducedMotion ? Duration.zero : IdsMotion.fast;
    final text = widget.label;
    final label =
        widget.semanticLabel ??
        text ??
        (groupScope == null ? IdsField.controlLabelOf(context) : null);

    return FormField<IdsCheckedState>(
      key: _form,
      initialValue:
          widget.checked ?? widget.defaultChecked ?? IdsCheckedState.unchecked,
      enabled: !disabled,
      autovalidateMode: AutovalidateMode.onUserInteractionIfError,
      onSaved: widget.onSaved == null
          ? null
          : (value) => widget.onSaved!(
              (groupValue ?? widget.checked ?? value) ==
                  IdsCheckedState.checked,
            ),
      validator: (value) {
        if (disabled) return null;
        final checked =
            (groupValue ?? widget.checked ?? value) == IdsCheckedState.checked;
        if (required && !checked) {
          return scope.messages.checkboxRequired;
        }
        return widget.validator?.call(checked);
      },
      builder: (form) {
        final value = groupValue ?? widget.checked ?? form.value!;
        final checked = value == IdsCheckedState.checked;
        final mixed = value == IdsCheckedState.indeterminate;
        final selected = checked || mixed;
        final invalid =
            widget.invalid ||
            (group?.invalid ?? field?.invalid ?? false) ||
            form.hasError;
        _fieldControl?.setInvalid(
          !disabled && (form.hasError || widget.invalid),
        );
        final accent = invalid ? colors.bgDangerSolid : colors.bgPrimarySolid;
        final onAccent = invalid
            ? colors.textOnDangerSolid
            : colors.textOnPrimarySolid;
        final focusColor = invalid ? colors.borderDanger : colors.borderPrimary;
        final outline = variant == IdsVariant.outline;
        final radius = theme.radius.indicator;

        void toggle() {
          final next = !checked;
          form.didChange(
            next ? IdsCheckedState.checked : IdsCheckedState.unchecked,
          );
          group?.owner.toggle(widget.value!, next);
          widget.onCheckedChange?.call(next);
        }

        final activate = readOnly ? null : toggle;

        return Semantics(
          container: true,
          checked: mixed ? null : checked,
          mixed: mixed,
          enabled: !disabled,
          readOnly: readOnly,
          onTap: disabled ? null : activate,
          validationResult: invalid
              ? SemanticsValidationResult.invalid
              : SemanticsValidationResult.none,
          label: label,
          child: IdsInteractive(
            focusNode: _focus,
            autofocus: widget.autofocus,
            activateOnEnter: false,
            excludePointerSemantics: true,
            disabled: disabled,
            onPressed: activate,
            builder: (context, interaction) {
              final state = (
                checked: checked,
                indeterminate: mixed,
                disabled: disabled,
                readOnly: readOnly,
                required: required,
                invalid: invalid,
                hovered: interaction.hovered,
                active: interaction.active,
                focused: interaction.focused,
                focusVisible: interaction.focusVisible,
              );
              final border = interaction.focusVisible
                  ? focusColor
                  : selected
                  ? accent
                  : invalid
                  ? colors.borderDanger
                  : outline
                  ? colors.borderNeutral
                  : const Color(0x00000000);
              final base = outline
                  ? outlineControlBackground(theme)
                  : colors.bgNeutralSoft;
              final foreground = selected ? onAccent : colors.textOnSurface;
              final decoration = ShapeDecoration(
                color: selected ? accent : base,
                shape: theme.shape(
                  radius: radius,
                  side: BorderSide(color: border),
                ),
                shadows: outline ? controlShadowXs : null,
              );
              final styled =
                  widget.style?.call(state, decoration) ?? decoration;
              final box = Opacity(
                opacity: disabled && !(field?.disabled ?? false) ? .5 : 1,
                child: TweenAnimationBuilder<Color?>(
                  tween: ColorTween(
                    end: focusColor.withValues(
                      alpha: interaction.focusVisible ? .4 : 0,
                    ),
                  ),
                  duration: duration,
                  builder: (context, color, child) => CustomPaint(
                    foregroundPainter: ControlFocusRing(
                      styled.shape,
                      color!,
                      direction: Directionality.of(context),
                    ),
                    child: child,
                  ),
                  child: AnimatedContainer(
                    width: size,
                    height: size,
                    duration: duration,
                    decoration: styled,
                    child: Center(
                      child: IconTheme(
                        data: IconThemeData(size: iconSize, color: foreground),
                        child: _CheckboxIndicatorScope(
                          state: state,
                          duration: duration,
                          child:
                              widget.child ??
                              widget.builder?.call(context, state) ??
                              const IdsCheckboxIndicator(),
                        ),
                      ),
                    ),
                  ),
                ),
              );
              return MouseRegion(
                cursor: disabled
                    ? SystemMouseCursors.forbidden
                    : SystemMouseCursors.click,
                child: text == null
                    ? box
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        spacing: theme.dimension(8),
                        children: [
                          box,
                          Flexible(
                            child: ExcludeSemantics(
                              child: IdsLabel(
                                disabled:
                                    disabled && !(field?.disabled ?? false),
                                size: tiny ? IdsSize.tiny : IdsSize.standard,
                                invalid: invalid,
                                child: Text(text),
                              ),
                            ),
                          ),
                        ],
                      ),
              );
            },
          ),
        );
      },
    );
  }
}

class IdsCheckboxIndicator extends StatelessWidget {
  const IdsCheckboxIndicator({super.key, this.child, this.builder, this.style})
    : assert(child == null || builder == null);

  final Widget? child;
  final Widget? Function(BuildContext context, IdsCheckboxState state)? builder;
  final IconThemeData Function(IdsCheckboxState state, IconThemeData base)?
  style;

  @override
  Widget build(BuildContext context) {
    final scope = context
        .dependOnInheritedWidgetOfExactType<_CheckboxIndicatorScope>();
    assert(scope != null, 'IdsCheckboxIndicator must be inside IdsCheckbox.');
    final state = scope!.state;
    final selected = state.checked || state.indeterminate;
    final base = IconTheme.of(context);
    final theme = style?.call(state, base) ?? base;
    return IgnorePointer(
      child: ExcludeSemantics(
        child: AnimatedScale(
          scale: selected ? 1 : .5,
          duration: scope.duration,
          child: AnimatedOpacity(
            opacity: selected ? 1 : 0,
            duration: scope.duration,
            child: IconTheme.merge(
              data: theme,
              child:
                  child ??
                  builder?.call(context, state) ??
                  CustomPaint(
                    size: Size.square(theme.size ?? base.size!),
                    painter: _CheckboxMark(
                      theme.color ?? base.color!,
                      state.indeterminate,
                    ),
                  ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CheckboxIndicatorScope extends InheritedWidget {
  const _CheckboxIndicatorScope({
    required this.state,
    required this.duration,
    required super.child,
  });

  final IdsCheckboxState state;
  final Duration duration;

  @override
  bool updateShouldNotify(_CheckboxIndicatorScope oldWidget) =>
      state != oldWidget.state || duration != oldWidget.duration;
}

class _CheckboxMark extends CustomPainter {
  const _CheckboxMark(this.color, this.mixed);

  final Color color;
  final bool mixed;

  @override
  void paint(Canvas canvas, Size size) {
    final unit = size.width / 16;
    final ink = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5 * unit
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    if (mixed) {
      canvas.drawLine(Offset(3.75, 8) * unit, Offset(12.25, 8) * unit, ink);
      return;
    }
    canvas.drawPath(
      Path()
        ..moveTo(4 * unit, 8.5 * unit)
        ..lineTo(7 * unit, 11.5 * unit)
        ..lineTo(12 * unit, 4 * unit),
      ink,
    );
  }

  @override
  bool shouldRepaint(_CheckboxMark old) =>
      color != old.color || mixed != old.mixed;
}
