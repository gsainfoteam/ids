import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final floatingButtonUseCases = [
  WidgetbookUseCase(
    name: 'Potg Action',
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
        child: Center(
          child: SizedBox(
            width: 360,
            height: 520,
            child: Stack(
              children: [
                const ColoredBox(
                  color: Color(0xFFF6F6F6),
                  child: SizedBox.expand(),
                ),
                IdsFloatingButton(
                  semanticLabel: '새 팟 만들기',
                  onPressed: () {},
                  children: const [_HugeIconData(HugeIcons.strokeRoundedCar03)],
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
];

final bottomNavigationUseCases = [
  WidgetbookUseCase(
    name: 'Potg',
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
        child: const _PotgBottomNavigationDemo(),
      );
    },
  ),
];

final tabsUseCases = [
  WidgetbookUseCase(
    name: 'Ziggle Groups',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.orange,
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
        child: Center(
          child: SizedBox(
            width: 390,
            child: IdsTabs<String>(
              defaultValue: 'notice',
              items: const [
                IdsTabItem(
                  value: 'intro',
                  label: '소개',
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: IdsText('지속 가능한 개발 문화를 만드는 팀입니다.'),
                  ),
                ),
                IdsTabItem(
                  value: 'notice',
                  label: '공지',
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: IdsCard(
                      variant: IdsCardVariant.elevated,
                      child: IdsCardHeader(
                        children: [
                          IdsCardDescription('짭인포팀 · 10분 전'),
                          IdsCardTitle('공지 제목'),
                        ],
                      ),
                    ),
                  ),
                ),
                IdsTabItem(
                  value: 'members',
                  label: '멤버',
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: IdsText('멤버 목록'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  ),
];

IdsBottomNavigationItem _navItem(List<List<dynamic>> icon, String label) {
  return IdsBottomNavigationItem(
    label: label,
    icon: (color, size) => HugeIcon(icon: icon, color: color, size: size),
  );
}

class _PotgBottomNavigationDemo extends StatefulWidget {
  const _PotgBottomNavigationDemo();

  @override
  State<_PotgBottomNavigationDemo> createState() =>
      _PotgBottomNavigationDemoState();
}

class _PotgBottomNavigationDemoState extends State<_PotgBottomNavigationDemo> {
  var currentIndex = 1;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 390,
        child: IdsBottomNavigation(
          currentIndex: currentIndex,
          onTap: (index) => setState(() => currentIndex = index),
          items: [
            _navItem(HugeIcons.strokeRoundedHome01, '모든 팟'),
            _navItem(HugeIcons.strokeRoundedSearch01, '팟 검색'),
            _navItem(HugeIcons.strokeRoundedMessage01, '채팅방'),
            _navItem(HugeIcons.strokeRoundedUserCircle02, '내 정보'),
          ],
        ),
      ),
    );
  }
}

class _HugeIconData extends StatelessWidget {
  const _HugeIconData(this.icon);

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
