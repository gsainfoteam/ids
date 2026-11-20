import { StarterKit } from '@tiptap/starter-kit';

import { isAllowedLinkHref } from './image-source';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const documentStarterKit = (levels: Level[]) =>
  StarterKit.configure({
    heading: { levels },
    gapcursor: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      isAllowedUri: (url) => isAllowedLinkHref(url),
    },
  });
