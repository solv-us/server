

let tempo;
let tempoEvent;
let quarterEvent;

let midiInputs = easymidi.getInputs();
let midiOutputs = easymidi.getOutputs();

let LEDS = Array(180).fill(0);
var input = new easymidi.Input('MPK Mini Mk II');

let activeKeys = [];
input.on('noteon',  (msg)=> {

    if (!activeKeys.includes(msg.note)){
        activeKeys.push(msg.note)

    }
    console.log(activeKeys)

    setLeds();

})
input.on('noteoff', (msg)=> {
    var index = activeKeys.indexOf(msg.note);
    if (index > -1) {
        activeKeys.splice(index, 1);
    }

    setLeds();
});

function setLeds(){
    LEDS.fill(0);

    for (let key of activeKeys) {
        let playedKey = key - 36;
        var rgb = HSVtoRGB(playedKey / 60.0 * 0.85, 1.0, 1.0);
        LEDS[playedKey * 3] = rgb.r;
        LEDS[playedKey * 3 + 1] = rgb.g;
        LEDS[playedKey * 3 + 2] = rgb.b;
    }

    io.emit('drawFrame', LEDS)
    artnet.set(1, LEDS)
}

// setInterval(()=>{
//     LEDS.fill(0);

//     for(let key of activeKeys){
//         let playedKey = key - 36;
//         var rgb = HSVtoRGB(playedKey / 60.0 * 0.85, 1.0, 1.0);
//         LEDS[playedKey * 3] = rgb.r;
//         LEDS[playedKey * 3 + 1] = rgb.g;
//         LEDS[playedKey * 3 + 2] = rgb.b;
//     }

//     io.emit('drawFrame', LEDS)
//     artnet.set(1, LEDS)
// }, 4)

// for(let i = 0; i < 135*3; i++){
//     if(i%2 === 0 || i%2 ===0){
//         LEDS[i] = 255;
//     }else{
//         LEDS[i] = 255;
//     }
// }
// artnet.set(1, LEDS)


if (midiInputs.length > 0) {
    var input = new easymidi.Input('MPK Mini Mk II').on('noteon', function (msg) {
        if (msg.note === 49) {
            clientsSocket.emit('start', Date.now() + START_OFFSET);
            io.emit('color','red');

        } else if (msg.note === 48) {
            tapTempo.tap();
        } else if(msg.note === 50){
            // artnet.set(1, 5);
        } else if (msg.note === 51) {
            clearInterval(tempoEvent);
            clearInterval(quarterEvent)
        }

    });
}
let output;

if (midiOutputs.length > 0) {
    output = new easymidi.Output("MPK Mini Mk II");
}

tapTempo.on('tempo', function (bpm) {

    clearInterval(tempoEvent);
    clearInterval(quarterEvent)
    let beat = 0;

    let timestamp = Date.now() + (60000 / bpm) * 4;
    clientsSocket.emit('bpm', { bpma: bpm, timestamp });

    let pads = [16, 13, 14, 15, 16]
    let pads2 = [9, 10, 11, 12, 9]

    let tick = 0;
    quarterEvent = setInterval(() => {
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

        // artnet.set(1, beat);
        LEDS.fill(0);
        for (let i =33 * tick; i < 33 * (tick + 1); i++) {
            LEDS[i * 3] = 200;
            LEDS[i * 3 + 1] = 0;
            LEDS[i * 3 + 2] = 100;
        }

        artnet.set(1, LEDS)

        if (tick > 3) {
            tick = 0;
        }

    }, 60000 / bpm / 4);

    tempoEvent = setInterval(() => {
        //console.log('beat '+tempo);
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
        io.emit('beat', beat);


        //   console.log("BPM: " + tempo + " (" + beat + ")\r");
        if (beat > 3) {
            beat = 0;
        }


    }, 60000 / bpm)
})



/// ZOOIO
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
