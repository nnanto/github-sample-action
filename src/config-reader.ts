
export class ConfigReader {

    public readFromWorkspace() {
        console.log("Reading with token :", process.env.GITHUB_TOKEN, " from workspace : ", process.env.GITHUB_WORKSPACE);
    }

}