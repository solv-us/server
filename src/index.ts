// Require dependencies
let chalk = require('chalk');
const log = console.log;

// Require components
import Server from './Server'
import ClientManager from './ClientManager'
import ProjectManager from './ProjectManager'
import MediaManager from './MediaManager'

// Setup Solvus
// TO-DO: Put this all in one over-arching class
log(chalk.bgRedBright('Solvus Server'));
let server = new Server();
let io = require('socket.io')(server.httpsServer, { serveClient: false });

let clientManager = new ClientManager();
let projectManager = new ProjectManager(__dirname + '/../public/projects');
let mediaManager = new MediaManager('/Users/daniel/projects/solvus/solvus-server/public/content');

const START_OFFSET = 500;

// Define the different namespaces for socket communication
let clientsSocket = io.of('/client');
let uiSocket = io.of('/ui');
let timeSocket = io.of('/time');

//
// Communication with UI
//
uiSocket.on('connection', (socket) => {

    if(projectManager.activeProject){
        socket.emit('clientsUpdate', clientManager.clients);
        socket.emit('filesUpdate', mediaManager.files);
        socket.emit('projectUpdate', projectManager.activeProject);
    }else{
        projectManager.listProjects().then(projects=>{
            socket.emit('projects', projects)
        })
    }

    socket.on('openProject', (projectName) =>{
        projectManager.loadProjectFromFile(projectName).then(()=>{
            log(chalk.bgGreenBright('SET ACTIVE PROJECT:'), projectManager.activeProject.name);
            
            socket.emit('clientsUpdate', clientManager.clients);
            socket.emit('filesUpdate', mediaManager.files);
            socket.emit('projectUpdate', projectManager.activeProject);
            console.log(projectManager.activeProject)
        });
    })

    socket.on('closeProject', () => {
        projectManager.close().then(()=>{
            log(chalk.bgGreenBright('CLOSED ACTIVE PROJECT'));

            socket.emit('clientsUpdate', clientManager.clients);
            socket.emit('filesUpdate', mediaManager.files);
            socket.emit('projectUpdate', projectManager.activeProject);
            projectManager.listProjects().then(projects => {
                socket.emit('projects', projects)
            })
        })
    });
    socket.on('deleteProject', () => {
        projectManager.delete().then(() => {
            socket.emit('projectUpdate', projectManager.activeProject);
            projectManager.listProjects().then(projects => {
                socket.emit('projects', projects)
            })
        });
    });
    socket.on('createProject', (projectName) => {
        projectManager.newEmptyProject(projectName).then(() => {
            socket.emit('clientsUpdate', clientManager.clients);
            socket.emit('filesUpdate', mediaManager.files);
            socket.emit('projectUpdate', projectManager.activeProject);
        });
    })

    socket.on('updateStages', (stages) =>{
        if(projectManager.activeProject){
            for (let stage of stages) {
                clientsSocket.to('#' + stage.id).emit('setMedia', stage.media)
            }
           // Object.assign(projectManager.activeProject.stages, stages);
             projectManager.activeProject.stages = stages;
            projectManager.save();
        }
    })

    socket.on('updateWindows', (windows) => {
        if(projectManager.activeProject){
            projectManager.activeProject.windows = windows;
            projectManager.save();
        }
    });

    socket.on('stageEvent', (to, event, data) => {
        log(chalk.bgBlueBright('STAGE EVENT:'), to, event, data);
       
        if(data === 'timestamp'){
            data = Date.now() + START_OFFSET;
        }
        if(to === '*' || to === 'all'){
            clientsSocket.emit(event, data);
        }else{
            clientsSocket.to('#'+to).emit(event,data);
        }
    });

});


// 
// Communication with clients
//
clientsSocket.on('connection', (socket) => {
    
    log(chalk.bgYellowBright('CLIENT CONNECTED:'), socket.id);

    // Add new Client
    let client  = clientManager.addClient(socket.id)

    // Save changes and emit to UI
    socket.on('clientUpdate', (data) => {

        // Subscribe to stage
        if (data.stageId !== client.data.stageId) {
            socket.leave('#' + client.data.stageId);
            socket.join('#' + data.stageId);

            if(projectManager.activeProject){
                for (let stage of projectManager.activeProject.stages) {

                    if (stage.id == data.stageId){
                        socket.emit('setMedia', stage.media)
                    }

                }
            }

        }

        // Update client list and send to ui
        Object.assign(client.data, data);
        uiSocket.emit('clientsUpdate', clientManager.clients);

    });

    // And remove it on disconnect
    socket.on('disconnect', () => {
        log(chalk.bgYellowBright('CLIENT DISCONNECTED:'), socket.id);
        clientManager.removeClient(client);
        uiSocket.emit('clientsUpdate', clientManager.clients);
    });

});

