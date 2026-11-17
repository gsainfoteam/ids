import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

const _orientations = ['vertical'];

final fieldUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) => SizedBox(
      width: 320,
      child: ids.Field(
        size: dropdown(context, 'size', ids.IdsSize.values),
        invalid: context.knobs.boolean(label: 'invalid'),
        disabled: context.knobs.boolean(label: 'disabled'),
        required: context.knobs.boolean(label: 'required', initialValue: true),
        children: const [
          ids.FieldLabel(child: Text('이메일')),
          ids.FieldDescription(child: Text('로그인에 사용합니다.')),
          StandInTextField(placeholder: 'name@example.com'),
          ids.FieldHint(child: Text('회사 이메일을 권장합니다.')),
          ids.FieldError(child: Text('이메일 형식을 확인하세요.')),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Orientation × Size',
          children: [
            ShowcaseMatrix(
              rows: ids.IdsSize.values,
              columns: _orientations,
              builder: (size, orientation) => SizedBox(
                width: 320,
                child: ids.Field(
                  size: size,
                  children: const [
                    ids.FieldLabel(child: Text('이름')),
                    ids.FieldDescription(child: Text('실명으로 적어 주세요.')),
                    StandInTextField(placeholder: '홍길동'),
                    ids.FieldHint(child: Text('한글 또는 영문')),
                  ],
                ),
              ),
            ),
          ],
        ),
        const ShowcaseSection(
          title: 'States',
          children: [
            ShowcaseRow(
              label: 'default',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Field(
                    children: [
                      ids.FieldLabel(child: Text('닉네임')),
                      StandInTextField(placeholder: '닉네임'),
                      ids.FieldHint(child: Text('2자 이상')),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'required',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Field(
                    required: true,
                    children: [
                      ids.FieldLabel(child: Text('닉네임')),
                      StandInTextField(placeholder: '닉네임'),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'filled',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Field(
                    children: [
                      ids.FieldLabel(child: Text('닉네임')),
                      _Prefilled('인포팀'),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'invalid',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Field(
                    invalid: true,
                    children: [
                      ids.FieldLabel(child: Text('닉네임')),
                      _Prefilled('a'),
                      ids.FieldHint(child: Text('2자 이상')),
                      ids.FieldError(child: Text('2자 이상 입력하세요.')),
                    ],
                  ),
                ),
              ],
            ),
            ShowcaseRow(
              label: 'disabled',
              children: [
                SizedBox(
                  width: 320,
                  child: ids.Field(
                    disabled: true,
                    children: [
                      ids.FieldLabel(child: Text('닉네임')),
                      _Prefilled('인포팀', disabled: true),
                      ids.FieldHint(child: Text('변경할 수 없습니다.')),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ),
  WidgetbookUseCase(
    name: 'Custom Label',
    builder: (context) => const SizedBox(
      width: 320,
      child: ids.Field(
        required: true,
        children: [
          ids.FieldLabel(
            child: Text(
              '사용자 이름',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          StandInTextField(),
        ],
      ),
    ),
  ),
];

class _Prefilled extends StatefulWidget {
  const _Prefilled(this.value, {this.disabled = false});

  final String value;
  final bool disabled;

  @override
  State<_Prefilled> createState() => _PrefilledState();
}

class _PrefilledState extends State<_Prefilled> {
  late final _controller = TextEditingController(text: widget.value);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      StandInTextField(controller: _controller, disabled: widget.disabled);
}
