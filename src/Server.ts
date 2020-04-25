// Require dependencies
let chalk = require('chalk');
const log = console.log;

let path = require('path');
let fs = require('fs');

import { projectManager } from './index'

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
    *   Set up the server using Express 
    */
    private async initialize() {

        let keyPath = './local-key.pem';
        let certPath = './local-cert.pem';

        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            log('No key and certificate found for HTTPS, generating new ones..');
            await this.createCertificate(keyPath,certPath);
        }

        let key = fs.readFileSync(keyPath);
        let cert = fs.readFileSync(certPath);

        this.app = express();
        this.httpsServer = createHttpsServer({ key, cert }, this.app);

        let port = process.env.PORT || 8843;

        this.httpsServer.listen(port, async () => {
            let ip = await this.getServerIPAddress();
            log(`Listening on https://${ip}:${port}`, '\n');
        });

        // Root message
        let version = require('../package.json').version;
        this.app.get('/', (req, res) => res.send(`solv.us server ${version}: ${projectManager.activeProject ? projectManager.activeProject.name +'.sproject opened' : 'no open project'}`))

        // Set up static file server for the public folder
        this.app.use('/stage', express.static(path.join(__dirname, '../public/stage')));
        this.app.use('/content', express.static(path.join(__dirname, '../public/content')));

    };

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