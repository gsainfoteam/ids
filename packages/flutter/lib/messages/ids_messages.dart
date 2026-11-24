import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

abstract class IdsMessagesBase {
  const IdsMessagesBase();

  String get language;

  String avatarGroupOverflow({required num count});

  String get breadcrumbMore;

  String get bubbleReactions;

  String carouselIndicator({required num index});

  String get carouselRoleDescription;

  String get checkboxRequired;

  String get colorPickerAlpha;

  String get colorPickerArea;

  String colorPickerAreaValue({required String saturation, required String brightness});

  String get colorPickerBrightness;

  String get colorPickerEyeDropper;

  String get colorPickerHue;

  String get colorPickerInput;

  String get colorPickerLabel;

  String get colorPickerSaturation;

  String get colorPickerSwatches;

  String get colorPickerTwoD;

  String get commonClear;

  String get commonClose;

  String get commonCollapse;

  String get commonCopied;

  String get commonCopy;

  String commonDragCancel({required String item});

  String commonDragEnd({required String item});

  String commonDragStart({required String item});

  String get commonExpand;

  String get commonInvalid;

  String get commonLoading;

  String get commonNext;

  String get commonOptions;

  String get commonPause;

  String get commonPrevious;

  String get commonRemove;

  String commonRemoveItem({required String label});

  String get commonResize;

  String get commonSearch;

  String get commonSending;

  String get commonStatusDanger;

  String get commonStatusInfo;

  String get commonStatusSuccess;

  String get commonStatusWarning;

  String dataTableResize({required String column});

  String get dataTableSelectAll;

  String dataTableSelectRow({required String label});

  String dataTableSelectRowNumber({required num number});

  String dataTableSelected({required num count});

  String get dateFieldOpen;

  String get editorAlignCenter;

  String get editorAlignJustify;

  String get editorAlignLeft;

  String get editorAlignRight;

  String get editorBlockDuplicate;

  String get editorBlockHandle;

  String get editorBlockInsertBelow;

  String get editorBlockTurnInto;

  String get editorBlockType;

  String get editorBlockquote;

  String get editorBold;

  String get editorBubbleMenu;

  String get editorBulletList;

  String get editorCallout;

  String get editorCalloutKind;

  String get editorCalloutRemove;

  String get editorCode;

  String get editorCodeBlock;

  String get editorCodeLanguage;

  String get editorCodeLanguageSearch;

  String get editorCodePlainText;

  String get editorColor;

  String get editorColorDefault;

  String get editorColorNone;

  String get editorColorPrimary;

  String get editorColorSecondary;

  String get editorColorTertiary;

  String get editorContent;

  String get editorDetails;

  String get editorDetailsSummary;

  String get editorDetailsToggle;

  String editorHeading({required num level});

  String get editorHighlight;

  String get editorHighlightColor;

  String get editorHorizontalRule;

  String get editorImage;

  String get editorImageAlt;

  String get editorImageInsert;

  String get editorImagePickFiles;

  String get editorImageUploadFailed;

  String get editorImageUploading;

  String get editorImageUrl;

  String get editorImageUrlInvalid;

  String get editorItalic;

  String get editorLink;

  String get editorLinkApply;

  String get editorLinkRemove;

  String get editorLinkUrl;

  String get editorMentionEmpty;

  String get editorMentionMenu;

  String get editorMentionSearching;

  String get editorOrderedList;

  String get editorParagraph;

  String get editorSlashMenu;

  String get editorSlashMenuEmpty;

  String get editorStrike;

  String get editorSubscript;

  String get editorSuperscript;

  String get editorTable;

  String get editorTableAddColumnAfter;

  String get editorTableAddColumnBefore;

  String get editorTableAddRowAfter;

  String get editorTableAddRowBefore;

  String get editorTableDelete;

  String get editorTableDeleteColumn;

  String get editorTableDeleteRow;

  String get editorTableHeaderRow;

  String get editorTableInsert;

  String get editorTableMergeCells;

  String editorTableSize({required num rows, required num cols});

  String get editorTableSplitCell;

  String editorTaskItem({required String text});

  String get editorTaskItemEmpty;

  String get editorTaskList;

  String get editorTextAlign;

  String get editorTextColor;

  String get editorToolbar;

  String get editorUnderline;

  String fileFieldCount({required num count});

  String get fileFieldList;

  String get imageDownload;

  String get imagePhotos;

  String imagePreview({required String alt});

  String get imagePreviewUntitled;

  String get imageShare;

  String get imageThumbnails;

  String get imageViewer;

  String get imageZoomIn;

  String get imageZoomOut;

