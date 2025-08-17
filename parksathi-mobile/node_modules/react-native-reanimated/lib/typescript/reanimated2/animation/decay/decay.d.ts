import type { AnimationCallback } from '../../commonTypes';
import type { DecayConfig } from './utils';
export type WithDecayConfig = DecayConfig;
type withDecayType = (userConfig: DecayConfig, callback?: AnimationCallback) => number;
export declare const withDecay: withDecayType;
export {};
