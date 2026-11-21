import 'package:flutter/widgets.dart';
import 'package:ids_flutter/ids.dart';

String showcaseLabel(Object? value) => value is Enum ? value.name : '$value';

class Showcase extends StatelessWidget {
  const Showcase({super.key, required this.children});

  final List<Widget> children;

  static const _maxWidth = 1024.0;

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: _maxWidth),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: IdsProvider.of(context).dimension(48),
        children: children,
      ),
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
    final ids = IdsProvider.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: ids.dimension(16),
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: ids.dimension(4),
          children: [
            Text(
              title,
              style: ids.textStyle(
                IdsTypography.subtitleS2Semibold,
                color: ids.colors.textNeutralStrong,
              ),
            ),
            if (description case final description?)
              Text(
                description,
                style: ids.textStyle(
                  IdsTypography.bodyB3Regular,
                  color: ids.colors.textNeutral,
                ),
              ),
            Padding(
              padding: EdgeInsets.only(top: ids.dimension(4)),
              child: const IdsDivider(decorative: true),
            ),
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: ids.dimension(12),
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
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    return Row(
      spacing: ids.dimension(16),
      children: [
        if (label case final label?) _ShowcaseHeading(label),
        Expanded(
          child: Wrap(
            spacing: ids.dimension(12),
            runSpacing: ids.dimension(12),
            crossAxisAlignment: WrapCrossAlignment.center,
            children: children,
          ),
        ),
      ],
    );
  }
}

class ShowcaseMatrix<R, C> extends StatelessWidget {
  const ShowcaseMatrix({
    super.key,
    required this.rows,
    required this.columns,
    required this.builder,
    this.rowLabel = showcaseLabel,
    this.columnLabel = showcaseLabel,
  });

  final List<R> rows;
  final List<C> columns;
  final Widget Function(R row, C column) builder;
  final String Function(R row) rowLabel;
  final String Function(C column) columnLabel;

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    final cell = EdgeInsetsDirectional.only(
      end: ids.dimension(16),
      bottom: ids.dimension(12),
    );
    final table = Table(
      defaultColumnWidth: const IntrinsicColumnWidth(),
      defaultVerticalAlignment: TableCellVerticalAlignment.middle,
      children: [
        TableRow(
          children: [
            const SizedBox.shrink(),
            for (final column in columns)
              Padding(
                padding: cell,
                child: _ShowcaseHeading(columnLabel(column), fixedWidth: false),
              ),
          ],
        ),
        for (final row in rows)
          TableRow(
            children: [
              Padding(padding: cell, child: _ShowcaseHeading(rowLabel(row))),
              for (final column in columns)
                Padding(padding: cell, child: builder(row, column)),
            ],
          ),
      ],
    );
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: table,
    );
  }
}

class Example extends StatelessWidget {
  const Example({super.key, required this.description, required this.child});

  final String description;
  final Widget child;

  static const _maxWidth = 640.0;

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: _maxWidth),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: ids.dimension(24),
        children: [
          Text(
            description,
            style: ids.textStyle(
              IdsTypography.bodyB3Regular,
              color: ids.colors.textNeutral,
            ),
          ),
          Flexible(child: child),
        ],
      ),
    );
  }
}

class _ShowcaseHeading extends StatelessWidget {
  const _ShowcaseHeading(this.text, {this.fixedWidth = true});

  final String text;
  final bool fixedWidth;

  static const _width = 96.0;

  @override
  Widget build(BuildContext context) {
    final ids = IdsProvider.of(context);
    final heading = Text(
      text,
      style: ids.textStyle(
        IdsTypography.captionC1Medium,
        color: ids.colors.textNeutral,
      ),
    );
    return fixedWidth
        ? SizedBox(width: ids.dimension(_width), child: heading)
        : heading;
  }
}
