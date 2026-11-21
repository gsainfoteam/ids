import { StarterKit } from '@tiptap/starter-kit';

import { isAllowedLinkHref } from './url-rules';

type Level = 1 | 2 | 3 | 4 | 5 | 6;

type DocumentStarterKitOptions = { codeBlock?: boolean; dropCursorClass?: string };

export const documentStarterKit = (
  levels: Level[],
  { codeBlock = true, dropCursorClass }: DocumentStarterKitOptions = {},
) =>
  StarterKit.configure({
    heading: { levels },
    ...(codeBlock ? {} : { codeBlock: false }),
    ...(dropCursorClass ? { dropcursor: { color: false, width: 2, class: dropCursorClass } } : {}),
    gapcursor: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      isAllowedUri: (url) => isAllowedLinkHref(url),
    },
  });
