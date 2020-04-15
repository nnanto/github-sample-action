import { GitHub, context } from '@actions/github';
import { Toolkit } from 'actions-toolkit';

export class ConfigReader {

    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public async readFromWorkspace() {
        let tk = new Toolkit({token: this.token});
        var fileContent = tk.getFile('schema.proto');
        console.log('Read file content: ', fileContent);
        const path = process.env.GITHUB_WORKSPACE;
        const files = await tk.runInWorkspace("ls");
        console.log(`Result of running 'ls' :`, files);
        await tk.runInWorkspace('mkdir',['-p','csharp']);
        const result = await tk.runInWorkspace('protoc',['schema.proto', '--csharp_out=./csharp']);
        console.log('Proto exec result:', result.all);
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
        
        var generatedFileContent = tk.getFile('csharp/Schema.cs');
        console.log('Generated file content:', generatedFileContent);
    }

}