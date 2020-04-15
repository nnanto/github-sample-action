import { GitHub, context } from '@actions/github';
import { Toolkit } from 'actions-toolkit';

export class ConfigReader {

    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private getBranchName() {
        return context.ref.split('/').pop();
    }

    private async createBranch(github: GitHub, lang = 'csharp') {
        let branch = this.getBranchName() + '-' + lang;


        // throws HttpError if branch already exists.
        try {
            await github.repos.getBranch({
                ...context.repo,
                branch
            })


        } catch (error) {
            if (error.name === 'HttpError' && error.status === 404) {
                await github.git.createRef({
                    ref: `refs/heads/${branch}`,
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

    public async readFromWorkspace() {
        let gh = new GitHub(this.token);
        // await this.createBranch(gh);

        let tk = new Toolkit({ token: this.token });
        var fileContent = tk.getFile('schema.proto');

        console.log('Read file content: ', fileContent);
        
        await this.runAndPrint(tk, "ls");
        await tk.runInWorkspace('mkdir', ['-p', 'csharp']);
        const result = await tk.runInWorkspace('protoc', ['schema.proto', '--csharp_out=./csharp']);

        await this.run(tk, "git branch -v");
        await this.run(tk, "git remote -v");

        await this.runAndPrint(tk, "git", ["status"]);
        await this.run(tk, 'git checkout -b csharp');
        await this.run(tk, `git config user.email ${process.env.GITHUB_ACTOR}@gmail.com`);
        await this.run(tk, `git config user.name ${process.env.GITHUB_ACTOR}`);

        await this.run(tk, 'git commit -a -m "new_code_generated"');
        
        console.log('Proto exec result:', result.stdout);
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);

        var generatedFileContent = tk.getFile('csharp/Schema.cs');
        console.log('Generated file content:', generatedFileContent);
    }

}