import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
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

    vscode.commands.registerCommand('legacyRefactor.startInAgentMode', async (projectName: string) => {
      const docsDir = path.join(workspaceRoot, 'docs', projectName);
      const promptPath = path.join(docsDir, '.migration-prompt.md');
      const progressPath = path.join(docsDir, '.migration-progress.json');

      // 初始化進度檔（如果不存在）
      if (!fsSync.existsSync(progressPath)) {
        fsSync.mkdirSync(docsDir, { recursive: true });
        const initialProgress = {
          projectName,
          startedAt: new Date().toISOString(),
          currentPhase: 'Phase 1',
          features: [],
        };
        fsSync.writeFileSync(progressPath, JSON.stringify(initialProgress, null, 2), 'utf-8');
      }

      // 建構簡短 query，引導 Agent 讀取完整 prompt 檔案
      const promptRelPath = `docs/${projectName}/.migration-prompt.md`;
      const query = `請閱讀工作區中的 ${promptRelPath} 檔案，然後按照裡面的指示執行遷移任務。直接開始執行，不需要再詢問確認。`;

      // 開啟新 chat → 切換至 Agent mode → 注入 query
      await vscode.commands.executeCommand('workbench.action.chat.newChat');

      // 嘗試以 mode 參數開啟 agent mode
      // 若 VS Code 版本不支援 mode 參數，fallback 到 URI scheme
      try {
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query,
          mode: 'agent',
        });
      } catch {
        // Fallback: 透過 URI scheme 開啟 agent mode
        await vscode.env.openExternal(
          vscode.Uri.parse('vscode://GitHub.Copilot-Chat/chat?mode=agent'),
        );
        // 延遲注入 query
        setTimeout(() => {
          vscode.commands.executeCommand('workbench.action.chat.open', {
            query,
            isPartialQuery: false,
          });
        }, 1000);
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
