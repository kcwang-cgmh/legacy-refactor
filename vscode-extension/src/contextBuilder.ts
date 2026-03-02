import * as path from 'path';
import * as fs from 'fs';

const LEGACY_EXTENSIONS = ['.cs', '.csproj', '.sln', '.config', '.aspx', '.cshtml'];

export interface ProjectContextResult {
  content: string;
  files: string[];
  includedFiles: string[];
  totalChars: number;
  truncated: boolean;
}

export async function buildProjectContext(
  workspaceRoot: string,
  projectName: string,
  maxChars: number,
): Promise<ProjectContextResult | null> {
  const projectDir = path.join(workspaceRoot, 'legacy-codes', projectName);
  if (!fs.existsSync(projectDir)) {
    return null;
  }

  const files = collectFiles(projectDir, LEGACY_EXTENSIONS);
  const parts: string[] = [];
  const includedFiles: string[] = [];
  let totalChars = 0;
  let truncated = false;

  for (const filePath of files) {
    const relativePath = path.relative(projectDir, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const entry = `### ${relativePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;

    if (totalChars + entry.length > maxChars) {
      parts.push(`\n<!-- truncated: token budget reached (${maxChars} chars) -->\n`);
      truncated = true;
      break;
    }

    parts.push(entry);
    includedFiles.push(filePath);
    totalChars += entry.length;
  }

  if (files.length === 0) {
    return null;
  }

  return {
    content: parts.join(''),
    files,
    includedFiles,
    totalChars,
    truncated,
  };
}

export function readReport(
  workspaceRoot: string,
  projectName: string,
  fileName: string,
): string | undefined {
  const filePath = path.join(workspaceRoot, 'docs', projectName, fileName);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'bin' || entry.name === 'obj') {
        continue;
      }
      results.push(...collectFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}