//
// Communication for timesyncing
//
timeSocket.on('connection', function (socket) {
    socket.on('timesync', function (data) {
        socket.emit('timesync', {
            id: data && 'id' in data ? data.id : null,
            result: Date.now()
        });
    });
});

//
// Communication for microcontrollers on main namespace
// Because of restrictions in the C++ library
//
io.on('connection', function (socket) {
    console.log('New connected'); 
});


// let tempo;
// let tempoEvent;
// let quarterEvent;

// let midiInputs = easymidi.getInputs();
// let midiOutputs = easymidi.getOutputs();

// let LEDS = Array(180).fill(0);
// var input = new easymidi.Input('UMX 61');
// input.on('noteon', function (msg) {
//     console.log(msg.note)
//     let playedKey = 60-(  msg.note - 36);

//     var rgb = HSVtoRGB(playedKey / 60.0 * 0.85, 1.0, 1.0);

//     LEDS[playedKey * 3] = rgb.r;
//     LEDS[playedKey*3 + 1] = rgb.g;
//     LEDS[playedKey * 3+ 2] = rgb.b;
  
//     artnet.set(1, LEDS)
//     console.log(msg.note - 35, LEDS);
// })
// input.on('noteoff', function (msg) {
//     console.log('off', msg)
//     let playedKey = 60 -( msg.note - 36);

//     LEDS[playedKey * 3] = 0;
//     LEDS[playedKey * 3 + 1] = 0;
//     LEDS[playedKey * 3 + 2] = 0;

//     artnet.set(1, LEDS)
// });



// if (midiInputs.length > 0) {
//     var input = new easymidi.Input('MPK Mini Mk II').on('noteon', function (msg) {
//         console.log(msg, 'mpk');
//         if (msg.note === 49) {
//             clientsSocket.emit('start', Date.now() + START_OFFSET);
//             io.emit('color','red');

//         } else if (msg.note === 48) {
//             tapTempo.tap();
//         } else if(msg.note === 50){
//             artnet.set(1, 5);
//         } else if (msg.note === 51) {
//             clearInterval(tempoEvent);
//             clearInterval(quarterEvent)
//         }
    
//     });
// }
// let output;

// if (midiOutputs.length > 0) {
//     output = new easymidi.Output(midiOutputs[0]);
// }

// tapTempo.on('tempo', function (bpm) {

//     clearInterval(tempoEvent);
//     clearInterval(quarterEvent)
//     let beat = 0;

//     console.log('BPM detected');
//     let timestamp = Date.now() + (60000 / bpm) * 4;
//     console.log(timestamp)
//     clientsSocket.emit('bpm', { bpma: bpm, timestamp });

//     let pads = [16, 13, 14, 15, 16]
//     let pads2 = [9, 10, 11, 12, 9]

//     let tick = 0;
//     quarterEvent = setInterval(() => {
//         tick++;
//         output.send('noteon', {
//             note: pads2[tick],
//             velocity: 127,
//             channel: 0
//         });


//         artnet.set(1, tick);

//         output.send('noteon', {
//             note: pads2[tick - 1],
//             velocity: 0,
//             channel: 0
//         });
//         if (tick > 3) {
//             tick = 0;
//         }
//     }, 60000 / bpm / 4);

//     tempoEvent = setInterval(() => {
//         //console.log('beat '+tempo);
//         beat++;
//         output.send('noteon', {
//             note: pads[beat],
//             velocity: 127,
//             channel: 0
//         });

//         output.send('noteon', {
//             note: pads[beat - 1],
//             velocity: 0,
//             channel: 0
//         });

//         process.stdout.write(" BPM: " + bpm + " (" + beat + ")\r");
//         io.emit('beat', beat);

//         // artnet.set(1, beat);

//         //   console.log("BPM: " + tempo + " (" + beat + ")\r");
//         if (beat > 3) {
//             beat = 0;
//         }


//     }, 60000 / bpm)
// })



// /// ZOOIO
// function HSVtoRGB(h, s, v) {
//     var r, g, b, i, f, p, q, t;
//     if (arguments.length === 1) {
//         s = h.s, v = h.v, h = h.h;
//     }
//     i = Math.floor(h * 6);
//     f = h * 6 - i;
//     p = v * (1 - s);
//     q = v * (1 - f * s);
//     t = v * (1 - (1 - f) * s);
//     switch (i % 6) {
//         case 0: r = v, g = t, b = p; break;
//         case 1: r = q, g = v, b = p; break;
//         case 2: r = p, g = v, b = t; break;
//         case 3: r = p, g = q, b = v; break;
//         case 4: r = t, g = p, b = v; break;
//         case 5: r = v, g = p, b = q; break;
//     }
//     return {
//         r: Math.round(r * 255),
//         g: Math.round(g * 255),
//         b: Math.round(b * 255)
//     };
// }
