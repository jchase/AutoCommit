/*
 * This code includes portions of code from the opencommit project, which is
 * licensed under the MIT License. Copyright (c) Dima Sukharev.
 * The original code can be found at https://github.com/di-sukharev/opencommit/blob/master/src/generateCommitMessageFromGitDiff.ts.
 */

import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

const initMessagesPrompt: Array<ChatCompletionRequestMessage> = [
  {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: `You are provided with a git diff from which to infer a git commit message. Compose a succinct commit message following this format: "<type>: <description>". The "type" represents the purpose of the commit and can be: 1. feat (a new feature or significant change), 2. fix (a bug fix), 3. docs (documentation changes), 4. style (code style changes), 5. refactor (code refactoring), 6. test (test modifications), 7. chore (routine tasks or maintenance). For the "description", infer and identify any and all distinct functional changes that were made, one line per concern affected. Whereever possible, try to infer the most likely purpose of the changes made and use that for the message. Include specific key details where possible and avoid being vague. Descriptions should be a brief, eight-word maximum summary of the changes, written in present tense. 
    
    If the diff is clearly a change in version numbers of any kind, you should include that in the message (e.g.: "chore: Bump version to 1.0.0"). A type of "refactor" should only be applied where it is clearly a code refactoring, otherwise, if the change has only to do with verbiage or copy, it should be categorized as a "chore". 

    The commit message should always try to answer the question "What does this changeset do"? The commit message that follows should be in the format of an implied "Answer: It", i.e. "It... (complete the phrasing with your commit message)". Here are some examples of good commit messages:

    'feat: Adds support for youtube video embedding'
    'fix: Fixes login bug regarding invalid email addresses'
    'docs: Updates README with new instructions'
    'style: Corrects indentation'
    'feat: Implements Bizzabo API'
    'refactor: Simplifies header display logic'
    'test: Adds tests for signup'

    Note specifically that instead of using the words "Add...", "Fix...", "Update...", "Correct...", "Implement...", etc, you should use the phrasing "Adds...", "Fixes...", "Updates...", "Corrects...", "Implements...", etc.

    A few minor exceptions to this rule would be in these instances:
    'chore: Bump version to 1.0.0'
    'chore: Typographic edits to header'
    'chore: Code tidy'

    Based on the 'git diff --staged' output I give you, translate it into a commit message. Your response should strictly be the commit message in English. Keep it easily comprehensible.`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `diff --git a/src/header.js b/src/header.js
index ad4db42..f3b18a9 100644
--- a/src/header.js
+++ b/src/header.js
@@ -10,7 +10,7 @@ import {
const app = express();
-const title = 'Old Title';
+const title = 'New Title';

diff --git a/src/signup.js b/src/signup.js
index ad4db42..f3b18a9 100644
--- a/src/signup.js
+++ b/src/signup.js
@@ -10,7 +10,7 @@ import {
-const signUp = 'Sign Up';
+const register = 'Register';
`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `chore: Typographic updates to header
    chore: Typographic updates to Register button`,
  },
];

export const generateCommitMessageChatCompletionPrompt = (
  diff: string
): Array<ChatCompletionRequestMessage> => {
  const chatContextAsCompletionRequest = [...initMessagesPrompt];

  chatContextAsCompletionRequest.push({
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `${diff}`,
  });

  return chatContextAsCompletionRequest;
};
