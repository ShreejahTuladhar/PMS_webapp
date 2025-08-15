import type { MeasuredDimensions } from '../commonTypes';
import type { AnimatedRef } from '../hook/commonTypes';
import type { Component } from 'react';
export declare let measure: <T extends Component>(animatedRef: AnimatedRef<T>) => MeasuredDimensions | null;
