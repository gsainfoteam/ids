import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

class HeldImage extends ImageProvider<HeldImage> {
  final completer = Completer<ImageInfo>();

  @override
  Future<HeldImage> obtainKey(ImageConfiguration configuration) =>
      SynchronousFuture(this);

  @override
  ImageStreamCompleter loadImage(HeldImage key, ImageDecoderCallback decode) =>
      OneFrameImageStreamCompleter(completer.future);
}
