import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final stackUseCases = [
  WidgetbookUseCase(
    name: 'HStack',
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
              children: const [
                _StackTile(label: 'A', width: 64, height: 64),
                _StackTile(label: 'B', width: 64, height: 40),
                _StackTile(label: 'C', width: 64, height: 88),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'VStack',
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
              children: const [
                _StackTile(label: 'A', width: 64, height: 48),
                _StackTile(label: 'B', width: 96, height: 48),
                _StackTile(label: 'C', width: 128, height: 48),
              ],
            ),
          ),
        ),
      );
    },
  ),
];

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

class _StackTile extends StatelessWidget {
  const _StackTile({
    required this.label,
    required this.width,
    required this.height,
  });

  final String label;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return SizedBox(
      width: width,
      height: height,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: theme.secondary,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: theme.onSecondary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}
