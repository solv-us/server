let fs = require('fs');
const fsPromises = fs.promises;
let path = require('path');

export class Project {
    mediaPath: String;
    stages: Array<any>;
    midiDevices: Array<any>;
    windows: Array<Window>;

    constructor(public name : string = ''){
        this.stages = [];
        this.windows = [];
        this.midiDevices = [];
        this.mediaPath = '';
    }
    
}

type WindowType = "Client" | "Stage" | "Controls";
export class Window {
    title: String;
    type: WindowType;
    position: {
        x: Number,
        y: Number
    };
    opened: false;

    constructor(title="") {

    }
}