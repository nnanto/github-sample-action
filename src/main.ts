import * as core from '@actions/core';
import { ConfigReader } from './config-reader';
import { GitHub, context} from '@actions/github';

async function run() {
  try {
    var configReader = new ConfigReader();
    configReader.readFromWorkspace();

  } catch (error) {
    core.setFailed(error.message);
  }
}
run();