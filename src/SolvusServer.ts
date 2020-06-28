// Require solvus components
import Server from './Server/Server'
import ClientManager from './Communication/Client/ClientManager'
import ProjectManager from './Project/ProjectManager'
import MediaManager from './Media/MediaManager'
import WindowManager from './Communication/UI/WindowManager'
import MidiDeviceManager from './Midi/MidiDeviceManager'
import MidiMapManager from "./Midi/MidiMapManager";
import EventManager from "./Events/EventManager";
import Clock from "./Time/Clock";
import uiCommunicator from "./Communication/UI/UICommunicator"
import ClientCommunicator from './Communication/Client/ClientCommunicator'

export default class Solvus {

  public server: Server = new Server();
  public clientManager = new ClientManager();
  public projectManager = new ProjectManager();
  public mediaManager = new MediaManager(this.projectManager.activeProject?.publicPath);
  public windowManager = new WindowManager(this);
  public mainClock = new Clock();
  public midiDeviceManager = new MidiDeviceManager(this);
  public midiMapManager = new MidiMapManager(this);
  public eventManager = new EventManager(this.midiDeviceManager, this.midiMapManager, this.mainClock);

  public uiCommunicator = new uiCommunicator(this);
  public clientCommunicator = new ClientCommunicator(this);

  constructor() {
    this.startServer();
  }

  /**
   * Performe all async functions in the right order
   */
  async startServer(){
    await this.server.initialize();
    await this.uiCommunicator.initialize();
    await this.clientCommunicator.initialize();
  }

}