import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ProjectTreeProvider } from './treeDataProvider';
import { PrerequisiteTreeProvider } from './prerequisiteTreeProvider';
import { runAllChecks, clearCache, PrerequisiteResult } from './environmentChecker';

const SLASH_COMMANDS: Record<string, string> = {
  analyze: '@legacy-refactor /analyze',
  plan: '@legacy-refactor /plan',
  start: '@legacy-refactor /start',
};

const REPORT_FILES: Record<string, string> = {
  analyze: 'analysis-report.md',
  plan: 'migration-plan.md',
};

async function runCopilotCommand(projectName: string, step: string, workspaceRoot: string): Promise<void> {
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

  // Open a new chat session, then send the query directly
  await vscode.commands.executeCommand('workbench.action.chat.newChat');
  vscode.commands.executeCommand('workbench.action.chat.open', { query: message });
}

export function registerCommands(
  context: vscode.ExtensionContext,
  treeProvider: ProjectTreeProvider,
  workspaceRoot: string,
  prerequisiteProvider?: PrerequisiteTreeProvider,
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

    vscode.commands.registerCommand('legacyRefactor.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'legacyRefactor');
    }),

    vscode.commands.registerCommand('legacyRefactor.checkPrerequisites', async () => {
      clearCache();
      if (prerequisiteProvider) {
        const results = await runAllChecks();
        prerequisiteProvider.setResults(results);
      }
    }),

    vscode.commands.registerCommand('legacyRefactor.openFixUrl', (item: PrerequisiteResult) => {
      if (item.fixUrl.startsWith('vscode:')) {
        vscode.commands.executeCommand('workbench.extensions.installExtension', 'GitHub.copilot');
      } else {
        vscode.env.openExternal(vscode.Uri.parse(item.fixUrl));
      }
    }),

    vscode.commands.registerCommand('legacyRefactor.importProject', async () => {
      const result = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: '選擇要匯入的專案資料夾',
      });
      if (!result || result.length === 0) { return; }

      const sourceDir = result[0].fsPath;
      const folderName = path.basename(sourceDir);
      const legacyCodesDir = path.join(workspaceRoot, 'legacy-codes');
      const targetDir = path.join(legacyCodesDir, folderName);

      try {
        await fs.mkdir(legacyCodesDir, { recursive: true });
        await fs.cp(sourceDir, targetDir, { recursive: true });
        treeProvider.refresh();
        vscode.window.showInformationMessage(`已匯入專案「${folderName}」`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`匯入失敗：${message}`);
      }
    }),
  );
}
