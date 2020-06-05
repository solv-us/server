// External Dependencies
import socketIO from "socket.io";

// Require solv.us components
import Server from './Server'
import ClientManager from './ClientManager'
import ProjectManager from './ProjectManager'
import MediaManager from './MediaManager'
import WindowManager from './WindowManager'

export default class SolvusServer {

    server: Server;
    clientManager: ClientManager;
    projectManager: ProjectManager;
    mediaManager: MediaManager;
    windowManager: WindowManager;
    io: any;

    constructor(){
        this.server = new Server();
        this.io = socketIO(this.server.httpsServer, { serveClient: false });

        this.clientManager = new ClientManager();
        this.projectManager = new ProjectManager(__dirname + '/../public/projects');
        this.mediaManager = new MediaManager('/Users/daniel/projects/solvus/server/public/content');
        this.windowManager = new WindowManager();
    }

}