import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final mvpFrameUseCases = [
  WidgetbookUseCase(
    name: 'Ziggle Notice Detail',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.orange,
      child: const _Phone(child: _ZiggleNoticeDetailFrame()),
    ),
  ),
  WidgetbookUseCase(
    name: 'Ziggle Profile',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.orange,
      child: const _Phone(child: _ZiggleProfileFrame()),
    ),
  ),
  WidgetbookUseCase(
    name: 'Potg Main List',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.green,
      child: const _Phone(child: _PotgMainListFrame()),
    ),
  ),
  WidgetbookUseCase(
    name: 'Potg Create Time',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.green,
      child: const _Phone(child: _PotgCreateTimeFrame()),
    ),
  ),
];

Widget _withTheme(
  BuildContext context, {
  required IdsColor initialColor,
  required Widget child,
}) {
  final color = context.knobs.object.dropdown(
    label: 'Color',
    options: IdsColor.values,
    initialOption: initialColor,
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
    child: Center(child: child),
  );
}

class _Phone extends StatelessWidget {
  const _Phone({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return ClipRect(
      child: Container(
        width: 390,
        height: 760,
        color: theme.muted,
        child: child,
      ),
    );
  }
}

class _PhoneHeader extends StatelessWidget {
  const _PhoneHeader({required this.title, this.backLabel});

  final String title;
  final String? backLabel;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: theme.surface,
        border: Border(bottom: BorderSide(color: theme.outline)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (backLabel != null)
            Positioned(
              left: 16,
              child: IdsText(
                backLabel!,
                variant: IdsTextVariant.label,
                color: theme.primary,
              ),
            ),
          IdsText(title, variant: IdsTextVariant.label),
        ],
      ),
    );
  }
}

class _ZiggleNoticeDetailFrame extends StatelessWidget {
  const _ZiggleNoticeDetailFrame();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Column(
      children: [
        const _PhoneHeader(title: '공지 상세', backLabel: '공지'),
        Expanded(
          child: ColoredBox(
            color: theme.surface,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: IdsVStack(
                gap: 20,
                crossAxis: CrossAxis.start,
                children: [
                  IdsButton(
                    onPressed: () {},
                    children: const [Text('마감기한  2024.03.30. 18:00')],
                  ),
                  const IdsHStack(
                    gap: 10,
                    crossAxis: CrossAxis.center,
                    children: [
                      IdsAvatar(name: '인포팀'),
                      IdsText('인포팀 · 32분 전', variant: IdsTextVariant.label),
                    ],
                  ),
                  const IdsText(
                    '2024 정보국 신입 국원 모집',
                    variant: IdsTextVariant.heading,
                  ),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: const [
                      IdsBadge('#모집'),
                      IdsBadge('#인포팀'),
                      IdsBadge('#개발'),
                      IdsBadge('#지글'),
                      IdsBadge('#비대위'),
                      IdsBadge('#정보국'),
                    ],
                  ),
                  const _NoticePoster(),
                  const IdsText(
                    '비상대책위원회 정보국(Infoteam)에서 신규 부원 모집을 진행합니다!\n지원서 작성 구글 폼 링크',
                  ),
                  const IdsText(
                    '인포팀은 IT 서비스 개발을 통해 GIST 학부생의 학교 생활을 편리하게 만들어주는 역할을 수행하고 있습니다. 현재 지글(Ziggle), IdP 등의 서비스를 운영 중입니다.',
                  ),
                  const _ReactionBar(),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _NoticePoster extends StatelessWidget {
  const _NoticePoster();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 320,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFFFFE0E3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ThemeProvider.of(context).outline),
      ),
      child: const IdsText(
        '2024 정보국\n신규 국원 모집',
        variant: IdsTextVariant.heading,
        align: TextAlign.center,
        color: Color(0xFFE85F6A),
      ),
    );
  }
}

class _ReactionBar extends StatelessWidget {
  const _ReactionBar();

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        IdsButton(
          onPressed: () {},
          size: IdsSize.sm,
          children: const [Text('🔥 268')],
        ),
        IdsButton(
          onPressed: () {},
          size: IdsSize.sm,
          variant: IdsVariant.soft,
          children: const [Text('😮 37')],
        ),
        IdsButton(
          onPressed: () {},
          size: IdsSize.sm,
          variant: IdsVariant.soft,
          children: const [Text('공유하기')],
        ),
        IdsButton(
          onPressed: () {},
          size: IdsSize.sm,
          variant: IdsVariant.soft,
          children: const [Text('링크 복사하기')],
        ),
      ],
    );
  }
}

