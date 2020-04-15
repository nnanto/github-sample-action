import { GitHub, context } from '@actions/github';
import { Toolkit } from 'actions-toolkit';

export class ConfigReader {

    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public readFromWorkspace() {
        let tk = new Toolkit({token: this.token});
        var fileContent = tk.getFile('README.md');
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
        console.log('Read file content: ', fileContent);
    }

}