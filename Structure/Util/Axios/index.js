const Get = require("./Interfaces/Method/GET/index");
const Post = require("./Interfaces/Method/POST/index");
const Put = require("./Interfaces/Method/PUT/index");
const Delete = require("./Interfaces/Method/DELETE/index");
const Head = require("./Interfaces/Method/HEAD/index")
class Axios {
    constructor() {
        this.getRequest = new Get();
        this.postRequest = new Post();
        this.putRequest = new Put();
        this.deleteRequest = new Delete();
        this.headRequest = new Head();
    }
    async get(url, config) {
        return this.getRequest.send(url, config);
    }

    async post(url, data, config) {
        return this.postRequest.send(url, data, config);
    }

    async put(url, data, config) {
        return this.putRequest.send(url, data, config);
    }

    async delete(url, config) {
        return this.deleteRequest.send(url, config);
    }

    async head(url, config) {
        return this.headRequest.send(url, config);
    }
}
module.exports = Axios;