  String imageZoomReset({required String percent});

  String get kbdAlt;

  String get kbdBackspace;

  String get kbdCapsLock;

  String get kbdCommand;

  String get kbdControl;

  String get kbdDelete;

  String get kbdDown;

  String get kbdEnd;

  String get kbdEnter;

  String get kbdEscape;

  String get kbdFn;

  String get kbdForwardDelete;

  String get kbdHome;

  String get kbdLeft;

  String get kbdMacDelete;

  String get kbdOption;

  String get kbdPageDown;

  String get kbdPageUp;

  String get kbdReturn;

  String get kbdRight;

  String get kbdShift;

  String get kbdSpace;

  String get kbdSuper;

  String get kbdTab;

  String get kbdUp;

  String get kbdWindows;

  String get linkNewTab;

  String get menuCommand;

  String get messageActions;

  String get messageError;

  String get messageRetry;

  String get messageUnread;

  String messageUnreadBy({required num count});

  String get messageScrollerJump;

  String messageScrollerJumpUnseen({required num count});

  String messageScrollerUnseen({required num count});

  String get numberFieldDecrement;

  String get numberFieldIncrement;

  String get paginationFirst;

  String get paginationLast;

  String paginationPage({required num page});

  String get passwordFieldShow;

  String get promptInputActions;

  String get promptInputAttach;

  String get promptInputAttachments;

  String get promptInputSend;

  String get promptInputStop;

  String get questionnaireNavigation;

  String get questionnaireProgress;

  String questionnaireStep({required num current, required num total});

  String ratingValueLabel({required num value, required num max});

  String get schedulerAddDay;

  String get schedulerAllDay;

  String get schedulerDayCount;

  String schedulerDragAt({required String time});

  String get schedulerDragHint;

  String get schedulerDragMonthHint;

  String get schedulerGoToDate;

  String schedulerMoreLabel({required String date, required num count});

  String get schedulerNavigation;

  String get schedulerRemoveDay;

  String schedulerResize({required String event});

  String get schedulerView;

  String sidebarDragAfter({required String target});

  String sidebarDragBefore({required String target});

  String get sidebarDragHint;

  String sidebarDragInside({required String target});

  String get sidebarDragOrigin;

  String get sidebarOpen;

  String get sliderEnd;

  String get sliderStart;

  String get slidesRoleDescription;

  String slidesSlide({required num index, required num count});

  String get stepperCompleted;

  String get stepperError;

  String get telFieldCountry;

  String get textAreaLimitReached;

  String textAreaRemaining({required num remaining});

  String get textFieldRequired;

  String get timePickerLabel;

  String get toastRegion;
}

class IdsMessagesEn extends IdsMessagesBase {
  const IdsMessagesEn();

  static final _numbers = NumberFormat.decimalPattern('en_US');

  static String _number(num value) => _numbers.format(value);

  @override
  String get language => 'en';

  @override
  String avatarGroupOverflow({required num count}) => '${_number(count)} more';

  @override
  String get breadcrumbMore => 'Show hidden path';

  @override
  String get bubbleReactions => 'Reactions';

  @override
  String carouselIndicator({required num index}) => 'Go to slide ${_number(index)}';

  @override
  String get carouselRoleDescription => 'carousel';

  @override
  String get checkboxRequired => 'Select this item.';

  @override
  String get colorPickerAlpha => 'Opacity';

  @override
  String get colorPickerArea => 'Saturation and brightness';

  @override
  String colorPickerAreaValue({required String saturation, required String brightness}) => 'Saturation $saturation, brightness $brightness';

  @override
  String get colorPickerBrightness => 'Brightness';

  @override
  String get colorPickerEyeDropper => 'Pick a color from the screen';

  @override
  String get colorPickerHue => 'Hue';

  @override
  String get colorPickerInput => 'Color value';

  @override
  String get colorPickerLabel => 'Color picker';

  @override
  String get colorPickerSaturation => 'Saturation';

  @override
  String get colorPickerSwatches => 'Swatches';

  @override
  String get colorPickerTwoD => '2D slider';

  @override
  String get commonClear => 'Clear';

  @override
  String get commonClose => 'Close';

  @override
  String get commonCollapse => 'Collapse';

  @override
  String get commonCopied => 'Copied';

  @override
  String get commonCopy => 'Copy';

  @override
  String commonDragCancel({required String item}) => 'Returned to its place: $item';

  @override
  String commonDragEnd({required String item}) => 'Moved: $item';

  @override
  String commonDragStart({required String item}) => 'Picked up: $item';

  @override
  String get commonExpand => 'Expand';

  @override
  String get commonInvalid => 'Enter a valid value.';

