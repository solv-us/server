import Client from './Client'

export default class ClientManager {
    public clients: Array<Client>;

    constructor(){
        this.clients = [];
    }
    
    /**
    * Adds a client
    * @param client The Client to delete
    */
    addClient(id: string){
        let client = new Client(id);
        this.clients.push(client);
        return client;
    }

    /**
     * Removes a client
     * @param client The Client to delete
     */
    removeClient(client: Client){
        let index = this.clients.indexOf(client);
        if (index >= 0) {
            this.clients.splice(index, 1);
        }
    }

}