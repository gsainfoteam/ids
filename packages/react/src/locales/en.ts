import { defineIdsLocale } from '../internal/locale';

// prettier-ignore
export const en = defineIdsLocale({
  language: 'en',
  tag: 'en-US',
  messages: {
    "avatarGroup": {
      "overflow": "{count} more"
    },
    "breadcrumb": {
      "more": "Show hidden path"
    },
    "bubble": {
      "reactions": "Reactions"
    },
    "carousel": {
      "indicator": "Go to slide {index}",
      "roleDescription": "carousel"
    },
    "checkbox": {
      "required": "Select this item."
    },
    "colorPicker": {
      "alpha": "Opacity",
      "area": "Saturation and brightness",
      "areaValue": "Saturation {saturation}, brightness {brightness}",
      "brightness": "Brightness",
      "eyeDropper": "Pick a color from the screen",
      "hue": "Hue",
      "input": "Color value",
      "label": "Color picker",
      "saturation": "Saturation",
      "swatches": "Swatches",
      "twoD": "2D slider"
    },
    "common": {
      "clear": "Clear",
      "close": "Close",
      "collapse": "Collapse",
      "copied": "Copied",
      "copy": "Copy",
      "drag": {
        "cancel": "Returned to its place: {item}",
        "end": "Moved: {item}",
        "start": "Picked up: {item}"
      },
      "expand": "Expand",
      "invalid": "Enter a valid value.",
      "loading": "Loading",
      "next": "Next",
      "options": "Options",
      "pause": "Pause",
      "previous": "Previous",
      "remove": "Remove",
      "removeItem": "Remove {label}",
      "resize": "Resize",
      "search": "Search",
      "sending": "Sending",
      "status": {
        "danger": "Danger",
        "info": "Info",
        "success": "Success",
        "warning": "Warning"
      }
    },
    "dataTable": {
      "resize": "{column} column width",
      "selectAll": "Select all rows",
      "selectRow": "Select {label}",
      "selectRowNumber": "Select row {number}",
      "selected": "{count} selected"
    },
    "dateField": {
      "open": "Open calendar"
    },
    "editor": {
      "alignCenter": "Align center",
      "alignJustify": "Justify",
      "alignLeft": "Align left",
      "alignRight": "Align right",
      "blockDuplicate": "Duplicate",
      "blockHandle": "Block menu",
      "blockInsertBelow": "Add a block below",
      "blockTurnInto": "Turn into",
      "blockType": "Text style",
      "blockquote": "Quote",
      "bold": "Bold",
      "bubbleMenu": "Selection formatting",
      "bulletList": "Bulleted list",
      "callout": "Callout",
      "calloutKind": "Callout type",
      "calloutRemove": "Remove callout",
      "code": "Code",
      "codeBlock": "Code block",
      "codeLanguage": "Code language",
      "codeLanguageSearch": "Search languages",
      "codePlainText": "Plain text",
      "color": "Color",
      "colorDefault": "Default",
      "colorNone": "None",
      "colorPrimary": "Accent 1",
      "colorSecondary": "Accent 2",
      "colorTertiary": "Accent 3",
      "content": "Content",
      "details": "Toggle",
      "detailsSummary": "Summary",
      "detailsToggle": "Show content",
      "heading": "Heading {level}",
      "highlight": "Highlight",
      "highlightColor": "Highlight color",
      "horizontalRule": "Divider",
      "image": "Image",
      "imageAlt": "Alt text",
      "imageInsert": "Insert",
      "imagePickFiles": "Choose files",
      "imageUploadFailed": "The image could not be uploaded",
      "imageUploading": "Uploading the image",
      "imageUrl": "Image address",
      "imageUrlInvalid": "Enter an address that starts with http or https",
      "italic": "Italic",
      "link": "Link",
      "linkApply": "Apply",
      "linkRemove": "Remove link",
      "linkUrl": "Link URL",
      "mentionEmpty": "No matches",
      "mentionMenu": "Mentions",
      "mentionSearching": "Searching…",
      "orderedList": "Numbered list",
      "paragraph": "Paragraph",
      "slashMenu": "Insert block",
      "slashMenuEmpty": "No matching blocks",
      "strike": "Strikethrough",
      "subscript": "Subscript",
      "superscript": "Superscript",
      "table": "Table",
      "tableAddColumnAfter": "Add column after",
      "tableAddColumnBefore": "Add column before",
      "tableAddRowAfter": "Add row below",
      "tableAddRowBefore": "Add row above",
      "tableDelete": "Delete table",
      "tableDeleteColumn": "Delete column",
      "tableDeleteRow": "Delete row",
      "tableHeaderRow": "Header row",
      "tableInsert": "Insert table",
      "tableMergeCells": "Merge cells",
      "tableSize": "{rows} by {cols}",
      "tableSplitCell": "Split cell",
      "taskItem": "Task: {text}",
      "taskItemEmpty": "Empty task",
      "taskList": "Task list",
      "textAlign": "Alignment",
      "textColor": "Text color",
      "toolbar": "Formatting",
      "underline": "Underline"
    },
    "fileField": {
      "count": "Files: {count}",
      "list": "Chosen files"
    },
    "image": {
      "download": "Download",
      "photos": "Images",
      "preview": "View larger: {alt}",
      "previewUntitled": "View image larger",
      "share": "Share",
      "thumbnails": "Image list",
      "viewer": "Image viewer",
      "zoomIn": "Zoom in",
      "zoomOut": "Zoom out",
      "zoomReset": "{percent}, fit to screen"
    },
    "kbd": {
      "alt": "Alt",
      "backspace": "Backspace",
      "capsLock": "Caps Lock",
      "command": "Command",
      "control": "Control",
      "delete": "Delete",
      "down": "Down Arrow",
      "end": "End",
      "enter": "Enter",
      "escape": "Escape",
      "fn": "Function",
      "forwardDelete": "Forward Delete",
      "home": "Home",
      "left": "Left Arrow",
      "macDelete": "Delete",
      "option": "Option",
      "pageDown": "Page Down",
      "pageUp": "Page Up",
      "return": "Return",
      "right": "Right Arrow",
      "shift": "Shift",
      "space": "Space",
      "super": "Super",
      "tab": "Tab",
      "up": "Up Arrow",
      "windows": "Windows"
    },
    "link": {
      "newTab": "(opens in a new tab)"
    },
    "menu": {
      "command": "Commands"
    },
    "message": {
      "actions": "Message actions",
      "error": "Not sent",
      "retry": "Resend",
      "unread": "Unread",
      "unreadBy": "Unread by {count}"
    },
    "messageScroller": {
      "jump": "Scroll to bottom",
      "jumpUnseen": "Scroll to bottom, new messages: {count}",
      "unseen": "New messages: {count}"
    },
    "numberField": {
      "decrement": "Decrease",
      "increment": "Increase"
    },
    "pagination": {
      "first": "First page",
      "last": "Last page",
      "page": "Page {page}"
    },
    "passwordField": {
      "show": "Show password"
    },
    "promptInput": {
      "actions": "Add",
      "attach": "Attach files",
      "attachments": "Attached files",
      "send": "Send",
      "stop": "Stop"
    },
    "questionnaire": {
      "navigation": "Question navigation",
      "progress": "Questionnaire progress",
      "step": "Question {current} of {total}"
    },
    "rating": {
      "valueLabel": "{value} out of {max}"
    },
    "scheduler": {
      "addDay": "Add a day",
      "allDay": "All day",
      "dayCount": "Number of days",
      "drag": {
        "at": "Starts {time}",
        "hint": "Press Space on an event to pick it up, the arrow keys to move it by 15 minutes or a day, and Enter to drop it. Shift with the up and down arrows moves an hour. Escape cancels.",
        "monthHint": "Press Space on an event to pick it up, the left and right arrows to move it a day, the up and down arrows to move it a week, and Enter to drop it. Escape cancels."
      },
      "goToDate": "Go to date",
      "moreLabel": "More events on {date}: {count}",
      "navigation": "Navigate dates",
      "removeDay": "Remove a day",
      "resize": "End of {event}",
      "view": "View"
    },
    "sidebar": {
      "drag": {
        "after": "After {target}",
        "before": "Before {target}",
        "hint": "Press Space to pick up, the up and down arrows to choose a place, and Enter to drop. Escape cancels.",
        "inside": "Inside {target}",
        "origin": "Original place"
      },
      "open": "Open menu"
    },
    "slider": {
      "end": "End",
      "start": "Start"
    },
    "slides": {
      "roleDescription": "slide",
      "slide": "{index} of {count}"
    },
    "stepper": {
      "completed": "Completed",
      "error": "Error"
    },
    "telField": {
      "country": "Country"
    },
    "textArea": {
      "limitReached": "Character limit reached.",
      "remaining": "Characters left: {remaining}"
    },
    "textField": {
      "required": "Enter a value."
    },
    "timePicker": {
      "label": "Time"
    },
    "toast": {
      "region": "Notifications"
    }
  },
});
