import Window from "../Communication/UI/Window"
import Stage from "./Stage"
import { MidiMapping } from "../Midi/MidiInterfaces"
import SolvusEvent from "../Events/EventInterface";

export interface ProjectInterface{
    publicPath: string;
    stages: Array<Stage>;
    midiMappings: Array<MidiMapping>;
    windows: Array<Window>; 
    events:Array<SolvusEvent>;
}
export default class Project implements ProjectInterface{
    publicPath: string;
    stages: Array<Stage>;
    midiMappings: Array<MidiMapping>;
    windows: Array<Window>; 
    events:Array<SolvusEvent>;
    
    constructor(public name : string = ''){
        this.publicPath = '';
        let stage : Stage = {
            id:'main'
        }
        this.stages = [stage];
        this.windows = [];
        this.midiMappings = [];
        this.events = [];
    }
   
}