# Control surface

`control_surface.dart` supplies the foreground, fill, border, shadow, and focus ring for `IdsButton`. It reads colors and corner shapes from `IdsTheme` and prioritizes pressed and active states over hover. Flat fills use a gradient with identical endpoints so Flutter can interpolate them with the glossy variant. The focus ring uses nested contours with even-odd filling so Flutter Web keeps the inside transparent.

`IdsInteractive` handles pointer and keyboard activation. `focusableWhenDisabled` keeps the control in the focus order while it blocks activation, which lets a button retain focus during a save.
