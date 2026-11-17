import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final textFieldUseCases = [
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      Builder(
        builder: (context) => Form(
          child: Builder(
            builder: (context) => SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: 16,
                children: [
                  const Text('Variant × Size'),
                  const Row(
                    spacing: 12,
                    children: [
                      SizedBox(width: 70),
                      Expanded(child: Text('outline')),
                      Expanded(child: Text('soft')),
                      Expanded(child: Text('ghost')),
                    ],
                  ),
                  for (final size in IdsSize.values)
                    Row(
                      spacing: 12,
                      children: [
                        SizedBox(width: 70, child: Text(size.name)),
                        for (final variant in [
                          IdsVariant.outline,
                          IdsVariant.soft,
                          IdsVariant.ghost,
                        ])
                          Expanded(
                            child: IdsTextField(
                              size: size,
                              variant: variant,
                              semanticLabel: '${variant.name} ${size.name}',
                              placeholder: '이름',
                            ),
                          ),
                      ],
                    ),
                  const Text('States and interaction'),
                  const IdsField(
                    required: true,
                    children: [
                      IdsFieldLabel(child: Text('검색')),
                      IdsTextField(
                        defaultValue: '인포팀',
                        clearable: true,
                        placeholder: '검색어를 입력하세요',
                        leading: Icon(Icons.search),
                      ),
                    ],
                  ),
                  const IdsField(
                    size: IdsSize.tiny,
                    invalid: true,
                    children: [
                      IdsFieldLabel(child: Text('이메일')),
                      IdsTextField(
                        variant: IdsVariant.soft,
                        defaultValue: 'info',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      IdsFieldError(child: Text('이메일 주소를 확인해 주세요.')),
                    ],
                  ),
                  const IdsTextField(
                    disabled: true,
                    semanticLabel: '사이트',
                    variant: IdsVariant.ghost,
                    placeholder: '이 필드는 비활성화되어 있습니다.',
                  ),
                  const IdsTextField(
                    semanticLabel: '읽기 전용',
                    defaultValue: '읽기 전용',
                    readOnly: true,
                  ),
                  IdsButton(
                    onPressed: () => Form.of(context).reset(),
                    variant: IdsVariant.outline,
                    child: const Text('초기화'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      width: 680,
    ),
  ),
];
