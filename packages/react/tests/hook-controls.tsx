import {
  ChipField,
  Slider,
  useChipField,
  useSlider,
  type UseChipFieldOptions,
  type UseSliderOptions,
} from '../src';

export function ChipFieldWith({
  create,
  maxCount,
  ...props
}: ChipField.Props & UseChipFieldOptions) {
  const chipField = useChipField({ create, maxCount });

  return <ChipField {...props} chipField={chipField} />;
}

export function SliderWith<V extends Slider.Value = number>({
  largeStep,
  minStepsBetweenThumbs,
  formatLabel,
  ...props
}: Slider.Props<V> & UseSliderOptions) {
  const slider = useSlider({ largeStep, minStepsBetweenThumbs, formatLabel });

  return <Slider {...props} slider={slider} />;
}
