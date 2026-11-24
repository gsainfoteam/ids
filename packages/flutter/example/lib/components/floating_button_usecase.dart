import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

const _variants = [
  IdsVariant.solid,
  IdsVariant.soft,
  IdsVariant.outline,
  IdsVariant.glossy,
];
const _schemes = [
  IdsColorScheme.primary,
  IdsColorScheme.secondary,
  IdsColorScheme.tertiary,
  IdsColorScheme.neutral,
  IdsColorScheme.danger,
  IdsColorScheme.success,
  IdsColorScheme.warning,
  IdsColorScheme.info,
];

final floatingButtonUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final placement = context.knobs.object.dropdown(
        label: 'Placement',
        options: IdsFloatingPlacement.values,
        initialOption: IdsFloatingPlacement.bottomRight,
      );
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
      );
      final colorScheme = context.knobs.object.dropdown(
        label: 'Color scheme',
        options: _schemes,
      );
      final variant = context.knobs.object.dropdown(
        label: 'Variant',
        options: _variants,
      );
      final disabled = context.knobs.boolean(label: 'Disabled');
      return themed(
        context,
        _frame([
          IdsFloatingButton(
            placement: placement,
            size: size,
            variant: variant,
            colorScheme: colorScheme,
            disabled: disabled,
            onPressed: () {},
            semanticLabel:
                context.strings.demo.floatingButtonSample.createAPost,
            child: const Icon(Icons.add),
          ),
        ]),
        width: 384,
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) {
      final matrixSize = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
      );
      return themed(
        context,
        SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 12,
            children: [
              const Text('Variant × Color scheme'),
              Text(
                context
                    .strings
                    .demo
                    .floatingButtonSample
                    .floatingButtonsUseOpaqueBackgrounds,
              ),
              galleryRow('', [
                for (final variant in _variants)
                  SizedBox(width: 56, child: Text(variant.name)),
              ]),
              for (final scheme in _schemes)
                galleryRow(scheme.name, [
                  for (final variant in _variants)
                    IdsFloatingButton(
                      placement: null,
                      colorScheme: scheme,
                      variant: variant,
                      size: matrixSize,
                      semanticLabel: scheme.name,
                      onPressed: () {},
                      child: const Icon(Icons.add),
                    ),
                ]),
              const Text('Shape × Size'),
              for (final size in IdsSize.values)
                galleryRow(size.name, [
                  IdsFloatingButton(
                    placement: null,
                    semanticLabel:
                        context.strings.demo.floatingButtonSample.createAPost,
                    size: size,
                    onPressed: () {},
                    child: const Icon(Icons.add),
                  ),
                  IdsFloatingButton(
                    placement: null,
                    size: size,
                    leading: const Icon(Icons.add),
                    onPressed: () {},
                    child: Text(
                      context.strings.demo.floatingButtonSample.createAPost,
                    ),
                  ),
                  IdsFloatingButton(
                    placement: null,
                    size: size,
                    leading: const Icon(Icons.chat_bubble_outline),
                    variant: IdsVariant.outline,
                    onPressed: () {},
                    child: Text(
                      context.strings.demo.floatingButtonSample.contactUs,
                    ),
                  ),
                ]),
              const Text('States'),
              galleryRow('disabled', [
                IdsFloatingButton(
                  placement: null,
                  disabled: true,
                  semanticLabel:
                      context.strings.demo.floatingButtonSample.createAPost,
                  child: Icon(Icons.add),
                ),
                IdsFloatingButton(
                  placement: null,
                  variant: IdsVariant.soft,
                  disabled: true,
                  leading: Icon(Icons.add),
                  child: Text(
                    context.strings.demo.floatingButtonSample.createAPost,
                  ),
                ),
              ]),
              galleryRow('loading', [
                IdsFloatingButton(
                  placement: null,
                  disabled: true,
                  busy: true,
                  semanticLabel:
                      context.strings.demo.floatingButtonSample.uploading,
                  child: IdsSpinner(decorative: true),
                ),
                IdsFloatingButton(
                  placement: null,
                  disabled: true,
                  busy: true,
                  leading: IdsSpinner(decorative: true),
                  child: Text(
                    context.strings.demo.floatingButtonSample.uploading,
                  ),
                ),
              ]),
              const Text('Placement'),
              _frame(_placements()),
            ],
          ),
        ),
        width: 600,
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Placement',
    builder: (context) => themed(context, _frame(_placements()), width: 384),
  ),
  WidgetbookUseCase(
    name: 'Right to left',
    builder: (context) => themed(
      context,
      Directionality(
        textDirection: TextDirection.rtl,
        child: _frame([
          IdsFloatingButton(
            onPressed: () {},
            semanticLabel: context.strings.demo.floatingButtonSample.compose,
            child: const Icon(Icons.add),
          ),
        ]),
      ),
      width: 384,
    ),
  ),
  WidgetbookUseCase(
    name: 'Shape',
    builder: (context) => themed(
      context,
      _frame([
        IdsFloatingButton(
          placement: IdsFloatingPlacement.bottomLeft,
          onPressed: () {},
          semanticLabel: context.strings.demo.floatingButtonSample.compose,
          child: const Icon(Icons.add),
        ),
        IdsFloatingButton(
          leading: const Icon(Icons.file_upload_outlined),
          onPressed: () {},
          child: Text(context.strings.demo.floatingButtonSample.upload),
        ),
      ]),
      width: 384,
    ),
  ),
  WidgetbookUseCase(
    name: 'Automatic label',
    builder: (context) => themed(
      context,
      _frame([
        IdsFloatingButton(
          placement: IdsFloatingPlacement.bottomLeft,
          onPressed: () {},
          child: const Icon(Icons.edit, semanticLabel: 'Compose'),
        ),
        IdsFloatingButton(
          onPressed: () {},
          child: const Icon(Icons.add, semanticLabel: 'Plus'),
        ),
      ]),
      width: 384,
    ),
  ),
  WidgetbookUseCase(
    name: 'Loading',
    builder: (context) => themed(context, const _UploadFrame(), width: 384),
  ),
  WidgetbookUseCase(
    name: 'Disabled action',
    builder: (context) => themed(
      context,
      _frame([
        IdsFloatingButton(
          onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                context.strings.demo.floatingButtonSample.createAPost,
              ),
            ),
          ),
          disabled: context.knobs.boolean(
            label: 'Disabled',
            initialValue: true,
          ),
          leading: const Icon(Icons.add),
          child: Text(context.strings.demo.floatingButtonSample.createAPost),
        ),
      ]),
      width: 384,
    ),
  ),
];

