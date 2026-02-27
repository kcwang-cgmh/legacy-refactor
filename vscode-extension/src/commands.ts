import * as vscode from 'vscode';
import { ProjectTreeProvider } from './treeDataProvider';

const SLASH_COMMANDS: Record<string, string> = {
  analyze: '/analyze-legacy',
  plan: '/plan-refactor',
  start: '/start-refactor',
};

function runCopilotCommand(projectName: string, step: string): void {
  const slashCommand = SLASH_COMMANDS[step];
  if (!slashCommand) { return; }

  const message = `${slashCommand} ${projectName}`;

  // Open Copilot Chat and pre-fill with the slash command
  vscode.commands.executeCommand('workbench.action.chat.open', { query: message });
}

export function registerCommands(
  context: vscode.ExtensionContext,
  treeProvider: ProjectTreeProvider,
  workspaceRoot: string,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('legacyRefactor.analyze', (projectName: string) => {
      runCopilotCommand(projectName, 'analyze');
    }),

    vscode.commands.registerCommand('legacyRefactor.plan', (projectName: string) => {
      runCopilotCommand(projectName, 'plan');
    }),

    vscode.commands.registerCommand('legacyRefactor.start', (projectName: string) => {
      runCopilotCommand(projectName, 'start');
    }),

    vscode.commands.registerCommand('legacyRefactor.preview', (filePath: string) => {
      const uri = vscode.Uri.file(filePath);
      vscode.commands.executeCommand('markdown.showPreview', uri);
    }),

    vscode.commands.registerCommand('legacyRefactor.refresh', () => {
      treeProvider.refresh();
    }),
  );
}
