import type { DependencyList, RNNativeScrollEvent, ReanimatedScrollEvent } from './commonTypes';
import type { EventHandlerInternal, EventHandlerProcessed } from './useEvent';
export type ScrollHandler<Context extends Record<string, unknown> = Record<string, unknown>> = (event: ReanimatedScrollEvent, context: Context) => void;
export interface ScrollHandlers<Context extends Record<string, unknown>> {
    onScroll?: ScrollHandler<Context>;
    onBeginDrag?: ScrollHandler<Context>;
    onEndDrag?: ScrollHandler<Context>;
    onMomentumBegin?: ScrollHandler<Context>;
    onMomentumEnd?: ScrollHandler<Context>;
}
export type ScrollHandlerProcessed<Context extends Record<string, unknown> = Record<string, unknown>> = EventHandlerProcessed<RNNativeScrollEvent, Context>;
export type ScrollHandlerInternal = EventHandlerInternal<RNNativeScrollEvent>;
export declare function useAnimatedScrollHandler<Context extends Record<string, unknown>>(handlers: ScrollHandler<Context> | ScrollHandlers<Context>, dependencies?: DependencyList): ScrollHandlerProcessed<Context>;
