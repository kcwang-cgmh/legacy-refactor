export interface Phase {
  name: string;
  content: string;
  index: number;
}

/**
 * 解析 migration-plan.md，依照 ## 標題拆分為 phase 陣列。
 * 支援常見格式：## Phase 1、## 階段一、## 第一階段 等。
 */
export function parseMigrationPlan(planContent: string): Phase[] {
  const lines = planContent.split('\n');
  const phases: Phase[] = [];
  let current: { name: string; startLine: number; lines: string[] } | null = null;

  const phaseHeadingPattern = /^##\s+(.*(phase|階段|步驟).*)/i;

  for (const line of lines) {
    const match = line.match(phaseHeadingPattern);
    if (match) {
      if (current) {
        phases.push({
          name: current.name,
          content: current.lines.join('\n').trim(),
          index: phases.length,
        });
      }
      current = { name: match[1].trim(), startLine: 0, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }

  if (current) {
    phases.push({
      name: current.name,
      content: current.lines.join('\n').trim(),
      index: phases.length,
    });
  }

  return phases;
}

/**
 * 建構送給 Copilot Agent mode 的完整 prompt。
 * 包含角色設定、計畫大綱、當前 phase 細節、操作指示。
 */
export function buildAgentPrompt(
  projectName: string,
  phases: Phase[],
  currentPhaseIndex: number,
  progressJson?: string,
  additionalInstruction?: string,
): string {
  const currentPhase = phases[currentPhaseIndex];
  if (!currentPhase) {
    return buildFallbackPrompt(projectName, phases, progressJson, additionalInstruction);
  }

  const outline = phases
    .map((p, i) => `${i === currentPhaseIndex ? '👉' : '  '} ${i + 1}. ${p.name}`)
    .join('\n');

  const parts: string[] = [
    `# 遷移任務：${projectName}`,
    '',
    '## 你的角色',
    '你是一位 .NET 現代化遷移工程師。請直接執行以下遷移任務，而非僅提供建議。',
    '你應該：建立檔案、撰寫程式碼、修改設定、執行終端指令（如 dotnet new、dotnet add package 等）。',
    '',
    '## 遷移計畫大綱',
    outline,
    '',
    `## 當前任務：${currentPhase.name}`,
    '',
    currentPhase.content,
  ];

  if (progressJson) {
    parts.push('', '## 目前進度', '```json', progressJson, '```');
  }

  if (additionalInstruction) {
    parts.push('', '## 使用者補充指示', additionalInstruction);
  }

  parts.push(
    '',
    '## 執行規範',
    '- 使用繁體中文撰寫註解與文件，使用台灣慣用的技術用語',
    '- 每完成一個步驟，更新 `docs/' + projectName + '/.migration-progress.json` 的進度',
    '- 建立檔案前先確認目錄結構',
    '- 撰寫對應的單元測試',
    '- 若遇到需要使用者決策的問題，請明確提出選項並等待回覆',
  );

  return parts.join('\n');
}

/**
 * 當無法解析出 phase 時，使用整份計畫作為 fallback prompt。
 */
function buildFallbackPrompt(
  projectName: string,
  phases: Phase[],
  progressJson?: string,
  additionalInstruction?: string,
): string {
  const parts: string[] = [
    `# 遷移任務：${projectName}`,
    '',
    '## 你的角色',
    '你是一位 .NET 現代化遷移工程師。請直接執行遷移任務，而非僅提供建議。',
    '你應該：建立檔案、撰寫程式碼、修改設定、執行終端指令。',
    '',
    '## 遷移計畫',
  ];

  if (phases.length > 0) {
    for (const phase of phases) {
      parts.push(`### ${phase.name}`, '', phase.content, '');
    }
  }

  if (progressJson) {
    parts.push('## 目前進度', '```json', progressJson, '```', '');
  }

  if (additionalInstruction) {
    parts.push('## 使用者補充指示', additionalInstruction, '');
  }

  parts.push(
    '## 執行規範',
    '- 使用繁體中文撰寫註解與文件，使用台灣慣用的技術用語',
    '- 每完成一個步驟，更新 `docs/' + projectName + '/.migration-progress.json` 的進度',
    '- 建立檔案前先確認目錄結構',
    '- 撰寫對應的單元測試',
  );

  return parts.join('\n');
}
