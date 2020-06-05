/** 
 * TempoTapper: Calculates BPM based on tap events (e.g. from a MIDI input)
 * Based on https://github.com/livejs/tap-tempo/blob/master/index.js by livejs
 * To-do: rewrite functions to be more clear and add comments
 */
const DEFAULT_TIMEOUT_TIME = 2000;

import { EventEmitter } from 'events';

export default class TempoTapper extends EventEmitter {
    private times: Array<number>;
    private lastTime: number;
    private lastDifference: number | null;
    private timer: NodeJS.Timeout | null;

    constructor(){
        super();

        this.times = [];
        this.lastTime = null;
        this.lastDifference = null;
    }
    /**
     * Register a tap to calculate the tempo from
     */
    tap() {
        let time = Date.now();

        if (this.lastTime) {
            this.lastDifference = time - this.lastTime;
            this.times.push(this.lastDifference)
            this.attemptCalculation()
        }
        this.lastTime = time
        this.beginTimeout()
        
    }

    /**
     * Attempt a BPM calculation
     */
    attemptCalculation() {
        if (this.times.length > 2) {
            var average = this.times.reduce((result, t)=> { return result += t }) / this.times.length
            var bpm = (1 / (average / 1000)) * 60
            this.emit('tempo', bpm)
        }
    }

    /**
     * 
     */
    beginTimeout() {
        clearTimeout(this.timer)
        
        this.timer = setTimeout(() => {
            this.times = [this.lastDifference]
            this.lastTime = null
        }, DEFAULT_TIMEOUT_TIME);
    }

}