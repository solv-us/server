let easymidi = require('easymidi');
let tapTempo = require('tap-tempo')();

class MidiManager {
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

    onBeatDetected() { }
    onTick() {

        tick++;
        output.send('noteon', {
            note: pads2[tick],
            velocity: 127,
            channel: 0
        });

        output.send('noteon', {
            note: pads2[tick - 1],
            velocity: 0,
            channel: 0
        });
        if (tick > 3) {
            tick = 0;
        }

    }

    onBeat() {
        beat++;
        output.send('noteon', {
            note: pads[beat],
            velocity: 127,
            channel: 0
        });

        output.send('noteon', {
            note: pads[beat - 1],
            velocity: 0,
            channel: 0
        });

        process.stdout.write(" BPM: " + bpm + " (" + beat + ")\r");

        if (beat > 3) {
            beat = 0;
        }


    }
}

    
}


tapTempo.on('tempo', function (bpm) {

    clearInterval(tempoEvent);
    clearInterval(quarterEvent)
    let beat = 0;

    console.log('BPM detected');
    let timestamp = Date.now() + (60000 / bpm) * 4;
    console.log(timestamp)

    let pads = [16, 13, 14, 15, 16]
    let pads2 = [9, 10, 11, 12, 9]
    let tick = 0;

})

// if (midiInputs.length > 0) {
//     var input = new easymidi.Input(midiInputs[0]).on('noteon', function (msg) {
//         console.log(msg);
//         if (msg.note === 48) {
//             clientsSocket.emit('start', Date.now() + START_OFFSET);
//         } else if (msg.note === 49) {
//             tapTempo.tap();
//         }
//     });
// }