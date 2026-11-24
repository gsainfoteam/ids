export {
  blurWithin,
  focusWasReturned,
  initialFocusTarget,
  returnFocusTo,
  FOCUS_GUARD,
  POPUP_AUTOFOCUS,
  TOASTER,
} from './lib/focus';
export {
  elementsAbove,
  focusReturnTarget,
  registerLayer,
  useInternalLayer,
  type DismissReason,
  type Layer,
  type LayerKind,
  type LayerOptions,
  type LayerPosition,
} from './lib/layer-stack';
export { createExternalStore, type ExternalStore } from './lib/external-store';
export {
  OverlayHost,
  OverlayItemContext,
  PortalRootContext,
  useOverlay,
  useInternalOverlayItem,
  type OverlayItemBinding,
} from './parts/host';
export * from './lib/interactions';
export { ModalLayer, type ModalLayerProps } from './parts/modal-layer';
export {
  coveredByKeyboard,
  onViewportChange,
  useInternalDrawerPresentation,
  visibleHeight,
  DRAWER_BELOW,
  type PopupPresentation,
} from './lib/sheet-viewport';
export {
  keepAboveLayers,
  raiseInTopLayer,
  raiseWhatStaysAboveLayers,
  showInTopLayer,
  supportsPopover,
  withoutTransitions,
} from './lib/top-layer';
export {
  useInternalAnchored,
  VIEWPORT_MARGIN,
  type Anchored,
  type AnchoredAlign,
  type AnchoredSide,
  type UseAnchoredOptions,
} from './hooks/use-anchored';
export { useInternalPresence, type PresenceOptions } from './hooks/use-presence';
export {
  overlay,
  type OverlayControls,
  type OverlayOptions,
  type OverlayRender,
} from './lib/store';
