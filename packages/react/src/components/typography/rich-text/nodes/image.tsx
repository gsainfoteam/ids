import { Image } from '../../../data/image';
import { richTextStyle } from '../style';

import type { DocumentNodeProps } from './types';

const PIXELS = /^\d+(\.\d+)?$/;

const cssWidth = (width: unknown) =>
  typeof width === 'number' || (typeof width === 'string' && PIXELS.test(width))
    ? `${width}px`
    : undefined;

const styles = richTextStyle();

export function ImageNode({ node }: DocumentNodeProps) {
  const { src, alt, title } = node.attrs;
  const width = cssWidth(node.attrs.width);
  const image = (
    <Image
      src={src}
      alt={alt ?? ''}
      title={title ?? undefined}
      className={styles.image()}
      style={width ? { width } : undefined}
    />
  );

  if (!title) return image;

  return (
    <figure className={styles.figure()}>
      {image}
      <figcaption className={styles.caption()}>{title}</figcaption>
    </figure>
  );
}
