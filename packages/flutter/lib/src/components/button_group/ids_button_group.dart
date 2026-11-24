import 'package:flutter/widgets.dart';

import '../group/ids_group.dart';

class IdsButtonGroup extends IdsGroup {
  const IdsButtonGroup({
    super.key,
    super.orientation,
    super.attached,
    super.size,
    super.variant,
    super.semanticLabel,
    super.decorativeSeparator,
    required super.children,
  });

  static Widget separator({Key? key, Widget? child}) =>
      IdsGroupSeparator(key: key, child: child);
}
