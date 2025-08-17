import type { SharedValue } from '../commonTypes';
import type { DependencyList } from './commonTypes';
export type DerivedValue<Value> = Readonly<SharedValue<Value>>;
export declare function useDerivedValue<Value>(processor: () => Value, dependencies?: DependencyList): DerivedValue<Value>;
