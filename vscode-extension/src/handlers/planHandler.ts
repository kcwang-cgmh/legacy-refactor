import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { readReport } from '../contextBuilder';
import { selectModel, QUALITY_MODEL_CANDIDATES } from './modelSelector';

const SYSTEM_PROMPT = `你是一位 .NET 現代化遷移專家。你的任務是根據分析報告，產出一份完整的繁體中文 Markdown 遷移計畫。

遷移計畫應包含：
1. 目標架構（.NET 8 Web API + 前端框架建議）
2. 遷移階段規劃（Phase 1, 2, 3...）
3. 每個階段的具體任務與預估工作量
4. API 端點設計
5. 資料庫遷移策略（Dapper + Oracle）
6. 測試策略
7. 風險緩解措施

請使用繁體中文撰寫，使用台灣慣用的技術用語。`;

export async function handlePlan(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  workspaceRoot: string,
): Promise<void> {
  const projectName = request.prompt.trim();
  if (!projectName) {
    stream.markdown('請提供專案名稱，例如：`/plan MyProject`');
    return;
  }

  const analysisReport = readReport(workspaceRoot, projectName, 'analysis-report.md');
  if (!analysisReport) {
    stream.markdown(`找不到 \`${projectName}\` 的分析報告。請先執行 \`/analyze ${projectName}\`。`);
    return;
  }

  const model = await selectModel(QUALITY_MODEL_CANDIDATES, request.model);

  stream.progress(`正在使用 ${model.name} 產出遷移計畫...`);

  const messages = [
    vscode.LanguageModelChatMessage.User(
      `${SYSTEM_PROMPT}\n\n---\n\n以下是專案 "${projectName}" 的分析報告：\n\n${analysisReport}`,
    ),
  ];

  const response = await model.sendRequest(messages, {}, token);

  const chunks: string[] = [];
  for await (const fragment of response.text) {
    chunks.push(fragment);
  }

  const docsDir = path.join(workspaceRoot, 'docs', projectName);
  fs.mkdirSync(docsDir, { recursive: true });
  const reportPath = path.join(docsDir, 'migration-plan.md');
  fs.writeFileSync(reportPath, chunks.join(''), 'utf-8');

  stream.markdown(`遷移計畫產出完成！已寫入 \`docs/${projectName}/migration-plan.md\`\n`);

  stream.button({
    command: 'legacyRefactor.preview',
    title: '開啟計畫預覽',
    arguments: [reportPath],
  });
}
