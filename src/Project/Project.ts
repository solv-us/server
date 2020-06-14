import Window from "../Communication/UI/Window"
import Stage from "./Stage"
import { MidiMapping } from "../Midi/MidiInterfaces"

export default class Project {
    mediaPath: string;
    stages: Array<Stage>;
    midiMappings: Array<MidiMapping>;
    windows: Array<Window>;8

    constructor(public name : string = ''){
        this.stages = [];
        this.windows = [];
        this.mediaPath = '';
    }
    
}