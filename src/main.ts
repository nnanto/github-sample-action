import * as core from '@actions/core';
import { SchemaProcessor } from './schema-processor';
import { GitHub, context } from '@actions/github';

async function run() {
    try {
        var token = core.getInput('token');
        var schemaProcessor = new SchemaProcessor(token);
        await schemaProcessor.process();

    } catch (error) {
        core.setFailed(error.message);
    }
}
run();