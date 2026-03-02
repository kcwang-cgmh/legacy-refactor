import * as vscode from 'vscode';
import * as path from 'path';

export class ThinkingLogger {
  private step = 0;
  private startTime: number;

  constructor(
    private stream: vscode.ChatResponseStream,
    private commandLabel: string,
  ) {
    this.startTime = Date.now();
  }

  phase(progressText: string, markdownDetail?: string): void {
    this.step++;
    this.stream.progress(progressText);
    if (markdownDetail) {
      this.stream.markdown(`**Step ${this.step}** — ${markdownDetail}\n\n`);
    }
  }

  fileDiscovery(files: string[], projectDir: string): void {
    this.step++;
    const maxAnchors = 10;
    const shown = files.slice(0, maxAnchors);
    const remaining = files.length - shown.length;

    this.stream.markdown(
      `**Step ${this.step}** — 掃描到 **${files.length}** 個程式檔案\n\n`,
    );

    for (const file of shown) {
      const relativePath = path.relative(projectDir, file);
      const uri = vscode.Uri.file(file);
      this.stream.anchor(uri, relativePath);
      this.stream.markdown('  ');
    }

    if (remaining > 0) {
      this.stream.markdown(`...以及其他 ${remaining} 個檔案`);
    }

    this.stream.markdown('\n\n');
  }

  contextStats(stats: {
    fileCount?: number;
    totalChars?: number;
    truncated?: boolean;
  }): void {
    const parts: string[] = [];
    if (stats.fileCount !== undefined) {
      parts.push(`${stats.fileCount} 個檔案`);
    }
    if (stats.totalChars !== undefined) {
      const kb = (stats.totalChars / 1024).toFixed(1);
      parts.push(`${kb}K 字元`);
    }
    if (stats.truncated) {
      parts.push('⚠ 已截斷');
    }
    if (parts.length > 0) {
      this.stream.markdown(`> Context: ${parts.join(' | ')}\n\n`);
    }
  }

  modelInfo(modelName: string): void {
    this.step++;
    this.stream.markdown(
      `**Step ${this.step}** — 送出 AI 分析請求\n\n> Model: **${modelName}**\n\n`,
    );
  }

  streamingStart(): void {
    this.step++;
    this.stream.markdown(
      `**Step ${this.step}** — AI 正在產出回應...\n\n---\n\n`,
    );
  }

  complete(extraInfo?: string): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    let msg = `\n\n---\n\n> ${this.commandLabel}完成，耗時 ${elapsed} 秒`;
    if (extraInfo) {
      msg += ` | ${extraInfo}`;
    }
    msg += '\n\n';
    this.stream.markdown(msg);
  }
}
