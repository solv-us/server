import { EventEmitter } from "events";
import SolvusEvent from "../Events/EventInterface";

export interface MidiInput {
    name: string;
    emitter: EventEmitter;
}

export interface MidiOutput {
    name: string;
    absorber: any;
}

// To-Do: no any;
export type MidiMessageType = 'noteon' | 'noteoff' | 'cc' | 'program' | any;

export interface MidiMessage {
    deviceName: string;
    channel: number;
    number: number; // depending on the type of message this refers to Note, Controller or Program number
    value: number | undefined;
    type: MidiMessageType;
}

export interface MidiMapping {
    deviceName: string | "*";
    channel: number | "*";
    number: number | "*";
    type: MidiMessageType | "*";
    event: SolvusEvent;
}