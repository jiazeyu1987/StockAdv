import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { stockCode } = await req.json();
    
    if (!stockCode) {
      return new Response(JSON.stringify({ error: '股票代码不能为空' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const s = stockCode.trim();
    let sinaCode = s;
    if (/^\d{6}$/.test(s)) {
      if (s.startsWith('6')) sinaCode = `sh${s}`;
      else if (s.startsWith('0') || s.startsWith('2') || s.startsWith('3')) sinaCode = `sz${s}`;
    } else if (/^\d{5}$/.test(s)) {
      sinaCode = `hk${s}`;
    }

    const url = `https://hq.sinajs.cn/list=${sinaCode}`;
    const response = await fetch(url, {
      headers: { 'Referer': 'https://finance.sina.com.cn' },
    });
    
    if (!response.ok) {
      throw new Error('Sina API failed');
    }
    
    const text = await response.text();
    const match = text.match(/"([^"]+)"/);
    
    if (!match) {
      throw new Error('Invalid data');
    }
    
    const parts = match[1].split(',');
    
    return new Response(
      JSON.stringify({
        name: parts[0],
        open: parseFloat(parts[1]),
        prevClose: parseFloat(parts[2]),
        price: parseFloat(parts[3]),
        high: parseFloat(parts[4]),
        low: parseFloat(parts[5]),
        volume: parseInt(parts[8]),
        amount: parseFloat(parts[9]),
      }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '获取失败' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
