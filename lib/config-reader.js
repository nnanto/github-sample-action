"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigReader {
    constructor(token) {
        this.token = token;
    }
    readFromWorkspace() {
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
    }
}
exports.ConfigReader = ConfigReader;
