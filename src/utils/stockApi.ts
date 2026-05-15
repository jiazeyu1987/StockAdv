export interface MarketData {
  code: string;
  name: string;
  price: number;
  change_percent: number;
  change_amount: number;
  volume: number;
  amount: number;
  turnover_rate: number;
  high: number;
  low: number;
  open: number;
  prev_close: number;
  support_level: number;
  resistance_level: number;
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi_6: number;
  rsi_12: number;
  macd_dif: number;
  macd_dea: number;
  macd_bar: number;
  boll_upper: number;
  boll_mid: number;
  boll_lower: number;
  pe_ttm: number;
  pe_lyr: number;
  pb: number;
  ps_ttm: number;
  dividend_yield: number;
  market_cap: number;
  circulating_market_cap: number;
  total_shares: number;
  circulating_shares: number;
}

export interface FinancialData {
  revenue: number;
  revenue_growth: number;
  net_profit: number;
  profit_growth: number;
  gross_margin: number;
  net_margin: number;
  roe: number;
  roa: number;
  eps: number;
  bvps: number;
  operating_cash_flow: number;
  free_cash_flow: number;
  asset_liability_ratio: number;
  current_ratio: number;
  quick_ratio: number;
  inventory_turnover: number;
  report_period: string;
}

export interface ResearchReport {
  institution: string;
  rating: string;
  target_price: number;
  publish_date: string;
  summary: string;
}

