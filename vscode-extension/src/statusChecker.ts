import * as path from 'path';
import * as fs from 'fs';

export type StepStatus = 'pending' | 'done' | 'in-progress';

export interface MigrationProgress {
  currentPhase?: string;
  features?: Array<{ name: string; status: string }>;
}

export interface ProjectStatus {
  analyze: StepStatus;
  plan: StepStatus;
  start: StepStatus;
  progress?: MigrationProgress;
}

export function checkProjectStatus(workspaceRoot: string, projectName: string): ProjectStatus {
  const docsDir = path.join(workspaceRoot, 'docs', projectName);

  const analysisExists = fs.existsSync(path.join(docsDir, 'analysis-report.md'));
  const planExists = fs.existsSync(path.join(docsDir, 'migration-plan.md'));
  const progressPath = path.join(docsDir, '.migration-progress.json');
  const progressExists = fs.existsSync(progressPath);

  let progress: MigrationProgress | undefined;
  if (progressExists) {
    try {
      progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    } catch {
      // ignore malformed JSON
    }
  }

  return {
    analyze: analysisExists ? 'done' : 'pending',
    plan: planExists ? 'done' : 'pending',
    start: progressExists ? 'in-progress' : 'pending',
    progress,
  };
}

export function getReportPath(workspaceRoot: string, projectName: string, step: 'analyze' | 'plan'): string | undefined {
  const filename = step === 'analyze' ? 'analysis-report.md' : 'migration-plan.md';
  const filePath = path.join(workspaceRoot, 'docs', projectName, filename);
  return fs.existsSync(filePath) ? filePath : undefined;
}
