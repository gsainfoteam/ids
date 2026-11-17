import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

WidgetbookComponent docs(String component, List<WidgetbookUseCase> stories) =>
    WidgetbookComponent(
      name: component,
      useCases: [
        WidgetbookUseCase(
          name: 'Docs',
          builder: (context) {
            final mode = context.knobs.object.dropdown(
              label: 'Mode',
              options: ids.IdsMode.values,
              initialOption: ids.IdsMode.light,
              labelBuilder: (mode) => mode.name,
            );
            return Theme(
              data: ThemeData(
                brightness: mode == ids.IdsMode.dark
                    ? Brightness.dark
                    : Brightness.light,
                fontFamily: ids.IdsTypography.sansFontFamily,
                package: ids.IdsTypography.sansFontPackage,
              ),
              child: ids.ThemeProvider(
                mode: mode,
                child: Builder(
                  builder: (context) {
                    final theme = ids.ThemeProvider.of(context);
                    return Material(
                      color: theme.surface,
                      textStyle: Theme.of(context).textTheme.bodyLarge!
                          .copyWith(
                            fontSize: 16,
                            height: 1.5,
                            letterSpacing: 0,
                            color: theme.onSurface,
                          ),
                      child: SizedBox.expand(
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            spacing: 16,
                            children: [
                              Text(
                                component,
                                style: ids.IdsTypography.headlineH4Bold,
                              ),
                              for (final story in stories) ...[
                                Container(
                                  margin: const EdgeInsets.only(top: 32),
                                  padding: const EdgeInsets.only(bottom: 8),
                                  decoration: BoxDecoration(
                                    border: Border(
                                      bottom: BorderSide(color: theme.border),
                                    ),
                                  ),
                                  child: Text(
                                    story.name,
                                    style: ids.IdsTypography.headlineH6Semibold,
                                  ),
                                ),
                                Align(
                                  alignment: AlignmentDirectional.topStart,
                                  child: Builder(builder: story.builder),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            );
          },
        ),
      ],
    );

T dropdown<T extends Enum>(
  BuildContext context,
  String label,
  List<T> options, {
  T? initial,
}) => context.knobs.object.dropdown(
  label: label,
  options: options,
  initialOption: initial ?? options.first,
  labelBuilder: (value) => value.name,
);

class Showcase extends StatelessWidget {
  const Showcase({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) => ConstrainedBox(
    constraints: const BoxConstraints(maxWidth: 1024),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 48,
      children: children,
    ),
  );
}

class ShowcaseSection extends StatelessWidget {
  const ShowcaseSection({
    super.key,
    required this.title,
    this.description,
    required this.children,
  });

  final String title;
  final String? description;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = ids.ThemeProvider.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 16,
      children: [
        Container(
          padding: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: theme.border)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: 4,
            children: [
              Text(title, style: ids.IdsTypography.subtitleS2Semibold),
              if (description != null)
                Text(
                  description!,
                  style: ids.IdsTypography.bodyB3Regular.copyWith(
                    color: theme.onMuted,
                  ),
                ),
            ],
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: 12,
          children: children,
        ),
      ],
    );
  }
}

class ShowcaseRow extends StatelessWidget {
  const ShowcaseRow({super.key, this.label, required this.children});

  final String? label;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Row(
    spacing: 16,
    children: [
      if (label != null) SizedBox(width: 96, child: _Caption(label!)),
      Expanded(
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: children,
        ),
      ),
    ],
  );
}

class ShowcaseMatrix<R, C> extends StatelessWidget {
  const ShowcaseMatrix({
    super.key,
    required this.rows,
    required this.columns,
    required this.builder,
  });

  final List<R> rows;
  final List<C> columns;
  final Widget Function(R row, C column) builder;

  static String _name(Object? value) =>
      value is Enum ? value.name : value.toString();

  Widget _cell(Widget child, {required bool top, required bool end}) => Padding(
    padding: EdgeInsetsDirectional.only(top: top ? 0 : 12, end: end ? 0 : 16),
    child: Align(alignment: AlignmentDirectional.centerStart, child: child),
  );

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    scrollDirection: Axis.horizontal,
    child: Table(
      defaultColumnWidth: const IntrinsicColumnWidth(),
      columnWidths: const {0: FixedColumnWidth(96 + 16)},
      defaultVerticalAlignment: TableCellVerticalAlignment.middle,
      children: [
        TableRow(
          children: [
            const SizedBox.shrink(),
            for (final column in columns)
              _cell(
                _Caption(_name(column)),
                top: true,
                end: column == columns.last,
              ),
          ],
        ),
        for (final row in rows)
          TableRow(
            children: [
              _cell(_Caption(_name(row)), top: false, end: false),
              for (final column in columns)
                _cell(
                  builder(row, column),
                  top: false,
                  end: column == columns.last,
                ),
            ],
          ),
      ],
    ),
  );
}

class _Caption extends StatelessWidget {
  const _Caption(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Text(
    text,
    style: ids.IdsTypography.captionC1Medium.copyWith(
      color: ids.ThemeProvider.of(context).onMuted,
    ),
  );
}

class PaintedImage extends ImageProvider<PaintedImage> {
  const PaintedImage(this.name, this.size, this.paint);

  final String name;
  final Size size;
  final void Function(Canvas canvas, Size size) paint;

  @override
  Future<PaintedImage> obtainKey(ImageConfiguration configuration) =>
      SynchronousFuture(this);

  @override
  ImageStreamCompleter loadImage(
    PaintedImage key,
    ImageDecoderCallback decode,
  ) => OneFrameImageStreamCompleter(_render());

  Future<ImageInfo> _render() async {
    final recorder = ui.PictureRecorder();
    paint(Canvas(recorder), size);
    final picture = recorder.endRecording();
    final image = await picture.toImage(
      size.width.round(),
      size.height.round(),
    );
    picture.dispose();
    return ImageInfo(image: image);
  }

  @override
  bool operator ==(Object other) => other is PaintedImage && other.name == name;

  @override
  int get hashCode => name.hashCode;
}

ImageProvider portrait(double hue) =>
    PaintedImage('portrait-$hue', const Size.square(160), (canvas, size) {
      final figure = Paint()
        ..color = HSLColor.fromAHSL(1, hue, 0.4, 0.36).toColor();
      canvas
        ..drawRect(
          Offset.zero & size,
          Paint()..color = HSLColor.fromAHSL(1, hue, 0.7, 0.78).toColor(),
        )
        ..drawCircle(const Offset(80, 66), 30, figure)
        ..drawPath(
          Path()
            ..moveTo(22, 160)
            ..relativeCubicTo(6, -36, 31, -54, 58, -54)
            ..relativeCubicTo(27, 0, 52, 18, 58, 54)
            ..close(),
          figure,
        );
    });

void _paintNothing(Canvas canvas, Size size) {}

const brokenImage = PaintedImage('broken', Size.zero, _paintNothing);

class StandInButton extends StatelessWidget {
  const StandInButton({
    super.key,
    this.variant = ids.IdsVariant.solid,
    this.size = ids.IdsSize.standard,
    this.icon,
    required this.onPressed,
    required this.child,
  });

  final ids.IdsVariant variant;
  final ids.IdsSize size;
  final Widget? icon;
  final VoidCallback? onPressed;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final tiny = size == ids.IdsSize.tiny;
    final style = ButtonStyle(
      minimumSize: WidgetStatePropertyAll(Size(0, tiny ? 32 : 36)),
      padding: WidgetStatePropertyAll(
        EdgeInsets.symmetric(horizontal: tiny ? 12 : 16),
      ),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: VisualDensity.standard,
      textStyle: WidgetStatePropertyAll(
        tiny ? ids.IdsTypography.buttonTiny : ids.IdsTypography.buttonStandard,
      ),
    );
    final label = icon == null
        ? child
        : Row(
            mainAxisSize: MainAxisSize.min,
            spacing: tiny ? 6 : 8,
            children: [
              IconTheme.merge(
                data: IconThemeData(size: tiny ? 14 : 16),
                child: ExcludeSemantics(child: icon),
              ),
              child,
            ],
          );
    final button = switch (variant) {
      ids.IdsVariant.solid || ids.IdsVariant.glossy => FilledButton.new,
      ids.IdsVariant.soft => FilledButton.tonal,
      ids.IdsVariant.outline => OutlinedButton.new,
      ids.IdsVariant.ghost => TextButton.new,
    };
    return button(onPressed: onPressed, style: style, child: label);
  }
}

class StandInIconButton extends StatelessWidget {
  const StandInIconButton({
    super.key,
    required this.icon,
    required this.label,
    this.size = ids.IdsSize.standard,
    this.disabled = false,
    this.onPressed,
  });

  final Widget icon;
  final String label;
  final ids.IdsSize size;
  final bool disabled;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final tiny = size == ids.IdsSize.tiny;
    return IconButton(
      onPressed: disabled ? null : onPressed ?? () {},
      tooltip: label,
      iconSize: tiny ? 14 : 16,
      padding: EdgeInsets.zero,
      constraints: BoxConstraints.tight(Size.square(tiny ? 32 : 36)),
      style: const ButtonStyle(tapTargetSize: MaterialTapTargetSize.shrinkWrap),
      icon: ExcludeSemantics(child: icon),
    );
  }
}

class StandInSwitch extends StatefulWidget {
  const StandInSwitch({super.key, required this.label, this.initial = false});

  final String label;
  final bool initial;

  @override
  State<StandInSwitch> createState() => _StandInSwitchState();
}

class _StandInSwitchState extends State<StandInSwitch> {
  late var _checked = widget.initial;

  @override
  Widget build(BuildContext context) => Semantics(
    label: widget.label,
    child: Switch(
      value: _checked,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      onChanged: (checked) => setState(() => _checked = checked),
    ),
  );
}

class StandInTextField extends StatelessWidget {
  const StandInTextField({
    super.key,
    this.controller,
    this.onChanged,
    this.placeholder,
    this.icon,
    this.disabled = false,
  });

  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String? placeholder;
  final IconData? icon;
  final bool disabled;

  @override
  Widget build(BuildContext context) => TextField(
    enabled: !disabled,
    controller: controller,
    onChanged: onChanged,
    decoration: InputDecoration(
      hintText: placeholder,
      prefixIcon: icon == null ? null : Icon(icon),
    ),
  );
}

class StandInChip extends StatelessWidget {
  const StandInChip({
    super.key,
    this.size = ids.IdsSize.standard,
    required this.child,
  });

  final ids.IdsSize size;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final tiny = size == ids.IdsSize.tiny;
    return Chip(
      label: child,
      labelStyle: tiny
          ? ids.IdsTypography.captionC2Medium
          : ids.IdsTypography.captionC1Medium,
      labelPadding: EdgeInsets.symmetric(horizontal: tiny ? 2 : 4),
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
    );
  }
}

class StandInKbd extends StatelessWidget {
  const StandInKbd(this.keys, {super.key});

  final String keys;

  @override
  Widget build(BuildContext context) =>
      Text(keys, style: ids.IdsTypography.captionC2Medium);
}
