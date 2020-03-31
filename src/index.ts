// Require dependencies
let chalk = require('chalk');
const log = console.log;
let fs = require('fs');
let path = require('path');
let express = require('express');
let easymidi = require('easymidi');
let tapTempo = require('tap-tempo')();

const key = fs.readFileSync('./localhost-key.pem');
const cert = fs.readFileSync('./localhost.pem');

let app = express();
let server = require('https').Server({ key: key, cert: cert }, app);
let io = require('socket.io')(server);

// Require components
import Client from './Client'
import ProjectManager from './ProjectManager'
import MediaManager from './MediaManager'

// Setup Solvus
let projectManager = new ProjectManager(path.join(__dirname,'../public/projects'));
let mediaManager = new MediaManager('/Users/daniel/projects/solvus/solvus-server/public/content');

// Set up port
let port = process.env.PORT || 8080;
server.listen(port, () => {
    log(chalk.bgRedBright('Solvus Server'));
    log(`Listening on port ${port}`, '\n');
});

// Set up static file server for the public folder
app.use('/stage',express.static(path.join(__dirname, '../public/stage')));
app.use('/content', express.static(path.join(__dirname, '../public/content')));

let clients : Array<Client> = [];
let files : Array<any> = [];

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
        socket.emit('clientsUpdate', clients);
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
            
            socket.emit('clientsUpdate', clients);
            socket.emit('filesUpdate', mediaManager.files);
            socket.emit('projectUpdate', projectManager.activeProject);
        });
    })

    socket.on('closeProject', () => {
        projectManager.close().then(()=>{
            log(chalk.bgGreenBright('CLOSED ACTIVE PROJECT'));

            socket.emit('clientsUpdate', clients);
            socket.emit('filesUpdate', mediaManager.files);
            socket.emit('projectUpdate', projectManager.activeProject);
            projectManager.listProjects().then(projects => {
                socket.emit('projects', projects)
            })
        })
    });

    socket.on('createProject', (projectName) => {
        projectManager.newEmptyProject(projectName).then(() => {
            socket.emit('clientsUpdate', clients);
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
    let client = new Client(socket.id);
    clients.push(client);

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
        uiSocket.emit('clientsUpdate', clients);

    });

    // And remove it on disconnect
    socket.on('disconnect', () => {
        log(chalk.bgYellowBright('CLIENT DISCONNECTED:'), socket.id);

        let index = clients.indexOf(client);
        if (index >= 0) {
            clients.splice(index, 1);
        }
        uiSocket.emit('clientsUpdate', clients);
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

let midiInputs = easymidi.getInputs();
let midiOutputs = easymidi.getOutputs();
if (midiInputs.length > 0) {
    var input = new easymidi.Input(midiInputs[0]).on('noteon', function (msg) {
        console.log(msg);
        if (msg.note === 49) {
            clientsSocket.emit('start', Date.now() + START_OFFSET);
        } else if (msg.note === 48) {
            tapTempo.tap();
        }
    });
}
let output;

if (midiOutputs.length > 0) {
    output = new easymidi.Output(midiOutputs[0]);
}


let tempo;
let tempoEvent;
let quarterEvent;

tapTempo.on('tempo', function (bpm) {

    clearInterval(tempoEvent);
    clearInterval(quarterEvent)
    let beat = 0;

    console.log('BPM detected');
    let timestamp = Date.now() + (60000 / bpm) * 4;
    console.log(timestamp)
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
        clientsSocket.emit('beat', { bpm, beat });
        //   console.log("BPM: " + tempo + " (" + beat + ")\r");
        if (beat > 3) {
            beat = 0;
        }


    }, 60000 / bpm)
})