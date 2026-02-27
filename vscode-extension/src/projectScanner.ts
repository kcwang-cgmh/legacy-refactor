import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface ProjectInfo {
  name: string;
  legacyPath: string;
}

export async function scanProjects(workspaceRoot: string): Promise<ProjectInfo[]> {
  const legacyCodesDir = path.join(workspaceRoot, 'legacy-codes');

  if (!fs.existsSync(legacyCodesDir)) {
    return [];
  }

  const entries = await fs.promises.readdir(legacyCodesDir, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      name: entry.name,
      legacyPath: path.join(legacyCodesDir, entry.name),
    }));
}
