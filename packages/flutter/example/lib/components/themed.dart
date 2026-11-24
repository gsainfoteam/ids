import 'package:flutter/material.dart';

import '../catalog/strings.dart';

Widget themed(BuildContext context, Widget child, {double width = 320}) =>
    Center(
      child: SizedBox(width: width, child: child),
    );

Widget galleryRow(String label, List<Widget> children) => Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SizedBox(width: 100, child: Text(label)),
    ...children,
  ],
);

void openGalleryLink(BuildContext context) {
  Navigator.of(context).push<void>(
    MaterialPageRoute<void>(
      builder: (context) => Scaffold(
        appBar: AppBar(title: const Text('Gallery')),
        body: Center(
          child: Text(context.strings.demo.themedSample.linkDestination),
        ),
      ),
    ),
  );
}
