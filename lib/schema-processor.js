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
var supportedLanguages = ['csharp', 'java'];
class SchemaProcessor {
    constructor(token) {
        this.token = token;
    }
    getCurrentBranchName() {
        return github_1.context.ref.split('/').pop();
    }
    getLanguageBasedBranchName(language) {
        return `${this.getCurrentBranchName()}_${language}`;
    }
    createBranch(github, branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            // throws HttpError if branch already exists.
            try {
                yield github.repos.getBranch(Object.assign(Object.assign({}, github_1.context.repo), { branch: branchName }));
            }
            catch (error) {
                console.error(error.message);
                if (error.name === 'HttpError' && error.status === 404) {
                    yield github.git.createRef(Object.assign({ ref: `refs/heads/${branchName}`, sha: github_1.context.sha }, github_1.context.repo));
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
            console.log(`Output of ${command} ${args === null || args === void 0 ? void 0 : args.toString()} : `, result.stdout);
        });
    }
    run(tk, command) {
        return __awaiter(this, void 0, void 0, function* () {
            let commandsArr = command.split(" ");
            yield tk.runInWorkspace(commandsArr.shift(), commandsArr);
        });
    }
    createCodeFor(tk, language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!supportedLanguages.includes(language)) {
                throw new Error(`Not a supported language! Please choose one of the following language : ${supportedLanguages.toString()}`);
            }
            let schemaFileName = 'schema.proto';
            yield this.run(tk, `mkdir -p ${language}`);
            yield this.run(tk, `protoc ${schemaFileName} --${language}_out=./${language}`);
            let languageSpecificBranchName = this.getLanguageBasedBranchName(language);
            yield this.runAndPrint(tk, `git`, ['branch', '-v']);
            try {
                yield this.run(tk, `git checkout -b ${languageSpecificBranchName}`);
            }
            catch (err) {
                console.log(`Branch ${languageSpecificBranchName} already exists`);
                yield this.run(tk, `git checkout ${languageSpecificBranchName}`);
            }
            yield this.run(tk, `git config user.email ${process.env.GITHUB_ACTOR}@gmail.com`);
            yield this.run(tk, `git config user.name ${process.env.GITHUB_ACTOR}`);
            yield this.run(tk, 'git add .');
            let commitMessage = `Update wrt ${github_1.context.sha}`;
            // not using this.run as we'll have space in commit message
            yield tk.runInWorkspace('git', ['commit', '-m', commitMessage]);
            yield this.run(tk, `git push -f origin ${languageSpecificBranchName}`);
        });
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.createBranch(gh);
            let tk = new actions_toolkit_1.Toolkit({ token: this.token });
            try {
                yield this.createCodeFor(tk, 'csharp');
            }
            catch (err) {
                console.error(err.message);
            }
        });
    }
}
exports.SchemaProcessor = SchemaProcessor;
