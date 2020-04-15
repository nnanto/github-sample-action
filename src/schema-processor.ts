import { GitHub, context } from '@actions/github';
import { Toolkit } from 'actions-toolkit';

var supportedLanguages = ['csharp','java'];

export class SchemaProcessor {

    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private getCurrentBranchName() {
        return context.ref.split('/').pop();
    }

    private getLanguageBasedBranchName(language: string) {
        return `${this.getCurrentBranchName()}_${language}`; 
    }

    private async createBranch(github: GitHub, branchName: string) {
        
        // throws HttpError if branch already exists.
        try {
            await github.repos.getBranch({
                ...context.repo,
                branch: branchName
            })

        } catch (error) {
            console.error(error.message);
            if (error.name === 'HttpError' && error.status === 404) {
                await github.git.createRef({
                    ref: `refs/heads/${branchName}`,
                    sha: context.sha,
                    ...context.repo
                })
            } else {
                throw Error(error)
            }
        }
    }

    private async runAndPrint(tk: Toolkit, command: string, args?: string | string[] | undefined) {
        const result = await tk.runInWorkspace(command, args);
        console.log(`Output of ${command} ${args?.toString()} : `, result.stdout);
    }

    private async run(tk: Toolkit, command: string) {
        let commandsArr = command.split(" ");
        await tk.runInWorkspace(commandsArr.shift() as string, commandsArr);
    }

    private async createCodeFor(tk: Toolkit, language: string) {
        if (!supportedLanguages.includes(language)) {
            throw new Error(`Not a supported language! Please choose one of the following language : ${supportedLanguages.toString()}`);
        }
        let schemaFileName = 'schema.proto';
        await this.run(tk,`mkdir -p ${language}`);
        await this.run(tk, `protoc ${schemaFileName} --${language}_out=./${language}`);
        let languageSpecificBranchName = this.getLanguageBasedBranchName(language);
        let gh = new GitHub(this.token);
        await this.createBranch(gh, languageSpecificBranchName);
        await this.run(tk, `git config user.email ${process.env.GITHUB_ACTOR}@gmail.com`);
        await this.run(tk, `git config user.name ${process.env.GITHUB_ACTOR}`);
        await this.runAndPrint(tk, `git branch -v`);
        await this.run(tk, `git checkout ${languageSpecificBranchName}`);
        await this.run(tk, 'git add .');
        let commitMessage = `Update wrt ${context.sha}`;
        // not using this.run as we'll have space in commit message
        await tk.runInWorkspace('git',['commit','-m',commitMessage]);
        await this.run(tk, `git push -f origin ${languageSpecificBranchName}`);
    }

    public async process() {
        
        // await this.createBranch(gh);

        let tk = new Toolkit({ token: this.token });
        try {
            await this.createCodeFor(tk, 'csharp');
        } catch(err) {
            console.error(err.message);
        }
    }

}