  @override
  String get commonLoading => 'Loading';

  @override
  String get commonNext => 'Next';

  @override
  String get commonOptions => 'Options';

  @override
  String get commonPause => 'Pause';

  @override
  String get commonPrevious => 'Previous';

  @override
  String get commonRemove => 'Remove';

  @override
  String commonRemoveItem({required String label}) => 'Remove $label';

  @override
  String get commonResize => 'Resize';

  @override
  String get commonSearch => 'Search';

  @override
  String get commonSending => 'Sending';

  @override
  String get commonStatusDanger => 'Danger';

  @override
  String get commonStatusInfo => 'Info';

  @override
  String get commonStatusSuccess => 'Success';

  @override
  String get commonStatusWarning => 'Warning';

  @override
  String dataTableResize({required String column}) => '$column column width';

  @override
  String get dataTableSelectAll => 'Select all rows';

  @override
  String dataTableSelectRow({required String label}) => 'Select $label';

  @override
  String dataTableSelectRowNumber({required num number}) => 'Select row ${_number(number)}';

  @override
  String dataTableSelected({required num count}) => '${_number(count)} selected';

  @override
  String get dateFieldOpen => 'Open calendar';

  @override
  String get editorAlignCenter => 'Align center';

  @override
  String get editorAlignJustify => 'Justify';

  @override
  String get editorAlignLeft => 'Align left';

  @override
  String get editorAlignRight => 'Align right';

  @override
  String get editorBlockDuplicate => 'Duplicate';

  @override
  String get editorBlockHandle => 'Block menu';

  @override
  String get editorBlockInsertBelow => 'Add a block below';

  @override
  String get editorBlockTurnInto => 'Turn into';

  @override
  String get editorBlockType => 'Text style';

  @override
  String get editorBlockquote => 'Quote';

  @override
  String get editorBold => 'Bold';

  @override
  String get editorBubbleMenu => 'Selection formatting';

  @override
  String get editorBulletList => 'Bulleted list';

  @override
  String get editorCallout => 'Callout';

  @override
  String get editorCalloutKind => 'Callout type';

  @override
  String get editorCalloutRemove => 'Remove callout';

  @override
  String get editorCode => 'Code';

  @override
  String get editorCodeBlock => 'Code block';

  @override
  String get editorCodeLanguage => 'Code language';

  @override
  String get editorCodeLanguageSearch => 'Search languages';

  @override
  String get editorCodePlainText => 'Plain text';

  @override
  String get editorColor => 'Color';

  @override
  String get editorColorDefault => 'Default';

  @override
  String get editorColorNone => 'None';

  @override
  String get editorColorPrimary => 'Accent 1';

  @override
  String get editorColorSecondary => 'Accent 2';

  @override
  String get editorColorTertiary => 'Accent 3';

  @override
  String get editorContent => 'Content';

  @override
  String get editorDetails => 'Toggle';

  @override
  String get editorDetailsSummary => 'Summary';

  @override
  String get editorDetailsToggle => 'Show content';

  @override
  String editorHeading({required num level}) => 'Heading ${_number(level)}';

  @override
  String get editorHighlight => 'Highlight';

  @override
  String get editorHighlightColor => 'Highlight color';

  @override
  String get editorHorizontalRule => 'Divider';

  @override
  String get editorImage => 'Image';

  @override
  String get editorImageAlt => 'Alt text';

  @override
  String get editorImageInsert => 'Insert';

  @override
  String get editorImagePickFiles => 'Choose files';

  @override
  String get editorImageUploadFailed => 'The image could not be uploaded';

  @override
  String get editorImageUploading => 'Uploading the image';

  @override
  String get editorImageUrl => 'Image address';

  @override
  String get editorImageUrlInvalid => 'Enter an address that starts with http or https';

  @override
  String get editorItalic => 'Italic';

  @override
  String get editorLink => 'Link';

  @override
  String get editorLinkApply => 'Apply';

  @override
  String get editorLinkRemove => 'Remove link';

  @override
  String get editorLinkUrl => 'Link URL';

  @override
  String get editorMentionEmpty => 'No matches';

  @override
  String get editorMentionMenu => 'Mentions';

  @override
  String get editorMentionSearching => 'Searching…';

  @override
  String get editorOrderedList => 'Numbered list';

  @override
  String get editorParagraph => 'Paragraph';

  @override
  String get editorSlashMenu => 'Insert block';

  @override
  String get editorSlashMenuEmpty => 'No matching blocks';

  @override
  String get editorStrike => 'Strikethrough';

  @override
  String get editorSubscript => 'Subscript';

