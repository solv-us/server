import fs from 'fs';
const fsPromises = fs.promises;

import Project from './Project';

export default class ProjectManager {

    activeProject: Project;
    projects: Array<string>

    constructor(public directory: string = './') {

        this.listProjects().then(projectList => {
            this.projects = projectList;
        });

    }

    /**
     * Reads the supplied directory and returns a list of filenames ending in .sproject
     */
    async listProjects() {
        let projectList: Array<string> = [];

        let directoryFiles = await fsPromises.readdir(this.directory);

        if (directoryFiles) {
            for (let file of directoryFiles) {
                if (file.split('.').pop() === 'sproject')
                    projectList.push(file);
            }
        } else {
            console.error('No files found in folder ' + this.directory)
        }

        return projectList;

    }

    /**
     * Gets a file from the specified path and loads it as active project
     * @param path The file path relative to the ProjectManagers directory
     */
    async loadProjectFromFile(path: string) {
        let project = await this.getFromFile(path);
        return this.loadProject(project);
    }

    /**
     * Gets the content of a specfic JSON file, parses and returns it
     * @param path The file path relative to the project managers directory
     */
    async getFromFile(path: string) {

        let project: any;
        try {
            let projectFile = await fsPromises.readFile(this.directory + '/' + path);
            project = JSON.parse(projectFile.toString());
        } catch{
            console.error('File not found or corrupted: ' + this.directory + '/' + path)
            return undefined;
        }

        return project;

    }

    /**
     * Loads a parsed JSON object as the active project
     */
    loadProject(project: any) {
        if (project) {
            this.activeProject = new Project(project.name);
            this.activeProject.stages = project.stages || [];
            this.activeProject.windows = project.windows || [];
            this.activeProject.midiMappings = project.midiMappings || [];
            this.activeProject.events = project.events || [];
            this.activeProject.publicPath = project.publicPath;

            console.log('Set ' + project.name + ' as active project')
        } else {
            console.error('Did not set active project')
        }
    }

    /**
     * Creates an empty project
     */
    async newEmptyProject(name: string) {
        this.activeProject = new Project(name);
        return this.save();
    }

    /**
     * Write the active project's data to the file system
     */
    async save() {
        if (this.activeProject) {
            let data = JSON.stringify(this.activeProject);
            try {
                let projectFile = await fsPromises.writeFile(this.directory + '/' + this.activeProject.name + '.sproject', data);
                return projectFile;
            } catch{
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Save the active project and make it inactive
     */
    async close() {
        await this.save();
        this.activeProject = undefined;
        return true;
    }

    /**
     * Remove the active project from the file system
     */
    async delete() {
        if (this.activeProject) {
            let deleted = await fsPromises.unlink(this.directory + '/' + this.activeProject.name + '.sproject').catch((e) => { console.error(e) })
            this.activeProject = undefined;
            return deleted;
        }
    }

}