import * as vscode from 'vscode';

export function getQualityModelCandidates(): string[] {
  const cfg = vscode.workspace.getConfiguration('legacyRefactor');
  const model = cfg.get<string>('qualityModel', 'claude-opus-4.6');
  return [model];
}

export function getSpeedModelCandidates(): string[] {
  const cfg = vscode.workspace.getConfiguration('legacyRefactor');
  const model = cfg.get<string>('speedModel', 'claude-sonnet-4.6');
  return [model];
}

export async function selectModel(
  preferredFamilies: string[],
  fallback: vscode.LanguageModelChat,
): Promise<vscode.LanguageModelChat> {
  for (const family of preferredFamilies) {
    try {
      const [model] = await vscode.lm.selectChatModels({
        vendor: 'copilot',
        family,
      });
      if (model) {
        return model;
      }
    } catch {
      // Not available, try next
    }
  }
  return fallback;
}
