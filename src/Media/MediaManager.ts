import fs from 'fs';
const fsPromises = fs.promises;
import MediaFile from './MediaFile'

export default class MediaManager {

    files: Array<MediaFile>

    constructor(public directory: string = '/'){
        this.listFiles().then(mediaFileList =>{
            this.files = mediaFileList;
        });
    }

    async listFiles(){
        let mediaFileList : Array<MediaFile> = [];

        let files = await fsPromises.readdir(this.directory);
        if(files){
            for (let file of files) {
                if(file.charAt(0) !== '.'){
                    let absolutePath = this.directory + '/' + file;
                    let stats = fs.statSync(absolutePath)

                    let mediaFile: MediaFile = {
                        name: file,
                        size: Math.round(stats.size / 1000000.0),
                    }
                    mediaFileList.push(mediaFile)
                }
            }

        }
        return mediaFileList;
    }
}



// To-Do: realtime file updates w/ chokidar 
// chokidar.watch('../stage/content').on('all', (event, path) => {
//     console.log(event, path);
// });

//