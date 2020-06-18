import { MidiMessage, MidiMessageType, MidiMapping } from "./MidiInterfaces"
import SolvusServer from "../SolvusServer"
import SolvusEvent from "../Events/EventInterface"

export default class MidiMapManager {
    public mappings: Array<MidiMapping>;

    constructor(private app : SolvusServer){

    }
    
    /**
    * Adds a MIDI Mapping
    * @param device The USB name of the MIDI Device
    * @param channel The MIDI Channel number to listen to, or "*" for all
    */
    addMapping(deviceName: string | "*", channel: number | "*", number: number | "*", type: string, event: SolvusEvent){
        let mapping: MidiMapping = {
            deviceName,
            channel,
            number,
            event,
            type: type as MidiMessageType
        }

        this.app.projectManager.activeProject?.midiMappings.push(mapping);

        this.app.projectManager.save();
        return mapping;
    }

    /**
     * Removes a mapping
     * @param mapping The MIDI Map to delete
     */
    removeMapping(mapping: MidiMapping){
        let mappings = this.app.projectManager.activeProject?.midiMappings;

        let index = mappings.indexOf(mapping);
        if (index >= 0) {
            mappings.splice(index, 1);
        }

        this.app.projectManager.save();
    }

    /**
     * Function to check if MIDI Event is mapped to a solvus event, and if so what event;
     */
    getEventMappedToMessage(message: MidiMessage) : SolvusEvent | false{

        let mapping = this.app.projectManager.activeProject?.midiMappings.find((e)=>{
            return (e.deviceName === '*' || e.deviceName === message.deviceName) &&
                   (e.channel === '*' || e.channel === message.channel) &&
                   (e.number === '*' || e.number === message.number) &&
                   (e.type === '*' || e.type === message.type)
                    
        });

        if(mapping){
            return {...mapping.event, midiMessage:message};
        }else{
            return false;
        }
    }

}