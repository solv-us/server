let easymidi = require('easymidi');
let tapTempo = require('tap-tempo')();

class MidiDeviceManager {
    inputs: any;
    outputs: any;
    controller: any;

    constructor() {
        this.inputs = easymidi.getInputs();
        this.outputs = easymidi.getOutputs();

        if (this.outputs.length > 0) {
            this.setUpController(this.outputs[0])
        }
    }

    setUpController(controller: String) {
        this.controller = new easymidi.Output(controller);
    }


}