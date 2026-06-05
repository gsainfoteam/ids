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
                  leading: HugeIcon(icon: HugeIcons.strokeRoundedUser, color: theme.onSurface, size: 20),
                  title: '계정',
                  description: '회원 정보 수정 · 아이디 및 비밀번호 변경',
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
                      leading: HugeIcon(icon: HugeIcons.strokeRoundedUser, color: theme.onSurface, size: 20),
                      title: '계정',
                      description: '회원 정보 수정 · 아이디 및 비밀번호 변경',
                      onPressed: () {},
                    ),
                    const IdsDivider(),
                    IdsItem(
                      leading: HugeIcon(icon: HugeIcons.strokeRoundedLogout03, color: theme.onSurface, size: 20),
                      title: '로그아웃',
                      onPressed: () {},
                    ),
                    const IdsDivider(),
                    IdsItem(
                      leading: HugeIcon(icon: HugeIcons.strokeRoundedSettings02, color: theme.onSurface, size: 20),
                      title: '설정',
                      description: '알림 · 언어 · 정보',
                      onPressed: () {},
                    ),
                    const IdsDivider(),
                    IdsItem(
                      leading: HugeIcon(icon: HugeIcons.strokeRoundedMessageEdit01, color: theme.onSurface, size: 20),
                      title: '피드백 · 버그 제보하기',
                      onPressed: () {},
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
