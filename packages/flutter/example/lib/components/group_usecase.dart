import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final groupUseCases = [
  WidgetbookUseCase(
    name: 'Orientation and spacing',
    builder: (context) => themed(
      context,
      GroupPreview(
        orientation: context.knobs.object.dropdown(
          label: 'Orientation',
          options: Axis.values,
          labelBuilder: (value) => value.name,
        ),
        attached: context.knobs.boolean(label: 'Attached', initialValue: true),
      ),
    ),
  ),
];

class GroupPreview extends StatefulWidget {
  const GroupPreview({
    super.key,
    required this.orientation,
    required this.attached,
  });

  final Axis orientation;
  final bool attached;

  @override
  State<GroupPreview> createState() => _GroupPreviewState();
}

class _GroupPreviewState extends State<GroupPreview> {
  String selected = 'None';

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    spacing: 16,
    children: [
      IdsGroup(
        orientation: widget.orientation,
        attached: widget.attached,
        semanticLabel: 'Example actions',
        children: [
          TextButton(
            onPressed: () => setState(() => selected = 'One'),
            child: const Text('One'),
          ),
          if (widget.attached) const IdsGroupSeparator(),
          TextButton(
            onPressed: () => setState(() => selected = 'Two'),
            child: const Text('Two'),
          ),
        ],
      ),
      Text('Action: $selected'),
    ],
  );
}
