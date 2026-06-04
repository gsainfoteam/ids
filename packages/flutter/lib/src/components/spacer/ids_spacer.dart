import 'package:flutter/widgets.dart';

class IdsSpacer extends StatelessWidget {
  const IdsSpacer({super.key, this.flex = 1});

  final int flex;

  @override
  Widget build(BuildContext context) {
    return Expanded(flex: flex, child: const SizedBox.shrink());
  }
}
