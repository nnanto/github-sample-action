
export class ConfigReader {

    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    public readFromWorkspace() {
        console.log("Reading with token :", this.token, " from workspace : ", process.env.GITHUB_WORKSPACE);
    }

}