import type { SharedValue } from '../commonTypes';
import type { AnimatedScrollView } from '../component/ScrollView';
import type { AnimatedRef } from './commonTypes';
export declare function useScrollViewOffset(animatedRef: AnimatedRef<AnimatedScrollView>, initialRef?: SharedValue<number>): SharedValue<number>;
