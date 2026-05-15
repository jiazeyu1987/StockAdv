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
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: '手机号和验证码不能为空' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: record } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!record) {
      return new Response(JSON.stringify({ error: '验证码无效或已过期' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    await supabaseAdmin
      .from('verification_codes')
      .update({ used: true })
      .eq('id', record.id);

    return new Response(
      JSON.stringify({ success: true, message: '验证成功' }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '验证失败' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
