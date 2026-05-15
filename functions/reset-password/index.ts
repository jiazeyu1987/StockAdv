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
    const { phone, code, newPassword } = await req.json();

    if (!phone || !code || !newPassword) {
      return new Response(JSON.stringify({ error: '请填写完整信息' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: '密码至少6位' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: verifyRecord } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!verifyRecord) {
      return new Response(JSON.stringify({ error: '验证码无效或已过期' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    await supabaseAdmin
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verifyRecord.id);

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (!user) {
      return new Response(JSON.stringify({ error: '该手机号未绑定用户' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: '密码重置成功' }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '重置失败' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
