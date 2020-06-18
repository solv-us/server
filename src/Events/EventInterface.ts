import { MidiMessage } from "../Midi/MidiInterfaces";
import Stage from "../Project/Stage";

export default interface SolvusEvent {
    type: 'stage' | 'system';
    target?: Stage | '*'
    label?:string;
    id: string;
    data?:any;
    midiMessage?: MidiMessage
}