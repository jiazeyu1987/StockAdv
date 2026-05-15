import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DAILY_FREE_LIMIT = 10;

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
    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: '请先登录' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const today = new Date().toISOString().split('T')[0];

    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from('user_daily_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('query_date', today)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingRecord) {
      const { data: newRecord, error: insertError } = await supabaseAdmin
        .from('user_daily_limits')
        .insert({
          user_id: user.id,
          query_date: today,
          query_count: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          canQuery: true,
          remaining: DAILY_FREE_LIMIT,
          total: DAILY_FREE_LIMIT,
        }),
        { headers: corsHeaders },
      );
    }

    const remaining = Math.max(0, DAILY_FREE_LIMIT - existingRecord.query_count);

    return new Response(
      JSON.stringify({
        canQuery: remaining > 0,
        remaining,
        total: DAILY_FREE_LIMIT,
        queryCount: existingRecord.query_count,
      }),
      { headers: corsHeaders },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: corsHeaders },
    );
  }
});
