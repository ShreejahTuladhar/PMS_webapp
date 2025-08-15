import type { ComponentClass, FunctionComponent } from 'react';
import '../reanimated2/layoutReanimation/animationsManager';
import type { AnimateProps } from '../reanimated2';
import type { AnimatedComponentRef } from './commonTypes';
type Options<P> = {
    setNativeProps: (ref: AnimatedComponentRef, props: P) => void;
};
export declare function createAnimatedComponent<P extends object>(component: FunctionComponent<P>, options?: Options<P>): FunctionComponent<AnimateProps<P>>;
export declare function createAnimatedComponent<P extends object>(component: ComponentClass<P>, options?: Options<P>): ComponentClass<AnimateProps<P>>;
export {};
