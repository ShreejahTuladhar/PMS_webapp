import type { DefaultStyle, DependencyList } from './commonTypes';
export declare function useAnimatedStyle<Style extends DefaultStyle>(updater: () => Style, dependencies?: DependencyList | null): Style;
