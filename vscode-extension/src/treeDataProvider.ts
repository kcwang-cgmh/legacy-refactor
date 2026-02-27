import * as vscode from 'vscode';
import * as path from 'path';
import { scanProjects, ProjectInfo } from './projectScanner';
import { checkProjectStatus, getReportPath, StepStatus, MigrationProgress } from './statusChecker';

type TreeNode = ProjectNode | StepNode | ProgressNode;

interface ProjectNode {
  type: 'project';
  project: ProjectInfo;
}

interface StepNode {
  type: 'step';
  projectName: string;
  step: 'analyze' | 'plan' | 'start';
  status: StepStatus;
  label: string;
}

interface ProgressNode {
  type: 'progress';
  label: string;
  status: string;
}

const STEP_CONFIG = {
  analyze: { label: '分析', command: 'legacyRefactor.analyze' },
  plan: { label: '規劃', command: 'legacyRefactor.plan' },
  start: { label: '執行', command: 'legacyRefactor.start' },
} as const;

const STATUS_ICONS: Record<StepStatus, vscode.ThemeIcon> = {
  pending: new vscode.ThemeIcon('circle-outline'),
  done: new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed')),
  'in-progress': new vscode.ThemeIcon('loading~spin', new vscode.ThemeColor('charts.yellow')),
};

export class ProjectTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private watcher: vscode.FileSystemWatcher;

  constructor(private workspaceRoot: string) {
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, 'docs/**/*')
    );
    this.watcher.onDidCreate(() => this.refresh());
    this.watcher.onDidDelete(() => this.refresh());
    this.watcher.onDidChange(() => this.refresh());
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  dispose(): void {
    this.watcher.dispose();
    this._onDidChangeTreeData.dispose();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    switch (element.type) {
      case 'project':
        return this.createProjectItem(element);
      case 'step':
        return this.createStepItem(element);
      case 'progress':
        return this.createProgressItem(element);
    }
  }

  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    if (!element) {
      const projects = await scanProjects(this.workspaceRoot);
      return projects.map(p => ({ type: 'project' as const, project: p }));
    }

    if (element.type === 'project') {
      const status = checkProjectStatus(this.workspaceRoot, element.project.name);
      const steps: StepNode[] = (['analyze', 'plan', 'start'] as const).map(step => ({
        type: 'step' as const,
        projectName: element.project.name,
        step,
        status: status[step],
        label: STEP_CONFIG[step].label,
      }));

      // If start is in-progress, add progress children later via getChildren on that node
      return steps;
    }

    if (element.type === 'step' && element.step === 'start' && element.status === 'in-progress') {
      const status = checkProjectStatus(this.workspaceRoot, element.projectName);
      const progress = status.progress;
      if (!progress) { return []; }

      const nodes: ProgressNode[] = [];
      if (progress.currentPhase) {
        nodes.push({ type: 'progress', label: `Phase: ${progress.currentPhase}`, status: '' });
      }
      if (progress.features) {
        for (const f of progress.features) {
          nodes.push({ type: 'progress', label: f.name, status: f.status });
        }
      }
      return nodes;
    }

    return [];
  }

  private createProjectItem(node: ProjectNode): vscode.TreeItem {
    const item = new vscode.TreeItem(node.project.name, vscode.TreeItemCollapsibleState.Expanded);
    item.contextValue = 'project';
    item.iconPath = new vscode.ThemeIcon('folder');
    return item;
  }

  private createStepItem(node: StepNode): vscode.TreeItem {
    const hasChildren = node.step === 'start' && node.status === 'in-progress';
    const collapsible = hasChildren
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.None;

    const item = new vscode.TreeItem(node.label, collapsible);
    item.iconPath = STATUS_ICONS[node.status];
    item.contextValue = `step-${node.status}`;

    if (node.status === 'pending') {
      item.command = {
        command: STEP_CONFIG[node.step].command,
        title: node.label,
        arguments: [node.projectName],
      };
      item.tooltip = `點擊執行「${node.label}」`;
    } else if (node.status === 'done' && (node.step === 'analyze' || node.step === 'plan')) {
      const reportPath = getReportPath(this.workspaceRoot, node.projectName, node.step);
      if (reportPath) {
        item.command = {
          command: 'legacyRefactor.preview',
          title: '檢視報告',
          arguments: [reportPath],
        };
        item.tooltip = '點擊檢視報告';
      }
    }

    return item;
  }

  private createProgressItem(node: ProgressNode): vscode.TreeItem {
    const label = node.status ? `${node.label} — ${node.status}` : node.label;
    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('info');
    return item;
  }
}
