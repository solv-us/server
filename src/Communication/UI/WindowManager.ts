import Window from './Window'
import SolvusServer from '../../SolvusServer'

export default class WindowManager {
    public windows: Array<Window>;

    constructor(private app : SolvusServer){
        this.windows = [];
    }
    
    /**
    * Adds a window
    * @param window The Window to delete
    */
    addWindow(id: string){
        let window = new Window(id);
        this.windows.push(window);
        return window;
    }

    /**
     * Removes a window
     * @param window The Window to delete
     */
    removeWindow(window: Window){
        let index = this.windows.indexOf(window);
        if (index >= 0) {
            this.windows.splice(index, 1);
        }
    }

}