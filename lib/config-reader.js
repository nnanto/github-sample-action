"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigReader {
    readFromWorkspace() {
        console.log("Reading with token :", process.env.GITHUB_TOKEN, " from workspace : ", process.env.GITHUB_WORKSPACE);
    }
}
exports.ConfigReader = ConfigReader;
