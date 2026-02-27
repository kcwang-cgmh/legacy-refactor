import * as vscode from 'vscode';
import { PrerequisiteResult } from './environmentChecker';

export class PrerequisiteTreeProvider implements vscode.TreeDataProvider<PrerequisiteResult> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PrerequisiteResult | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private results: PrerequisiteResult[] = [];

  setResults(results: PrerequisiteResult[]): void {
    this.results = results;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: PrerequisiteResult): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);

    switch (element.status) {
      case 'checking':
        item.iconPath = new vscode.ThemeIcon('loading~spin');
        item.description = '檢查中…';
        break;
      case 'installed':
        item.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
        item.description = element.version ?? '已安裝';
        break;
      case 'missing':
        item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.yellow'));
        item.description = '未安裝';
        item.command = {
          command: 'legacyRefactor.openFixUrl',
          title: element.fixLabel,
          arguments: [element],
        };
        item.tooltip = `點擊${element.fixLabel}`;
        break;
    }

    return item;
  }

  getChildren(): PrerequisiteResult[] {
    return this.results;
  }
}
