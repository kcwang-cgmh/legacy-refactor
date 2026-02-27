import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { buildProjectContext } from '../contextBuilder';
import { selectModel, OPUS_CANDIDATES } from './modelSelector';

const SYSTEM_PROMPT = `你是一位 legacy code 分析專家。你的任務是分析舊的 .NET 專案程式碼，並產出一份完整的繁體中文 Markdown 分析報告。

報告應包含：
1. 專案概覽（技術棧、框架版本、專案結構）
2. 程式碼品質評估
3. 相依性分析（NuGet 套件、外部服務）
4. 資料庫存取模式（ADO.NET、Entity Framework、Stored Procedure 等）
5. 潛在風險與技術債
6. 遷移複雜度評估

請使用繁體中文撰寫，使用台灣慣用的技術用語。`;

export async function handleAnalyze(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  workspaceRoot: string,
): Promise<void> {
  const projectName = request.prompt.trim();
  if (!projectName) {
    stream.markdown('請提供專案名稱，例如：`/analyze MyProject`');
    return;
  }

  const projectDir = path.join(workspaceRoot, 'legacy-codes', projectName);
  if (!fs.existsSync(projectDir)) {
    stream.markdown(`找不到專案 \`${projectName}\`，請確認 \`legacy-codes/${projectName}/\` 目錄存在。`);
    return;
  }

  stream.progress('正在讀取專案檔案...');

  const model = await selectModel(OPUS_CANDIDATES, request.model);
  const maxChars = (model.maxInputTokens ?? 100000) * 3;
  const projectContext = await buildProjectContext(workspaceRoot, projectName, maxChars);

  if (!projectContext) {
    stream.markdown(`專案 \`${projectName}\` 中沒有找到可分析的程式碼檔案。`);
    return;
  }

  stream.progress(`正在使用 ${model.name} 分析中...`);

  const messages = [
    vscode.LanguageModelChatMessage.User(
      `${SYSTEM_PROMPT}\n\n---\n\n以下是專案 "${projectName}" 的原始碼：\n\n${projectContext}`,
    ),
  ];

  const response = await model.sendRequest(messages, {}, token);

  const chunks: string[] = [];
  for await (const fragment of response.text) {
    chunks.push(fragment);
  }

  // Write report to docs
  const docsDir = path.join(workspaceRoot, 'docs', projectName);
  fs.mkdirSync(docsDir, { recursive: true });
  const reportPath = path.join(docsDir, 'analysis-report.md');
  fs.writeFileSync(reportPath, chunks.join(''), 'utf-8');

  stream.markdown(`分析完成！報告已寫入 \`docs/${projectName}/analysis-report.md\`\n`);

  stream.button({
    command: 'legacyRefactor.preview',
    title: '開啟報告預覽',
    arguments: [reportPath],
  });
}
