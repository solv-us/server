import easymidi from 'easymidi';
import { EventEmitter } from 'events';

import { MidiInput, MidiOutput, MidiMessage } from './MidiInterfaces'

const DEFAULT_MIDI_POLL_INTERVAL = 5000;

export default class MidiDeviceManager extends EventEmitter {

    public inputs: Array<MidiInput> = [];
    public outputs: Array<MidiOutput> = [];

    constructor() {
        super();
        
        this.registerDevices();
        setInterval(() => { this.registerDevices(); }, DEFAULT_MIDI_POLL_INTERVAL);

    }

    /**
     * Register new in- and output listeners
     */
    registerDevices(){
        this.registerInputs();
        this.registerOutputs();
    }

    /**
     * Register new inputs and add event listeners
     */
    registerInputs(){

        let inputNames = easymidi.getInputs()

        for(let name of inputNames){
            let existingInput = this.getInputByName(name);
            if(!existingInput){
                
                let input: MidiInput = {
                    name,
                    emitter: new easymidi.Input(name)
                }
         
                this.inputs.push(input)

                input.emitter.on('message', (message) => { this.handleMidiMessage(message, name) });

            }
        }
    }

    /**
    * Register new outputs
    */
    registerOutputs() {

        let outputNames = easymidi.getOutputs()

        for (let name of outputNames) {
            let existingOutput = this.getOutputByName(name);

            if (!existingOutput) {

                let output: MidiOutput = {
                    name,
                    absorber: new easymidi.Output(name)
                }

                this.outputs.push(output)

            }
        }
    }

    /**
     * Get output by USB Name
     * @param name
     */
    getOutputByName(name : string){
       return this.outputs.find(e => e.name === name);
    }

    /**
     * Get output by USB name
     * @param name 
     */
    getInputByName(name: string){
        return this.inputs.find(e => e.name === name);
    }

    /**
     * Called on every midi message of every device
     */
    handleMidiMessage(easyMidiMsg, deviceName: string){
        
        let number, value;

        if (easyMidiMsg._type === 'noteon' || easyMidiMsg._type === 'noteoff' ){
            number = easyMidiMsg.note;
            value = easyMidiMsg.velocity;
        }else if(easyMidiMsg._type==='cc'){
            number = easyMidiMsg.controller
            value = easyMidiMsg.value
        } else if (easyMidiMsg._type === 'pitch') {
            number = 1;
            value = easyMidiMsg.value
        }else{
            number = easyMidiMsg.number
            value = easyMidiMsg.value
        }

        let message : MidiMessage = {
            deviceName,
            channel: easyMidiMsg.channel,
            number,
            value,
            type: easyMidiMsg._type
        }
        this.emit('message',message)
    }
}