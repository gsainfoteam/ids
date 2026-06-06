import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final checkboxUseCases = [
  WidgetbookUseCase(
    name: 'Potg Filter',
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
        child: const _PotgCheckboxDemo(),
      );
    },
  ),
];

final emptyUseCases = [
  WidgetbookUseCase(
    name: 'Potg Empty',
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
          child: IdsEmpty(
            children: [
              const IdsEmptyMedia(
                child: _HugeEmptyIcon(HugeIcons.strokeRoundedSad01),
              ),
              const IdsEmptyDescription('해당 조건의 택시 팟이 존재하지 않습니다'),
              IdsEmptyActions(
                children: [
                  IdsButton(
                    onPressed: () {},
                    variant: IdsVariant.outline,
                    children: const [
                      _HugeButtonIcon(HugeIcons.strokeRoundedCar03),
                      Text('새 팟 만들기'),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  ),
];

final dialogUseCases = [
  WidgetbookUseCase(
    name: 'Potg Join',
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
        child: const _PotgDialogDemo(),
      );
    },
  ),
];

class _PotgCheckboxDemo extends StatefulWidget {
  const _PotgCheckboxDemo();

  @override
  State<_PotgCheckboxDemo> createState() => _PotgCheckboxDemoState();
}

class _PotgCheckboxDemoState extends State<_PotgCheckboxDemo> {
  var checked = true;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: IdsHStack(
        gap: 8,
        crossAxis: CrossAxis.center,
        children: [
          IdsCheckbox(
            checked: checked,
            semanticLabel: '정원이 가득 찬 팟 숨기기',
            onChanged: (value) => setState(() => checked = value),
          ),
          const IdsText('정원이 가득 찬 팟 숨기기', variant: IdsTextVariant.label),
        ],
      ),
    );
  }
}

class _PotgDialogDemo extends StatefulWidget {
  const _PotgDialogDemo();

  @override
  State<_PotgDialogDemo> createState() => _PotgDialogDemoState();
}

class _PotgDialogDemoState extends State<_PotgDialogDemo> {
  var open = false;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 390,
        height: 560,
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: IdsButton(
                onPressed: () => setState(() => open = true),
                children: const [Text('팟 입장')],
              ),
            ),
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
                      IdsText('노선  송정역 → 지스트', variant: IdsTextVariant.label),
                      IdsText(
                        '날짜  2025년 12월 13일 토요일',
                        variant: IdsTextVariant.label,
                      ),
                      IdsText('시간  23:30~01:00', variant: IdsTextVariant.label),
                      IdsText(
                        '참여자 목록  홍길동, 심청이, 변사또',
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
                      children: const [Text('네')],
                    ),
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

class _HugeEmptyIcon extends StatelessWidget {
  const _HugeEmptyIcon(this.icon);

  final List<List<dynamic>> icon;

  @override
  Widget build(BuildContext context) {
    final iconTheme = IconTheme.of(context);
    return HugeIcon(
      icon: icon,
      color: iconTheme.color ?? Colors.grey,
      size: iconTheme.size ?? 56,
    );
  }
}

class _HugeButtonIcon extends StatelessWidget {
  const _HugeButtonIcon(this.icon);

  final List<List<dynamic>> icon;

  @override
  Widget build(BuildContext context) {
    final style = DefaultTextStyle.of(context).style;
    return HugeIcon(icon: icon, color: style.color ?? Colors.black, size: 18);
  }
}
