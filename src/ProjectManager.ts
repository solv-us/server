let fs = require('fs');
const fsPromises = fs.promises;

import { Project } from './Project';
import { timingSafeEqual } from 'crypto';

export default class ProjectManager {

    activeProject:Project;
    projects: Array<String>

    constructor(public directory: String = '/'){
        
        this.listProjects().then(projectList => {
            this.projects = projectList;
        });

    }

    async listProjects(){
        let projectList : Array<String> = [];

        let projectFiles = await fsPromises.readdir(this.directory);
        if (projectFiles) {
            for(let projectFile of projectFiles){
                if (projectFile.split('.').pop() === 'sproject')
                projectList.push(projectFile);
            }
        } else {
            console.error('No projects found in folder ' + this.directory)
        }

       return projectList;
    
    }

    async loadProjectFromFile(path: string) {
        let project = await this.getFromFile(path);
        this.loadProject(project);
    }

    async getFromFile(path: string) {

        let project: any;

        let projectFile = await fsPromises.readFile(this.directory + '/' +path);

        if (projectFile) {
            project = JSON.parse(projectFile);
        } else {
            console.error('Cannot load project file: ' + path + '. File corrupted or not found.')
        }

        return project;

    }

    loadProject(project: any) {
        this.activeProject = new Project(project.name);
        this.activeProject.stages = project.stages;
        this.activeProject.windows = project.windows;
        this.activeProject.mediaPath = project.mediaPath;
    }
 
    async newEmptyProject(name: string){
        this.activeProject = new Project(name);
        return this.save();
    }

    async save(){
        if(this.activeProject){
            let data = JSON.stringify(this.activeProject);
            let projectFile = await fsPromises.writeFile(this.directory + '/' + this.activeProject.name + '.sproject', data)
            if (projectFile) {
                return true;
            } else {
                return false;
            }
        }else{
            return false;
        }
    }

    async close(){
        await this.save();
        this.activeProject = undefined;
        return true;
    }

    async delete(){
        if (this.activeProject) {
            let deleted = await fsPromises.unlink(this.directory + '/' + this.activeProject.name + '.sproject').catch((e)=>{console.error(e)})
            this.activeProject = undefined;
            return deleted;
        }
    }

}