import * as vscode from 'vscode';

// Candidates ordered by preference (newest first).
// The exact family strings may change as Copilot adds models —
// use `vscode.lm.selectChatModels({ vendor: 'copilot' })` to inspect at runtime.
// analyze / plan: 品質優先
export const OPUS_CANDIDATES = ['claude-opus-4.6'];

// start: 速度優先
export const SONNET_CANDIDATES = ['claude-sonnet-4.6'];

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
