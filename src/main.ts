import * as core from '@actions/core';
import { ConfigReader } from './config-reader';
import { GitHub, context } from '@actions/github';

async function run() {
    try {
        var token = core.getInput('token');
        var configReader = new ConfigReader(token);
        configReader.readFromWorkspace();

    } catch (error) {
        core.setFailed(error.message);
    }
}
run();