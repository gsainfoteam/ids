import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'fixtures/slang/generated/translations.g.dart';

void main() {
  test(
    'generated Korean defaults preserve interpolation and number grouping',
    () {
      const ko = IdsMessages.ko;
      expect(ko.commonClose, '닫기');
      expect(ko.commonRemoveItem(label: '사과'), '사과 삭제');
      expect(ko.dataTableSelectRowNumber(number: 1200), '1,200번째 행 선택');
      expect(ko.ratingValueLabel(max: 5, value: 4.5), '5점 만점에 4.5점');
    },
  );

  test('slang objects implement the IDS contract without an adapter', () {
    final IdsMessages en = Translations().ids;
    expect(en.commonClose, 'Close');
    expect(en.commonRemoveItem(label: 'Apple'), 'Remove Apple');
    expect(en.textAreaRemaining(remaining: 12), 'Characters left: 12');
    expect(en.toastRegion, isNull);
    expect(en.toastRegion ?? IdsMessages.ko.toastRegion, '알림');
  });
}
