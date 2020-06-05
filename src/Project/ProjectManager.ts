let fs = require('fs');
const fsPromises = fs.promises;

import Project from './Project';

export default class ProjectManager {

    activeProject:Project;
    projects: Array<string>

    constructor(public directory: String = '/'){
        
        this.listProjects().then(projectList => {
            this.projects = projectList;
        });

    }

    /**
     * Reads the supplied directory and returns a list of filenames ending in .sproject
     */
    async listProjects(){
        let projectList : Array<string> = [];

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

    /**
     * Gets a file from the specified path and loads it as active project
     * @param path The file path relative to the ProjectManagers directory
     */
    async loadProjectFromFile(path: string) {
        let project = await this.getFromFile(path);
        this.loadProject(project);
    }

    /**
     * Gets the content of a specfic JSON file, parses and returns it
     * @param path The file path relative to the project managers directory
     */
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

    /**
     * Loads a parsed JSON object as the active project
     */
    loadProject(project: any) {
        this.activeProject = new Project(project.name);
        this.activeProject.stages = project.stages;
        this.activeProject.windows = project.windows;
        this.activeProject.mediaPath = project.mediaPath;
    }
 
    /**
     * Creates an empty project
     */
    async newEmptyProject(name: string){
        this.activeProject = new Project(name);
        return this.save();
    }

    /**
     * Write the active project's data to the file system
     */
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

    /**
     * Save the active project and remove it as active
     */
    async close(){
        await this.save();
        this.activeProject = undefined;
        return true;
    }

    /**
     * Remove the active project from the file system
     */
    async delete(){
        if (this.activeProject) {
            let deleted = await fsPromises.unlink(this.directory + '/' + this.activeProject.name + '.sproject').catch((e)=>{console.error(e)})
            this.activeProject = undefined;
            return deleted;
        }
    }

}