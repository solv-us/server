/**
 * This file sets up the Akai MPK mini as a controller for the clock
 */
import SolvusServer from '../../SolvusServer'
import SolvusEvent from "../../Events/EventInterface";

export default function setUpMPKController(app : SolvusServer){

    app.midiMapManager.addMapping('MPK Mini Mk II', 2, 5, 'cc', { type: 'stage', id: 'volume' } as SolvusEvent)
    app.midiMapManager.addMapping('*', 1, 48, 'noteon', { type: 'system', id: 'MainClock.TapTempo' } as SolvusEvent);
    app.midiMapManager.addMapping('*', 1, 51, 'noteon', { type: 'system', id: 'MainClock.Toggle' } as SolvusEvent);

    let pads = [16, 13, 14, 15, 16];
    let pads2 = [9, 10, 11, 12, 9];

    let output = app.midiDeviceManager.getOutputByName('MPK Mini Mk II').absorber;

    app.mainClock.on('tempoChanged', e => console.log(e))

    app.mainClock.on('division', ({ beat, division }) => {

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

    app.mainClock.on('stop', ()=>{
        // output.send('noteon', {
        //     note: pads[beat - 1],
        //     velocity: 0,
        //     channel: 0
        // });
        // output.send('noteon', {
        //     note: pads2[beat - 1],
        //     velocity: 0,
        //     channel: 0
        // });
    })

    // app.eventManager.on('systemEvent', (event)=>{
    //     if(event.id==='')
    // })

}