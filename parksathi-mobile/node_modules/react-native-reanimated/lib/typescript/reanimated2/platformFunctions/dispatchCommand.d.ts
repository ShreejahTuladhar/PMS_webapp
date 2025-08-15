import type { AnimatedRef } from '../hook/commonTypes';
import type { Component } from 'react';
export declare let dispatchCommand: <T extends Component>(animatedRef: AnimatedRef<T>, commandName: string, args?: Array<unknown>) => void;
