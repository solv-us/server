/**
 * Clock: emits pulses based on a tempo in BPM. 
 * Based on https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js by  alteredq under MIT License
 * and https://github.com/livejs/midi-clock by livejs
 */

// To-Do: Find a better alternative for setTimeout to allow for higher PPB rate.
// e.g. https://nodejs.org/fa/docs/guides/event-loop-timers-and-nexttick/

const DEFAULT_BPM = 120 // Beats per minute
const DEFAULT_PPB = 12 // Pulse per beat / quarter-note
const DEFAULT_FPS = 24 // Frames Per Second

import { EventEmitter } from 'events';
//import timecode from './timecode'

export default class Clock extends EventEmitter  {
    isRunning: boolean;
    startTime: number;
    oldTime: number;
    elapsedTime: number;
    elapsedPulses:number;
    pulseLength:number;

    constructor(public bpm : number = DEFAULT_BPM, public ppb : number = DEFAULT_PPB, public fps : number = DEFAULT_FPS) {
        super();
        this.isRunning = false;

        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;
        this.elapsedPulses = 0;

        this.pulseLength = 60000 / (this.bpm * this.ppb); // 1 minute in ms / Pulses per minute
    }
    /**
     * Sets a new BPM tempo and resets elapsed pulses so beat starts at 1 again
     */
    setTempo(bpm){
        this.bpm = bpm;
        this.elapsedPulses = 0;
        this.pulseLength = 60000 / (this.bpm * this.ppb);

        this.emit('tempoChanged', this.bpm);
    }

    /**
     * Toggles the clock between Start and Stop state
     */
    toggle(){
        if(this.isRunning){
            this.stop();
        }else{
            this.start();
        }
    }

    /**
     * Starts the clock
     */
    start() {
        if(!this.isRunning){
            this.isRunning = true;
            this.startTime = this.getSystemTime()
            this.oldTime = this.startTime
            this.elapsedTime = 0;
            this.elapsedPulses = 0;

            this.emit('started');
            this.pulse()
        }
    }

    /**
     * Stops the clock
     */
    stop() {
        if(this.isRunning){
            this.getElapsedTime()
            this.isRunning = false;
            this.emit('stopped');
        }
    }

    /**
     *  Updates elapsed time by calling getDelta, then returns total elapsed time in ms
     */
    getElapsedTime(){
        this.getDelta();
        return this.elapsedTime;
    }

    // To do; return elapsed time in FPS
    getTimecode(){

    }

    /**
     * Updates elapsed time variable and returns delta time in ms
     */
    getDelta(){
        let diff = 0;

        if (this.isRunning) {

            let newTime = this.getSystemTime()

            diff = newTime - this.oldTime;
            this.oldTime = newTime;

            this.elapsedTime += diff;

        }

        return diff;

    }

    /** 
     * The MIDI Pulse
     * https://en.wikipedia.org/wiki/Pulses_per_quarter_note
     */
    pulse() {

        let pulse = this.elapsedPulses % this.ppb
        let quarterPulse = this.elapsedPulses % (this.ppb / 4);

        let beatsFromZero = Math.floor(this.elapsedPulses / this.ppb);
        let beat = (beatsFromZero % 4) + 1;

        let division = Math.floor(pulse / (this.ppb / 4)) + 1
        let bar = Math.floor(beatsFromZero / 4) + 1;

        let data = { bar, beat, division, pulse };

        if (pulse === 0) {
            this.emit('beat',data)
        }

        if (quarterPulse === 0){
           this.emit('division', data)
        }

        this.emit('pulse', data)

        this.elapsedPulses += 1;

        if (this.isRunning) {
            setTimeout(this.pulse.bind(this), this.pulseLength);
        }
    }

    /**
     * Returns high precison system time in miliseconds
     * With fallback to Performance.now(), or Date.now()
     */
    getSystemTime() : number {
        if (global.process && process.hrtime) {
            var t = process.hrtime()
            return (t[0] + (t[1] / 1e9)) * 1000
        } else {
            return (typeof performance === 'undefined' ? Date : performance).now();
        }
    }

}