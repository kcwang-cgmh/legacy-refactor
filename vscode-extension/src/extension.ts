import * as vscode from 'vscode';
import { ProjectTreeProvider } from './treeDataProvider';
import { PrerequisiteTreeProvider } from './prerequisiteTreeProvider';
import { registerCommands } from './commands';
import { registerChatParticipant } from './chatParticipant';
import { runAllChecks } from './environmentChecker';

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return;
  }

  const prerequisiteProvider = new PrerequisiteTreeProvider();
  const prerequisiteView = vscode.window.createTreeView('legacyRefactor.prerequisites', {
    treeDataProvider: prerequisiteProvider,
  });

  const treeProvider = new ProjectTreeProvider(workspaceRoot);
  const treeView = vscode.window.createTreeView('legacyRefactor.projects', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  registerCommands(context, treeProvider, workspaceRoot, prerequisiteProvider);
  registerChatParticipant(context, workspaceRoot);

  context.subscriptions.push(prerequisiteView, treeView);

  // Run environment checks asynchronously after activation
  runAllChecks().then(results => {
    prerequisiteProvider.setResults(results);

    const copilot = results.find(r => r.id === 'copilot');
    if (copilot && copilot.status === 'missing') {
      vscode.window.showWarningMessage(
        'Legacy Refactor Helper 需要 GitHub Copilot 才能正常運作。',
        '安裝 GitHub Copilot',
      ).then(choice => {
        if (choice) {
          vscode.commands.executeCommand('workbench.extensions.installExtension', 'GitHub.copilot');
        }
      });
    }
  });
}

export function deactivate() {}