class _ZiggleProfileFrame extends StatelessWidget {
  const _ZiggleProfileFrame();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: IdsVStack(
              gap: 24,
              children: [
                const IdsCard(
                  size: IdsCardSize.lg,
                  child: IdsCardContent(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: IdsVStack(
                        gap: 10,
                        crossAxis: CrossAxis.center,
                        children: [
                          IdsAvatar(name: '이정우', size: IdsSize.xxl),
                          IdsText('이정우', variant: IdsTextVariant.heading),
                          IdsText('20260000', variant: IdsTextVariant.title),
                          IdsText('crowntheking@gm.gist.ac.kr'),
                        ],
                      ),
                    ),
                  ),
                ),
                _ProfileSection(
                  items: const [
                    ('계정', '회원 정보 수정 · 아이디 및 비밀번호 변경'),
                    ('회원 탈퇴', null),
                    ('로그아웃', null),
                  ],
                ),
                _ProfileSection(
                  items: const [
                    ('설정', '알림 · 언어 · 정보'),
                    ('피드백 · 버그 제보하기', null),
                  ],
                ),
              ],
            ),
          ),
        ),
        IdsBottomNavigation(
          currentIndex: 2,
          onTap: (_) {},
          items: [
            _navItem(HugeIcons.strokeRoundedHome01, '홈'),
            _navItem(HugeIcons.strokeRoundedBookmark01, '즐겨찾기'),
            _navItem(HugeIcons.strokeRoundedUserCircle02, '프로필'),
          ],
        ),
      ],
    );
  }
}

class _ProfileSection extends StatelessWidget {
  const _ProfileSection({required this.items});

  final List<(String, String?)> items;

  @override
  Widget build(BuildContext context) {
    return IdsCard(
      child: IdsCardContent(
        child: Column(
          children: [
            for (var i = 0; i < items.length; i++) ...[
              IdsItem(
                children: [
                  IdsItemContent(
                    children: [
                      IdsItemTitle(items[i].$1),
                      if (items[i].$2 != null) IdsItemDescription(items[i].$2!),
                    ],
                  ),
                ],
              ),
              if (i < items.length - 1)
                Container(height: 1, color: ThemeProvider.of(context).outline),
            ],
          ],
        ),
      ),
    );
  }
}

class _PotgMainListFrame extends StatelessWidget {
  const _PotgMainListFrame();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Stack(
      children: [
        Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: IdsVStack(
                  gap: 20,
                  crossAxis: CrossAxis.start,
                  children: [
                    const IdsText('팟쥐', variant: IdsTextVariant.heading),
                    const _WeekStatusCard(),
                    IdsText(
                      '2025/11/15 토요일',
                      variant: IdsTextVariant.label,
                      color: theme.onMuted,
                    ),
                    for (var i = 0; i < 5; i++) const _TaxiPotCard(),
                  ],
                ),
              ),
            ),
            IdsBottomNavigation(
              currentIndex: 0,
              onTap: (_) {},
              items: [
                _navItem(HugeIcons.strokeRoundedHome01, '모든 팟'),
                _navItem(HugeIcons.strokeRoundedSearch01, '팟 검색'),
                _navItem(HugeIcons.strokeRoundedMessage01, '채팅방'),
                _navItem(HugeIcons.strokeRoundedUserCircle02, '내 정보'),
              ],
            ),
          ],
        ),
        IdsFloatingButton(
          semanticLabel: '새 팟 만들기',
          onPressed: () {},
          children: const [_HugeIcon(HugeIcons.strokeRoundedCar03)],
        ),
      ],
    );
  }
}

