//import SolvusServer from './SolvusServer'
//let app = new SolvusServer();

let easymidi = require('easymidi')
let tapTempo = require('tap-tempo')();


import Clock from './Clock'

let clock = new Clock(120);

let pads = [16, 13, 14, 15, 16];
let pads2 = [9, 10, 11, 12, 9];

let output = new easymidi.Output("MPK Mini Mk II");

clock.on('division', ({bar, beat, division}) => {

        output.send('noteon', {
            note: pads2[division],
            velocity: 127,
            channel: 0
        });

        output.send('noteon', {
            note: pads2[division - 1],
            velocity: 0,
            channel: 0
        });

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

});

tapTempo.on('tempo', (bpm)=>{
    console.log('tempo: '+bpm)
    clock.setTempo(bpm)
})
 
let input = new easymidi.Input('MPK Mini Mk II').on('noteon', function (msg) {
         if (msg.note === 48) {
            tapTempo.tap();
         }else if(msg.note === 50){
             clock.stop();
         }else if(msg.note === 51){
             clock.start();
         }
});

clock.start(); 
