import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { readReport } from '../contextBuilder';
import { selectModel, getSpeedModelCandidates } from './modelSelector';

const SYSTEM_PROMPT = `你是一位 .NET 現代化遷移工程師。你的任務是根據遷移計畫，協助使用者執行遷移工作。

請根據遷移計畫和目前的進度，指導下一步具體的實作步驟。包含：
- 需要建立的檔案和程式碼
- 需要修改的設定
- 測試驗證步驟

請使用繁體中文撰寫，使用台灣慣用的技術用語。`;

export async function handleStart(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  workspaceRoot: string,
): Promise<void> {
  const projectName = request.prompt.trim();
  if (!projectName) {
    stream.markdown('請提供專案名稱，例如：`/start MyProject`');
    return;
  }

  const migrationPlan = readReport(workspaceRoot, projectName, 'migration-plan.md');
  if (!migrationPlan) {
    stream.markdown(`找不到 \`${projectName}\` 的遷移計畫。請先執行 \`/plan ${projectName}\`。`);
    return;
  }

  const model = await selectModel(getSpeedModelCandidates(), request.model);

  stream.progress(`正在使用 ${model.name} 準備遷移指引...`);

  // Read existing progress if available
  const docsDir = path.join(workspaceRoot, 'docs', projectName);
  const progressPath = path.join(docsDir, '.migration-progress.json');
  let progressContext = '';
  if (fs.existsSync(progressPath)) {
    try {
      const progress = fs.readFileSync(progressPath, 'utf-8');
      progressContext = `\n\n---\n\n目前遷移進度：\n\`\`\`json\n${progress}\n\`\`\``;
    } catch { /* ignore */ }
  }

  const userPrompt = request.prompt.replace(projectName, '').trim();
  const additionalInstruction = userPrompt ? `\n\n使用者補充指示：${userPrompt}` : '';

  const messages = [
    vscode.LanguageModelChatMessage.User(
      `${SYSTEM_PROMPT}\n\n---\n\n以下是專案 "${projectName}" 的遷移計畫：\n\n${migrationPlan}${progressContext}${additionalInstruction}`,
    ),
  ];

  const response = await model.sendRequest(messages, {}, token);

  const chunks: string[] = [];
  for await (const fragment of response.text) {
    stream.markdown(fragment);
    chunks.push(fragment);
  }

  // Initialize progress file if it doesn't exist
  if (!fs.existsSync(progressPath)) {
    fs.mkdirSync(docsDir, { recursive: true });
    const initialProgress = {
      projectName,
      startedAt: new Date().toISOString(),
      currentPhase: 'Phase 1',
      features: [],
    };
    fs.writeFileSync(progressPath, JSON.stringify(initialProgress, null, 2), 'utf-8');
  }
}
