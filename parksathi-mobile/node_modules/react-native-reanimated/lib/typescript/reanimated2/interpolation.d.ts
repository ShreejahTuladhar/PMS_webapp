export declare enum Extrapolation {
    IDENTITY = "identity",
    CLAMP = "clamp",
    EXTEND = "extend"
}
type ExtrapolationAsString = 'identity' | 'clamp' | 'extend';
export interface ExtrapolationConfig {
    extrapolateLeft?: Extrapolation | string;
    extrapolateRight?: Extrapolation | string;
}
export type ExtrapolationType = ExtrapolationConfig | Extrapolation | ExtrapolationAsString | undefined;
export declare function interpolate(x: number, input: readonly number[], output: readonly number[], type?: ExtrapolationType): number;
/**
 * `clamp` lets you limit a value within a specified range.
 *
 * @param value - A number that will be returned as long as the provided value is in range between `min` and `max`.
 * @param min - A number which will be returned when provided `value` is lower than `min`.
 * @param max - A number which will be returned when provided `value` is higher than `max`.
 */
export declare function clamp(value: number, min: number, max: number): number;
export {};