class _WeekStatusCard extends StatelessWidget {
  const _WeekStatusCard();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    return IdsCard(
      child: IdsCardContent(
        child: IdsVStack(
          gap: 16,
          crossAxis: CrossAxis.start,
          children: [
            const IdsText('요일 별 팟 현황', variant: IdsTextVariant.title),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                for (var i = 0; i < days.length; i++)
                  Column(
                    children: [
                      IdsText(days[i], variant: IdsTextVariant.caption),
                      const SizedBox(height: 8),
                      for (var row = 0; row < 3; row++) ...[
                        Container(
                          width: 34,
                          height: 34,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: i == 6 && row == 1 ? theme.primary : null,
                            border: Border.all(color: theme.outline),
                          ),
                          child: IdsText(
                            i == 6 && row == 1 ? '5' : (row == 0 ? '0' : '1'),
                            variant: IdsTextVariant.label,
                            color: i == 6 && row == 1
                                ? theme.onPrimary
                                : theme.onSurface,
                          ),
                        ),
                        if (row < 2) const SizedBox(height: 8),
                      ],
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TaxiPotCard extends StatelessWidget {
  const _TaxiPotCard();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return IdsCard(
      variant: IdsCardVariant.elevated,
      interactive: true,
      child: Row(
        children: [
          const Expanded(
            child: IdsCardContent(
              child: IdsVStack(
                gap: 8,
                crossAxis: CrossAxis.start,
                children: [
                  IdsText('지스트 → 송정역', variant: IdsTextVariant.label),
                  IdsText('13:10~14:00', variant: IdsTextVariant.title),
                ],
              ),
            ),
          ),
          Container(
            width: 88,
            height: 92,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.secondary,
              border: Border(left: BorderSide(color: theme.outline)),
            ),
            child: IdsVStack(
              gap: 4,
              fit: IdsStackFit.content,
              crossAxis: CrossAxis.center,
              children: [
                const IdsText('정원', variant: IdsTextVariant.caption),
                IdsText(
                  '1/4',
                  variant: IdsTextVariant.title,
                  color: theme.primary,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PotgCreateTimeFrame extends StatelessWidget {
  const _PotgCreateTimeFrame();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return ColoredBox(
      color: theme.surface,
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: IdsVStack(
          gap: 24,
          crossAxis: CrossAxis.start,
          children: [
            const IdsText('팟 생성', variant: IdsTextVariant.heading),
            _StepRow(index: '1', label: '지스트 → 광주송정역', filled: true),
            _StepRow(index: '2', label: '11월 14일 금요일', filled: true),
            _StepRow(index: '3', label: '시간대 설정', filled: false),
            const IdsCard(
              child: IdsCardContent(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _TimeSummary(label: '금요일 오전', time: '9:41'),
                    IdsText('~', variant: IdsTextVariant.heading),
                    _TimeSummary(label: '금요일 오후', time: '12:30'),
                  ],
                ),
              ),
            ),
            const IdsText(
              '출발 가능한 가장 늦은 시각을 설정하세요',
              variant: IdsTextVariant.title,
            ),
            IdsCard(
              variant: IdsCardVariant.filled,
              child: IdsCardContent(
                child: SizedBox(
                  height: 240,
                  child: IdsVStack(
                    gap: 28,
                    mainAxis: MainAxis.center,
                    crossAxis: CrossAxis.center,
                    children: [
                      IdsHStack(
                        gap: 32,
                        fit: IdsStackFit.content,
                        children: [
                          IdsText(
                            '9',
                            variant: IdsTextVariant.heading,
                            color: theme.onMuted,
                          ),
                          IdsText(
                            '41',
                            variant: IdsTextVariant.heading,
                            color: theme.onMuted,
                          ),
                          IdsText(
                            'AM',
                            variant: IdsTextVariant.heading,
                            color: theme.onMuted,
                          ),
                        ],
                      ),
                      IdsButton(
                        onPressed: () {},
                        variant: IdsVariant.outline,
                        children: const [Text('확인')],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StepRow extends StatelessWidget {
  const _StepRow({
    required this.index,
    required this.label,
    required this.filled,
  });

  final String index;
  final String label;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return IdsHStack(
      gap: 12,
      crossAxis: CrossAxis.center,
      children: [
        Container(
          width: 34,
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: filled ? theme.primary : null,
            borderRadius: BorderRadius.circular(10),
            border: filled ? null : Border.all(color: theme.primary, width: 2),
          ),
          child: IdsText(
            index,
            variant: IdsTextVariant.title,
            color: filled ? theme.onPrimary : theme.primary,
          ),
        ),
        Expanded(child: IdsText(label, variant: IdsTextVariant.title)),
      ],
    );
  }
}

class _TimeSummary extends StatelessWidget {
  const _TimeSummary({required this.label, required this.time});

  final String label;
  final String time;

  @override
  Widget build(BuildContext context) {
    return IdsVStack(
      gap: 4,
      fit: IdsStackFit.content,
      crossAxis: CrossAxis.center,
      children: [
        IdsText(label, variant: IdsTextVariant.caption),
        IdsText(time, variant: IdsTextVariant.title),
      ],
    );
  }
}

IdsBottomNavigationItem _navItem(List<List<dynamic>> icon, String label) {
  return IdsBottomNavigationItem(
    label: label,
    icon: (color, size) => HugeIcon(icon: icon, color: color, size: size),
  );
}

class _HugeIcon extends StatelessWidget {
  const _HugeIcon(this.icon);

  final List<List<dynamic>> icon;

  @override
  Widget build(BuildContext context) {
    final iconTheme = IconTheme.of(context);
    return HugeIcon(
      icon: icon,
      color: iconTheme.color ?? const Color(0xFF000000),
      size: iconTheme.size ?? 24,
    );
  }
}
