'use strict';

import { isWeb } from '../../PlatformChecker';
const IS_WEB = isWeb();
export const VELOCITY_EPS = IS_WEB ? 1 / 20 : 1;
export const SLOPE_FACTOR = 0.1;

// If user wants to use rubber band decay animation we have to make sure he has provided clamp

export function isValidRubberBandConfig(config) {
  'worklet';

  return !!config.rubberBandEffect && Array.isArray(config.clamp) && config.clamp.length === 2;
}
//# sourceMappingURL=utils.js.map