  @override
  String get editorSuperscript => 'Superscript';

  @override
  String get editorTable => 'Table';

  @override
  String get editorTableAddColumnAfter => 'Add column after';

  @override
  String get editorTableAddColumnBefore => 'Add column before';

  @override
  String get editorTableAddRowAfter => 'Add row below';

  @override
  String get editorTableAddRowBefore => 'Add row above';

  @override
  String get editorTableDelete => 'Delete table';

  @override
  String get editorTableDeleteColumn => 'Delete column';

  @override
  String get editorTableDeleteRow => 'Delete row';

  @override
  String get editorTableHeaderRow => 'Header row';

  @override
  String get editorTableInsert => 'Insert table';

  @override
  String get editorTableMergeCells => 'Merge cells';

  @override
  String editorTableSize({required num rows, required num cols}) => '${_number(rows)} by ${_number(cols)}';

  @override
  String get editorTableSplitCell => 'Split cell';

  @override
  String editorTaskItem({required String text}) => 'Task: $text';

  @override
  String get editorTaskItemEmpty => 'Empty task';

  @override
  String get editorTaskList => 'Task list';

  @override
  String get editorTextAlign => 'Alignment';

  @override
  String get editorTextColor => 'Text color';

  @override
  String get editorToolbar => 'Formatting';

  @override
  String get editorUnderline => 'Underline';

  @override
  String fileFieldCount({required num count}) => 'Files: ${_number(count)}';

  @override
  String get fileFieldList => 'Chosen files';

  @override
  String get imageDownload => 'Download';

  @override
  String get imagePhotos => 'Images';

  @override
  String imagePreview({required String alt}) => 'View larger: $alt';

  @override
  String get imagePreviewUntitled => 'View image larger';

  @override
  String get imageShare => 'Share';

  @override
  String get imageThumbnails => 'Image list';

  @override
  String get imageViewer => 'Image viewer';

  @override
  String get imageZoomIn => 'Zoom in';

  @override
  String get imageZoomOut => 'Zoom out';

  @override
  String imageZoomReset({required String percent}) => '$percent, fit to screen';

  @override
  String get kbdAlt => 'Alt';

  @override
  String get kbdBackspace => 'Backspace';

  @override
  String get kbdCapsLock => 'Caps Lock';

  @override
  String get kbdCommand => 'Command';

  @override
  String get kbdControl => 'Control';

  @override
  String get kbdDelete => 'Delete';

  @override
  String get kbdDown => 'Down Arrow';

  @override
  String get kbdEnd => 'End';

  @override
  String get kbdEnter => 'Enter';

  @override
  String get kbdEscape => 'Escape';

  @override
  String get kbdFn => 'Function';

  @override
  String get kbdForwardDelete => 'Forward Delete';

  @override
  String get kbdHome => 'Home';

  @override
  String get kbdLeft => 'Left Arrow';

  @override
  String get kbdMacDelete => 'Delete';

  @override
  String get kbdOption => 'Option';

  @override
  String get kbdPageDown => 'Page Down';

  @override
  String get kbdPageUp => 'Page Up';

  @override
  String get kbdReturn => 'Return';

  @override
  String get kbdRight => 'Right Arrow';

  @override
  String get kbdShift => 'Shift';

  @override
  String get kbdSpace => 'Space';

  @override
  String get kbdSuper => 'Super';

  @override
  String get kbdTab => 'Tab';

  @override
  String get kbdUp => 'Up Arrow';

  @override
  String get kbdWindows => 'Windows';

  @override
  String get linkNewTab => '(opens in a new tab)';

  @override
  String get menuCommand => 'Commands';

  @override
  String get messageActions => 'Message actions';

  @override
  String get messageError => 'Not sent';

  @override
  String get messageRetry => 'Resend';

  @override
  String get messageUnread => 'Unread';

  @override
  String messageUnreadBy({required num count}) => 'Unread by ${_number(count)}';

  @override
  String get messageScrollerJump => 'Scroll to bottom';

  @override
  String messageScrollerJumpUnseen({required num count}) => 'Scroll to bottom, new messages: ${_number(count)}';

  @override
  String messageScrollerUnseen({required num count}) => 'New messages: ${_number(count)}';

  @override
  String get numberFieldDecrement => 'Decrease';

  @override
  String get numberFieldIncrement => 'Increase';

  @override
  String get paginationFirst => 'First page';

  @override
  String get paginationLast => 'Last page';

  @override
  String paginationPage({required num page}) => 'Page ${_number(page)}';

  @override
  String get passwordFieldShow => 'Show password';

  @override
  String get promptInputActions => 'Add';

