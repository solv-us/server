let fs = require('fs');
let path = require('path');

export class Project {
    name: String;
    mediaPath: String;
    stages: Array<any>;
    midiDevices: Array<any>;

    constructor(fileName : string = ''){
        this.name = '';
        this.stages = [];
        this.midiDevices = [];
        this.mediaPath = '';
        
        if(fileName){
            console.log('Loading project fom file: '+fileName);
            this.loadFromFile(fileName);
        }
    }

    loadFromFile(fileName : string){
        let rawData = fs.readFile(path.join(__dirname, fileName), (error, contents)=>{
            try {
                let project = JSON.parse(contents);
                this.loadProject(project)
            }catch(error){
                console.error('Cannot load project file: ' +fileName + '. File corrupted or not found.')
            }
        });
    }

    loadProject(project: any){
        this.stages = project.stages;
        this.mediaPath = project.mediaPath;
    }

}