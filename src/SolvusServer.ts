// External Dependencies
import socketIO from "socket.io";

// Require solvus components
import Server from './Server'
import ClientManager from './ClientManager'
import ProjectManager from './Project/ProjectManager'
import MediaManager from './Media/MediaManager'
import WindowManager from './UI/WindowManager'
import MidiDeviceManager from './Midi/MidiDeviceManager'
import MidiMapManager from "./Midi/MidiMapManager";
import EventManager from "./Events/EventManager";
import Clock from "./Time/Clock";
import SolvusEvent from "./Events/EventInterface";

export default class Solvus {

    server: Server = new Server();
    clientManager = new ClientManager();
    projectManager = new ProjectManager(__dirname + '/../public/projects');
    mediaManager = new MediaManager('/Users/daniel/projects/solvus/server/public/content');
    windowManager = new WindowManager();
    midiDeviceManager = new MidiDeviceManager();
    midiMapManager = new MidiMapManager();
    mainClock = new Clock();
    eventManager = new EventManager(this.midiDeviceManager, this.midiMapManager, this.mainClock);
    io: any;

    constructor(){

        this.io = socketIO(this.server.httpsServer, { serveClient: false });
        this.eventManager.on('stageEvent', (event : SolvusEvent)=>{
            
          console.log(event)

        });

    }

}