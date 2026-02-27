import * as vscode from 'vscode';
import { handleAnalyze } from './handlers/analyzeHandler';
import { handlePlan } from './handlers/planHandler';
import { handleStart } from './handlers/startHandler';

const PARTICIPANT_ID = 'legacy-refactor-team.legacy-refactor';

export function registerChatParticipant(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
): void {
  const handler: vscode.ChatRequestHandler = async (request, chatContext, stream, token) => {
    switch (request.command) {
      case 'analyze':
        await handleAnalyze(request, chatContext, stream, token, workspaceRoot);
        return { metadata: { command: 'analyze', project: request.prompt.trim() } };

      case 'plan':
        await handlePlan(request, chatContext, stream, token, workspaceRoot);
        return { metadata: { command: 'plan', project: request.prompt.trim() } };

      case 'start':
        await handleStart(request, chatContext, stream, token, workspaceRoot);
        return { metadata: { command: 'start', project: request.prompt.trim() } };

      default:
        stream.markdown(
          '歡迎使用 Legacy Refactor Helper！請使用以下指令：\n\n' +
          '- `/analyze <專案名稱>` — 分析舊專案，產出分析報告\n' +
          '- `/plan <專案名稱>` — 根據分析報告產出遷移計畫\n' +
          '- `/start <專案名稱>` — 執行遷移計畫\n',
        );
        return {};
    }
  };

  const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
  participant.iconPath = new vscode.ThemeIcon('wand');

  participant.followupProvider = {
    provideFollowups(result: vscode.ChatResult): vscode.ChatFollowup[] {
      const meta = result.metadata as { command?: string; project?: string } | undefined;
      if (!meta?.project) {
        return [];
      }

      switch (meta.command) {
        case 'analyze':
          return [{
            prompt: meta.project,
            command: 'plan',
            label: `產出 ${meta.project} 的遷移計畫`,
          }];
        case 'plan':
          return [{
            prompt: meta.project,
            command: 'start',
            label: `開始遷移 ${meta.project}`,
          }];
        default:
          return [];
      }
    },
  };

  context.subscriptions.push(participant);
}
