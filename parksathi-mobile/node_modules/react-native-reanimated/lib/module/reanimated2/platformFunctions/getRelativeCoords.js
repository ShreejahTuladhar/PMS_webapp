'use strict';

import { measure } from './measure';
/**
 * Given an absolute position and a component ref, returns the relative
 * position in the component's local coordinate space.
 */
export function getRelativeCoords(parentAnimatedRef, absoluteX, absoluteY) {
  'worklet';

  const parentCoords = measure(parentAnimatedRef);
  if (parentCoords === null) {
    return null;
  }
  return {
    x: absoluteX - parentCoords.x,
    y: absoluteY - parentCoords.y
  };
}
//# sourceMappingURL=getRelativeCoords.js.map