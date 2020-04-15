"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_toolkit_1 = require("actions-toolkit");
class ConfigReader {
    constructor(token) {
        this.token = token;
    }
    readFromWorkspace() {
        let tk = new actions_toolkit_1.Toolkit({ token: this.token });
        var fileContent = tk.getFile('README.md');
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
        console.log('Read file content: ', fileContent);
    }
}
exports.ConfigReader = ConfigReader;
