import { acceptsFile, parseAccept } from '../../file-field/lib/file-rules';

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'];

export type ImageUpload = (file: File) => Promise<string>;

export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');

const IMAGE_TOKENS = parseAccept(IMAGE_ACCEPT);

export const isImageFile = (file: File) => acceptsFile(file, IMAGE_TOKENS);
