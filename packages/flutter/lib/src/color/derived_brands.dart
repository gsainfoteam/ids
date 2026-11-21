import '../../theme/ids_palette.dart';
import 'color_distance.dart';
import 'palette_seed.dart';

const derivedChromaRatio = 1 / 3;

const tertiaryHueTurn = 60.0;

double _derivedChroma(IdsRamp primary) =>
    chromaRatioOf(primary.colors) * derivedChromaRatio;

IdsRamp derivedSecondary(IdsRamp primary) =>
    IdsRamp(rampAtHue(hueOf(primary.colors), _derivedChroma(primary)));

bool _closeToAny(IdsRamp palette, Iterable<IdsRamp> others) =>
    others.any((other) => tooClose(palette[comparedStep], other[comparedStep]));

IdsRamp derivedTertiary(IdsRamp primary, Iterable<IdsRamp> others) {
  final hue = hueOf(primary.colors);
  final chroma = _derivedChroma(primary);
  final turned = IdsRamp(rampAtHue(hue + tertiaryHueTurn, chroma));
  return _closeToAny(turned, others)
      ? IdsRamp(rampAtHue(hue - tertiaryHueTurn, chroma))
      : turned;
}
