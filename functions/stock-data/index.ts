const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const TUSHARE_TOKEN = '61b4f44bf83c40ff68a744e10442931c67edac2f066d8c0d81975557';

const STOCK_NAME_MAP: Record<string, string> = {
  '贵州茅台': '600519',
  '中国平安': '601318',
  '招商银行': '600036',
  '五粮液': '000858',
  '宁德时代': '300750',
  '比亚迪': '002594',
  '美的集团': '000333',
  '格力电器': '000651',
  '平安银行': '000001',
  '兴业银行': '601166',
  '中信证券': '600030',
  '东方财富': '300059',
  '隆基绿能': '601012',
  '药明康德': '603259',
  '迈瑞医疗': '300760',
  '恒瑞医药': '600276',
  '伊利股份': '600887',
  '海康威视': '002415',
  '立讯精密': '002475',
  '京东方A': '000725',
  '万科A': '000002',
  '保利发展': '600048',
  '中国建筑': '601668',
  '中国中免': '601888',
  '长江电力': '600900',
  '牧原股份': '002714',
  '顺丰控股': '002352',
  '工业富联': '601138',
  '紫金矿业': '601899',
  '万华化学': '600309',
  '中国银行': '601988',
  '工商银行': '601398',
  '建设银行': '601939',
  '农业银行': '601288',
  '交通银行': '601328',
  '邮储银行': '601658',
  '浦发银行': '600000',
  '民生银行': '600016',
  '中信银行': '601998',
  '光大银行': '601818',
  '华夏银行': '600015',
  '北京银行': '601169',
  '上海银行': '601229',
  '南京银行': '601009',
  '宁波银行': '002142',
  '杭州银行': '600926',
  '江苏银行': '600919',
  '成都银行': '601838',
  '长沙银行': '601577',
  '重庆银行': '601963',
  '贵阳银行': '601997',
  '郑州银行': '002936',
  '青岛银行': '002948',
  '苏州银行': '002966',
  '西安银行': '600928',
  '厦门银行': '601187',
  '齐鲁银行': '601665',
  '兰州银行': '001227',
  '紫金银行': '601860',
  '常熟银行': '601128',
  '无锡银行': '600908',
  '江阴银行': '002807',
  '张家港行': '002839',
  '苏农银行': '603323',
  '瑞丰银行': '601528',
};

function resolveStockCode(input: string): string {
  const s = input.trim();
  if (/^\d{6}$/.test(s)) return s;
  if (STOCK_NAME_MAP[s]) return STOCK_NAME_MAP[s];
  for (const [name, code] of Object.entries(STOCK_NAME_MAP)) {
    if (name.includes(s) || s.includes(name)) return code;
  }
  return s;
}

async function fetchTushare(stockCode: string): Promise<any> {
  const tsCode = stockCode.startsWith('6') ? `${stockCode}.SH` : `${stockCode}.SZ`;
  const today = new Date();
  const endDate = today.toISOString().split('T')[0].replace(/-/g, '');
  const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '');

  const response = await fetch('http://api.tushare.pro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_name: 'daily',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: startDate,
        end_date: endDate,
      },
      fields: 'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount',
    }),
  });

  if (!response.ok) throw new Error('Tushare API failed');
  const data = await response.json();

  if (!data.data || !data.data.items || data.data.items.length === 0) {
    throw new Error('No data from Tushare');
  }

  const latest = data.data.items[0];
  const fields = data.data.fields;
  const getField = (name: string) => {
    const idx = fields.indexOf(name);
    return idx >= 0 ? latest[idx] : 0;
  };

  return {
    name: stockCode,
    price: parseFloat(getField('close')) || 0,
    prevClose: parseFloat(getField('pre_close')) || 0,
    open: parseFloat(getField('open')) || 0,
    high: parseFloat(getField('high')) || 0,
    low: parseFloat(getField('low')) || 0,
    volume: parseFloat(getField('vol')) || 0,
    amount: parseFloat(getField('amount')) || 0,
    change: parseFloat(getField('change')) || 0,
    changePercent: parseFloat(getField('pct_chg')) || 0,
  };
}

async function fetchTushareBasic(stockCode: string): Promise<any> {
  const response = await fetch('http://api.tushare.pro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_name: 'stock_basic',
      token: TUSHARE_TOKEN,
      params: {
        ts_code: stockCode.startsWith('6') ? `${stockCode}.SH` : `${stockCode}.SZ`,
      },
      fields: 'ts_code,name,area,industry,list_date',
    }),
  });

  if (!response.ok) throw new Error('Tushare basic API failed');
  const data = await response.json();

  if (data.data && data.data.items && data.data.items.length > 0) {
    return { name: data.data.items[0][1] };
  }
  return { name: stockCode };
}

