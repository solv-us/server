import { MidiMessage } from "../Midi/MidiInterfaces";

export default interface SolvusEvent {
    type: 'stage' | 'system';
    target: number | '*' | undefined;
    name: string | undefined;
    id: string;
    midiMessage: MidiMessage | undefined;
}