export interface Announcement {
  title: string;
  date: string;
  type: string;
  url: string;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface CapitalFlow {
  net_inflow: number;
  main_force_inflow: number;
  retail_inflow: number;
}

export interface NewsAndFlow {
  news: NewsItem[];
  capital_flow: CapitalFlow;
}

export interface CompleteStockData {
  basic: MarketData;
  financial: FinancialData;
  reports: ResearchReport[];
  announcements: Announcement[];
  newsFlow: NewsAndFlow;
}

export interface DataSourceInfo {
  source: string;
  status: 'success' | 'failed';
  data?: any;
  error?: string;
}

const STOCK_NAME_MAP: Record<string, string> = {
  '贵州茅台': '600519', '中国平安': '601318', '招商银行': '600036', '五粮液': '000858',
  '宁德时代': '300750', '比亚迪': '002594', '美的集团': '000333', '格力电器': '000651',
  '平安银行': '000001', '兴业银行': '601166', '中信证券': '600030', '东方财富': '300059',
  '隆基绿能': '601012', '药明康德': '603259', '迈瑞医疗': '300760', '恒瑞医药': '600276',
  '伊利股份': '600887', '海康威视': '002415', '立讯精密': '002475', '京东方A': '000725',
  '万科A': '000002', '保利发展': '600048', '中国建筑': '601668', '中国中免': '601888',
  '长江电力': '600900', '牧原股份': '002714', '顺丰控股': '002352', '工业富联': '601138',
  '紫金矿业': '601899', '万华化学': '600309', '中国银行': '601988', '工商银行': '601398',
  '建设银行': '601939', '农业银行': '601288', '交通银行': '601328', '邮储银行': '601658',
  '浦发银行': '600000', '民生银行': '600016', '中信银行': '601998', '光大银行': '601818',
  '华夏银行': '600015', '北京银行': '601169', '上海银行': '601229', '南京银行': '601009',
  '宁波银行': '002142', '杭州银行': '600926', '江苏银行': '600919', '成都银行': '601838',
  '长沙银行': '601577', '重庆银行': '601963', '贵阳银行': '601997', '郑州银行': '002936',
  '青岛银行': '002948', '苏州银行': '002966', '西安银行': '600928', '厦门银行': '601187',
  '齐鲁银行': '601665', '兰州银行': '001227', '紫金银行': '601860', '常熟银行': '601128',
  '无锡银行': '600908', '江阴银行': '002807', '张家港行': '002839', '苏农银行': '603323',
  '瑞丰银行': '601528', '山东黄金': '600547', '中金黄金': '600489', '赤峰黄金': '600988',
  '湖南黄金': '002155', '银泰黄金': '000975', '西部黄金': '601069', '四川黄金': '001337',
  '恒邦股份': '002237', '中国黄金': '600916', '捷佳伟创': '300724', '迈为股份': '300751',
  '晶盛机电': '300316', '上机数控': '603185', '通威股份': '600438', '大全能源': '688303',
  'TCL中环': '002129', '晶澳科技': '002459', '天合光能': '688599', '隆基股份': '601012',
  '阳光电源': '300274', '固德威': '688390', '锦浪科技': '300763', '德业股份': '605117',
  '禾迈股份': '688032', '昱能科技': '688348', '派能科技': '688063', '鹏辉能源': '300438',
  '亿纬锂能': '300014', '国轩高科': '002074', '欣旺达': '300207', '孚能科技': '688567',
  '天赐材料': '002709', '新宙邦': '300037', '当升科技': '300073', '容百科技': '688005',
  '杉杉股份': '600884', '璞泰来': '603659', '恩捷股份': '002812', '星源材质': '300568',
  '中材科技': '002080', '科达利': '002850', '诺德股份': '600110', '嘉元科技': '688388',
  '天奈科技': '688116', '贝特瑞': '835185', '中科电气': '300035', '石大胜华': '603026',
  '永太科技': '002326', '多氟多': '002407', '天际股份': '002759', '华盛锂电': '688353',
  '中伟股份': '300919', '华友钴业': '603799', '格林美': '002340', '洛阳钼业': '603993',
  '寒锐钴业': '300618', '盛屯矿业': '600711', '赣锋锂业': '002460', '天齐锂业': '002466',
  '盐湖股份': '000792', '雅化集团': '002497', '永兴材料': '002756', '江特电机': '002176',
  '融捷股份': '002192', '盛新锂能': '002240', '西藏矿业': '000762', '西藏珠峰': '600338',
  '西藏城投': '600773', '川能动力': '000155', '科华数据': '002335', '科士达': '002518',
  '英维克': '002837', '高澜股份': '300499', '同飞股份': '300990', '申菱环境': '301018',
};

async function searchStockByName(name: string): Promise<{ code: string; name: string } | null> {
  if (STOCK_NAME_MAP[name]) {
    return { code: STOCK_NAME_MAP[name], name };
  }
  for (const [stockName, code] of Object.entries(STOCK_NAME_MAP)) {
    if (stockName.includes(name) || name.includes(stockName)) {
      return { code, name: stockName };
    }
  }
  try {
    const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(name)}&type=14&count=5`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.QuotationCodeTable?.Data?.length > 0) {
      for (const item of data.QuotationCodeTable.Data) {
        if (item.Code && /^\d{6}$/.test(item.Code)) {
          return { code: item.Code, name: item.Name || item.Code };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getEastMoneySecid(code: string): string {
  if (code.startsWith('6')) return `1.${code}`;
  return `0.${code}`;
}

async function fetchEastMoney(code: string): Promise<DataSourceInfo> {
  try {
    const secid = getEastMoneySecid(code);
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f170`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    if (!data.data) throw new Error('No data');
    const d = data.data;
    return {
      source: '东方财富',
      status: 'success',
      data: {
        name: d.f58 || d.f57,
        price: d.f43 ? d.f43 / 100 : 0,
        prevClose: d.f60 ? d.f60 / 100 : 0,
        open: d.f46 ? d.f46 / 100 : 0,
        high: d.f44 ? d.f44 / 100 : 0,
        low: d.f45 ? d.f45 / 100 : 0,
        volume: d.f47 || 0,
        amount: d.f48 ? d.f48 / 10000 : 0,
      }
    };
  } catch (error: any) {
    return { source: '东方财富', status: 'failed', error: error.message };
  }
}

