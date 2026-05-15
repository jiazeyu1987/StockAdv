import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { phone } = await req.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(JSON.stringify({ error: '请输入有效的手机号' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from('verification_codes')
      .insert({
        phone,
        code,
        expires_at: expiresAt,
        used: false,
      });

    return new Response(
      JSON.stringify({ success: true, message: '验证码已发送' }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '发送失败' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