  @override
  String get promptInputAttach => 'Attach files';

  @override
  String get promptInputAttachments => 'Attached files';

  @override
  String get promptInputSend => 'Send';

  @override
  String get promptInputStop => 'Stop';

  @override
  String get questionnaireNavigation => 'Question navigation';

  @override
  String get questionnaireProgress => 'Questionnaire progress';

  @override
  String questionnaireStep({required num current, required num total}) => 'Question ${_number(current)} of ${_number(total)}';

  @override
  String ratingValueLabel({required num value, required num max}) => '${_number(value)} out of ${_number(max)}';

  @override
  String get schedulerAddDay => 'Add a day';

  @override
  String get schedulerAllDay => 'All day';

  @override
  String get schedulerDayCount => 'Number of days';

  @override
  String schedulerDragAt({required String time}) => 'Starts $time';

  @override
  String get schedulerDragHint => 'Press Space on an event to pick it up, the arrow keys to move it by 15 minutes or a day, and Enter to drop it. Shift with the up and down arrows moves an hour. Escape cancels.';

  @override
  String get schedulerDragMonthHint => 'Press Space on an event to pick it up, the left and right arrows to move it a day, the up and down arrows to move it a week, and Enter to drop it. Escape cancels.';

  @override
  String get schedulerGoToDate => 'Go to date';

  @override
  String schedulerMoreLabel({required String date, required num count}) => 'More events on $date: ${_number(count)}';

  @override
  String get schedulerNavigation => 'Navigate dates';

  @override
  String get schedulerRemoveDay => 'Remove a day';

  @override
  String schedulerResize({required String event}) => 'End of $event';

  @override
  String get schedulerView => 'View';

  @override
  String sidebarDragAfter({required String target}) => 'After $target';

  @override
  String sidebarDragBefore({required String target}) => 'Before $target';

  @override
  String get sidebarDragHint => 'Press Space to pick up, the up and down arrows to choose a place, and Enter to drop. Escape cancels.';

  @override
  String sidebarDragInside({required String target}) => 'Inside $target';

  @override
  String get sidebarDragOrigin => 'Original place';

  @override
  String get sidebarOpen => 'Open menu';

  @override
  String get sliderEnd => 'End';

  @override
  String get sliderStart => 'Start';

  @override
  String get slidesRoleDescription => 'slide';

  @override
  String slidesSlide({required num index, required num count}) => '${_number(index)} of ${_number(count)}';

  @override
  String get stepperCompleted => 'Completed';

  @override
  String get stepperError => 'Error';

  @override
  String get telFieldCountry => 'Country';

  @override
  String get textAreaLimitReached => 'Character limit reached.';

  @override
  String textAreaRemaining({required num remaining}) => 'Characters left: ${_number(remaining)}';

  @override
  String get textFieldRequired => 'Enter a value.';

  @override
  String get timePickerLabel => 'Time';

  @override
  String get toastRegion => 'Notifications';
}

class IdsMessagesKo extends IdsMessagesBase {
  const IdsMessagesKo();

  static final _numbers = NumberFormat.decimalPattern('ko_KR');

  static String _number(num value) => _numbers.format(value);

  @override
  String get language => 'ko';

  @override
  String avatarGroupOverflow({required num count}) => '외 ${_number(count)}명';

  @override
  String get breadcrumbMore => '숨은 경로 보기';

  @override
  String get bubbleReactions => '반응';

  @override
  String carouselIndicator({required num index}) => '${_number(index)}번째 슬라이드로';

  @override
  String get carouselRoleDescription => '캐러셀';

  @override
  String get checkboxRequired => '이 항목을 선택하세요.';

  @override
  String get colorPickerAlpha => '투명도';

  @override
  String get colorPickerArea => '채도와 밝기';

  @override
  String colorPickerAreaValue({required String saturation, required String brightness}) => '채도 $saturation, 밝기 $brightness';

  @override
  String get colorPickerBrightness => '밝기';

  @override
  String get colorPickerEyeDropper => '화면에서 색 고르기';

  @override
  String get colorPickerHue => '색조';

  @override
  String get colorPickerInput => '색상 값';

  @override
  String get colorPickerLabel => '색상 선택';

  @override
  String get colorPickerSaturation => '채도';

  @override
  String get colorPickerSwatches => '팔레트';

  @override
  String get colorPickerTwoD => '2D 슬라이더';

  @override
  String get commonClear => '지우기';

  @override
  String get commonClose => '닫기';

  @override
  String get commonCollapse => '접기';

  @override
  String get commonCopied => '복사했습니다';

  @override
  String get commonCopy => '복사';

