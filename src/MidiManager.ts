// let easymidi = require('easymidi');
// let tapTempo = require('tap-tempo')();

// class MidiManager {
//     constructor(){
//       this.inputs = easymidi.getInputs();
//       this.outputs = easymidi.getOutputs();
//     }

    
// }
// // if (midiInputs.length > 0) {
// //     var input = new easymidi.Input(midiInputs[0]).on('noteon', function (msg) {
// //         console.log(msg);
// //         if (msg.note === 48) {
// //             clientsSocket.emit('start', Date.now() + START_OFFSET);
// //         } else if (msg.note === 49) {
// //             tapTempo.tap();
// //         }
// //     });
// // }
// // let output;

// // if (midiOutputs.length > 0) {
// //     console.log('d')
// //     output = new easymidi.Output(midiOutputs[0]);

// //     // for (let note = 0; note < 128; note++) {
// //     // setInterval(() => {
// //     //         console.log( note);

// //     //         output.send('noteon', {
// //     //             note: note,
// //     //             value: 127,
// //     //             channel:0
// //     //         });
// //     //         note++;
// //     // }, 100)
// //     // }
// //     // noteon 14 channel 0 
// //     let note = 0;
// //     // output.send('noteon', {
// //     //     note: 14,
// //     //     value: 0,
// //     //     channel: 0
// //     // });
// //     let val1 = 0;

// // }

// // let tempo;
// // let tempoEvent;
// // let quarterEvent;

// // tapTempo.on('tempo', function (bpm) {

// //     clearInterval(tempoEvent);
// //     clearInterval(quarterEvent)
// //     let beat = 0;

// //     console.log('BPM detected');
// //     let timestamp = Date.now() + (60000 / bpm) * 4;
// //     console.log(timestamp)
// //     clientsSocket.emit('bpm', { bpma: bpm, timestamp });

// //     let pads = [16, 13, 14, 15, 16]
// //     let pads2 = [9, 10, 11, 12, 9]
// //     let tick = 0;
// //     quarterEvent = setInterval(() => {
// //         tick++;
// //         output.send('noteon', {
// //             note: pads2[tick],
// //             velocity: 127,
// //             channel: 0
// //         });

// //         output.send('noteon', {
// //             note: pads2[tick - 1],
// //             velocity: 0,
// //             channel: 0
// //         });
// //         if (tick > 3) {
// //             tick = 0;
// //         }
// //     }, 60000 / bpm / 4);

// //     tempoEvent = setInterval(() => {
// //         //console.log('beat '+tempo);
// //         beat++;
// //         output.send('noteon', {
// //             note: pads[beat],
// //             velocity: 127,
// //             channel: 0
// //         });

// //         output.send('noteon', {
// //             note: pads[beat - 1],
// //             velocity: 0,
// //             channel: 0
// //         });

// //         process.stdout.write(" BPM: " + bpm + " (" + beat + ")\r");
// //         clientsSocket.emit('beat', { bpm, beat });
// //         //   console.log("BPM: " + tempo + " (" + beat + ")\r");
// //         if (beat > 3) {
// //             beat = 0;
// //         }


// //     }, 60000 / bpm)
// // })
