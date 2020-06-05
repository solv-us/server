// Require dependencies
let chalk = require('chalk');
const log = console.log;


let artnet = require('artnet')({
    host:'192.168.2.5',
})
// Require components
import Server from './Server'
import ClientManager from './ClientManager'
import ProjectManager from './ProjectManager'
import MediaManager from './Media/MediaManager'
import WindowManager from './UI/WindowManager'

// Setup Solvus
// TO-DO: Put this all in one over-arching class
log(chalk.bgRedBright('Solvus Server'));
let server = new Server();
let io = require('socket.io')(server.httpsServer, { serveClient: false });

let clientManager = new ClientManager();
let projectManager = new ProjectManager(__dirname + '/../public/projects');
let mediaManager = new MediaManager('/Users/daniel/projects/solvus/server/public/content');
let windowManager = new WindowManager();

//export { clientManager, projectManager, mediaManager};

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