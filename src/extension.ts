import * as vscode from "vscode";

import generateAICommitMessage from "./autocommit";

async function getGitApi() {
  const gitEntension = vscode.extensions.getExtension("vscode.git");

  if (!gitEntension) {
    return;
  }

  if (!gitEntension.isActive) {
    await gitEntension.activate();
  }

  const gitApi = gitEntension.exports?.getAPI(1);

  return gitApi;
}

function getOpenAiApiKey() {
  const configuration = vscode.workspace.getConfiguration("autocommit");
  const apiKey = configuration.get<string>("openAI.apiKey");
  return apiKey;
}

async function setOpenAiApiKey(apiKey: string) {
  const configuration = vscode.workspace.getConfiguration("autocommit");
  await configuration.update(
    "openAI.apiKey",
    apiKey,
    vscode.ConfigurationTarget.Global
  );
}

function getDelimeter() {
  const configuration = vscode.workspace.getConfiguration("autocommit");
  const delimeter = configuration.get<string>("appearance.delimeter");
  if (delimeter?.trim() === "") {
    return;
  }
  return delimeter;
}

function getOpenAiModel() {
  const configuration = vscode.workspace.getConfiguration("autocommit");
  const model = configuration.get<string>("openAI.model") ?? "gpt-4o";
  return model;
}

async function setRepositoryCommitMessage(commitMessage: string) {
  const gitApi = await getGitApi();
  const respository = gitApi?.repositories[0];

  if (!respository) {
    return;
  }

  respository.inputBox.value = commitMessage;
}

async function generateAICommitCommand() {
  let apiKey = getOpenAiApiKey();

  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: "Please enter your OpenAi API Key",
      title: "OpenAi API Key",
      placeHolder: "OpenAi API Key",
    });

    if (!apiKey || apiKey.trim() === "") {
      vscode.window.showErrorMessage(
        "You should set OpenAi API Key before extension using!"
      );
      return;
    }

    await setOpenAiApiKey(apiKey);
  }

  const delimeter = getDelimeter();
  const model = getOpenAiModel();
  const commitMessage = await generateAICommitMessage(apiKey, model, delimeter);

  if (!commitMessage) {
    return;
  }

  await setRepositoryCommitMessage(commitMessage);
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "autocommit.generateAICommit",
    generateAICommitCommand
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
