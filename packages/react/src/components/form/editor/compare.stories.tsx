import { useState } from 'react';

import { SegmentedControl } from '../segmented-control';

import { Editor } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const MEMBERS = [
  { id: '1', label: 'Ada Lovelace', description: 'Mathematician' },
  { id: '2', label: 'Alan Turing', description: 'Logician' },
  { id: '3', label: 'Grace Hopper', description: 'Computer scientist' },
];

const PICTURE = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#dbeafe"/><circle cx="320" cy="180" r="90" fill="#3b82f6"/></svg>',
)}`;

const DOCUMENTS = {
  block: `<h1 style="text-align: center;">Block Editor</h1><p>A block-style editor built on <strong>Tiptap</strong> and <strong>shadcn/ui</strong>. Type <code>/</code> to open the command menu and insert blocks, or <code>@</code> to mention someone like <span data-type="mention" data-id="1" data-label="Ada Lovelace" data-mention-suggestion-char="@">@Ada Lovelace</span>. Drag the handle on the left to reorder any block.</p><h2>Text Formatting</h2><p>Select any text to see the <strong>bubble menu</strong> with <em>formatting</em> options. You can also use <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p><h2>Task List</h2><ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Design the component API</p></div></li><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Build the slash command menu</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Add table support</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Write documentation</p></div></li></ul><h2>Table</h2><p>Use <code>/table</code> to insert a table. Resize columns by dragging the handles.</p><table style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Feature</p></th><th colspan="1" rowspan="1"><p>Status</p></th><th colspan="1" rowspan="1"><p>Priority</p></th></tr><tr><td colspan="1" rowspan="1"><p>Bubble menu</p></td><td colspan="1" rowspan="1"><p>Done</p></td><td colspan="1" rowspan="1"><p>High</p></td></tr><tr><td colspan="1" rowspan="1"><p>Drag handles</p></td><td colspan="1" rowspan="1"><p>Done</p></td><td colspan="1" rowspan="1"><p>High</p></td></tr><tr><td colspan="1" rowspan="1"><p>Tables</p></td><td colspan="1" rowspan="1"><p>In progress</p></td><td colspan="1" rowspan="1"><p>Medium</p></td></tr></tbody></table><h2>Code Block with Syntax Highlighting</h2><pre><code class="language-javascript">import { BlockEditor } from "@editorcn/block-editor";\nimport { StarterKit } from "@tiptap/starter-kit";\n\nfunction MyEditor() {\n  const editor = useEditor({\n    extensions: [StarterKit],\n  });\n\n  return &lt;BlockEditor editor={editor} /&gt;;\n}</code></pre><h2>Mermaid Diagram</h2><p>Set a code block language to <strong>Mermaid</strong> to see a live diagram below the code.</p><pre><code class="language-mermaid">graph LR\n  A[Type in the editor] --&gt; B{Code or diagram?}\n  B --&gt;|Code| C[Shiki highlighting]\n  B --&gt;|Mermaid| D[Live preview]</code></pre><h2>Callout</h2><div data-type="callout" data-kind="info"><p>Type <code>/callout</code> to insert a callout, or <code>&gt; [!WARNING]</code> and a space. Click the icon to switch between info, tip, warning, danger, and note.</p></div><h2>Blockquote</h2><blockquote><p>Block-level content with drag handles for reordering. Every block can be moved, edited, or deleted independently.</p></blockquote><h2>Text Alignment</h2><p style="text-align: center;">Center-aligned text — great for headings.</p><p style="text-align: right;">Right-aligned text — useful for annotations.</p><h2>Images &amp; Links</h2><p>Type <code>/image</code> to insert an image by URL. Links are auto-detected and open in a new tab. Drag handles let you reorder any block — try it on this paragraph.</p>`,
  toolbar: `<h1 style="text-align: center;">Welcome to editorcn</h1><p>A rich text editor built on <a target="_blank" rel="noopener noreferrer nofollow" href="https://tiptap.dev/">Tiptap</a> and <strong>shadcn/ui</strong>. Every control in the toolbar is a standalone component — pick the ones you need, build your own layout.</p><hr><h2>Text Formatting</h2><p>Use the toolbar to apply <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <mark>highlighted text</mark>, H<sub>2</sub>O (subscript), and E=mc<sup>2</sup> (superscript). Inline <code>code</code> is also supported.</p><h2>Headings</h2><h3>Heading 3 — Section Title</h3><p>Headings from H1 through H6 are available. This editor uses six levels for deep document structure.</p><h4>Heading 4 — Subsection</h4><p>Nested content under a section. H4 works well for grouped items within an H3 section.</p><h5>Heading 5 — Detail</h5><p>Fine-grained headings for technical documentation or nested outlines.</p><h2>Lists</h2><p>Organize content with <strong>bullet lists</strong> and <strong>ordered lists</strong>:</p><ul><li><p>Bullet list item one</p></li><li><p>Bullet list with <strong>bold</strong> and <em>italic</em> text</p></li><li><p>Nested bullet</p><ul><li><p>Indented sub-item</p></li><li><p>Another sub-item</p></li></ul></li></ul><ol><li><p>First ordered item</p></li><li><p>Second ordered item with a <a target="_blank" rel="noopener noreferrer nofollow" href="#">link</a></p></li><li><p>Third ordered item</p></li></ol><h2>Mentions</h2><p>Type <code>@</code> to mention someone, like <span data-type="mention" data-id="3" data-label="Grace Hopper" data-mention-suggestion-char="@">@Grace Hopper</span>. The picker filters as you type and inserts a mention with a stable id.</p><h2>Callouts</h2><div data-type="callout" data-kind="success"><p>Use the <strong>callout</strong> button in the toolbar, or type <code>&gt; [!NOTE]</code> and a space, to highlight a note, tip, or warning. Click the icon to change its type.</p></div><h2>Blockquote &amp; Code</h2><blockquote><p>A well-placed blockquote adds authority. The left border uses your theme's border color.</p></blockquote><p>For longer code snippets, use a <strong>code block</strong>:</p><pre><code class="language-javascript">function greet(name) {\n  return \`Hello, \${name}! Welcome to editorcn.\`;\n}</code></pre><p>Set the language to <strong>Mermaid</strong> and the diagram renders live below the code:</p><pre><code class="language-mermaid">graph LR\n  A[Type in the editor] --&gt; B{Code or diagram?}\n  B --&gt;|Code| C[Shiki highlighting]\n  B --&gt;|Mermaid| D[Live preview]</code></pre><h2>Alignment</h2><p style="text-align: left;">Left aligned — the default for most content.</p><p style="text-align: center;">Center aligned — great for headings or callouts.</p><p style="text-align: right;">Right aligned — useful for captions or annotations.</p><p style="text-align: justify;">Justified text stretches each line to fill the container width, creating clean edges on both sides. This works best for longer paragraphs where readability matters.</p><h2>Embeds</h2><p>Use the <strong>YouTube</strong> and <strong>Twitter</strong> buttons in the toolbar to paste a URL and embed content. Select an embed to see the resize handles — drag to resize. Embeds maintain their dimensions in the document and can be aligned left, center, or right.</p><h2>Table</h2><p>Tables use fixed-width columns that you can resize by dragging the handles on column edges. Hover over the table to see the controls.</p><table style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Extension</p></th><th colspan="1" rowspan="1"><p>Type</p></th><th colspan="1" rowspan="1"><p>Status</p></th></tr><tr><td colspan="1" rowspan="1"><p>Table</p></td><td colspan="1" rowspan="1"><p>Block</p></td><td colspan="1" rowspan="1"><p>Resizing</p></td></tr><tr><td colspan="1" rowspan="1"><p>Image</p></td><td colspan="1" rowspan="1"><p>Block</p></td><td colspan="1" rowspan="1"><p>Placeholder</p></td></tr><tr><td colspan="1" rowspan="1"><p>Highlight</p></td><td colspan="1" rowspan="1"><p>Mark</p></td><td colspan="1" rowspan="1"><p>Active</p></td></tr></tbody></table><hr><p style="text-align: center;">Built with Tiptap, shadcn/ui, and TypeScript. MIT licensed.</p>`,
};

