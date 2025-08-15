import type { AnimatableValue, AnimationObject, Animation, ReduceMotion, Timestamp, RequiredKeys } from '../../../reanimated2/commonTypes';
export declare const VELOCITY_EPS: number;
export declare const SLOPE_FACTOR = 0.1;
export interface DecayAnimation extends Animation<DecayAnimation> {
    lastTimestamp: Timestamp;
    startTimestamp: Timestamp;
    initialVelocity: number;
    velocity: number;
    current: AnimatableValue;
}
export interface InnerDecayAnimation extends Omit<DecayAnimation, 'current'>, AnimationObject {
    current: number;
    springActive?: boolean;
}
export type DecayConfig = {
    deceleration?: number;
    velocityFactor?: number;
    velocity?: number;
    reduceMotion?: ReduceMotion;
} & ({
    rubberBandEffect?: false;
    clamp?: [min: number, max: number];
} | {
    rubberBandEffect: true;
    clamp: [min: number, max: number];
    rubberBandFactor?: number;
});
export type DefaultDecayConfig = RequiredKeys<DecayConfig, 'deceleration' | 'velocityFactor' | 'velocity'> & {
    rubberBandFactor: number;
};
export type RubberBandDecayConfig = RequiredKeys<DefaultDecayConfig, 'clamp'> & {
    rubberBandEffect: true;
};
export declare function isValidRubberBandConfig(config: DefaultDecayConfig): config is RubberBandDecayConfig;