function getSinaCode(code: string): string {
  const s = code.trim();
  if (/^\d{6}$/.test(s)) {
    if (s.startsWith('6')) return `sh${s}`;
    return `sz${s}`;
  }
  if (/^\d{5}$/.test(s)) return `hk${s}`;
  return s;
}

async function fetchSina(stockCode: string): Promise<any> {
  const sinaCode = getSinaCode(stockCode);
  const url = `https://hq.sinajs.cn/list=${sinaCode}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Sina API failed');
  const text = await response.text();
  const match = text.match(/"([^"]*)"/);
  if (!match || !match[1]) throw new Error('No data');
  const parts = match[1].split(',');
  if (parts.length < 10 || !parts[0]) throw new Error('Invalid data');
  return {
    name: parts[0],
    open: parseFloat(parts[1]) || 0,
    prevClose: parseFloat(parts[2]) || 0,
    price: parseFloat(parts[3]) || 0,
    high: parseFloat(parts[4]) || 0,
    low: parseFloat(parts[5]) || 0,
    volume: parseInt(parts[8]) || 0,
    amount: parseFloat(parts[9]) || 0,
  };
}

async function fetchTencent(stockCode: string): Promise<any> {
  const s = stockCode.trim();
  let tencentCode = s;
  if (/^\d{6}$/.test(s)) {
    tencentCode = s.startsWith('6') ? `sh${s}` : `sz${s}`;
  } else if (/^\d{5}$/.test(s)) {
    tencentCode = `hk${s}`;
  }
  const url = `https://qt.gtimg.cn/q=${tencentCode}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Tencent API failed');
  const text = await response.text();
  const match = text.match(/"([^"]*)"/);
  if (!match || !match[1]) throw new Error('No data');
  const parts = match[1].split('~');
  if (parts.length < 45) throw new Error('Invalid data');
  return {
    name: parts[1],
    price: parseFloat(parts[3]) || 0,
    prevClose: parseFloat(parts[4]) || 0,
    open: parseFloat(parts[5]) || 0,
    high: parseFloat(parts[33]) || 0,
    low: parseFloat(parts[34]) || 0,
    volume: parseInt(parts[36]) || 0,
    amount: parseFloat(parts[37]) || 0,
  };
}

async function fetchYahoo(stockCode: string): Promise<any> {
  const s = stockCode.trim();
  let symbol = s;
  if (/^\d{6}$/.test(s)) {
    symbol = s.startsWith('6') ? `${s}.SS` : `${s}.SZ`;
  } else if (/^\d{5}$/.test(s)) {
    symbol = `${s}.HK`;
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Yahoo API failed');
  const data = await response.json();
  if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
    throw new Error('No data');
  }
  const result = data.chart.result[0];
  const meta = result.meta;
  return {
    name: meta.shortName || meta.symbol || stockCode,
    price: meta.regularMarketPrice || 0,
    prevClose: meta.previousClose || 0,
    open: meta.regularMarketOpen || 0,
    high: meta.regularMarketDayHigh || 0,
    low: meta.regularMarketDayLow || 0,
    volume: meta.regularMarketVolume || 0,
    amount: 0,
  };
}

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

    const resolvedCode = resolveStockCode(stockCode);
    if (!/^\d{6}$/.test(resolvedCode)) {
      return new Response(JSON.stringify({ error: '抱歉，测试版接入数据时，采用免费数据接口，有时数据不全，无法继续分析。' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    let data = null;
    let error = null;
    let source = '';

    try {
      data = await fetchTushare(resolvedCode);
      source = 'Tushare';
      try {
        const basicInfo = await fetchTushareBasic(resolvedCode);
        if (basicInfo.name) {
          data.name = basicInfo.name;
        }
      } catch {}
    } catch (e) {
      error = e;
      try {
        data = await fetchSina(resolvedCode);
        source = '新浪财经';
      } catch (e2) {
        error = e2;
        try {
          data = await fetchTencent(resolvedCode);
          source = '腾讯财经';
        } catch (e3) {
          error = e3;
          try {
            data = await fetchYahoo(resolvedCode);
            source = 'Yahoo Finance';
          } catch (e4) {
            error = e4;
          }
        }
      }
    }

    if (!data) {
      throw new Error('所有数据源均获取失败');
    }

    const change = data.price - data.prevClose;

    return new Response(
      JSON.stringify({
        code: resolvedCode,
        name: data.name || resolvedCode,
        price: data.price,
        open: data.open,
        high: data.high,
        low: data.low,
        prevClose: data.prevClose,
        change: change,
        changePercent: data.prevClose > 0 ? ((change / data.prevClose) * 100).toFixed(2) : 0,
        volume: data.volume,
        amount: data.amount,
        source: source,
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