  @override
  String commonDragCancel({required String item}) => '제자리에 두었습니다: $item';

  @override
  String commonDragEnd({required String item}) => '옮겼습니다: $item';

  @override
  String commonDragStart({required String item}) => '집었습니다: $item';

  @override
  String get commonExpand => '펼치기';

  @override
  String get commonInvalid => '올바른 값이 아닙니다.';

  @override
  String get commonLoading => '불러오는 중';

  @override
  String get commonNext => '다음';

  @override
  String get commonOptions => '옵션';

  @override
  String get commonPause => '일시 정지';

  @override
  String get commonPrevious => '이전';

  @override
  String get commonRemove => '삭제';

  @override
  String commonRemoveItem({required String label}) => '$label 삭제';

  @override
  String get commonResize => '크기 조절';

  @override
  String get commonSearch => '검색';

  @override
  String get commonSending => '보내는 중';

  @override
  String get commonStatusDanger => '위험';

  @override
  String get commonStatusInfo => '정보';

  @override
  String get commonStatusSuccess => '성공';

  @override
  String get commonStatusWarning => '경고';

  @override
  String dataTableResize({required String column}) => '$column 열 너비';

  @override
  String get dataTableSelectAll => '모든 행 선택';

  @override
  String dataTableSelectRow({required String label}) => '$label 선택';

  @override
  String dataTableSelectRowNumber({required num number}) => '${_number(number)}번째 행 선택';

  @override
  String dataTableSelected({required num count}) => '${_number(count)}개 선택됨';

  @override
  String get dateFieldOpen => '달력 열기';

  @override
  String get editorAlignCenter => '가운데 정렬';

  @override
  String get editorAlignJustify => '양쪽 정렬';

  @override
  String get editorAlignLeft => '왼쪽 정렬';

  @override
  String get editorAlignRight => '오른쪽 정렬';

  @override
  String get editorBlockDuplicate => '복제';

  @override
  String get editorBlockHandle => '블록 메뉴';

  @override
  String get editorBlockInsertBelow => '아래에 블록 넣기';

  @override
  String get editorBlockTurnInto => '바꾸기';

  @override
  String get editorBlockType => '문단 모양';

  @override
  String get editorBlockquote => '인용';

  @override
  String get editorBold => '굵게';

  @override
  String get editorBubbleMenu => '선택한 글 서식';

  @override
  String get editorBulletList => '글머리 기호 목록';

  @override
  String get editorCallout => '콜아웃';

  @override
  String get editorCalloutKind => '콜아웃 종류';

  @override
  String get editorCalloutRemove => '콜아웃 해제';

  @override
  String get editorCode => '코드';

  @override
  String get editorCodeBlock => '코드 블록';

  @override
  String get editorCodeLanguage => '코드 언어';

  @override
  String get editorCodeLanguageSearch => '언어 찾기';

  @override
  String get editorCodePlainText => '일반 텍스트';

  @override
  String get editorColor => '색';

  @override
  String get editorColorDefault => '기본';

  @override
  String get editorColorNone => '없음';

  @override
  String get editorColorPrimary => '강조 1';

  @override
  String get editorColorSecondary => '강조 2';

  @override
  String get editorColorTertiary => '강조 3';

  @override
  String get editorContent => '본문';

  @override
  String get editorDetails => '토글';

  @override
  String get editorDetailsSummary => '제목';

  @override
  String get editorDetailsToggle => '내용 펼치기';

  @override
  String editorHeading({required num level}) => '제목 ${_number(level)}';

  @override
  String get editorHighlight => '형광펜';

  @override
  String get editorHighlightColor => '형광펜 색';

  @override
  String get editorHorizontalRule => '구분선';

  @override
  String get editorImage => '그림';

  @override
  String get editorImageAlt => '대체 텍스트';

  @override
  String get editorImageInsert => '넣기';

  @override
  String get editorImagePickFiles => '파일에서 고르기';

  @override
  String get editorImageUploadFailed => '그림을 올리지 못했습니다';

  @override
  String get editorImageUploading => '그림을 올리는 중입니다';

  @override
  String get editorImageUrl => '그림 주소';

  @override
  String get editorImageUrlInvalid => 'http 나 https 로 시작하는 주소를 넣어 주세요';

  @override
  String get editorItalic => '기울임';

  @override
  String get editorLink => '링크';

  @override
  String get editorLinkApply => '적용';

  @override
  String get editorLinkRemove => '링크 지우기';

  @override
  String get editorLinkUrl => '링크 주소';

  @override
  String get editorMentionEmpty => '맞는 사람이 없습니다';

  @override
  String get editorMentionMenu => '멘션';

