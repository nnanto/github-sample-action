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
const github_1 = require("@actions/github");
const actions_toolkit_1 = require("actions-toolkit");
const createPullRequest = require("octokit-create-pull-request");
class ConfigReader {
    constructor(token) {
        this.token = token;
    }
    getBranchName() {
        return github_1.context.ref.split('/').pop();
    }
    createBranch(github, lang = 'csharp') {
        return __awaiter(this, void 0, void 0, function* () {
            let branch = this.getBranchName() + '-' + lang;
            // throws HttpError if branch already exists.
            try {
                yield github.repos.getBranch(Object.assign(Object.assign({}, github_1.context.repo), { branch }));
            }
            catch (error) {
                if (error.name === 'HttpError' && error.status === 404) {
                    yield github.git.createRef(Object.assign({ ref: `refs/heads/${branch}`, sha: github_1.context.sha }, github_1.context.repo));
                }
                else {
                    throw Error(error);
                }
            }
        });
    }
    runAndPrint(tk, command, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield tk.runInWorkspace(command, args);
            console.log(`Output of ${command} ${args === null || args === void 0 ? void 0 : args.toString()} : `, result.all);
        });
    }
    readFromWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            let gh = new github_1.GitHub(this.token);
            // await this.createBranch(gh);
            let tk = new actions_toolkit_1.Toolkit({ token: this.token });
            var fileContent = tk.getFile('schema.proto');
            console.log('Read file content: ', fileContent);
            this.runAndPrint(tk, "ls");
            yield tk.runInWorkspace('mkdir', ['-p', 'csharp']);
            const result = yield tk.runInWorkspace('protoc', ['schema.proto', '--csharp_out=./csharp']);
            yield this.runAndPrint(tk, "git", ['branch', '-v']);
            yield this.runAndPrint(tk, "git", ['remote', '-v']);
            console.log('Proto exec result:', result.all);
            console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
            var generatedFileContent = tk.getFile('csharp/Schema.cs');
            console.log('Generated file content:', generatedFileContent);
        });
    }
}
exports.ConfigReader = ConfigReader;
