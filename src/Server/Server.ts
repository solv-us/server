// Require dependencies
import path from "path"
import fs from "fs"
import pem from "pem"
import express, { Application } from "express";
import cors from "cors"
import { Server as HTTPSServer } from "https";
import SocketIO from "socket.io"

export default class Server {

    public app: Application; 
    public httpsServer: HTTPSServer;
    public sockets: SocketIO;

    constructor(){
   
    }

    /*
    *   Set up the server using Express and self-sign HTTPS certificates if none are present
    */
    public async initialize(){

        let { key, cert } = await this.getOrCreateKeyAndCertificate();

        this.app = express();
        this.app.use(cors());

        this.httpsServer = new HTTPSServer({ key, cert }, this.app);
        this.handleRoutes();

        // Listen!
        let port = process.env.PORT || 8843;

        this.httpsServer.listen(port, async () => {
            let ip = await this.getServerIPAddress();
            console.log(`Listening on https://${ip}:${port}`, '\n');
        });

        this.sockets = SocketIO(this.httpsServer, { serveClient: false, path:'/sockets' });

    };

    /**
     * See if key and certificate are available, or create new ones
     */
    private async getOrCreateKeyAndCertificate(){
        let keyPath = './local-key.pem';
        let certPath = './local-cert.pem';

        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.log('No key and certificate found for HTTPS, generating new ones..');
            await this.createCertificate(keyPath, certPath);
        }

        let key = fs.readFileSync(keyPath);
        let cert = fs.readFileSync(certPath);

        return {key, cert};
    }

    /**
     * Set up root message and static file serving
     */
    private handleRoutes(){
        // Root message
        let version = require('../../package.json').version;
        this.app.get('/', (req, res) => res.send(`solv.us server ${version}`))

        // Set up static file server for the public folder
        // to-do
        this.app.use('/stage', express.static(path.join(__dirname, '../../../client')));
        this.app.use('/content', express.static(path.join(__dirname, '../public/content')));
    }

    /**
     * Generates a new, self-signed certificate and key for HTTPS
     * @param keyPath File name and directory for the key file
     * @param certPath File name and directory for the certificate file
     */
    private async createCertificate(keyPath, certPath){
       return new Promise(resolve => { 
           pem.createCertificate({ days: 100, selfSigned: true }, (err, keys) => {
                if (err) {
                    throw err
                }

                fs.writeFileSync(keyPath, keys.serviceKey);
                fs.writeFileSync(certPath, keys.certificate);
                resolve();

            })
        })
    }

    /*
    * Get the server IP
    */
    async getServerIPAddress() {
        return require('ip').address();
    }
} 