const EDITORCN = {
  block: 'https://www.rtecn.space/preview/full-block-editor',
  toolbar: 'https://www.rtecn.space/preview/full-editor',
};

const meta = {
  title: 'Form/Editor/Compare with editorcn',
  component: Editor,
  tags: ['!autodocs', '!test'],
  parameters: { layout: 'fullscreen', canvasPadding: false },
} satisfies Meta<typeof Editor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SideBySide: Story = {
  render: function Render() {
    const [template, setTemplate] = useState<keyof typeof EDITORCN>('block');

    return (
      <div className="flex h-screen flex-col gap-3 p-4">
        <SegmentedControl
          size="tiny"
          aria-label="editorcn template"
          value={template}
          onValueChange={(value) => setTemplate(value as keyof typeof EDITORCN)}
          className="self-center"
        >
          <SegmentedControl.Item value="block">Block editor</SegmentedControl.Item>
          <SegmentedControl.Item value="toolbar">Toolbar editor</SegmentedControl.Item>
        </SegmentedControl>
        <div className="grid min-h-0 grow grid-cols-2 gap-4">
          <section className="flex min-h-0 flex-col gap-3">
            <h2 className="text-body-b2-bold">IDS Editor</h2>
            {template === 'block' ? (
              <Editor
                key="block"
                type="block"
                aria-label="IDS Editor"
                defaultValue={DOCUMENTS[template]}
                className="ms-8 h-auto min-h-0 w-auto grow"
                onImageUpload={async () => PICTURE}
                mentions={(query) =>
                  MEMBERS.filter((member) =>
                    member.label.toLowerCase().includes(query.toLowerCase()),
                  )
                }
              >
                <Editor.Content placeholder="Type / for blocks, @ for people" />
              </Editor>
            ) : (
              <Editor
                key="toolbar"
                aria-label="IDS Editor"
                defaultValue={DOCUMENTS[template]}
                className="ms-8 h-auto min-h-0 w-auto grow"
                onImageUpload={async () => PICTURE}
                mentions={(query) =>
                  MEMBERS.filter((member) =>
                    member.label.toLowerCase().includes(query.toLowerCase()),
                  )
                }
              >
                <Editor.BlockType />
                <Editor.Separator />
                <Editor.Bold />
                <Editor.Italic />
                <Editor.Underline />
                <Editor.Strike />
                <Editor.Code />
                <Editor.Highlight />
                <Editor.Color />
                <Editor.Subscript />
                <Editor.Superscript />
                <Editor.Link />
                <Editor.Separator />
                <Editor.BulletList />
                <Editor.OrderedList />
                <Editor.TaskList />
                <Editor.Blockquote />
                <Editor.CodeBlock />
                <Editor.Separator />
                <Editor.TextAlign />
                <Editor.Separator />
                <Editor.Image />
                <Editor.Table />
                <Editor.Callout />
                <Editor.Details />
                <Editor.HorizontalRule />
                <Editor.Content placeholder="Type / for blocks, @ for people" />
                <Editor.BubbleMenu />
              </Editor>
            )}
          </section>

          <section className="flex min-h-0 flex-col gap-3">
            <h2 className="text-body-b2-bold">editorcn</h2>
            <iframe
              key={template}
              title={`editorcn ${template} editor`}
              src={EDITORCN[template]}
              className="rounded-standard border-neutral min-h-0 w-full grow border"
            />
          </section>
        </div>
      </div>
    );
  },
};
