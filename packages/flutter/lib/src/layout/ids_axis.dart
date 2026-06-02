import 'package:flutter/widgets.dart';

enum MainAxis { start, center, end, between, around, evenly }

enum CrossAxis { start, center, end, stretch, baseline }

enum IdsStackFit { fill, content }

extension IdsMainAxisAlignment on MainAxis {
  MainAxisAlignment get alignment => switch (this) {
    MainAxis.start => MainAxisAlignment.start,
    MainAxis.center => MainAxisAlignment.center,
    MainAxis.end => MainAxisAlignment.end,
    MainAxis.between => MainAxisAlignment.spaceBetween,
    MainAxis.around => MainAxisAlignment.spaceAround,
    MainAxis.evenly => MainAxisAlignment.spaceEvenly,
  };
}

extension IdsCrossAxisAlignment on CrossAxis {
  CrossAxisAlignment get alignment => switch (this) {
    CrossAxis.start => CrossAxisAlignment.start,
    CrossAxis.center => CrossAxisAlignment.center,
    CrossAxis.end => CrossAxisAlignment.end,
    CrossAxis.stretch => CrossAxisAlignment.stretch,
    CrossAxis.baseline => CrossAxisAlignment.center,
  };
}

extension IdsStackMainAxisSize on IdsStackFit {
  MainAxisSize get mainAxisSize => switch (this) {
    IdsStackFit.fill => MainAxisSize.max,
    IdsStackFit.content => MainAxisSize.min,
  };
}
