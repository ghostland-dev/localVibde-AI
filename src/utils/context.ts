/**
 * Utility for building code context
 */

import * as vscode from 'vscode';
import { CodeContext } from '../types';

export class ContextBuilder {
  static async buildContext(
    document: vscode.TextDocument,
    position: vscode.Position,
    maxLines: number = 1000
  ): Promise<CodeContext> {
    const text = document.getText();
    const lines = text.split('\n');
    const currentLine = position.line;

    // Calculate lines before and after
    const contextBefore = Math.min(maxLines / 2, currentLine);
    const contextAfter = Math.min(
      maxLines / 2,
      lines.length - currentLine - 1
    );

    const startLine = Math.max(0, currentLine - contextBefore);
    const endLine = Math.min(lines.length, currentLine + contextAfter + 1);

    const before = lines.slice(startLine, currentLine).join('\n');
    const after = lines.slice(currentLine + 1, endLine).join('\n');
    const currentLineText = lines[currentLine] || '';

    return {
      before: before + currentLineText.substring(0, position.character),
      after: currentLineText.substring(position.character) + '\n' + after,
      filePath: document.fileName,
      language: document.languageId,
    };
  }

  static buildPrompt(context: CodeContext, task: string = 'complete'): string {
    const language = context.language || 'code';
    
    switch (task) {
      case 'complete':
        return `You are a code assistant specialized in ${language}.
Here is the code context before the cursor:
\`\`\`${language}
${context.before}
\`\`\`

And after:
\`\`\`${language}
${context.after}
\`\`\`

Generate a natural continuation of the code. Respond only with the code to complete, without explanations.`;

      case 'explain':
        return `Explain this ${language} code:
\`\`\`${language}
${context.before}${context.after}
\`\`\``;

      case 'refactor':
        return `Refactor this ${language} code to improve readability and maintainability:
\`\`\`${language}
${context.before}${context.after}
\`\`\`

Respond only with the refactored code, without explanations.`;

      case 'optimize':
        return `Optimize this ${language} code to improve performance:
\`\`\`${language}
${context.before}${context.after}
\`\`\`

Respond only with the optimized code, without explanations.`;

      case 'review':
        return `Analyze this ${language} code and identify:
- Potential issues (bugs, errors)
- Possible improvements (readability, performance, security)
- Best practices not followed

Code:
\`\`\`${language}
${context.before}${context.after}
\`\`\``;

      case 'tests':
        return `Generate comprehensive unit tests for this ${language} code:
\`\`\`${language}
${context.before}${context.after}
\`\`\`

Respond only with the test code, without explanations.`;

      default:
        return `${context.before}${context.after}`;
    }
  }

  static truncateContext(context: CodeContext, maxChars: number): CodeContext {
    const totalLength = context.before.length + context.after.length;
    if (totalLength <= maxChars) {
      return context;
    }

    const ratio = maxChars / totalLength;
    const beforeMax = Math.floor(context.before.length * ratio);
    const afterMax = Math.floor(context.after.length * ratio);

    return {
      ...context,
      before: context.before.slice(-beforeMax),
      after: context.after.slice(0, afterMax),
    };
  }
}

