import { RatingItem, type RatingItemProps } from './item';
import { RatingRoot, type RatingState, type RatingItemState, type RatingProps } from './root';
import { ratingStyle } from './style';

export function Rating(props: RatingProps) {
  return <RatingRoot {...props} />;
}

export namespace Rating {
  export type Props = RatingProps;
  export type State = RatingState;
  export type ItemState = RatingItemState;
  export const Item = RatingItem;

  export namespace Item {
    export type Props = RatingItemProps;
  }

  export const Style = ratingStyle;
}

export type { RatingState, RatingItemState, RatingProps } from './root';
