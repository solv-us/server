# solvus-server
Solvus Server aims to be software for playing and syncronizing multimedia on the web. 

## Setup for production
### Prerequisites
Solvus is a Node.js server, so to run it you need [Node.js](https://nodejs.org/en/) installed on the computer you intend to run this server on. Solvus is written for Node.js V12.13, but might work with different versions.

Download the latest version from ```dist/SolvusServer.js```. Place it where you want, navigate to it in your terminal and then run:
```
node SolvusServer
```

Solvus will now start.

###

### Note on HTTPS
Solvus server is by default only accessible over HTTPS. To make things easier, it will generate the necessary certificate and key on start up and save them in the root folder. Browsers will not trust this certificate since it's self-signed, so in each browser you will need to trust it manually. If you wish to provide your own certificate and key to prevent this, save them as ```./local-cert.pem``` and ```./local-key.pem``` in your root folder.



## Setup for development
If you want to add features or customize the server, you'll need to clone the whole repository and install its dependencies.

```
git clone https://github.com/solv-us/solvus-server.git
cd solvus-server
npm install
```

### Starting the server with auto reload
```
npm run start:watch
```

### Compile and minifie for production
```
npm run build
```

## Directories

| Directory         | Purpose                                                              |
|-------------------|----------------------------------------------------------------------|
| /dist             | Containtes minified and bundled script to use in production |
| /public           | The folder exposed by the server                                     |
| /public/stage     | The stages                                                           |
| /src              | The source code of the server                                        |