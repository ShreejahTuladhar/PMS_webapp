import type { Animation, AnimatableValue, Timestamp, ReduceMotion } from '../commonTypes';
export type SpringConfig = {
    stiffness?: number;
    overshootClamping?: boolean;
    restDisplacementThreshold?: number;
    restSpeedThreshold?: number;
    velocity?: number;
    reduceMotion?: ReduceMotion;
} & ({
    mass?: number;
    damping?: number;
    duration?: never;
    dampingRatio?: never;
} | {
    mass?: never;
    damping?: never;
    duration?: number;
    dampingRatio?: number;
});
export type DefaultSpringConfig = {
    [K in keyof Required<SpringConfig>]: K extends 'reduceMotion' ? Required<SpringConfig>[K] | undefined : Required<SpringConfig>[K];
};
export type WithSpringConfig = SpringConfig;
export interface SpringConfigInner {
    useDuration: boolean;
    skipAnimation: boolean;
}
export interface SpringAnimation extends Animation<SpringAnimation> {
    current: AnimatableValue;
    toValue: AnimatableValue;
    velocity: number;
    lastTimestamp: Timestamp;
    startTimestamp: Timestamp;
    startValue: number;
    zeta: number;
    omega0: number;
    omega1: number;
}
export interface InnerSpringAnimation extends Omit<SpringAnimation, 'toValue' | 'current'> {
    toValue: number;
    current: number;
}
export declare function checkIfConfigIsValid(config: DefaultSpringConfig): boolean;
export declare function initialCalculations(mass: number | undefined, config: DefaultSpringConfig & SpringConfigInner): {
    zeta: number;
    omega0: number;
    omega1: number;
};
export declare function calculateNewMassToMatchDuration(x0: number, config: DefaultSpringConfig & SpringConfigInner, v0: number): number;
export declare function criticallyDampedSpringCalculations(animation: InnerSpringAnimation, precalculatedValues: {
    v0: number;
    x0: number;
    omega0: number;
    t: number;
}): {
    position: number;
    velocity: number;
};
export declare function underDampedSpringCalculations(animation: InnerSpringAnimation, precalculatedValues: {
    zeta: number;
    v0: number;
    x0: number;
    omega0: number;
    omega1: number;
    t: number;
}): {
    position: number;
    velocity: number;
};
export declare function isAnimationTerminatingCalculation(animation: InnerSpringAnimation, config: DefaultSpringConfig): {
    isOvershooting: boolean;
    isVelocity: boolean;
    isDisplacement: boolean;
};
