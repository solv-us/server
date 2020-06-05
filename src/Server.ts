// Require dependencies
import path from "path"
import fs from "fs"
import pem from "pem"
import express, { Application } from "express";
import { createServer as createHttpsServer, Server as HTTPSServer } from "https";

export default class Server {

    public app: Application; 
    public httpsServer: HTTPSServer;

    constructor(){
        this.initialize();
    }

    /*
    *   Set up the server using Express and self-sign HTTPS certificates if none are present
    */
    private async initialize(){

        let { key, cert } = await this.getOrCreateKeyAndCertificate();

        this.app = express();
        this.httpsServer = createHttpsServer({ key, cert }, this.app);
        this.handleRoutes();

        // Listen!
        let port = process.env.PORT || 8843;

        this.httpsServer.listen(port, async () => {
            let ip = await this.getServerIPAddress();
            console.log(`Listening on https://${ip}:${port}`, '\n');
        });

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
        let version = require('../package.json').version;
        this.app.get('/', (req, res) => res.send(`solv.us server ${version}`))

        // Set up static file server for the public folder
        this.app.use('/stage', express.static(path.join(__dirname, '../public/stage')));
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