async function fetchTencent(code: string): Promise<DataSourceInfo> {
  try {
    const tencentCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
    const url = `https://qt.gtimg.cn/q=${tencentCode}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    const text = await response.text();
    const match = text.match(/"([^"]*)"/);
    if (!match) throw new Error('No data');
    const parts = match[1].split('~');
    if (parts.length < 45) throw new Error('Invalid format');
    return {
      source: '腾讯财经',
      status: 'success',
      data: {
        name: parts[1],
        price: parseFloat(parts[3]) || 0,
        prevClose: parseFloat(parts[4]) || 0,
        open: parseFloat(parts[5]) || 0,
        high: parseFloat(parts[33]) || 0,
        low: parseFloat(parts[34]) || 0,
        volume: parseInt(parts[36]) || 0,
        amount: parseFloat(parts[37]) || 0,
      }
    };
  } catch (error: any) {
    return { source: '腾讯财经', status: 'failed', error: error.message };
  }
}

async function fetchSina(code: string): Promise<DataSourceInfo> {
  try {
    const sinaCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
    const url = `https://hq.sinajs.cn/list=${sinaCode}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    const text = await response.text();
    const match = text.match(/"([^"]*)"/);
    if (!match) throw new Error('No data');
    const parts = match[1].split(',');
    if (parts.length < 10) throw new Error('Invalid format');
    return {
      source: '新浪财经',
      status: 'success',
      data: {
        name: parts[0],
        price: parseFloat(parts[3]) || 0,
        prevClose: parseFloat(parts[2]) || 0,
        open: parseFloat(parts[1]) || 0,
        high: parseFloat(parts[4]) || 0,
        low: parseFloat(parts[5]) || 0,
        volume: parseInt(parts[8]) || 0,
        amount: parseFloat(parts[9]) || 0,
      }
    };
  } catch (error: any) {
    return { source: '新浪财经', status: 'failed', error: error.message };
  }
}

async function fetchYahoo(code: string): Promise<DataSourceInfo> {
  try {
    const symbol = code.startsWith('6') ? `${code}.SS` : `${code}.SZ`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    if (!data.chart?.result?.[0]) throw new Error('No data');
    const meta = data.chart.result[0].meta;
    return {
      source: 'Yahoo Finance',
      status: 'success',
      data: {
        name: meta.shortName || meta.symbol,
        price: meta.regularMarketPrice || 0,
        prevClose: meta.previousClose || 0,
        open: meta.regularMarketOpen || 0,
        high: meta.regularMarketDayHigh || 0,
        low: meta.regularMarketDayLow || 0,
        volume: meta.regularMarketVolume || 0,
        amount: 0,
      }
    };
  } catch (error: any) {
    return { source: 'Yahoo Finance', status: 'failed', error: error.message };
  }
}

export async function fetchMultiSourceData(input: string): Promise<{ code: string; name: string; sources: DataSourceInfo[] }> {
  let code: string;
  let name: string;

  if (/^\d{6}$/.test(input.trim())) {
    code = input.trim();
    name = code;
  } else {
    const searchResult = await searchStockByName(input.trim());
    if (!searchResult) {
      throw new Error('无法识别的股票名称，请输入6位股票代码');
    }
    code = searchResult.code;
    name = searchResult.name;
  }

  const [eastMoney, tencent, sina, yahoo] = await Promise.all([
    fetchEastMoney(code),
    fetchTencent(code),
    fetchSina(code),
    fetchYahoo(code),
  ]);

  return { code, name, sources: [eastMoney, tencent, sina, yahoo] };
}

export async function getMarketDataWithSources(input: string): Promise<{ marketData: MarketData; sources: DataSourceInfo[] }> {
  const { code, name, sources } = await fetchMultiSourceData(input);

  const successfulSource = sources.find(s => s.status === 'success');
  if (!successfulSource) {
    const errors = sources.map(s => `${s.source}: ${s.error}`).join('; ');
    throw new Error(`所有数据源均获取失败 (${errors})`);
  }

  const d = successfulSource.data;
  const currentPrice = d.price || 0;
  const prevClose = d.prevClose || currentPrice;
  const change = currentPrice - prevClose;
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

  const marketData: MarketData = {
    code,
    name: d.name || name,
    price: parseFloat(currentPrice.toFixed(2)),
    change_percent: parseFloat(changePercent.toFixed(2)),
    change_amount: parseFloat(change.toFixed(2)),
    volume: Math.floor(d.volume || 0),
    amount: Math.floor(d.amount || 0),
    turnover_rate: 0,
    high: parseFloat((d.high || currentPrice).toFixed(2)),
    low: parseFloat((d.low || currentPrice).toFixed(2)),
    open: parseFloat((d.open || currentPrice).toFixed(2)),
    prev_close: parseFloat(prevClose.toFixed(2)),
    support_level: parseFloat((currentPrice * 0.95).toFixed(2)),
    resistance_level: parseFloat((currentPrice * 1.05).toFixed(2)),
    ma5: 0, ma10: 0, ma20: 0, ma60: 0,
    rsi_6: 0, rsi_12: 0,
    macd_dif: 0, macd_dea: 0, macd_bar: 0,
    boll_upper: parseFloat((currentPrice * 1.08).toFixed(2)),
    boll_mid: parseFloat(currentPrice.toFixed(2)),
    boll_lower: parseFloat((currentPrice * 0.92).toFixed(2)),
    pe_ttm: 0, pe_lyr: 0, pb: 0, ps_ttm: 0, dividend_yield: 0,
    market_cap: 0, circulating_market_cap: 0, total_shares: 0, circulating_shares: 0,
  };

  return { marketData, sources };
}

