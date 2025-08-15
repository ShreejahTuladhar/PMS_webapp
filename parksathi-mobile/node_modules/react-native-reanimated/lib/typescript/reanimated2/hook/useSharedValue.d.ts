import type { SharedValue } from '../commonTypes';
export declare function useSharedValue<Value>(init: Value, oneWayReadsOnly?: boolean): SharedValue<Value>;
