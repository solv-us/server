// Require dependencies
let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

// TODO: CHange back to socket.io implementation
let timesyncServer = require('./timesync.js');

// Require components
import Client from './Client'
import ProjectManager from './ProjectManager'
import MediaManager from './MediaManager'

// Setup Solvus
let projectManager = new ProjectManager('../public/projects');
projectManager.loadProjectFromFile('../public/projects/DHO_STRP.json');
let mediaManager = new MediaManager('/Users/daniel/projects/solvus/solvus-server/public/content');


// Set up port
let port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Set up static file server for the public folder
app.use('/stage',express.static(path.join(__dirname, '../public/stage')));
app.use('/timesync', timesyncServer.requestHandler);

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
    uiSocket.emit('clientsUpdate', clients);
    socket.emit('filesUpdate', mediaManager.files);
    uiSocket.emit('projectUpdate', projectManager.activeProject);

    socket.on('updateStages', (stages) =>{
        for(let stage of stages){
            clientsSocket.to('#'+stage.id).emit('setMedia',stage.media)
        }
        Object.assign(projectManager.activeProject.stages, stages);
    })

    socket.on('stageEvent', (to, event, data) => {
        console.log('stageEvent:', to, event, data)
       
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

    // Add new Client
    let client = new Client(socket.id);
    clients.push(client);

    // Save changes and emit to UI
    socket.on('clientUpdate', (data) => {

        // Subscribe to stage
        if (data.stageId !== client.data.stageId) {
            socket.leave('#' + client.data.stageId);
            socket.join('#' + data.stageId);

            for (let stage of projectManager.activeProject.stages) {
                if (stage.id === data.stageId)
                    socket.emit('setMedia', stage.media)
            }

        }

        // Update client list and send to ui
        Object.assign(client.data, data);
        uiSocket.emit('clientsUpdate', clients);

    });

    // And remove it on disconnect
    socket.on('disconnect', () => {
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
