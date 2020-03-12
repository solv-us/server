// Require dependencies
var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var easymidi = require('easymidi');
var tapTempo = require('tap-tempo')();
var express = require('express');
var app = express();
var server = require('http').Server(app);
console.log(express.adress);
var io = require('socket.io')(server);
var timesyncServer = require('./timesync.js');
// Require components
var Project = require('./Project.js');
var Client = require('./Client.js');
var START_OFFSET = 500;
// Set up port
var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log("Listening on port " + port);
});
// Set up static file server for the public folder
app.use('/stage', express.static(path.join(__dirname, '../public/stage')));
app.use(express.static(path.join(__dirname, '.../solvus-ui/dist')));
app.use('/timesync', timesyncServer.requestHandler);
var activeProject = new Project('../public/DHO_STRP.json');
var clients = [];
var files = [];
var clientsSocket = io.of('/client');
var uiSocket = io.of('/ui');
var timeSocket = io.of('/time');
//
// Communication with all clients
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
// Communication with clients
//
clientsSocket.on('connection', function (socket) {
    // Add new Client
    var client = new Client(socket.id);
    clients.push(client);
    // Save changes and emit to UI
    socket.on('clientUpdate', function (data) {
        // Subscribe to stage
        if (data.stageId !== client.data.stageId) {
            socket.leave('#' + client.data.stageId);
            socket.join('#' + data.stageId);
            for (var _i = 0, _a = activeProject.stages; _i < _a.length; _i++) {
                stage = _a[_i];
                if (stage.id === data.stageId)
                    socket.emit('setMedia', stage.media);
            }
        }
        // Update client list and send to ui
        Object.assign(client.data, data);
        uiSocket.emit('clientsUpdate', clients);
    });
    // And remove it on disconnect
    socket.on('disconnect', function () {
        var index = clients.indexOf(client);
        if (index >= 0) {
            clients.splice(index, 1);
        }
        uiSocket.emit('clientsUpdate', clients);
    });
});
//
// Communication with UI
//
uiSocket.on('connection', function (socket) {
    uiSocket.emit('clientsUpdate', clients);
    uiSocket.emit('projectUpdate', activeProject);
    socket.on('updateStages', function (stages) {
        for (var _i = 0, stages_1 = stages; _i < stages_1.length; _i++) {
            stage = stages_1[_i];
            clientsSocket.to('#' + stage.id).emit('setMedia', stage.media);
        }
        Object.assign(activeProject.stages, stages);
    });
    socket.on('stageEvent', function (to, event, data) {
        console.log(to, event, data);
        if (data === 'timestamp') {
            data = Date.now() + START_OFFSET;
        }
        if (to === '*' || to === 'all') {
            clientsSocket.emit(event, data);
        }
        else {
            clientsSocket.to('#' + to).emit(event, data);
        }
        // clientsSocket.emit('start', Date.now() + START_OFFSET);
    });
    var mediaFiles = [];
    var directoryPath = path.join(__dirname, '../public/stage/content');
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var absolutePath = directoryPath + '/' + file;
            var stats = fs.statSync(absolutePath);
            mediaFiles.push({
                name: file,
                size: stats.size / 1000000.0
            });
        }
        socket.emit('filesUpdate', mediaFiles);
    });
});
// chokidar.watch('../stage/content').on('all', (event, path) => {
//     console.log(event, path);
// });
//
// Communication with MIDI Devices
var midiInputs = easymidi.getInputs();
var midiOutputs = easymidi.getOutputs();
console.log(midiInputs, midiOutputs);
if (midiInputs.length > 0) {
    var input = new easymidi.Input(midiInputs[0]).on('noteon', function (msg) {
        console.log(msg);
        if (msg.note === 48) {
            clientsSocket.emit('start', Date.now() + START_OFFSET);
        }
        else if (msg.note === 49) {
            tapTempo.tap();
        }
    });
}
var output;
if (midiOutputs.length > 0) {
    console.log('d');
    output = new easymidi.Output(midiOutputs[0]);
    // for (let note = 0; note < 128; note++) {
    // setInterval(() => {
    //         console.log( note);
    //         output.send('noteon', {
    //             note: note,
    //             value: 127,
    //             channel:0
    //         });
    //         note++;
    // }, 100)
    // }
    // noteon 14 channel 0 
    var note = 0;
    // output.send('noteon', {
    //     note: 14,
    //     value: 0,
    //     channel: 0
    // });
    var val1 = 0;
}
var tempo;
var tempoEvent;
var quarterEvent;
tapTempo.on('tempo', function (bpm) {
    clearInterval(tempoEvent);
    clearInterval(quarterEvent);
    var beat = 0;
    console.log('BPM detected');
    var timestamp = Date.now() + (60000 / bpm) * 4;
    console.log(timestamp);
    clientsSocket.emit('bpm', { bpma: bpm, timestamp: timestamp });
    var pads = [16, 13, 14, 15, 16];
    var pads2 = [12, 9, 10, 11, 12];
    var tick = 0;
    quarterEvent = setInterval(function () {
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
    tempoEvent = setInterval(function () {
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
        // for(i = 9; i <13; i++){
        //     output.send('noteon', {
        //         note: i,
        //         velocity: beat%2===0 ? 127 : 0,
        //         channel: 0
        //     });
        // }
        process.stdout.write(" BPM: " + bpm + " (" + beat + ")\r");
        clientsSocket.emit('beat', { bpm: bpm, beat: beat });
        //   console.log("BPM: " + tempo + " (" + beat + ")\r");
        if (beat > 3) {
            beat = 0;
        }
    }, 60000 / bpm);
});
