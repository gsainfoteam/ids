import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'fixtures/slang/generated/translations.g.dart';

void main() {
  test('generated Korean defaults preserve interpolation and number grouping', () {
    const ko = IdsMessages.ko;
    expect(ko.dialogClose, '닫기');
    expect(ko.chipFieldRemove(label: '사과'), '사과 삭제');
    expect(ko.textAreaCountOfMax(count: 1200, maxLength: 2000), '1,200 / 2,000');
    expect(ko.ratingValueLabel(max: 5, value: 4.5), '5점 만점에 4.5점');
  });

  test('slang objects implement the IDS contract without an adapter', () {
    final IdsMessages en = Translations().ids;
    expect(en.dialogClose, 'Close');
    expect(en.chipFieldRemove(label: 'Apple'), 'Remove Apple');
    expect(en.textAreaRemaining(remaining: 12), '12 characters left');
    expect(en.toastClose, isNull);
    expect(en.toastClose ?? IdsMessages.ko.toastClose, '알림 닫기');
  });
}
