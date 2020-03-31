let fs = require('fs');
const fsPromises = fs.promises;
let path = require('path');

export class Project {
    mediaPath: String;
    stages: Array<any>;
    midiDevices: Array<any>;

    constructor(public name : string = ''){
        this.stages = [];
        this.midiDevices = [];
        this.mediaPath = '';
    }
    
}