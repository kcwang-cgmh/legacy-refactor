import * as vscode from 'vscode';
import { ProjectTreeProvider } from './treeDataProvider';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return;
  }

  const treeProvider = new ProjectTreeProvider(workspaceRoot);

  const treeView = vscode.window.createTreeView('legacyRefactor.projects', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  registerCommands(context, treeProvider, workspaceRoot);

  context.subscriptions.push(treeView);
}

export function deactivate() {}
