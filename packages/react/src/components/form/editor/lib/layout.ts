import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { EDITOR_FEATURES, type EditorFeature } from './load-engine';
import {
  containsElementOfType,
  elementTypeOf,
  flattenFragments,
  invariant,
} from '../../../../utils';
import { warnOnce } from '../../../../utils/dev';
import { EditorCallout } from '../callout/tool';
import { EditorDetails } from '../details/tool';
import { EditorImage } from '../image/tool';
import { EditorBlockType } from '../parts/block-type';
import {
  EditorBlockquote,
  EditorBulletList,
  EditorCodeBlock,
  EditorOrderedList,
  EditorTaskList,
} from '../parts/blocks';
import { EditorBubbleMenu } from '../parts/bubble-menu';
import { EditorColor } from '../parts/color';
import { EditorContentPart, type EditorContentProps } from '../parts/content';
import { EditorCount } from '../parts/count';
import { EditorHorizontalRule } from '../parts/horizontal-rule';
import { EditorLink } from '../parts/link';
import {
  EditorBold,
  EditorCode,
  EditorHighlight,
  EditorItalic,
  EditorStrike,
  EditorSubscript,
  EditorSuperscript,
  EditorUnderline,
} from '../parts/marks';
import { EditorTextAlign } from '../parts/text-align';
import { EditorTable } from '../table/tool';

const TOOLS = new Set<unknown>([
  EditorBlockType,
  EditorBold,
  EditorItalic,
  EditorUnderline,
  EditorStrike,
  EditorCode,
  EditorHighlight,
  EditorColor,
  EditorSubscript,
  EditorSuperscript,
  EditorLink,
  EditorImage,
  EditorBulletList,
  EditorOrderedList,
  EditorTaskList,
  EditorBlockquote,
  EditorCodeBlock,
  EditorHorizontalRule,
  EditorTable,
  EditorTextAlign,
  EditorCallout,
  EditorDetails,
]);

const isOfType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

const isFloating = isOfType(EditorBubbleMenu);

export const isTool = (node: ReactNode) => isValidElement(node) && TOOLS.has(elementTypeOf(node));

function dropTheToolbar(items: ReactNode[]) {
  const kept = items.filter((item) => !isTool(item));
  if (kept.length < items.length) {
    warnOnce(
      '`<Editor type="block">` shows no toolbar, so the tools placed beside `<Editor.Content>` are left out. Put them in `<Editor.BubbleMenu>`, or use `type="toolbar"`.',
    );
  }
  return kept;
}

function splitByContent(children: ReactNode, defaultContent: ReactElement<EditorContentProps>) {
  const items = flattenFragments(children);
  const bubbles = items.filter(isOfType(EditorBubbleMenu));
  const laidOut = items.filter((item) => !isFloating(item));
  const indexes = laidOut.flatMap((item, index) =>
    isOfType(EditorContentPart)(item) ? [index] : [],
  );
  invariant(indexes.length <= 1, '`<Editor>` accepts at most one `<Editor.Content />`.');
  const index = indexes[0];
  if (index === undefined)
    return { items, bubbles, top: laidOut, content: defaultContent, bottom: [] };
  return {
    items,
    bubbles,
    top: laidOut.slice(0, index),
    content: laidOut[index] as ReactElement<EditorContentProps>,
    bottom: laidOut.slice(index + 1),
  };
}

export function layOutTheEditor(
  shown: ReactNode,
  {
    blockEditor,
    defaultContent,
    defaultBubbleMenu,
  }: {
    blockEditor: boolean;
    defaultContent: ReactElement<EditorContentProps>;
    defaultBubbleMenu: ReactNode;
  },
) {
  const laidOut = splitByContent(shown, defaultContent);
  return {
    content: laidOut.content,
    top: blockEditor ? dropTheToolbar(laidOut.top) : laidOut.top,
    bottom: blockEditor ? dropTheToolbar(laidOut.bottom) : laidOut.bottom,
    bubbles: blockEditor && laidOut.bubbles.length === 0 ? [defaultBubbleMenu] : laidOut.bubbles,
    hasCount: laidOut.items.some(isOfType(EditorCount)),
  };
}

type ToolFeature = Exclude<EditorFeature, 'imageUpload' | 'mention'>;

const FEATURE_TOOLS: Record<ToolFeature, unknown[]> = {
  highlight: [EditorHighlight, EditorColor],
  textColor: [EditorColor],
  subscript: [EditorSubscript],
  superscript: [EditorSuperscript],
  taskList: [EditorTaskList],
  textAlign: [EditorTextAlign],
  table: [EditorTable],
  callout: [EditorCallout],
  details: [EditorDetails],
};

export function featuresIn(
  source: ReactNode,
  props: Record<'imageUpload' | 'mention' | 'everyBlock', boolean>,
): EditorFeature[] {
  return EDITOR_FEATURES.filter((feature) =>
    feature === 'imageUpload' || feature === 'mention'
      ? props[feature]
      : props.everyBlock || containsElementOfType(source, new Set(FEATURE_TOOLS[feature])),
  );
}
