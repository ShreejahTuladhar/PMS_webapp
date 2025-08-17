import type { MutableRefObject } from 'react';
import WorkletEventHandler from '../WorkletEventHandler';
import type { ReanimatedEvent } from './commonTypes';
/**
 * Worklet to provide as an argument to `useEvent` hook.
 */
export type EventHandler<Event extends object, Context extends Record<string, unknown> = never> = (event: ReanimatedEvent<Event>, context?: Context) => void;
/**
 * Return type of `useEvent` hook.
 */
export type EventHandlerProcessed<Event extends object, Context extends Record<string, unknown> = never> = (event: Event, context?: Context) => void;
/**
 * Real return type of `useEvent` hook - only meant to be used internally.
 */
export type EventHandlerInternal<Event extends object> = MutableRefObject<WorkletEventHandler<Event>>;
export declare function useEvent<Event extends object, Context extends Record<string, unknown> = never>(handler: EventHandler<Event, Context>, eventNames?: string[], rebuild?: boolean): EventHandlerProcessed<Event, Context>;
