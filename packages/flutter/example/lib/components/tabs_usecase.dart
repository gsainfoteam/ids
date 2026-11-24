import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

const _variants = [
  IdsVariant.ghost,
  IdsVariant.outline,
  IdsVariant.soft,
  IdsVariant.solid,
  IdsVariant.glossy,
];

final tabsUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) {
      final appearance = context.knobs.object.dropdown(
        label: 'Appearance',
        options: IdsTabsAppearance.values,
      );
      final variant = context.knobs.object.dropdown(
        label: 'Pill variant',
        options: _variants,
        initialOption: IdsVariant.soft,
      );
      final orientation = context.knobs.object.dropdown(
        label: 'Orientation',
        options: Axis.values,
      );
      final direction = context.knobs.object.dropdown(
        label: 'Direction',
        options: const [TextDirection.ltr, TextDirection.rtl],
      );
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Activation mode',
        options: IdsTabsActivationMode.values,
      );
      final scheme = context.knobs.object.dropdown(
        label: 'Color scheme',
        options: const [
          IdsColorScheme.primary,
          IdsColorScheme.secondary,
          IdsColorScheme.tertiary,
        ],
      );
      final loop = context.knobs.boolean(label: 'Loop', initialValue: true);
      return themed(
        context,
        Directionality(
          textDirection: direction,
          child: Center(
            child: IdsTabs(
              defaultValue: 'overview',
              appearance: appearance,
              variant: appearance == IdsTabsAppearance.pill ? variant : null,
              orientation: orientation,
              size: size,
              activationMode: mode,
              colorScheme: scheme,
              loop: loop,
              children: _playgroundParts(context),
            ),
          ),
        ),
        width: 400,
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 12,
          children: [
            const Text('Appearance × Size'),
            galleryRow('', [
              for (final appearance in IdsTabsAppearance.values)
                SizedBox(width: 350, child: Text(appearance.name)),
            ]),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                for (final appearance in IdsTabsAppearance.values)
                  SizedBox(
                    width: 350,
                    child: IdsTabs(
                      defaultValue: 'overview',
                      size: size,
                      appearance: appearance,
                      children: _productParts(context),
                    ),
                  ),
              ]),
            const Text('Pill variant'),
            galleryRow('', [
              for (final variant in _variants)
                SizedBox(width: 290, child: Text(variant.name)),
            ]),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                for (final variant in _variants)
                  SizedBox(
                    width: 290,
                    child: IdsTabs(
                      defaultValue: 'day',
                      size: size,
                      appearance: IdsTabsAppearance.pill,
                      variant: variant,
                      children: _periodParts(context),
                    ),
                  ),
              ]),
            const Text('Vertical'),
            for (final appearance in IdsTabsAppearance.values)
              galleryRow(appearance.name, [
                _settings(
                  context,
                  orientation: Axis.vertical,
                  appearance: appearance,
                ),
              ]),
            const Text('States'),
            galleryRow('disabled trigger', [
              _settings(context, disableAlerts: true),
            ]),
            galleryRow('icons', [
              _settings(
                context,
                appearance: IdsTabsAppearance.pill,
                icons: true,
              ),
            ]),
            galleryRow('stretch', [
              SizedBox(
                width: 448,
                child: IdsTabs(
                  defaultValue: 'new',
                  children: [
                    IdsTabsList(
                      semanticLabel: context.strings.demo.tabsSample.alignment,
                      stretch: true,
                      children: [
                        IdsTabsTrigger(
                          value: 'new',
                          child: Text(context.strings.demo.tabsSample.latest),
                        ),
                        IdsTabsTrigger(
                          value: 'popular',
                          child: Text(context.strings.demo.tabsSample.popular),
                        ),
                        IdsTabsTrigger(
                          value: 'comments',
                          child: Text(
                            context.strings.demo.tabsSample.mostDiscussed,
                          ),
                        ),
                      ],
                    ),
                    IdsTabsContent(
                      value: 'new',
                      child: Text(context.strings.demo.tabsSample.latestPosts),
                    ),
                    IdsTabsContent(
                      value: 'popular',
                      child: Text(context.strings.demo.tabsSample.popularPosts),
                    ),
                    IdsTabsContent(
                      value: 'comments',
                      child: Text(
                        context.strings.demo.tabsSample.mostDiscussedPosts,
                      ),
                    ),
                  ],
                ),
              ),
            ]),
          ],
        ),
      ),
      width: 920,
    ),
  ),
  WidgetbookUseCase(
    name: 'Keyboard',
    builder: (context) => themed(
      context,
      Center(
        child: IdsTabs(
          defaultValue: 'overview',
          children: [
            IdsTabsList(
              semanticLabel: context.strings.demo.tabsSample.productInformation,
              children: [
                IdsTabsTrigger(
                  value: 'overview',
                  child: Text(context.strings.demo.tabsSample.overview),
                ),
                IdsTabsTrigger(
                  value: 'specs',
                  disabled: true,
                  child: Text(context.strings.demo.tabsSample.specifications),
                ),
                IdsTabsTrigger(
                  value: 'reviews',
                  child: Text(context.strings.demo.tabsSample.reviews),
                ),
                IdsTabsTrigger(value: 'qna', child: Text('Q&A')),
              ],
            ),
            IdsTabsContent(
              value: 'overview',
              child: Text(
                context
                    .strings
                    .demo
                    .tabsSample
                    .alightweightwirelesskeyboardwith,
              ),
            ),
            IdsTabsContent(
              value: 'specs',
              child: Text(context.strings.demo.tabsSample.weight450G),
            ),
            IdsTabsContent(
              value: 'reviews',
              child: Text(context.strings.demo.tabsSample.reviewCount),
            ),
            IdsTabsContent(
              value: 'qna',
              child: Text(
                context.strings.demo.tabsSample.all12QuestionsHaveBeenAnswered,
              ),
            ),
          ],
        ),
      ),
      width: 570,
    ),
  ),
  WidgetbookUseCase(
    name: 'Manual activation',
    builder: (context) => themed(
      context,
      Center(
        child: IdsTabs(
          defaultValue: 'inbox',
          activationMode: IdsTabsActivationMode.manual,
          children: [
            IdsTabsList(
              semanticLabel: context.strings.demo.tabsSample.mailbox,
              children: [
                IdsTabsTrigger(
                  value: 'inbox',
                  child: Text(context.strings.demo.tabsSample.inbox),
                ),
                IdsTabsTrigger(
                  value: 'sent',
                  child: Text(context.strings.demo.tabsSample.sent),
                ),
                IdsTabsTrigger(
                  value: 'spam',
                  child: Text(context.strings.demo.tabsSample.spam),
                ),
                IdsTabsTrigger(
                  value: 'archive',
                  child: Text(context.strings.demo.tabsSample.archiveFolder),
                ),
              ],
            ),
            IdsTabsContent(
              value: 'inbox',
              child: Text(context.strings.demo.tabsSample.newMailCount),
            ),
            IdsTabsContent(
              value: 'sent',
              child: Text(context.strings.demo.tabsSample.sentMailCount),
            ),
            IdsTabsContent(
              value: 'spam',
              child: Text(context.strings.demo.tabsSample.noSpam),
            ),
            IdsTabsContent(
              value: 'archive',
              child: Text(context.strings.demo.tabsSample.archivedMail),
            ),
          ],
        ),
      ),
      width: 500,
    ),
  ),
  WidgetbookUseCase(
    name: 'Vertical',
    builder: (context) => themed(
      context,
      Center(
        child: IdsTabs(
          defaultValue: 'profile',
          orientation: Axis.vertical,
          appearance: IdsTabsAppearance.pill,
          children: [
            IdsTabsList(
              semanticLabel: context.strings.demo.tabsSample.settings,
              children: [
                IdsTabsTrigger(
                  value: 'profile',
                  child: Text(context.strings.demo.tabsSample.profile),
                ),
                IdsTabsTrigger(
                  value: 'alerts',
                  child: Text(context.strings.demo.tabsSample.notifications),
                ),
                IdsTabsTrigger(
                  value: 'account',
                  child: Text(context.strings.demo.tabsSample.account),
                ),
              ],
            ),
            IdsTabsContent(
              value: 'profile',
              child: Text(
                context.strings.demo.tabsSample.changeYourNameAndPhoto,
              ),
            ),
            IdsTabsContent(
              value: 'alerts',
              child: Text(
                context
                    .strings
                    .demo
                    .tabsSample
                    .chooseWhereToReceiveNotifications,
              ),
            ),
            IdsTabsContent(
              value: 'account',
              child: Text(
                context
                    .strings
                    .demo
                    .tabsSample
                    .changeYourPasswordOrCloseYourAccount,
              ),
            ),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Right to left',
    builder: (context) => themed(
      context,
      Center(
        child: Directionality(
          textDirection: TextDirection.rtl,
          child: IdsTabs(
            defaultValue: 'one',
            children: [
              IdsTabsList(
                semanticLabel: context.strings.demo.tabsSample.step,
                children: [
                  IdsTabsTrigger(
                    value: 'one',
                    child: Text(context.strings.demo.tabsSample.one),
                  ),
                  IdsTabsTrigger(
                    value: 'two',
                    child: Text(context.strings.demo.tabsSample.two),
                  ),
                  IdsTabsTrigger(
                    value: 'three',
                    child: Text(context.strings.demo.tabsSample.three),
                  ),
                ],
              ),
              IdsTabsContent(
                value: 'one',
                child: Text(context.strings.demo.tabsSample.first),
              ),
              IdsTabsContent(
                value: 'two',
                child: Text(context.strings.demo.tabsSample.second),
              ),
              IdsTabsContent(
                value: 'three',
                child: Text(context.strings.demo.tabsSample.third),
              ),
            ],
          ),
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Controlled',
    builder: (context) =>
        themed(context, const Center(child: _ControlledTabs()), width: 380),
  ),
  WidgetbookUseCase(
    name: 'Typed parts',
    builder: (context) => themed(context, const Center(child: _TypedTabs())),
  ),
  WidgetbookUseCase(
    name: 'Keep panel mounted',
    builder: (context) => themed(
      context,
      Align(
        alignment: Alignment.topCenter,
        child: IdsTabs(
          defaultValue: 'write',
          appearance: IdsTabsAppearance.enclosed,
          children: [
            IdsTabsList(
              semanticLabel: context.strings.demo.tabsSample.comment,
              children: [
                IdsTabsTrigger(
                  value: 'write',
                  child: Text(context.strings.demo.tabsSample.write),
                ),
                IdsTabsTrigger(
                  value: 'preview',
                  child: Text(context.strings.demo.tabsSample.preview),
                ),
              ],
            ),
            IdsTabsContent(
              value: 'write',
              forceMount: true,
              child: Padding(
                padding: EdgeInsets.all(4),
                child: IdsTextField(
                  semanticLabel: context.strings.demo.tabsSample.comment,
                  placeholder: context.strings.demo.tabsSample.leaveAComment,
                ),
              ),
            ),
            IdsTabsContent(
              value: 'preview',
              forceMount: true,
              skipTraversal: true,
              child: Text(
                context.strings.demo.tabsSample.thisTextAppearsInThePreview,
              ),
            ),
          ],
        ),
      ),
      width: 480,
    ),
  ),
];

class _ControlledTabs extends StatefulWidget {
  const _ControlledTabs();

  @override
  State<_ControlledTabs> createState() => _ControlledTabsState();
}

class _ControlledTabsState extends State<_ControlledTabs> {
  String _tab = 'profile';

  void _select(String tab) => setState(() => _tab = tab);

  @override
  Widget build(BuildContext context) => Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: 12,
    children: [
      IdsTabs(
        value: _tab,
        onValueChange: _select,
        appearance: IdsTabsAppearance.pill,
        variant: IdsVariant.outline,
        children: [
          IdsTabsList(
            semanticLabel: context.strings.demo.tabsSample.settings,
            children: [
              IdsTabsTrigger(
                value: 'profile',
                child: Text(context.strings.demo.tabsSample.profile),
              ),
              IdsTabsTrigger(
                value: 'alerts',
                child: Text(context.strings.demo.tabsSample.notifications),
              ),
            ],
          ),
          IdsTabsContent(
            value: 'profile',
            child: Text(context.strings.demo.tabsSample.nameAndPhoto),
          ),
          IdsTabsContent(
            value: 'alerts',
            child: Text(
              context.strings.demo.tabsSample.whereToReceiveNotifications,
            ),
          ),
        ],
      ),
      IdsButton(
        variant: IdsVariant.outline,
        onPressed: () => _select('alerts'),
        child: Text(context.strings.demo.tabsSample.goToNotificationSettings),
      ),
      Semantics(
        label: context.strings.demo.tabsSample.tabValue,
        child: Text(_tab),
      ),
    ],
  );
}

enum _Section { docs, api }

class _TypedTabs extends StatefulWidget {
  const _TypedTabs();

  @override
  State<_TypedTabs> createState() => _TypedTabsState();
}

class _TypedTabsState extends State<_TypedTabs> {
  _Section _section = _Section.docs;

  @override
  Widget build(BuildContext context) => IdsTabs<_Section>(
    value: _section,
    onValueChange: (section) => setState(() => _section = section),
    appearance: IdsTabsAppearance.pill,
    children: [
      IdsTabsList(
        semanticLabel: context.strings.demo.tabsSample.docs,
        children: [
          IdsTabsTrigger<_Section>(
            value: _Section.docs,
            child: Text(context.strings.demo.tabsSample.docs),
          ),
          IdsTabsTrigger<_Section>(
            value: _Section.api,
            style: (state, base) => state.selected
                ? ShapeDecoration(
                    color: IdsProvider.of(context).colors.bgInfoSoft,
                    shape: base.shape,
                    shadows: base.shadows,
                  )
                : base,
            child: const Text('API'),
          ),
        ],
      ),
      IdsTabsContent<_Section>(
        value: _Section.docs,
        child: Text(context.strings.demo.tabsSample.gettingStartedAndGuides),
      ),
      IdsTabsContent<_Section>(
        value: _Section.api,
        child: Text(context.strings.demo.tabsSample.propertiesOfAllComponents),
      ),
    ],
  );
}

Widget _productList(BuildContext context) => IdsTabsList(
  semanticLabel: context.strings.demo.tabsSample.productInformation,
  children: [
    IdsTabsTrigger(
      value: 'overview',
      child: Text(context.strings.demo.tabsSample.overview),
    ),
    IdsTabsTrigger(
      value: 'reviews',
      child: Text(context.strings.demo.tabsSample.reviews),
    ),
    IdsTabsTrigger(value: 'qna', child: Text('Q&A')),
  ],
);

List<Widget> _productParts(BuildContext context) => [
  _productList(context),
  IdsTabsContent(
    value: 'overview',
    child: Text(context.strings.demo.tabsSample.overviewDetails),
  ),
  IdsTabsContent(
    value: 'reviews',
    child: Text(context.strings.demo.tabsSample.reviewDetails),
  ),
  IdsTabsContent(
    value: 'qna',
    child: Text(context.strings.demo.tabsSample.questionsAndAnswers),
  ),
];

List<Widget> _playgroundParts(BuildContext context) => [
  _productList(context),
  IdsTabsContent(
    value: 'overview',
    child: Text(
      context.strings.demo.tabsSample.alightweightwirelesskeyboardwith,
    ),
  ),
  IdsTabsContent(
    value: 'reviews',
    child: Text(context.strings.demo.tabsSample.reviewCount),
  ),
  IdsTabsContent(
    value: 'qna',
    child: Text(context.strings.demo.tabsSample.all12QuestionsHaveBeenAnswered),
  ),
];

List<Widget> _periodParts(BuildContext context) => [
  IdsTabsList(
    semanticLabel: context.strings.demo.tabsSample.period,
    children: [
      IdsTabsTrigger(
        value: 'day',
        child: Text(context.strings.demo.tabsSample.day),
      ),
      IdsTabsTrigger(
        value: 'week',
        child: Text(context.strings.demo.tabsSample.week),
      ),
      IdsTabsTrigger(
        value: 'month',
        child: Text(context.strings.demo.tabsSample.month),
      ),
    ],
  ),
  IdsTabsContent(
    value: 'day',
    child: Text(context.strings.demo.tabsSample.today),
  ),
  IdsTabsContent(
    value: 'week',
    child: Text(context.strings.demo.tabsSample.thisWeek),
  ),
  IdsTabsContent(
    value: 'month',
    child: Text(context.strings.demo.tabsSample.thisMonth),
  ),
];

Widget _settings(
  BuildContext context, {
  Axis orientation = Axis.horizontal,
  IdsTabsAppearance appearance = IdsTabsAppearance.underline,
  bool disableAlerts = false,
  bool icons = false,
}) => IdsTabs(
  defaultValue: 'profile',
  orientation: orientation,
  appearance: appearance,
  children: [
    IdsTabsList(
      semanticLabel: context.strings.demo.tabsSample.settings,
      children: [
        IdsTabsTrigger(
          value: 'profile',
          leading: icons ? const Icon(Icons.person) : null,
          child: Text(context.strings.demo.tabsSample.profile),
        ),
        IdsTabsTrigger(
          value: 'alerts',
          disabled: disableAlerts,
          leading: icons ? const Icon(Icons.notifications) : null,
          child: Text(context.strings.demo.tabsSample.notifications),
        ),
        IdsTabsTrigger(
          value: 'account',
          leading: icons ? const Icon(Icons.settings) : null,
          child: Text(context.strings.demo.tabsSample.account),
        ),
      ],
    ),
    IdsTabsContent(
      value: 'profile',
      child: Text(context.strings.demo.tabsSample.nameAndPhoto),
    ),
    IdsTabsContent(
      value: 'alerts',
      child: Text(context.strings.demo.tabsSample.whereToReceiveNotifications),
    ),
    IdsTabsContent(
      value: 'account',
      child: Text(context.strings.demo.tabsSample.passwordAndAccountClosure),
    ),
  ],
);
