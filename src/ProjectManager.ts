let fs = require('fs');
const fsPromises = fs.promises;

import { Project } from './Project';

export default class ProjectManager {

    activeProject:Project;
    projects: Array<String>

    constructor(public directory: String = '/'){
        
        this.listProjects().then(projectList => {
            this.projects = projectList;
        });

    }

    async listProjects(){
        let projectList : Array<String>;

        let projectFiles = await fsPromises.readdir(this.directory);
        if (projectFiles) {
            projectList = projectFiles;
        } else {
            console.error('No projects found in folder ' + this.directory)
        }

       return projectList;
    
    }

    loadProjectFromFile(fileName){
       this.activeProject = new Project(fileName)
    }

}