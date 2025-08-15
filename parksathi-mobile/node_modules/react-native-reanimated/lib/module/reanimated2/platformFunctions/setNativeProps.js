'use strict';

import { isChromeDebugger, isFabric, isJest, shouldBeUseWeb } from '../PlatformChecker';
import { processColorsInProps } from '../Colors';
export let setNativeProps;
function setNativePropsFabric(animatedRef, updates) {
  'worklet';

  if (!_WORKLET) {
    console.warn('[Reanimated] setNativeProps() can only be used on the UI runtime.');
    return;
  }
  const shadowNodeWrapper = animatedRef();
  processColorsInProps(updates);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  _updatePropsFabric([{
    shadowNodeWrapper,
    updates
  }]);
}
function setNativePropsPaper(animatedRef, updates) {
  'worklet';

  if (!_WORKLET) {
    console.warn('[Reanimated] setNativeProps() can only be used on the UI runtime.');
    return;
  }
  const tag = animatedRef();
  const name = animatedRef.viewName.value;
  processColorsInProps(updates);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  _updatePropsPaper([{
    tag,
    name,
    updates
  }]);
}
function setNativePropsJest() {
  console.warn('[Reanimated] setNativeProps() is not supported with Jest.');
}
function setNativePropsChromeDebugger() {
  console.warn('[Reanimated] setNativeProps() is not supported with Chrome Debugger.');
}
function setNativePropsDefault() {
  console.warn('[Reanimated] setNativeProps() is not supported on this configuration.');
}
if (!shouldBeUseWeb()) {
  if (isFabric()) {
    setNativeProps = setNativePropsFabric;
  } else {
    setNativeProps = setNativePropsPaper;
  }
} else if (isJest()) {
  setNativeProps = setNativePropsJest;
} else if (isChromeDebugger()) {
  setNativeProps = setNativePropsChromeDebugger;
} else {
  setNativeProps = setNativePropsDefault;
}
//# sourceMappingURL=setNativeProps.js.map