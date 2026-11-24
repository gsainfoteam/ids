import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import '../../../theme/ids_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../../interaction/control_surface.dart';
import '../../interaction/control_tokens.dart';
import '../../interaction/ids_interactive.dart';
import '../field/ids_field.dart';
import '../group/ids_group.dart';
import '../icon_button/ids_icon_button.dart';

class IdsTextField extends StatefulWidget implements IdsGroupedControl {
  const IdsTextField({
    super.key,
    this.controller,
    this.defaultValue,
    this.focusNode,
    this.onValueChange,
    this.onSubmitted,
    this.onSaved,
    this.validator,
    this.placeholder,
    this.semanticLabel,
    this.clearable = false,
    this.leading,
    this.trailing,
    this.size,
    this.variant = IdsVariant.outline,
    this.disabled = false,
    this.invalid = false,
    this.required = false,
    this.readOnly = false,
    this.autofocus = false,
    this.keyboardType,
    this.textInputAction,
    this.inputFormatters,
    this.autofillHints,
  }) : assert(controller == null || defaultValue == null),
       assert(
         variant == IdsVariant.outline ||
             variant == IdsVariant.soft ||
             variant == IdsVariant.ghost,
       );

  final TextEditingController? controller;
  final String? defaultValue;
  final FocusNode? focusNode;
  final ValueChanged<String>? onValueChange;
  final ValueChanged<String>? onSubmitted;
  final FormFieldSetter<String>? onSaved;
  final FormFieldValidator<String>? validator;
  final String? placeholder;
  final String? semanticLabel;
  final bool clearable;
  final Widget? leading;
  final Widget? trailing;
  final IdsSize? size;
  final IdsVariant variant;
  final bool disabled;
  final bool invalid;
  final bool required;
  final bool readOnly;
  final bool autofocus;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final List<TextInputFormatter>? inputFormatters;
  final Iterable<String>? autofillHints;

  @override
  State<IdsTextField> createState() => _IdsTextFieldState();
}

class _IdsTextFieldState extends State<IdsTextField> {
  TextEditingController? _ownedController;
  FocusNode? _ownedFocus;
  FieldControlBinding? _fieldControl;
  String? _externalInitialValue;

  TextEditingController get _controller =>
      widget.controller ?? _ownedController!;
  FocusNode get _focus => widget.focusNode ?? _ownedFocus!;

  @override
  void initState() {
    super.initState();
    if (widget.controller == null) {
      _ownedController = TextEditingController(text: widget.defaultValue);
    } else {
      _externalInitialValue = _controller.text;
    }
    if (widget.focusNode == null) _ownedFocus = FocusNode();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _bindField();
  }

