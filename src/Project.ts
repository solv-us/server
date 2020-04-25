import Window from "./Window"
import Stage from "./Stage"
import MidiMap from "./MidiMap"

export default class Project {
    mediaPath: string;
    stages: Array<Stage>;
    midiMappings: Array<MidiMap>;
    windows: Array<Window>;

    constructor(public name : string = ''){
        this.stages = [];
        this.windows = [];
        this.mediaPath = '';
    }
    
}