class Client {
    constructor(id){
        this.id = id;
        this.data = {
            name: id,
            width:12
        }
    }

    setDimensions(width = 0, height = 0){
        this.width = width;
        this.height = height;
    }
}

module.exports = Client;