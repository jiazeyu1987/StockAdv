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
    const { username, password, phone } = await req.json();

    if (!username || !password || !phone) {
      return new Response(JSON.stringify({ error: '请填写完整信息' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: '密码至少6位' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return new Response(JSON.stringify({ error: '该用户名已存在' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@meoo.local`,
      password,
      user_metadata: { username, phone },
      email_confirm: true,
    });

    if (authError) {
      throw authError;
    }

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        username,
        phone,
        email: `${username}@meoo.local`,
        remaining_queries: 10,
        query_count: 0,
        total_recharge_amount: 0,
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: '注册成功' }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '注册失败' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
