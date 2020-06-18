import Window from "../Communication/UI/Window"
import Stage from "./Stage"
import { MidiMapping } from "../Midi/MidiInterfaces"
import SolvusEvent from "../Events/EventInterface";

export interface ProjectInterface{
    mediaPath: string;
    stages: Array<Stage>;
    midiMappings: Array<MidiMapping>;
    windows: Array<Window>; 
    events:Array<SolvusEvent>;
}
export default class Project implements ProjectInterface{
    mediaPath: string;
    stages: Array<Stage>;
    midiMappings: Array<MidiMapping>;
    windows: Array<Window>; 
    events:Array<SolvusEvent>;
    
    constructor(public name : string = ''){
        this.stages = [];
        this.windows = [];
        this.mediaPath = '';
        this.midiMappings = [];
        this.events = [];
    }
    
}