export async function getMarketData(input: string): Promise<MarketData> {
  const { marketData } = await getMarketDataWithSources(input);
  return marketData;
}

export async function getFinancialData(stockCode: string): Promise<FinancialData> {
  return {
    revenue: 0, revenue_growth: 0, net_profit: 0, profit_growth: 0,
    gross_margin: 0, net_margin: 0, roe: 0, roa: 0, eps: 0, bvps: 0,
    operating_cash_flow: 0, free_cash_flow: 0, asset_liability_ratio: 0,
    current_ratio: 0, quick_ratio: 0, inventory_turnover: 0, report_period: 'N/A',
  };
}

const mockReports: ResearchReport[] = [
  { institution: 'Morningstar', rating: 'Buy', target_price: 180.00, publish_date: '2025-04-10', summary: 'Strong fundamentals with competitive moat' },
  { institution: 'Zacks', rating: 'Hold', target_price: 175.00, publish_date: '2025-04-08', summary: 'Fair valuation with stable growth outlook' },
  { institution: 'TheStreet', rating: 'Buy', target_price: 185.00, publish_date: '2025-04-05', summary: 'Excellent cash flow generation' },
];

const mockAnnouncements: Announcement[] = [
  { title: 'Q1 2025 Earnings Report', date: '2025-04-12', type: 'Financial Report', url: '#' },
  { title: 'Annual Shareholder Meeting Notice', date: '2025-04-10', type: 'Corporate', url: '#' },
];

const mockNewsFlow: NewsAndFlow = {
  news: [
    { title: 'Tech sector shows resilience amid market volatility', source: 'Bloomberg', date: '2025-04-13', sentiment: 'positive' },
    { title: 'Company announces new product line expansion', source: 'Reuters', date: '2025-04-12', sentiment: 'neutral' },
  ],
  capital_flow: { net_inflow: 123456789, main_force_inflow: 98765432, retail_inflow: 24691357 },
};

export async function getResearchReports(stockCode: string, limit = 5): Promise<ResearchReport[]> {
  return mockReports.slice(0, limit);
}

export async function getAnnouncements(stockCode: string, limit = 3): Promise<Announcement[]> {
  return mockAnnouncements.slice(0, limit);
}

export async function getNewsAndFlow(stockCode: string, limit = 5): Promise<NewsAndFlow> {
  return { ...mockNewsFlow, news: mockNewsFlow.news.slice(0, limit) };
}

export async function fetchCompleteStockData(input: string): Promise<CompleteStockData & { sources: DataSourceInfo[] }> {
  const { marketData: basic, sources } = await getMarketDataWithSources(input);
  const [financial, reports, announcements, newsFlow] = await Promise.all([
    getFinancialData(basic.code),
    getResearchReports(basic.code, 5),
    getAnnouncements(basic.code, 3),
    getNewsAndFlow(basic.code, 5),
  ]);
  return { basic, financial, reports, announcements, newsFlow, sources };
}

export function calculateAvgTargetPrice(reports: ResearchReport[]): number {
  if (!reports || reports.length === 0) return 0;
  const sum = reports.reduce((acc, r) => acc + r.target_price, 0);
  return parseFloat((sum / reports.length).toFixed(2));
}

export function formatAmount(amount: number): string {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(2)}万`;
  return amount.toFixed(2);
}
