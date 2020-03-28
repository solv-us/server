let fs = require('fs');
let path = require('path');

import { Project } from './Project';

export default class ProjectManager {

    activeProject:Project;
    projects: Array<String>

    constructor(directory: String = '/'){
        this.projects = this.listProjects(directory);
    }

    listProjects(directory: String){
        let ProjectList : Array<String>;

        fs.readdir(path.join(__dirname, directory), (err, files: Array<String>) => {
            if(files){
               ProjectList = files;
            }
        });

        return ProjectList;
    }

    loadProjectFromFile(fileName){
       this.activeProject = new Project(fileName)
    }

}