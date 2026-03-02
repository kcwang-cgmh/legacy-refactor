import * as vscode from 'vscode';
import { execFile } from 'child_process';

export type CheckStatus = 'checking' | 'installed' | 'missing';

export interface PrerequisiteResult {
  id: string;
  label: string;
  status: CheckStatus;
  version?: string;
  fixUrl: string;
  fixLabel: string;
}

let cache: PrerequisiteResult[] | undefined;

export function clearCache(): void {
  cache = undefined;
}

export async function runAllChecks(): Promise<PrerequisiteResult[]> {
  if (cache) { return cache; }
  const results = await Promise.all([checkCopilot(), checkNodeJs(), checkDotnet()]);
  cache = results;
  return results;
}

async function checkCopilot(): Promise<PrerequisiteResult> {
  const base = { id: 'copilot', label: 'GitHub Copilot', fixUrl: 'vscode:extension/GitHub.copilot', fixLabel: '安裝 GitHub Copilot' };
  try {
    const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
    if (models.length > 0) {
      return { ...base, status: 'installed', version: models[0].family };
    }
  } catch { /* not available */ }
  return { ...base, status: 'missing' };
}

async function checkNodeJs(): Promise<PrerequisiteResult> {
  const base = { id: 'node', label: 'Node.js', fixUrl: 'https://nodejs.org/en/download', fixLabel: '下載 Node.js' };
  try {
    const version = await execCommand('node', ['--version']);
    return { ...base, status: 'installed', version: version.trim() };
  } catch {
    return { ...base, status: 'missing' };
  }
}

async function checkDotnet(): Promise<PrerequisiteResult> {
  const base = { id: 'dotnet', label: '.NET SDK', fixUrl: 'https://dotnet.microsoft.com/download', fixLabel: '下載 .NET SDK' };
  try {
    const version = await execCommand('dotnet', ['--version']);
    return { ...base, status: 'installed', version: version.trim() };
  } catch {
    return { ...base, status: 'missing' };
  }
}

function execCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: 10000, shell: true }, (error, stdout) => {
      if (error) { reject(error); } else { resolve(stdout); }
    });
  });
}
