import 'package:flutter/widgets.dart';

import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_typography.dart';

enum IdsEmptyVariant { default_, compact }

class IdsEmpty extends StatelessWidget {
  const IdsEmpty({
    super.key,
    required this.children,
    this.variant = IdsEmptyVariant.default_,
  });

  final List<Widget> children;
  final IdsEmptyVariant variant;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(variant == IdsEmptyVariant.default_ ? 48 : 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: _withGaps(children),
      ),
    );
  }

  List<Widget> _withGaps(List<Widget> widgets) {
    return [
      for (var i = 0; i < widgets.length; i++) ...[
        if (i > 0) SizedBox(height: widgets[i] is IdsEmptyActions ? 18 : 10),
        widgets[i],
      ],
    ];
  }
}

class IdsEmptyMedia extends StatelessWidget {
  const IdsEmptyMedia({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return IconTheme(
      data: IconThemeData(color: theme.onMuted, size: 56),
      child: child,
    );
  }
}

class IdsEmptyTitle extends StatelessWidget {
  const IdsEmptyTitle(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Text(
      data,
      style: IdsTypography.title.copyWith(
        color: theme.onSurface,
        fontWeight: FontWeight.w700,
        leadingDistribution: TextLeadingDistribution.even,
      ),
      textAlign: TextAlign.center,
    );
  }
}

class IdsEmptyDescription extends StatelessWidget {
  const IdsEmptyDescription(this.data, {super.key});

  final String data;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    return Text(
      data,
      style: IdsTypography.body.copyWith(
        color: theme.onMuted,
        leadingDistribution: TextLeadingDistribution.even,
      ),
      textAlign: TextAlign.center,
    );
  }
}

class IdsEmptyActions extends StatelessWidget {
  const IdsEmptyActions({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          children[i],
        ],
      ],
    );
  }
}