class _UploadFrame extends StatefulWidget {
  const _UploadFrame();

  @override
  State<_UploadFrame> createState() => _UploadFrameState();
}

class _UploadFrameState extends State<_UploadFrame> {
  bool _uploading = false;

  Future<void> _upload() async {
    setState(() => _uploading = true);
    await Future<void>.delayed(const Duration(milliseconds: 800));
    if (mounted) setState(() => _uploading = false);
  }

  @override
  Widget build(BuildContext context) => _frame([
    IdsFloatingButton(
      disabled: _uploading,
      busy: _uploading,
      focusableWhenDisabled: true,
      onPressed: _upload,
      leading: _uploading
          ? const IdsSpinner(decorative: true)
          : const Icon(Icons.check),
      child: Text(
        _uploading
            ? context.strings.demo.floatingButtonSample.uploading
            : context.strings.demo.floatingButtonSample.upload,
      ),
    ),
  ]);
}

List<Widget> _placements() => [
  for (final placement in IdsFloatingPlacement.values)
    IdsFloatingButton(
      placement: placement,
      size: IdsSize.tiny,
      onPressed: () {},
      semanticLabel: placement.name,
      child: const Icon(Icons.add),
    ),
];

Widget _frame(List<Widget> buttons) => Builder(
  builder: (context) {
    final theme = IdsProvider.of(context);
    return SizedBox(
      width: 384,
      height: 256,
      child: DecoratedBox(
        decoration: ShapeDecoration(
          color: theme.colors.bgNeutralSoft.withValues(alpha: .4),
          shape: theme.resolved.shape(
            side: BorderSide(color: theme.colors.borderNeutral),
          ),
        ),
        child: Stack(fit: StackFit.expand, children: buttons),
      ),
    );
  },
);
