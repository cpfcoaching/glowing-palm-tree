export type BurnRow = {
  date: string;
  // EXACT lane
  codex_tokens: number;
  claude_code_tokens: number;
  claude_code_calls: number;
  api_tokens: number; // OpenRouter, etc.
  antigravity_tokens: number; // Antigravity IDE/SDK usage
  
  // ACTIVITY lane
  chatgpt_conversations: number;
  chatgpt_messages: number;
  chatgpt_files: number;
  claude_chat_conversations: number;
  claude_chat_messages: number;
  vscode_chat_conversations: number;
  vscode_chat_messages: number;

  // ESTIMATE lane
  chat_tokens_low: number;
  chat_tokens_high: number;
  confidence: "measured" | "floor" | "rough";

  // Meta
  driver: string;
  evidence: string;

  // Computed fields
  exact_total: number;
};

export function normalizeRows(rows: any[]): BurnRow[] {
  return rows
    .map((row) => {
      const codex = asNumber(row.codex_tokens);
      const claudeCode = asNumber(row.claude_code_tokens);
      const api = asNumber(row.api_tokens);
      const antigravity = asNumber(row.antigravity_tokens);
      const exact_total = codex + claudeCode + api + antigravity;

      return {
        date: row.date || "",
        codex_tokens: codex,
        claude_code_tokens: claudeCode,
        claude_code_calls: asNumber(row.claude_code_calls),
        api_tokens: api,
        antigravity_tokens: antigravity,
        chatgpt_conversations: asNumber(row.chatgpt_conversations),
        chatgpt_messages: asNumber(row.chatgpt_messages),
        chatgpt_files: asNumber(row.chatgpt_files),
        claude_chat_conversations: asNumber(row.claude_chat_conversations),
        claude_chat_messages: asNumber(row.claude_chat_messages),
        vscode_chat_conversations: asNumber(row.vscode_chat_conversations),
        vscode_chat_messages: asNumber(row.vscode_chat_messages),
        chat_tokens_low: asNumber(row.chat_tokens_low),
        chat_tokens_high: asNumber(row.chat_tokens_high),
        confidence: row.confidence || "rough",
        driver: row.driver || "unlabeled",
        evidence: row.evidence || "",
        exact_total,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function asNumber(value: any) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}
