import { TaskItem, TaskList } from '@tiptap/extension-list';

import { checkboxStyle } from '../../checkbox/style';
import { editorStyle } from '../style';

import type { NodeView } from '@tiptap/pm/view';

const SVG = 'http://www.w3.org/2000/svg';
const HEROICONS_CHECK_16 =
  'M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z';

function checkIcon(document: Document) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('fill-rule', 'evenodd');
  path.setAttribute('clip-rule', 'evenodd');
  path.setAttribute('d', HEROICONS_CHECK_16);
  svg.append(path);
  return svg;
}

const checkbox = checkboxStyle({ variant: 'outline', size: 'standard' });
const { taskBox } = editorStyle();

const EditorTaskItemNode = TaskItem.extend({
  addNodeView() {
    const tiptapView = this.parent?.();
    if (!tiptapView) return null;

    return (props) => {
      const view = tiptapView(props) as NodeView;
      const item = view.dom as HTMLElement;
      const box = item.querySelector<HTMLElement>(':scope > label');
      const input = box?.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (!box || !input) return view;

      const indicator = item.ownerDocument.createElement('span');
      indicator.setAttribute('aria-hidden', 'true');
      indicator.append(checkIcon(item.ownerDocument));
      box.append(indicator);
      box.className = checkbox.root({ className: taskBox() });
      input.className = checkbox.input();
      indicator.className = checkbox.indicator();

      const showChecked = (checked: boolean) => {
        const state = checked ? 'checked' : 'unchecked';
        box.dataset.state = state;
        indicator.dataset.state = state;
      };
      showChecked(Boolean(props.node.attrs.checked));

      return {
        ...view,
        dom: item,
        contentDOM: view.contentDOM,
        update: (node, decorations, innerDecorations) => {
          const kept = view.update?.(node, decorations, innerDecorations) ?? false;
          if (kept) showChecked(Boolean(node.attrs.checked));
          return kept;
        },
      };
    };
  },
});

export function taskListExtensions(checkboxLabel: (text: string) => string) {
  return [
    TaskList,
    EditorTaskItemNode.configure({
      nested: true,
      a11y: { checkboxLabel: (node) => checkboxLabel(node.textContent) },
    }),
  ];
}
