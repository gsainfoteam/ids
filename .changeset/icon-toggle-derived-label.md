---
'@gsainfoteam/ids-react': minor
---

IconToggle names itself from its icon when `aria-label` is omitted, the same way IconButton does,
and follows Toggle's new look and behaviour (quiet off state, `ghost` by default, `onClick` that
can cancel the change, `colorScheme`, `asChild`, `focusableWhenDisabled`). It is drawn from the
control surface directly, so it stays an exact square whether it is on or off.

Breaking: a missing `aria-label` no longer throws; the name is derived from the icon, and a
development warning fires when none can be found.
