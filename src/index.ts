/**
 * This file is not included in the distribution build, but it's the entry point for the development setup.
 */

import SolvusServer from './SolvusServer'

let app = new SolvusServer();
app.projectManager.directory = '/Users/daniel/projects/solvus/server/public/projects'

async function setup(){
   await app.projectManager.loadProjectFromFile('beepleboople.sproject');
   app.midiMapManager.addMapping('MPK', 2, 1, 'a', { type: 'stage', id: 'j' });
}

setup();
// A function I wrote to use the Akai MPK Mini II as a controller.
import setUpMPKController from './Midi/Controllers/MPKMiniController';
//setUpMPKController(app);
