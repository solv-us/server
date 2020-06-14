/**
 * This file sets up the Akai MPK mini as a controller for the clock
 */
let SolvusServer = require('../dist/SolvusServer.js');

let app = new SolvusServer();

// Adding a midi map to set the tempo of the clock 
app.midiMapManager.addMapping('*', 1, 48, 'noteon', { type: 'system', id: 'MainClock.TapTempo' });

// Use any MIDI input as a toggle for the clock
app.midiMapManager.addMapping('*', 1, 51, 'noteon', { type: 'system', id: 'MainClock.Toggle' });

app.mainClock.on('tempoChanged', e => conso/le.log(e))

// Called every 4/th of a beat
app.mainClock.on('division', (time) => {
    console.log(time);
});

// Called when clock is started
app.mainClock.on('stop', ()=>{
    console.log('Clock stopped.')
})

// Called when clock is stopped
app.mainClock.on('stop', ()=>{
    console.log('Clock stopped.')
})