  @override
  void didUpdateWidget(IdsTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      if (widget.controller == null) {
        _ownedController = TextEditingController.fromValue(
          oldWidget.controller!.value,
        );
      } else {
        _ownedController?.dispose();
        _ownedController = null;
      }
      _externalInitialValue = widget.controller?.text;
    }
    if (widget.focusNode != oldWidget.focusNode) {
      _fieldControl?.dispose();
      _fieldControl = null;
      _ownedFocus?.dispose();
      _ownedFocus = widget.focusNode == null ? FocusNode() : null;
      _bindField();
    }
  }

  void _bindField() {
    _fieldControl = bindFieldControl(context, _focus, _fieldControl);
  }

  @override
  void dispose() {
    _fieldControl?.dispose();
    _ownedController?.dispose();
    _ownedFocus?.dispose();
    super.dispose();
  }

  void _clear(FormFieldState<String> form) {
    _controller.clear();
    _focus.requestFocus();
    form.didChange('');
    widget.onValueChange?.call('');
  }

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    final theme = scope.resolved;
    final colors = theme.colors;
    final field = IdsField.maybeOf(context);
    final groupItem = IdsGroupItem.of(context);
    final direction = Directionality.of(context);
    final tiny =
        (widget.size ?? field?.size ?? IdsGroup.sizeOf(context)) ==
        IdsSize.tiny;
    final disabled = widget.disabled || (field?.disabled ?? false);
    final required = widget.required || (field?.required ?? false);
    final initialValue = _externalInitialValue ?? widget.defaultValue ?? '';
    final requiredMessage = scope.messages.textFieldRequired;
    final clearLabel = scope.messages.commonClear;
    final label = widget.semanticLabel ?? IdsField.controlLabelOf(context);
    final textStyle = theme.textStyle(
      tiny ? IdsTypography.captionC1Regular : IdsTypography.bodyB3Regular,
      color: colors.textOnSurface,
    );
    final reducedMotion =
        (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ||
        View.of(context).platformDispatcher.accessibilityFeatures.reduceMotion;
    final padding = theme.dimension(tiny ? 10 : 12);
    final actionSize = theme.dimension(tiny ? 24 : 28);
    final height = theme.dimension(tiny ? 32 : 36);
    final iconTheme = IconThemeData(
      size: theme.dimension(tiny ? 14 : 16),
      color: colors.textNeutral,
    );

    return FormField<String>(
      initialValue: initialValue,
      enabled: !disabled,
      onReset: () => _controller.text = initialValue,
      onSaved: widget.onSaved == null
          ? null
          : (_) => widget.onSaved!(_controller.text),
      validator: (_) {
        if (disabled) return null;
        final value = _controller.text;
        return required && value.isEmpty
            ? requiredMessage
            : widget.validator?.call(value);
      },
      builder: (form) {
        _fieldControl?.setInvalid(
          !disabled && (form.hasError || widget.invalid),
        );
        final invalid =
            widget.invalid || (field?.invalid ?? false) || form.hasError;
        final ring = invalid ? colors.borderDanger : colors.borderPrimary;
        final variant = widget.variant;
        final background = switch (variant) {
          IdsVariant.outline => outlineControlBackground(theme),
          IdsVariant.soft => colors.bgNeutralSoft,
          _ => const Color(0x00000000),
        };
        final input = _input(
          form,
          label,
          textStyle,
          colors.textNeutral,
          ring,
          colors.bgPrimarySolid.withValues(alpha: .3),
          disabled,
          invalid,
        );
        final control = IdsInteractive(
          disabled: disabled,
          focusOnTap: false,
          builder: (context, _) => ListenableBuilder(
            listenable: _focus,
            builder: (context, _) {
              final focused = _focus.hasPrimaryFocus && !disabled;
              final border = focused || invalid
                  ? ring
                  : variant == IdsVariant.outline
                  ? colors.borderNeutral
                  : const Color(0x00000000);
              final shape = theme.shape(
                side: BorderSide(color: border),
                corners: groupItem?.corners(theme.radius.standard),
              );
              return CustomPaint(
                foregroundPainter: ControlFocusRing(
                  shape,
                  ring.withValues(alpha: focused ? .4 : 0),
                  direction: direction,
                ),
                child: AnimatedContainer(
                  duration: reducedMotion ? Duration.zero : IdsMotion.fast,
                  constraints: BoxConstraints(minHeight: height),
                  decoration: ShapeDecoration(
                    color: background,
                    shape: shape,
                    shadows: variant == IdsVariant.outline
                        ? controlShadowXs
                        : const [],
                  ),
                  child: IdsGroup.reset(
                    child: TextFieldTapRegion(
                      child: GestureDetector(
                        behavior: HitTestBehavior.translucent,
                        excludeFromSemantics: true,
                        onTap: disabled ? null : _focus.requestFocus,
                        child: IconTheme(
                          data: iconTheme,
                          child: ValueListenableBuilder(
                            valueListenable: _controller,
                            child: input,
                            builder: (context, value, input) {
                              final showClear =
                                  widget.clearable &&
                                  !disabled &&
                                  !widget.readOnly &&
                                  value.text.isNotEmpty;
                              return Padding(
                                padding: EdgeInsetsDirectional.only(
                                  start: padding,
                                  end: showClear ? theme.dimension(4) : padding,
                                ),
                                child: Row(
                                  spacing: theme.dimension(tiny ? 6 : 8),
                                  children: [
                                    ?widget.leading,
                                    Expanded(child: input!),
                                    ?widget.trailing,
                                    if (showClear)
                                      ExcludeFocus(
                                        child: SizedBox.square(
                                          dimension: actionSize,
                                          child: IdsIconButton(
                                            variant: IdsVariant.ghost,
                                            size: tiny
                                                ? IdsSize.tiny
                                                : IdsSize.standard,
                                            icon: Icon(
                                              Icons.close,
                                              color: colors.textNeutral,
                                            ),
                                            semanticLabel: clearLabel,
                                            onPressed: () => _clear(form),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        );
        return Opacity(
          opacity: widget.disabled && !(field?.disabled ?? false) ? .5 : 1,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: theme.dimension(field == null ? 4 : 8),
            children: [
              control,
              if (form.errorText case final error?)
                Semantics(
                  liveRegion: true,
                  child: Text(
                    error,
                    style: field == null
                        ? theme.textStyle(
                            IdsTypography.captionC1Regular,
                            color: colors.textDanger,
                          )
                        : DefaultTextStyle.of(
                            context,
                          ).style.copyWith(color: colors.textDanger),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _input(
    FormFieldState<String> form,
    String? label,
    TextStyle textStyle,
    Color muted,
    Color cursorColor,
    Color selectionColor,
    bool disabled,
    bool invalid,
  ) {
    return Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onKeyEvent: (_, event) {
        final composing = _controller.value.composing;
        if (event is! KeyDownEvent ||
            event.logicalKey != LogicalKeyboardKey.escape ||
            !widget.clearable ||
            disabled ||
            widget.readOnly ||
            _controller.text.isEmpty ||
            (composing.isValid && !composing.isCollapsed)) {
          return KeyEventResult.ignored;
        }
        _clear(form);
        return KeyEventResult.handled;
      },
      child: Semantics(
        label: label,
        validationResult: invalid
            ? SemanticsValidationResult.invalid
            : SemanticsValidationResult.none,
        child: Material(
          type: MaterialType.transparency,
          child: DefaultSelectionStyle(
            selectionColor: selectionColor,
            child: TextField(
              controller: _controller,
              focusNode: _focus,
              enabled: !disabled,
              readOnly: widget.readOnly,
              autofocus: widget.autofocus,
              style: textStyle,
              cursorColor: cursorColor,
              keyboardType: widget.keyboardType,
              textInputAction: widget.textInputAction,
              inputFormatters: widget.inputFormatters,
              autofillHints: widget.autofillHints,
              onSubmitted: widget.onSubmitted,
              onChanged: (value) {
                form.didChange(value);
                widget.onValueChange?.call(value);
              },
              decoration: InputDecoration(
                isCollapsed: true,
                border: InputBorder.none,
                hintText: widget.placeholder,
                hintStyle: textStyle.copyWith(color: muted),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
