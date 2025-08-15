import type { Component } from 'react';
import type { AnimatedRef } from '../hook/commonTypes';
export interface ComponentCoords {
    x: number;
    y: number;
}
/**
 * Given an absolute position and a component ref, returns the relative
 * position in the component's local coordinate space.
 */
export declare function getRelativeCoords(parentAnimatedRef: AnimatedRef<Component>, absoluteX: number, absoluteY: number): ComponentCoords | null;
