import 'package:flutter/widgets.dart';

class Kept extends StatefulWidget {
  const Kept({super.key});

  @override
  State<Kept> createState() => _KeptState();
}

class _KeptState extends State<Kept> {
  @override
  Widget build(BuildContext context) => const SizedBox.square(dimension: 10);
}
