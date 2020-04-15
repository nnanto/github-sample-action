"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_toolkit_1 = require("actions-toolkit");
class ConfigReader {
    constructor(token) {
        this.token = token;
    }
    readFromWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            let tk = new actions_toolkit_1.Toolkit({ token: this.token });
            var fileContent = tk.getFile('schema.proto');
            console.log('Read file content: ', fileContent);
            const path = process.env.GITHUB_WORKSPACE;
            const files = yield tk.runInWorkspace("ls");
            console.log(`Result of running 'ls' :`, files);
            yield tk.runInWorkspace('mkdir', ['-p', 'csharp']);
            const result = yield tk.runInWorkspace('protoc', ['schema.proto', '--csharp_out=./csharp']);
            console.log('Proto exec result:', result.all);
            console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
            var generatedFileContent = tk.getFile('csharp/Schema.cs');
            console.log('Generated file content:', generatedFileContent);
        });
    }
}
exports.ConfigReader = ConfigReader;
