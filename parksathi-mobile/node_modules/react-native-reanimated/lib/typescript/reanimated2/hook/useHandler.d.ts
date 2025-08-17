import type { DependencyList, ReanimatedEvent } from './commonTypes';
interface GeneralHandler<Event extends object, Context extends Record<string, unknown>> {
    (event: ReanimatedEvent<Event>, context: Context): void;
}
type GeneralHandlers<Event extends object, Context extends Record<string, unknown>> = Record<string, GeneralHandler<Event, Context> | undefined>;
export interface UseHandlerContext<Context extends Record<string, unknown>> {
    context: Context;
    doDependenciesDiffer: boolean;
    useWeb: boolean;
}
export declare function useHandler<Event extends object, Context extends Record<string, unknown>>(handlers: GeneralHandlers<Event, Context>, dependencies?: DependencyList): UseHandlerContext<Context>;
export {};
