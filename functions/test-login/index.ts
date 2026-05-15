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
    const { phone } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: '手机号不能为空' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const email = `${phone}@meoo.local`;
    const password = 'test123456';

    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: { phone, username: phone },
        },
      });

      if (signUpError) {
        return new Response(JSON.stringify({ error: signUpError.message }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      await supabaseAdmin.from('users').insert({
        id: signUpData.user!.id,
        username: phone,
        email: email,
        phone: phone,
        remaining_queries: 10,
      });

      return new Response(
        JSON.stringify({
          success: true,
          access_token: signUpData.session!.access_token,
          refresh_token: signUpData.session!.refresh_token,
          user: signUpData.user,
        }),
        { headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: authData.session!.access_token,
        refresh_token: authData.session!.refresh_token,
        user: authData.user,
      }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '登录失败' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
