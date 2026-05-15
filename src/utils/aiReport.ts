import { getSupabaseUrl } from '../supabase/client';

export async function generateAIReport(
  stockData: any,
  userQuestion: string,
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch(`${getSupabaseUrl()}/functions/v1/ai-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stockData, userQuestion }),
  });

  if (!response.ok) throw new Error(`请求失败: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const payload = trimmed.slice(6);
      if (payload === '[DONE]') return fullText;

      try {
        const json = JSON.parse(payload);
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk(content);
        }
      } catch {}
    }
  }

  return fullText;
}
