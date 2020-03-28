# solvus-server
Solvus Server aims to be software for playing and syncronizing multimedia on the web. 

## Directories

| Directory         | Purpose                                                              |
|-------------------|----------------------------------------------------------------------|
| /dist             | Containtes minified and bundled script after building for production |
| /public           | The folder exposed by the server                                     |
| /public/stage     | The stages                                                           |
| /src              | The source code of the server                                        |

## Recommended project setup
```
git clone https://github.com/dpkn/solvus-server.git
cd solvus-server
npm install
```

### Compiles with auto-reload on changes and crashed, for development
```
npm run start:watch
```

### Compiles and minifies for production (Currently Fails)
```
npm run build
```