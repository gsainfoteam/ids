import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final cardUseCases = [
  WidgetbookUseCase(
    name: 'Basic',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: const Center(
          child: SizedBox(
            width: 320,
            child: IdsCard(
              child: IdsCardContent(
                child: IdsText('기본 카드', style: IdsTypography.bodyB2Regular),
              ),
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'With Header',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: const Center(
          child: SizedBox(
            width: 320,
            child: IdsCard(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IdsCardHeader(children: [
                    IdsCardTitle('공지 제목'),
                    IdsCardDescription('2024년 3월 30일'),
                  ]),
                  IdsCardContent(
                    child: IdsText('카드 본문 내용이 들어갑니다.', style: IdsTypography.bodyB2Regular),
                  ),
                  IdsCardFooter(
                    child: Row(
                      children: [
                        IdsBadge('#모집', variant: IdsVariant.soft),
                        SizedBox(width: 6),
                        IdsBadge('#인포팀', variant: IdsVariant.soft),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Potg Route',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.green,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: const Center(
          child: SizedBox(
            width: 320,
            child: IdsCard(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IdsCardHeader(children: [
                    IdsCardDescription('지스트 → 송정역'),
                    IdsCardTitle('13:10~14:00'),
                  ]),
                  IdsCardFooter(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        IdsBadge('정원 1/4', variant: IdsVariant.outline),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    },
  ),
];
