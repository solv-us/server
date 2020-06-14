/**
 * This file is not included in the distribution build, but it's the entry point for the development setup.
 */

import SolvusServer from './SolvusServer'

let app = new SolvusServer();




// A function I wrote to use the Akai MPK Mini II as a controller.
import setUpMPKController from './Midi/Controllers/MPKMiniController';
setUpMPKController(app);
