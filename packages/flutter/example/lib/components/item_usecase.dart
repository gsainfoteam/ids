import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final itemUseCases = [
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
        child: Builder(
          builder: (context) {
            final theme = ThemeProvider.of(context);
            return Center(
              child: SizedBox(
                width: 320,
                child: IdsItem(
                  children: [
                    IdsItemLeading(
                      child: HugeIcon(icon: HugeIcons.strokeRoundedUser, color: theme.onSurface, size: 20),
                    ),
                    const IdsItemContent(children: [
                      IdsItemTitle('계정'),
                      IdsItemDescription('회원 정보 수정 · 아이디 및 비밀번호 변경'),
                    ]),
                  ],
                ),
              ),
            );
          },
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Profile Menu',
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
        child: Builder(
          builder: (context) {
            final theme = ThemeProvider.of(context);
            return Center(
              child: SizedBox(
                width: 320,
                child: IdsVStack(
                  children: [
                    IdsItem(
                      onPressed: () {},
                      children: [
                        IdsItemLeading(
                          child: HugeIcon(icon: HugeIcons.strokeRoundedUser, color: theme.onSurface, size: 20),
                        ),
                        const IdsItemContent(children: [
                          IdsItemTitle('계정'),
                          IdsItemDescription('회원 정보 수정 · 아이디 및 비밀번호 변경'),
                        ]),
                      ],
                    ),
                    const IdsDivider(),
                    IdsItem(
                      onPressed: () {},
                      children: [
                        IdsItemLeading(
                          child: HugeIcon(icon: HugeIcons.strokeRoundedLogout03, color: theme.onSurface, size: 20),
                        ),
                        const IdsItemContent(children: [
                          IdsItemTitle('로그아웃'),
                        ]),
                      ],
                    ),
                    const IdsDivider(),
                    IdsItem(
                      onPressed: () {},
                      children: [
                        IdsItemLeading(
                          child: HugeIcon(icon: HugeIcons.strokeRoundedSettings02, color: theme.onSurface, size: 20),
                        ),
                        const IdsItemContent(children: [
                          IdsItemTitle('설정'),
                          IdsItemDescription('알림 · 언어 · 정보'),
                        ]),
                      ],
                    ),
                    const IdsDivider(),
                    IdsItem(
                      onPressed: () {},
                      children: [
                        IdsItemLeading(
                          child: HugeIcon(icon: HugeIcons.strokeRoundedMessageEdit01, color: theme.onSurface, size: 20),
                        ),
                        const IdsItemContent(children: [
                          IdsItemTitle('피드백 · 버그 제보하기'),
                        ]),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    },
  ),
];
