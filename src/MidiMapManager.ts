import MidiMap from "./MidiMap"

export default class MidiMapManager {
    public mappings: Array<MidiMap>;

    constructor(){
        this.mappings = [];
    }
    
    /**
    * Adds a MIDI Mapping
    * @param device The USB name of the MIDI Device
    * @param channel The MIDI Channel number to listen to, or "*" for all
    */
    addMapping(device: string, channel: number | "*"){
        let mapping: MidiMap = {
            device,
            channel
        }

        this.mappings.push(mapping);
        return mapping;
    }

    /**
     * Removes a mapping
     * @param mapping The MIDI Map to delete
     */
    removeMapping(mapping: MidiMap){
        let index = this.mappings.indexOf(mapping);
        if (index >= 0) {
            this.mappings.splice(index, 1);
        }
    }

}