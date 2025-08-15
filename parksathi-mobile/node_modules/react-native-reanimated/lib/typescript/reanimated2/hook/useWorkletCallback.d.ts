import type { DependencyList } from './commonTypes';
export declare function useWorkletCallback<Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue, deps?: DependencyList): (...args: Args) => ReturnValue;
