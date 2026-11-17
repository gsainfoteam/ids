import 'package:flutter/widgets.dart';

Widget coveringItsBox(Widget child) => child is Image && child.fit == null
    ? Image(
        key: child.key,
        image: child.image,
        frameBuilder: child.frameBuilder,
        loadingBuilder: child.loadingBuilder,
        errorBuilder: child.errorBuilder,
        semanticLabel: child.semanticLabel,
        excludeFromSemantics: child.excludeFromSemantics,
        width: child.width,
        height: child.height,
        color: child.color,
        opacity: child.opacity,
        colorBlendMode: child.colorBlendMode,
        fit: BoxFit.cover,
        alignment: child.alignment,
        repeat: child.repeat,
        centerSlice: child.centerSlice,
        matchTextDirection: child.matchTextDirection,
        gaplessPlayback: child.gaplessPlayback,
        isAntiAlias: child.isAntiAlias,
        filterQuality: child.filterQuality,
      )
    : child;
