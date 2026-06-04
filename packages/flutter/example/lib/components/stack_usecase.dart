import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final stackUseCases = [
  WidgetbookUseCase(
    name: 'HStack Playground',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );
      final gap = context.knobs.double.slider(
        label: 'Gap',
        initialValue: 8,
        min: 0,
        max: 32,
      );
      final mainAxis = context.knobs.object.dropdown(
        label: 'Main axis',
        options: MainAxis.values,
        initialOption: MainAxis.start,
        labelBuilder: (a) => a.name,
      );
      final crossAxis = context.knobs.object.dropdown(
        label: 'Cross axis',
        options: CrossAxis.values,
        initialOption: CrossAxis.center,
        labelBuilder: (a) => a.name,
      );
      final textBaseline = context.knobs.object.dropdown(
        label: 'Text baseline',
        options: TextBaseline.values,
        initialOption: TextBaseline.alphabetic,
        labelBuilder: (b) => b.name,
      );
      final fit = context.knobs.object.dropdown(
        label: 'Fit',
        options: IdsStackFit.values,
        initialOption: IdsStackFit.fill,
        labelBuilder: (f) => f.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: _StackFrame(
            width: 360,
            height: 160,
            child: IdsHStack(
              gap: gap,
              mainAxis: mainAxis,
              crossAxis: crossAxis,
              fit: fit,
              textBaseline: textBaseline,
              children: [
                IdsButton(
                  onPressed: () {},
                  children: const [Text('첫 번째')],
                ),
                IdsButton(
                  onPressed: () {},
                  variant: IdsVariant.outline,
                  children: const [Text('두 번째')],
                ),
                IdsButton(
                  onPressed: () {},
                  variant: IdsVariant.ghost,
                  children: const [Text('세 번째')],
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'HStack Alignment',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: IdsHStack(
            gap: 12,
            crossAxis: CrossAxis.center,
            children: [
              _ColorBlock(width: 80, height: 64, variant: _BlockVariant.primary),
              _ColorBlock(width: 80, height: 40, variant: _BlockVariant.secondary),
              _ColorBlock(width: 80, height: 96, variant: _BlockVariant.muted),
            ],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'VStack Playground',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );
      final gap = context.knobs.double.slider(
        label: 'Gap',
        initialValue: 8,
        min: 0,
        max: 32,
      );
      final mainAxis = context.knobs.object.dropdown(
        label: 'Main axis',
        options: MainAxis.values,
        initialOption: MainAxis.start,
        labelBuilder: (a) => a.name,
      );
      final crossAxis = context.knobs.object.dropdown(
        label: 'Cross axis',
        options: CrossAxis.values
            .where((axis) => axis != CrossAxis.baseline)
            .toList(),
        initialOption: CrossAxis.stretch,
        labelBuilder: (a) => a.name,
      );
      final fit = context.knobs.object.dropdown(
        label: 'Fit',
        options: IdsStackFit.values,
        initialOption: IdsStackFit.fill,
        labelBuilder: (f) => f.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: _StackFrame(
            width: 240,
            height: 320,
            child: IdsVStack(
              gap: gap,
              mainAxis: mainAxis,
              crossAxis: crossAxis,
              fit: fit,
              children: [
                IdsButton(
                  onPressed: () {},
                  children: const [Text('첫 번째')],
                ),
                IdsButton(
                  onPressed: () {},
                  variant: IdsVariant.outline,
                  children: const [Text('두 번째')],
                ),
                IdsButton(
                  onPressed: () {},
                  variant: IdsVariant.ghost,
                  children: const [Text('세 번째')],
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'VStack ContentFit',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: IdsVStack(
            gap: 12,
            fit: IdsStackFit.content,
            crossAxis: CrossAxis.start,
            children: [
              IdsButton(
                onPressed: () {},
                children: const [Text('저장')],
              ),
              IdsButton(
                onPressed: () {},
                variant: IdsVariant.outline,
                children: const [Text('취소')],
              ),
              IdsButton(
                onPressed: () {},
                variant: IdsVariant.ghost,
                children: const [Text('초기화')],
              ),
            ],
          ),
        ),
      );
    },
  ),
];

enum _BlockVariant { primary, secondary, muted }

class _ColorBlock extends StatelessWidget {
  const _ColorBlock({
    required this.width,
    required this.height,
    required this.variant,
  });

  final double width;
  final double height;
  final _BlockVariant variant;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    final bgColor = switch (variant) {
      _BlockVariant.primary => theme.primary,
      _BlockVariant.secondary => theme.secondary,
      _BlockVariant.muted => theme.muted,
    };

    return SizedBox(
      width: width,
      height: height,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(6),
        ),
      ),
    );
  }
}

class _StackFrame extends StatelessWidget {
  const _StackFrame({
    required this.width,
    required this.height,
    required this.child,
  });

  final double width;
  final double height;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return SizedBox(
      width: width,
      height: height,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: theme.outline),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: child,
        ),
      ),
    );
  }
}
