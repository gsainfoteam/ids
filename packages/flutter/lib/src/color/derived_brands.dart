import '../../theme/ids_palette.dart';
import 'color_distance.dart';
import 'palette_seed.dart';

const derivedChromaRatio = 1 / 3;

const tertiaryHueTurn = 60.0;

double _derivedChroma(IdsPalette primary) =>
    chromaRatioOf(primary.colors) * derivedChromaRatio;

IdsPalette derivedSecondary(IdsPalette primary) =>
    IdsPalette(paletteAtHue(hueOf(primary.colors), _derivedChroma(primary)));

bool _closeToAny(IdsPalette palette, Iterable<IdsPalette> others) =>
    others.any((other) => tooClose(palette[comparedStep], other[comparedStep]));

IdsPalette derivedTertiary(IdsPalette primary, Iterable<IdsPalette> others) {
  final hue = hueOf(primary.colors);
  final chroma = _derivedChroma(primary);
  final turned = IdsPalette(paletteAtHue(hue + tertiaryHueTurn, chroma));
  return _closeToAny(turned, others)
      ? IdsPalette(paletteAtHue(hue - tertiaryHueTurn, chroma))
      : turned;
}
