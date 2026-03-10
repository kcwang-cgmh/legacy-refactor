import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { readReport } from '../contextBuilder';
import { parseMigrationPlan, buildAgentPrompt } from '../helpers/promptBuilder';
import { ThinkingLogger } from '../helpers/thinkingLogger';

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

  const logger = new ThinkingLogger(stream, '遷移準備');

  // Step 1: 讀取遷移計畫
  logger.phase('正在讀取遷移計畫...', '載入遷移計畫');

  const migrationPlan = readReport(workspaceRoot, projectName, 'migration-plan.md');
  if (!migrationPlan) {
    stream.markdown(`找不到 \`${projectName}\` 的遷移計畫。請先執行 \`/plan ${projectName}\`。`);
    return;
  }

  // Step 2: 解析 phases
  logger.phase('正在解析遷移階段...', '解析遷移計畫');

  const phases = parseMigrationPlan(migrationPlan);

  // Step 3: 讀取進度
  const docsDir = path.join(workspaceRoot, 'docs', projectName);
  const progressPath = path.join(docsDir, '.migration-progress.json');
  let progressJson: string | undefined;
  let currentPhaseIndex = 0;

  if (fs.existsSync(progressPath)) {
    try {
      progressJson = fs.readFileSync(progressPath, 'utf-8');
      const progress = JSON.parse(progressJson);
      // 從 currentPhase 欄位推算 index（例如 "Phase 2" → index 1）
      if (progress.currentPhase) {
        const phaseNum = progress.currentPhase.match(/\d+/);
        if (phaseNum) {
          currentPhaseIndex = Math.max(0, parseInt(phaseNum[0], 10) - 1);
        }
      }
      logger.phase('偵測到既有進度紀錄', '載入遷移進度');
    } catch { /* ignore */ }
  }

  // Step 4: 建構 prompt
  const userPrompt = request.prompt.replace(projectName, '').trim();
  const prompt = buildAgentPrompt(
    projectName,
    phases,
    currentPhaseIndex,
    progressJson,
    userPrompt || undefined,
  );

  // Step 5: 將 prompt 寫入檔案（避免 chat input 字元限制）
  fs.mkdirSync(docsDir, { recursive: true });
  const promptPath = path.join(docsDir, '.migration-prompt.md');
  fs.writeFileSync(promptPath, prompt, 'utf-8');

  // Step 6: 輸出摘要
  if (phases.length > 0) {
    stream.markdown('### 遷移計畫摘要\n\n');
    for (let i = 0; i < phases.length; i++) {
      const marker = i === currentPhaseIndex ? '➡️' : (i < currentPhaseIndex ? '✅' : '⬜');
      stream.markdown(`${marker} **${phases[i].name}**\n\n`);
    }

    const currentPhase = phases[currentPhaseIndex];
    if (currentPhase) {
      stream.markdown(`\n---\n\n即將執行：**${currentPhase.name}**\n\n`);
    }
  } else {
    stream.markdown('已讀取遷移計畫，準備在 Agent Mode 中執行。\n\n');
  }

  stream.markdown(`> Prompt 已寫入 \`docs/${projectName}/.migration-prompt.md\`\n\n`);

  // Step 7: 提供按鈕觸發 Agent mode
  stream.button({
    command: 'legacyRefactor.startInAgentMode',
    title: '🚀 在 Agent Mode 中開始遷移',
    arguments: [projectName],
  });

  logger.complete();
}
