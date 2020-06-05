import SolvusServer from './SolvusServer'
import SolvusEvent from './Events/EventInterface'

let app = new SolvusServer();

// A function I wrote to use the Akai MPK Mini II as a controller.
import setUpMPKController from './Midi/MidiControllers/MPKMiniController';
setUpMPKController(app);
