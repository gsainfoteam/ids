import { StarterKit } from '@tiptap/starter-kit';

import { isAllowedLinkHref } from './url-rules';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const documentStarterKit = (levels: Level[], { codeBlock = true } = {}) =>
  StarterKit.configure({
    heading: { levels },
    ...(codeBlock ? {} : { codeBlock: false }),
    gapcursor: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      isAllowedUri: (url) => isAllowedLinkHref(url),
    },
  });
