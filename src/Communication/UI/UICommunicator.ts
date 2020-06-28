import SolvusServer from '../../SolvusServer';
import SolvusEvent from '../../Events/EventInterface';

export default class UICommunicator {

    constructor(private app : SolvusServer){
       
    }
    
    initialize(){
        let uiSocket = this.app.server.sockets.of('/ui')
        uiSocket.on('connection', (socket)=>{this.handleConnection(socket)});
    }

    /**
     * Called when a websocket connects to the UI namespace
     */
    handleConnection(socket){
        let projectManager = this.app.projectManager;
        let clientManager = this.app.clientManager;
        let mediaManager = this.app.mediaManager;
        let clientSockets = this.app.server.sockets.of('/client');

        if (projectManager.activeProject) {
            socket.emit('clientsUpdate', clientManager.clients);
            socket.emit('filesUpdate', mediaManager.files);
            socket.emit('projectUpdate', projectManager.activeProject);
        } else {
            projectManager.listProjects().then(projects => {
                socket.emit('projects', projects)
            })
        }

        socket.on('openProject', (projectName) => {
            projectManager.loadProjectFromFile(projectName).then(() => {
                console.log('SET ACTIVE PROJECT:', projectManager.activeProject?.name);

                socket.emit('clientsUpdate', clientManager.clients);
                socket.emit('filesUpdate', mediaManager.files);
                socket.emit('projectUpdate', projectManager.activeProject);
            });
        })

        socket.on('closeProject', () => {
            projectManager.close().then(() => {
                console.log('CLOSED ACTIVE PROJECT');

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

        socket.on('updateStages', (stages) => {
            if (projectManager.activeProject) {
                for (let stage of stages) {
                    clientSockets.to('#' + stage.id).emit('setMedia', stage.media)
                }
                // Object.assign(projectManager.activeProject.stages, stages);
                projectManager.activeProject.stages = stages;
                projectManager.save();
            }
        })

        socket.on('updateWindows', (windows) => {
           
            if (projectManager.activeProject) {
                projectManager.activeProject.windows = windows;
                projectManager.save();
            }
        });

        socket.on('updateEvents', (events) => {
            if (projectManager.activeProject) {
                projectManager.activeProject.events = events;
                projectManager.save();
            }
        });

        socket.on('updateMidiMappings', (mappings) => {
            if (projectManager.activeProject) {
                projectManager.activeProject.midiMappings = mappings;
                projectManager.save();
            }
        });

        socket.on('updatePublicPath', (publicPath) => {
            if (projectManager.activeProject) {
                projectManager.activeProject.publicPath = publicPath;

                mediaManager.directory = publicPath;
                projectManager.save();
            }
        });

        socket.on('sendStageEvent', (target, id, value) => {

            let event : SolvusEvent = {
                type:'stage',
                id,
                target,
                data:{
                    value
                }
            }  

            if (target === '*' || target === 'all') {
                clientSockets.emit('stageEvent', event);
            } else {
                clientSockets.to('#' + target).emit('stageEvent', event);
            }
        });

        socket.on('forceToStage', (clientId, stageId) => {
            clientSockets.to(clientId).emit('forceToStage', stageId)
        });

    }

}