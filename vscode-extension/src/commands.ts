import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectTreeProvider } from './treeDataProvider';

const SLASH_COMMANDS: Record<string, string> = {
  analyze: '@legacy-refactor /analyze',
  plan: '@legacy-refactor /plan',
  start: '@legacy-refactor /start',
};

const REPORT_FILES: Record<string, string> = {
  analyze: 'analysis-report.md',
  plan: 'migration-plan.md',
};

function runCopilotCommand(projectName: string, step: string, workspaceRoot: string): void {
  const slashCommand = SLASH_COMMANDS[step];
  if (!slashCommand) { return; }

  const message = `${slashCommand} ${projectName}`.trim();

  // Watch for report file creation (analyze and plan only)
  const reportFile = REPORT_FILES[step];
  if (reportFile) {
    const pattern = new vscode.RelativePattern(
      workspaceRoot,
      `docs/${projectName}/${reportFile}`,
    );
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    const openPreview = (uri: vscode.Uri) => {
      vscode.commands.executeCommand('markdown.showPreview', uri);
      watcher.dispose();
    };

    watcher.onDidCreate(openPreview);
    watcher.onDidChange(openPreview);
  }

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
      runCopilotCommand(projectName, 'analyze', workspaceRoot);
    }),

    vscode.commands.registerCommand('legacyRefactor.plan', (projectName: string) => {
      runCopilotCommand(projectName, 'plan', workspaceRoot);
    }),

    vscode.commands.registerCommand('legacyRefactor.start', (projectName: string) => {
      runCopilotCommand(projectName, 'start', workspaceRoot);
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
