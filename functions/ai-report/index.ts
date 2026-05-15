const MEOO_AI_BASE_URL = 'https://api.meoo.host';
const MEOO_PROJECT_SERVICE_AK = Deno.env.get('MEOO_PROJECT_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const stockData = body.stockData || {};
    const userQuestion = body.userQuestion || '';
    const model = body.model || 'qwen3.6-plus';

    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = `你是一位专业的价值投资分析师，擅长基于企业基本面进行深度研究分析。
请根据提供的股票数据，生成一份专业的投资研究报告。
报告日期：${today}

报告应该包含以下维度（根据数据可用性灵活调整）：
1. 公司概况与业务分析
2. 财务健康状况评估
3. 估值分析与内在价值判断
4. 竞争优势与护城河分析
5. 成长性与行业前景
6. 风险因素识别
7. 投资建议与结论

请用专业、客观的语言撰写，数据驱动，逻辑清晰。如果某些数据缺失，请合理推断或说明。`;

    const userPrompt = `用户问题：${userQuestion}

股票数据：
${JSON.stringify(stockData, null, 2)}

请生成一份详细的投资分析报告。`;

    const response = await fetch(
      `${MEOO_AI_BASE_URL}/meoo-ai/compatible-mode/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MEOO_PROJECT_SERVICE_AK}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(errorBody, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reader = response.body!.getReader();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
