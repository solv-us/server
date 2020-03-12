const fs = require('fs');
const path = require('path');

class Project {
    constructor(fileName = ''){
        this.name = '';
        this.stages = [];
        // this.midiDevices = [];

        if(fileName){
            console.log('loading fom file');
            this.loadFromFile(fileName);
        }
    }

    loadFromFile(fileName){
        let rawData = fs.readFileSync(path.join(__dirname, fileName));
        let project = JSON.parse(rawData);
        this.stages = project.stages;
        console.log(this)
    }

}

module.exports = Project;

// let stages = [];
// let Stage = require('./Stage.js');

// for (let stageSetup of stagesSetup) {

//     let stage = new Stage(stageSetup.id);
//     stage.fileName = stageSetup.file;
//     stages.push(stage);
// }
