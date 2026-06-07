import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter/tokens/ids_typography.dart';
import 'package:widgetbook/widgetbook.dart';

final mvpFrameUseCases = [
  WidgetbookUseCase(
    name: 'Ziggle Groups',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.orange,
      child: const _Phone(child: _ZiggleGroupsFrame()),
    ),
  ),
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
  WidgetbookUseCase(
    name: 'Potg Search Empty',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.green,
      child: const _Phone(child: _PotgSearchEmptyFrame()),
    ),
  ),
  WidgetbookUseCase(
    name: 'Potg Filter Dialog',
    builder: (context) => _withTheme(
      context,
      initialColor: IdsColor.green,
      child: const _Phone(child: _PotgFilterDialogFrame()),
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

class _ZiggleGroupsFrame extends StatelessWidget {
  const _ZiggleGroupsFrame();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Column(
      children: [
        const _GroupHeader(),
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final panelHeight = constraints.maxHeight - 49;

              return IdsTabs<String>(
                defaultValue: 'notice',
                items: [
                  IdsTabItem(
                    value: 'intro',
                    label: '소개',
                    child: SizedBox(
                      height: panelHeight,
                      child: const Padding(
                        padding: EdgeInsets.all(24),
                        child: IdsText(
                          '지속 가능한 개발 문화를 통해 지스트 학부생의 삶의 질을 높이는 팀입니다.',
                          variant: IdsTextVariant.label,
                        ),
                      ),
                    ),
                  ),
                  IdsTabItem(
                    value: 'notice',
                    label: '공지',
                    child: SizedBox(
                      height: panelHeight,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: IdsVStack(
                          gap: 16,
                          children: [
                            const _GroupNoticeCard(),
                            IdsCard(
                              variant: IdsCardVariant.elevated,
                              child: IdsCardContent(
                                child: IdsVStack(
                                  gap: 12,
                                  crossAxis: CrossAxis.start,
                                  children: [
                                    const IdsText(
                                      '2026 봄학기 개발자 모집 안내',
                                      variant: IdsTextVariant.body,
                                    ),
                                    const _NoticePoster(),
                                    Wrap(
                                      spacing: 8,
                                      children: const [
                                        IdsBadge('#공지'),
                                        IdsBadge('#행사'),
                                        IdsBadge('#지원'),
                                      ],
                                    ),
                                    IdsText(
                                      '10일 남음',
                                      variant: IdsTextVariant.caption,
                                      color: theme.primary,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  IdsTabItem(
                    value: 'members',
                    label: '멤버',
                    child: SizedBox(
                      height: panelHeight,
                      child: const Padding(
                        padding: EdgeInsets.all(24),
                        child: IdsText('멤버 목록', variant: IdsTextVariant.label),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

class _GroupHeader extends StatelessWidget {
  const _GroupHeader();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return ColoredBox(
      color: theme.surface,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: IdsVStack(
          gap: 18,
          children: [
            const IdsHStack(
              gap: 16,
              crossAxis: CrossAxis.center,
              children: [
                IdsAvatar(name: '인포팀', size: IdsSize.xxl),
                Expanded(
                  child: IdsVStack(
                    gap: 4,
                    crossAxis: CrossAxis.start,
                    children: [
                      IdsText('GIST 인포팀', variant: IdsTextVariant.title),
                      IdsText(
                        '구독자 248명 · 게시글 12개',
                        variant: IdsTextVariant.caption,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            IdsCard(
              variant: IdsCardVariant.filled,
              child: IdsCardContent(
                child: IdsText(
                  'GIST 학생을 위한 웹 서비스와 인증 인프라를 만들고 운영하는 개발팀입니다.',
                  variant: IdsTextVariant.label,
                  color: theme.onMuted,
                ),
              ),
            ),
            IdsButton(onPressed: () {}, children: const [Text('즐겨찾기')]),
          ],
        ),
      ),
    );
  }
}

class _GroupNoticeCard extends StatelessWidget {
  const _GroupNoticeCard();

  @override
  Widget build(BuildContext context) {
    return IdsCard(
      variant: IdsCardVariant.elevated,
      child: IdsCardContent(
        child: IdsVStack(
          gap: 12,
          crossAxis: CrossAxis.start,
          children: [
            const IdsHStack(
              gap: 10,
              crossAxis: CrossAxis.center,
              children: [
                IdsAvatar(name: '인포팀'),
                IdsVStack(
                  gap: 2,
                  crossAxis: CrossAxis.start,
                  fit: IdsStackFit.content,
                  children: [
                    IdsText('GIST 인포팀', variant: IdsTextVariant.caption),
                    IdsText('12분 전', variant: IdsTextVariant.caption),
                  ],
                ),
              ],
            ),
            const IdsText('2026 봄학기 인포팀 개발자 모집', variant: IdsTextVariant.body),
            const _NoticePoster(),
            Wrap(
              spacing: 8,
              children: const [
                IdsBadge('#모집'),
                IdsBadge('#개발'),
                IdsBadge('#인포팀'),
              ],
            ),
          ],
        ),
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
      width: double.infinity,
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
              top: 0,
              bottom: 0,
              child: Center(
                child: IdsText(
                  backLabel!,
                  variant: IdsTextVariant.label,
                  color: theme.primary,
                ),
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
                    children: const [Text('마감기한  2026.03.30. 18:00')],
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
                    '2026 봄학기 인포팀 개발자 모집',
                    variant: IdsTextVariant.title,
                  ),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: const [
                      IdsBadge('#모집'),
                      IdsBadge('#인포팀'),
                      IdsBadge('#개발'),
                      IdsBadge('#앱개발'),
                      IdsBadge('#디자인시스템'),
                      IdsBadge('#서비스운영'),
                    ],
                  ),
                  const _NoticePoster(),
                  const IdsText(
                    'GIST 인포팀에서 2026 봄학기 신규 멤버를 모집합니다.\n지원서 작성 구글 폼 링크',
                    variant: IdsTextVariant.label,
                  ),
                  const IdsText(
                    '인포팀은 지글(Ziggle), IdP, 디자인 시스템 등 학생들이 매일 사용하는 서비스를 설계하고 운영합니다. 제품 개발과 서비스 운영을 함께 경험하고 싶은 분을 기다립니다.',
                    variant: IdsTextVariant.label,
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
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFECE8), Color(0xFFFFD6DC)],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: ThemeProvider.of(context).outline),
      ),
      child: const IdsText(
        '2026 봄학기\n인포팀 개발자 모집',
        variant: IdsTextVariant.title,
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
    return const Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        _ReactionChip(
          label: '268',
          icon: HugeIcons.strokeRoundedFire,
          selected: true,
          width: 70,
        ),
        _ReactionChip(
          label: '37',
          icon: HugeIcons.strokeRoundedSurprise,
          width: 64,
        ),
        _ReactionChip(
          label: '2',
          icon: HugeIcons.strokeRoundedCrying,
          width: 58,
        ),
        _ReactionChip(
          label: '1',
          icon: HugeIcons.strokeRoundedIdea01,
          width: 58,
        ),
        _ReactionChip(
          label: '0',
          icon: HugeIcons.strokeRoundedSad01,
          width: 58,
        ),
        _ReactionChip(
          label: '공유하기',
          icon: HugeIcons.strokeRoundedShare01,
          width: 112,
        ),
        _ReactionChip(
          label: '링크 복사하기',
          icon: HugeIcons.strokeRoundedCopyLink,
          width: 136,
        ),
      ],
    );
  }
}

class _ReactionChip extends StatelessWidget {
  const _ReactionChip({
    required this.label,
    required this.width,
    this.icon,
    this.selected = false,
  });

  final String label;
  final double width;
  final List<List<dynamic>>? icon;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return SizedBox(
      width: width,
      child: Container(
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? theme.primary : theme.secondary,
          borderRadius: BorderRadius.circular(16),
        ),
        child: IconTheme(
          data: IconThemeData(
            color: selected ? theme.onPrimary : theme.onSecondary,
            size: 17,
          ),
          child: IdsHStack(
            gap: icon == null ? 0 : 5,
            fit: IdsStackFit.content,
            crossAxis: CrossAxis.center,
            children: [
              if (icon != null) _HugeIcon(icon!),
              Text(
                label,
                style: IdsTypography.caption.copyWith(
                  color: selected ? theme.onPrimary : theme.onSecondary,
                  fontWeight: FontWeight.w700,
                  leadingDistribution: TextLeadingDistribution.even,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ZiggleProfileFrame extends StatelessWidget {
  const _ZiggleProfileFrame();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
            child: IdsVStack(
              gap: 24,
              children: [
                IdsCard(
                  size: IdsCardSize.lg,
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: IdsVStack(
                      gap: 10,
                      crossAxis: CrossAxis.center,
                      children: [
                        const IdsAvatar(name: '류현승', size: IdsSize.xxl),
                        const IdsVStack(
                          gap: 4,
                          fit: IdsStackFit.content,
                          crossAxis: CrossAxis.center,
                          children: [
                            IdsText('류현승', variant: IdsTextVariant.title),
                            IdsText('20255070', variant: IdsTextVariant.body),
                          ],
                        ),
                        IdsText(
                          'rhseungg@gm.gist.ac.kr',
                          variant: IdsTextVariant.caption,
                          color: theme.onMuted,
                        ),
                      ],
                    ),
                  ),
                ),
                _ProfileSection(
                  items: const [
                    (
                      HugeIcons.strokeRoundedUserCircle02,
                      '계정',
                      '회원 정보 수정 · 아이디 및 비밀번호 변경',
                    ),
                    (HugeIcons.strokeRoundedUserRemove01, '회원 탈퇴', null),
                    (HugeIcons.strokeRoundedLogout03, '로그아웃', null),
                  ],
                ),
                _ProfileSection(
                  items: const [
                    (HugeIcons.strokeRoundedSettings02, '설정', '알림 · 언어 · 정보'),
                    (
                      HugeIcons.strokeRoundedMessageEdit01,
                      '피드백 · 버그 제보하기',
                      null,
                    ),
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

  final List<(List<List<dynamic>>, String, String?)> items;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return IdsCard(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        child: Column(
          children: [
            for (var i = 0; i < items.length; i++) ...[
              IdsItem(
                onPressed: () {},
                children: [
                  IdsItemLeading(
                    child: IconTheme(
                      data: IconThemeData(color: theme.onSurface, size: 22),
                      child: _HugeIcon(items[i].$1),
                    ),
                  ),
                  IdsItemContent(
                    children: [
                      IdsItemTitle(items[i].$2),
                      if (items[i].$3 != null) IdsItemDescription(items[i].$3!),
                    ],
                  ),
                ],
              ),
              if (i < items.length - 1) const IdsDivider(),
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
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 128),
                child: IdsVStack(
                  gap: 20,
                  crossAxis: CrossAxis.start,
                  children: [
                    const IdsText('팟쥐', variant: IdsTextVariant.title),
                    const _WeekStatusCard(),
                    IdsText(
                      '2025/11/15 토요일',
                      variant: IdsTextVariant.caption,
                      color: theme.onMuted,
                    ),
                    const _TaxiPotCard(
                      from: '지스트',
                      to: '광주송정역',
                      time: '13:10~14:00',
                      capacity: '1/4',
                    ),
                    const _TaxiPotCard(
                      from: '지스트',
                      to: '유스퀘어',
                      time: '17:30~18:10',
                      capacity: '2/4',
                    ),
                    const _TaxiPotCard(
                      from: '광주송정역',
                      to: '지스트',
                      time: '21:20~22:00',
                      capacity: '3/4',
                    ),
                    const _TaxiPotCard(
                      from: '지스트',
                      to: '광주공항',
                      time: '08:40~09:20',
                      capacity: '1/3',
                    ),
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
        const _PotgFloatingButton(),
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
            const IdsText('요일 별 팟 현황', variant: IdsTextVariant.body),
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
                            variant: IdsTextVariant.caption,
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
  const _TaxiPotCard({
    this.from = '지스트',
    this.to = '광주송정역',
    this.time = '13:10~14:00',
    this.capacity = '1/4',
  });

  final String from;
  final String to;
  final String time;
  final String capacity;

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: theme.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      foregroundDecoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.outline),
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(18, 16, 14, 16),
              child: IdsVStack(
                gap: 10,
                crossAxis: CrossAxis.start,
                children: [
                  IdsHStack(
                    gap: 8,
                    fit: IdsStackFit.content,
                    crossAxis: CrossAxis.center,
                    children: [
                      IconTheme(
                        data: IconThemeData(color: theme.primary, size: 20),
                        child: const _HugeIcon(HugeIcons.strokeRoundedRoute01),
                      ),
                      Expanded(
                        child: Text(
                          '$from → $to',
                          style: IdsTypography.body.copyWith(
                            color: theme.onSurface,
                            fontWeight: FontWeight.w600,
                            leadingDistribution: TextLeadingDistribution.even,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  IdsText(time, variant: IdsTextVariant.body),
                ],
              ),
            ),
          ),
          Container(
            width: 86,
            height: 96,
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
                const IdsText('정원', variant: IdsTextVariant.label),
                IdsText(
                  capacity,
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

class _PotgSearchEmptyFrame extends StatelessWidget {
  const _PotgSearchEmptyFrame();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return Stack(
      children: [
        Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: IdsVStack(
                  gap: 24,
                  crossAxis: CrossAxis.start,
                  children: [
                    const IdsText('팟 검색', variant: IdsTextVariant.title),
                    Expanded(
                      child: Center(
                        child: IdsEmpty(
                          children: [
                            IdsEmptyMedia(
                              child: Container(
                                width: 84,
                                height: 84,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: theme.secondary,
                                  shape: BoxShape.circle,
                                ),
                                child: IconTheme(
                                  data: IconThemeData(
                                    color: theme.primary,
                                    size: 48,
                                  ),
                                  child: const _HugeIcon(
                                    HugeIcons.strokeRoundedSad01,
                                  ),
                                ),
                              ),
                            ),
                            IdsText(
                              '해당 조건의 택시 팟이 존재하지 않습니다',
                              variant: IdsTextVariant.label,
                              color: theme.primary,
                              align: TextAlign.center,
                            ),
                            IdsEmptyActions(
                              children: [
                                IdsButton(
                                  onPressed: () {},
                                  variant: IdsVariant.outline,
                                  children: const [
                                    _HugeIcon(HugeIcons.strokeRoundedCar03),
                                    Text('새 팟 만들기'),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _PotgBottomNavigation(currentIndex: 1),
          ],
        ),
        const _PotgFloatingButton(),
      ],
    );
  }
}

class _PotgFilterDialogFrame extends StatefulWidget {
  const _PotgFilterDialogFrame();

  @override
  State<_PotgFilterDialogFrame> createState() => _PotgFilterDialogFrameState();
}

class _PotgFilterDialogFrameState extends State<_PotgFilterDialogFrame> {
  var checked = true;
  var open = true;

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
                    const IdsText('팟 검색', variant: IdsTextVariant.title),
                    const IdsText('노선 필터', variant: IdsTextVariant.caption),
                    const IdsCard(
                      child: IdsCardContent(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            IdsText('지스트', variant: IdsTextVariant.body),
                            IdsText('→', variant: IdsTextVariant.body),
                            IdsText('유스퀘어', variant: IdsTextVariant.body),
                          ],
                        ),
                      ),
                    ),
                    const IdsText('날짜 필터', variant: IdsTextVariant.caption),
                    const _CalendarFilterCard(),
                    IdsHStack(
                      gap: 8,
                      crossAxis: CrossAxis.center,
                      children: [
                        IdsCheckbox(
                          checked: checked,
                          semanticLabel: '정원이 가득 찬 팟 숨기기',
                          onChanged: (value) => setState(() => checked = value),
                        ),
                        const Expanded(
                          child: IdsText(
                            '정원이 가득 찬 팟 숨기기',
                            variant: IdsTextVariant.caption,
                          ),
                        ),
                      ],
                    ),
                    IdsButton(
                      onPressed: () => setState(() => open = true),
                      children: const [Text('적용')],
                    ),
                    _TaxiPotCard(),
                  ],
                ),
              ),
            ),
            _PotgBottomNavigation(currentIndex: 1),
          ],
        ),
        const _PotgFloatingButton(),
        IdsDialog(
          open: open,
          onOpenChanged: (value) => setState(() => open = value),
          children: [
            const IdsDialogHeader(children: [IdsDialogTitle('입장하시겠습니까?')]),
            const IdsDialogContent(
              child: IdsVStack(
                gap: 8,
                crossAxis: CrossAxis.start,
                children: [
                  IdsText('노선  광주송정역 → 지스트', variant: IdsTextVariant.label),
                  IdsText(
                    '날짜  2025년 12월 13일 토요일',
                    variant: IdsTextVariant.label,
                  ),
                  IdsText('시간  23:30~01:00', variant: IdsTextVariant.label),
                  IdsText(
                    '참여자 목록  김민준, 박서연, 이서연',
                    variant: IdsTextVariant.label,
                  ),
                ],
              ),
            ),
            IdsDialogFooter(
              children: [
                IdsButton(
                  onPressed: () => setState(() => open = false),
                  variant: IdsVariant.ghost,
                  children: const [Text('아니요')],
                ),
                IdsButton(
                  onPressed: () => setState(() => open = false),
                  variant: IdsVariant.ghost,
                  children: [Text('네', style: TextStyle(color: theme.primary))],
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _CalendarFilterCard extends StatelessWidget {
  const _CalendarFilterCard();

  @override
  Widget build(BuildContext context) {
    final theme = ThemeProvider.of(context);

    return IdsCard(
      child: IdsCardContent(
        child: IdsVStack(
          gap: 16,
          children: [
            const IdsText(
              '2025년 11월',
              variant: IdsTextVariant.body,
              align: TextAlign.center,
            ),
            Wrap(
              spacing: 18,
              runSpacing: 14,
              children: [
                for (var day = 8; day <= 22; day++)
                  Container(
                    width: 34,
                    height: 34,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: day == 14 ? theme.primary : null,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IdsText(
                      '$day',
                      variant: IdsTextVariant.caption,
                      color: day == 14 ? theme.onPrimary : theme.onSurface,
                    ),
                  ),
              ],
            ),
          ],
        ),
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
      child: SizedBox.expand(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: IdsVStack(
            gap: 24,
            crossAxis: CrossAxis.start,
            children: [
              const IdsText('팟 생성', variant: IdsTextVariant.title),
              _StepRow(index: '1', label: '지스트 → 광주송정역', filled: true),
              _StepRow(index: '2', label: '11월 14일 금요일', filled: true),
              _StepRow(index: '3', label: '시간대 설정', filled: false),
              const IdsCard(
                child: IdsCardContent(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _TimeSummary(label: '금요일 오전', time: '9:41'),
                      IdsText('~', variant: IdsTextVariant.title),
                      _TimeSummary(label: '금요일 오후', time: '12:30'),
                    ],
                  ),
                ),
              ),
              const IdsText(
                '출발 가능한 가장 늦은 시각을 설정하세요',
                variant: IdsTextVariant.body,
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
                              variant: IdsTextVariant.title,
                              color: theme.onMuted,
                            ),
                            IdsText(
                              '41',
                              variant: IdsTextVariant.title,
                              color: theme.onMuted,
                            ),
                            IdsText(
                              'AM',
                              variant: IdsTextVariant.title,
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
            variant: IdsTextVariant.body,
            color: filled ? theme.onPrimary : theme.primary,
          ),
        ),
        Expanded(child: IdsText(label, variant: IdsTextVariant.body)),
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
        IdsText(time, variant: IdsTextVariant.body),
      ],
    );
  }
}

class _PotgBottomNavigation extends StatelessWidget {
  const _PotgBottomNavigation({required this.currentIndex});

  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    return IdsBottomNavigation(
      currentIndex: currentIndex,
      onTap: (_) {},
      items: [
        _navItem(HugeIcons.strokeRoundedHome01, '모든 팟'),
        _navItem(HugeIcons.strokeRoundedSearch01, '팟 검색'),
        _navItem(HugeIcons.strokeRoundedMessage01, '채팅방'),
        _navItem(HugeIcons.strokeRoundedUserCircle02, '내 정보'),
      ],
    );
  }
}

class _PotgFloatingButton extends StatelessWidget {
  const _PotgFloatingButton();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 88),
      child: IdsFloatingButton(
        semanticLabel: '새 팟 만들기',
        onPressed: () {},
        children: const [_HugeIcon(HugeIcons.strokeRoundedCar03)],
      ),
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