  @override
  String get editorMentionSearching => '찾는 중…';

  @override
  String get editorOrderedList => '번호 목록';

  @override
  String get editorParagraph => '문단';

  @override
  String get editorSlashMenu => '블록 넣기';

  @override
  String get editorSlashMenuEmpty => '맞는 블록이 없습니다';

  @override
  String get editorStrike => '취소선';

  @override
  String get editorSubscript => '아래 첨자';

  @override
  String get editorSuperscript => '위 첨자';

  @override
  String get editorTable => '표';

  @override
  String get editorTableAddColumnAfter => '오른쪽에 열 추가';

  @override
  String get editorTableAddColumnBefore => '왼쪽에 열 추가';

  @override
  String get editorTableAddRowAfter => '아래에 행 추가';

  @override
  String get editorTableAddRowBefore => '위에 행 추가';

  @override
  String get editorTableDelete => '표 지우기';

  @override
  String get editorTableDeleteColumn => '열 지우기';

  @override
  String get editorTableDeleteRow => '행 지우기';

  @override
  String get editorTableHeaderRow => '머리글 행';

  @override
  String get editorTableInsert => '표 넣기';

  @override
  String get editorTableMergeCells => '셀 합치기';

  @override
  String editorTableSize({required num rows, required num cols}) => '${_number(rows)}행 ${_number(cols)}열';

  @override
  String get editorTableSplitCell => '셀 나누기';

  @override
  String editorTaskItem({required String text}) => '할 일: $text';

  @override
  String get editorTaskItemEmpty => '빈 할 일';

  @override
  String get editorTaskList => '할 일 목록';

  @override
  String get editorTextAlign => '정렬';

  @override
  String get editorTextColor => '글자 색';

  @override
  String get editorToolbar => '서식';

  @override
  String get editorUnderline => '밑줄';

  @override
  String fileFieldCount({required num count}) => '파일 ${_number(count)}개';

  @override
  String get fileFieldList => '고른 파일';

  @override
  String get imageDownload => '내려받기';

  @override
  String get imagePhotos => '사진';

  @override
  String imagePreview({required String alt}) => '$alt 크게 보기';

  @override
  String get imagePreviewUntitled => '이미지 크게 보기';

  @override
  String get imageShare => '공유하기';

  @override
  String get imageThumbnails => '사진 목록';

  @override
  String get imageViewer => '사진 보기';

  @override
  String get imageZoomIn => '확대';

  @override
  String get imageZoomOut => '축소';

  @override
  String imageZoomReset({required String percent}) => '$percent, 화면에 맞추기';

  @override
  String get kbdAlt => '알트';

  @override
  String get kbdBackspace => '백스페이스';

  @override
  String get kbdCapsLock => '캡스 락';

  @override
  String get kbdCommand => '커맨드';

  @override
  String get kbdControl => '컨트롤';

  @override
  String get kbdDelete => '딜리트';

  @override
  String get kbdDown => '아래쪽 화살표';

  @override
  String get kbdEnd => '엔드';

  @override
  String get kbdEnter => '엔터';

  @override
  String get kbdEscape => '이스케이프';

  @override
  String get kbdFn => '펑션';

  @override
  String get kbdForwardDelete => '포워드 딜리트';

  @override
  String get kbdHome => '홈';

  @override
  String get kbdLeft => '왼쪽 화살표';

  @override
  String get kbdMacDelete => '딜리트';

  @override
  String get kbdOption => '옵션';

  @override
  String get kbdPageDown => '페이지 다운';

  @override
  String get kbdPageUp => '페이지 업';

  @override
  String get kbdReturn => '리턴';

  @override
  String get kbdRight => '오른쪽 화살표';

  @override
  String get kbdShift => '시프트';

  @override
  String get kbdSpace => '스페이스';

  @override
  String get kbdSuper => '슈퍼';

  @override
  String get kbdTab => '탭';

  @override
  String get kbdUp => '위쪽 화살표';

  @override
  String get kbdWindows => '윈도우';

  @override
  String get linkNewTab => '(새 탭에서 열림)';

  @override
  String get menuCommand => '명령';

  @override
  String get messageActions => '메시지 동작';

  @override
  String get messageError => '보내지 못했어요';

  @override
  String get messageRetry => '다시 보내기';

  @override
  String get messageUnread => '안 읽음';

  @override
  String messageUnreadBy({required num count}) => '${_number(count)}명 안 읽음';

  @override
  String get messageScrollerJump => '맨 아래로';

  @override
  String messageScrollerJumpUnseen({required num count}) => '맨 아래로, 새 메시지 ${_number(count)}개';

