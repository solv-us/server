import SolvusServer from '../../SolvusServer';

export default class ClientCommunicator {

    constructor(private app: SolvusServer) {

    }

    initialize() {
        let clients = this.app.server.sockets.of('/client')
        clients.on('connection', (socket) => { this.handleConnection(socket) });

        this.app.mainClock.on('beat', (data)=>{
            clients.emit('beat', data);
        });
        this.app.mainClock.on('division', (data) => {
            clients.emit('division', data);
        })
    }

    /**
     * Called when a websocket connects to the UI namespace
     */
    handleConnection(socket) {
        let clientManager = this.app.clientManager;
        let projectManager = this.app.projectManager;
        let uiSockets = this.app.server.sockets.of('/ui');

        // Add new Client
        let client = clientManager.addClient(socket.id)

        // Save changes and emit to UI
        socket.on('clientUpdate', (data) => {
            
            // Subscribe to stage
            if (data.stageId !== client.data.stageId) {
                socket.leave('#' + client.data.stageId);
                socket.join('#' + data.stageId);


                if (projectManager.activeProject) {
                    for (let stage of projectManager.activeProject.stages) {

                        if (stage.id == data.stageId) {
                            socket.emit('setMedia', stage.media)
                        }

                    }
                }

            }
            // Update client list and send to ui
            Object.assign(client.data, data);
            uiSockets.emit('clientsUpdate', clientManager.clients);

        });

        // And remove it on disconnect
        socket.on('disconnect', () => {
            console.log('CLIENT DISCONNECTED:', socket.id);
            clientManager.removeClient(client);
            uiSockets.emit('clientsUpdate', clientManager.clients);
        });

    }

}