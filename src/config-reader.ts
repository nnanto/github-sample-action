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
        const path = process.env.GITHUB_WORKSPACE;
        const result = await tk.runInWorkspace("protoc",`protoc -I=${path} --csharp_out=${path}/csharp ${path}/schema.proto`);
        console.log('Proto exec result:', result.all);
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
        console.log('Read file content: ', fileContent);
        var generatedFileContent = tk.getFile('csharp/Addressbook.cs');
        console.log('Generated file content:', generatedFileContent);
    }

}