# solv.us server
This repository contains the server component of solv.us. For full instructions, please see the [documentation repository](https://github.com/solv-us/documentation).

## Setup for production
### Prerequisites
Solv.us server runs in a Node.js environment, so make sure [Node.js](https://nodejs.org/en/) is installed on the computer you intend to run this server on. 

Download the latest version from [the Releases tab](https://github.com/solv-us/server/releases). Place the file wherever you want your projects to live, navigate there in your terminal and then start the server.

```
cd path/to/the/folder
node SolvusServer
```

### Note on HTTPS
Solv.us server is by default only accessible over HTTPS. To make things easier, it will generate the necessary certificate and key on start up and save them in the root folder. Browsers will not trust this certificate since it's self-signed, so in each browser you will need to trust it manually.

If you wish to provide your own certificate and key to prevent this, save them as ```./local-cert.pem``` and ```./local-key.pem``` in your root folder.

## Setup for development
If you want to add features or customize the server, you'll need to clone the whole repository and install its dependencies.

```
git clone https://github.com/solv-us/server.git
cd server
npm install
```

### Starting the server with auto reload
```
npm run start:watch
```

### Compile and minify for production
```
npm run build
```

## Directories

| Directory         | Purpose                                                              |
|-------------------|----------------------------------------------------------------------|
| /dist             | Containes minified and bundled script to use in production           |
| /public           | The folder exposed by the server                                     |
| /public/stage     | The stages                                                           |
| /src              | The source code of the server                                        |