  @override
  String messageScrollerUnseen({required num count}) => '새 메시지 ${_number(count)}개';

  @override
  String get numberFieldDecrement => '값 줄이기';

  @override
  String get numberFieldIncrement => '값 늘리기';

  @override
  String get paginationFirst => '첫 페이지';

  @override
  String get paginationLast => '마지막 페이지';

  @override
  String paginationPage({required num page}) => '${_number(page)}페이지';

  @override
  String get passwordFieldShow => '비밀번호 표시';

  @override
  String get promptInputActions => '더하기';

  @override
  String get promptInputAttach => '파일 첨부';

  @override
  String get promptInputAttachments => '첨부한 파일';

  @override
  String get promptInputSend => '보내기';

  @override
  String get promptInputStop => '멈추기';

  @override
  String get questionnaireNavigation => '질문 이동';

  @override
  String get questionnaireProgress => '질문 진행';

  @override
  String questionnaireStep({required num current, required num total}) => '질문 ${_number(current)} / ${_number(total)}';

  @override
  String ratingValueLabel({required num value, required num max}) => '${_number(max)}점 만점에 ${_number(value)}점';

  @override
  String get schedulerAddDay => '하루 늘리기';

  @override
  String get schedulerAllDay => '종일';

  @override
  String get schedulerDayCount => '보여 줄 날 수';

  @override
  String schedulerDragAt({required String time}) => '$time 시작';

  @override
  String get schedulerDragHint => '일정에서 Space로 집고, 방향키로 15분이나 하루씩 옮긴 뒤 Enter로 놓습니다. Shift와 위아래 방향키는 1시간씩 옮깁니다. Escape는 취소합니다.';

  @override
  String get schedulerDragMonthHint => '일정에서 Space로 집고, 좌우 방향키로 하루, 위아래 방향키로 한 주씩 옮긴 뒤 Enter로 놓습니다. Escape는 취소합니다.';

  @override
  String get schedulerGoToDate => '날짜로 이동';

  @override
  String schedulerMoreLabel({required String date, required num count}) => '$date 일정 ${_number(count)}개 더 보기';

  @override
  String get schedulerNavigation => '날짜 이동';

  @override
  String get schedulerRemoveDay => '하루 줄이기';

  @override
  String schedulerResize({required String event}) => '$event 끝 시각';

  @override
  String get schedulerView => '보기';

  @override
  String sidebarDragAfter({required String target}) => '$target 뒤';

  @override
  String sidebarDragBefore({required String target}) => '$target 앞';

  @override
  String get sidebarDragHint => 'Space로 집고, 위아래 방향키로 놓을 자리를 고른 뒤 Enter로 놓습니다. Escape는 취소합니다.';

  @override
  String sidebarDragInside({required String target}) => '$target 안';

  @override
  String get sidebarDragOrigin => '원래 자리';

  @override
  String get sidebarOpen => '메뉴 열기';

  @override
  String get sliderEnd => '끝';

  @override
  String get sliderStart => '시작';

  @override
  String get slidesRoleDescription => '슬라이드';

  @override
  String slidesSlide({required num index, required num count}) => '${_number(count)}장 중 ${_number(index)}번째';

  @override
  String get stepperCompleted => '완료';

  @override
  String get stepperError => '오류';

  @override
  String get telFieldCountry => '국가';

  @override
  String get textAreaLimitReached => '글자 수 제한에 도달했습니다.';

  @override
  String textAreaRemaining({required num remaining}) => '${_number(remaining)}자 남았습니다.';

  @override
  String get textFieldRequired => '값을 입력해 주세요.';

  @override
  String get timePickerLabel => '시간';

  @override
  String get toastRegion => '알림';
}

@immutable
class IdsLocale {
  IdsLocale({required this.locale, required this.messages})
    : assert(
        locale.languageCode == messages.language,
        'IdsLocale: the locale ${locale.toLanguageTag()} is not in the language of its messages (${messages.language}).',
      );

  static final en = IdsLocale(
    locale: Locale.fromSubtags(languageCode: 'en', countryCode: 'US'),
    messages: const IdsMessagesEn(),
  );

  static final ko = IdsLocale(
    locale: Locale.fromSubtags(languageCode: 'ko', countryCode: 'KR'),
    messages: const IdsMessagesKo(),
  );

  static final List<IdsLocale> values = [en, ko];

  final Locale locale;
  final IdsMessagesBase messages;

  @override
  bool operator ==(Object other) =>
      other is IdsLocale && other.locale == locale && other.messages == messages;

  @override
  int get hashCode => Object.hash(locale, messages);
}
