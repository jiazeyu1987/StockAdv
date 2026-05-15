/**
 * A股日线数据获取脚本
 * 支持获取指数和个股的日线历史数据
 * 数据来源：东方财富网公开API
 */

const axios = require('axios');
const dayjs = require('dayjs');

// 常用指数代码映射
const INDEX_MAP = {
  '上证指数': '000001',
  '上证': '000001',
  '深证成指': '399001',
  '深证': '399001',
  '创业板指': '399006',
  '创业板': '399006',
  '科创50': '000688',
  '科创板': '000688',
  '沪深300': '000300',
  '上证50': '000016',
  '中证500': '000905',
  '中证1000': '000852',
  '深证100': '399330'
};

// 个股名称到代码的映射（常用股票）
const STOCK_NAME_MAP = {
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
  '万华化学': '600309'
};

/**
 * 解析股票代码
 * 支持：6位数字代码、指数名称、个股名称
 */
function parseStockCode(input) {
  const trimmed = input.trim();
  
  // 如果是6位数字，直接返回
  if (/^\d{6}$/.test(trimmed)) {
    return trimmed;
  }
  
  // 检查指数映射
  if (INDEX_MAP[trimmed]) {
    return INDEX_MAP[trimmed];
  }
  
  // 检查个股名称映射
  if (STOCK_NAME_MAP[trimmed]) {
    return STOCK_NAME_MAP[trimmed];
  }
  
  // 尝试模糊匹配
  for (const [name, code] of Object.entries(INDEX_MAP)) {
    if (name.includes(trimmed) || trimmed.includes(name)) {
      return code;
    }
  }
  
  for (const [name, code] of Object.entries(STOCK_NAME_MAP)) {
    if (name.includes(trimmed) || trimmed.includes(name)) {
      return code;
    }
  }
  
  return null;
}

/**
 * 获取股票市场前缀
 * 沪市：sh，深市：sz，北交所：bj
 */
function getMarketPrefix(code) {
  if (code.startsWith('6') || code.startsWith('5') || code.startsWith('9')) {
    return 'sh';
  } else if (code.startsWith('0') || code.startsWith('3') || code.startsWith('2')) {
    return 'sz';
  } else if (code.startsWith('8') || code.startsWith('4')) {
    return 'bj';
  }
  return 'sh';
}

/**
 * 获取股票名称
 */
async function getStockName(code) {
  try {
    const prefix = getMarketPrefix(code);
    const secid = `${prefix === 'sh' ? '1' : '0'}.${code}`;
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.data) {
      return response.data.data.f58 || code;
    }
  } catch (error) {
    console.error('获取股票名称失败:', error.message);
  }
  return code;
}

/**
 * 获取日线历史数据
 * @param {string} code - 6位股票代码
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 */
async function fetchDailyData(code, startDate, endDate) {
  try {
    const prefix = getMarketPrefix(code);
    const secid = `${prefix === 'sh' ? '1' : '0'}.${code}`;
    
    // 转换日期格式
    const start = startDate ? dayjs(startDate).format('YYYYMMDD') : dayjs().subtract(30, 'day').format('YYYYMMDD');
    const end = endDate ? dayjs(endDate).format('YYYYMMDD') : dayjs().format('YYYYMMDD');
    
    // 东方财富K线数据API
    const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=0&beg=${start}&end=${end}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://quote.eastmoney.com/'
      },
      timeout: 15000
    });
    
    if (!response.data || !response.data.data || !response.data.data.klines) {
      throw new Error('未获取到数据，请检查股票代码是否正确');
    }
    
    const klines = response.data.data.klines;
    const stockName = response.data.data.name || await getStockName(code);
    
    // 解析K线数据
    // 格式：日期,开盘价,收盘价,最高价,最低价,成交量,成交额,振幅,涨跌幅,涨跌额,换手率
    const parsedData = klines.map(line => {
      const parts = line.split(',');
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseInt(parts[5]),
        amount: parseFloat(parts[6]),
        amplitude: parseFloat(parts[7]),
        changePercent: parseFloat(parts[8]),
        change: parseFloat(parts[9]),
        turnover: parseFloat(parts[10]) || 0
      };
    });
    
    return {
      code: code,
      name: stockName,
      market: prefix,
      data: parsedData
    };
    
  } catch (error) {
    console.error('获取数据失败:', error.message);
    throw error;
  }
}

/**
 * 获取最新行情数据
 * @param {string} code - 6位股票代码
 */
async function fetchLatestQuote(code) {
  try {
    const prefix = getMarketPrefix(code);
    const secid = `${prefix === 'sh' ? '1' : '0'}.${code}`;
    
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f170`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      return {
        code: code,
        name: data.f58,
        price: data.f43 / 100,
        open: data.f44 / 100,
        high: data.f45 / 100,
        low: data.f46 / 100,
        prevClose: data.f60 / 100,
        change: data.f170 / 100,
        changePercent: ((data.f170 / 100) / (data.f60 / 100) * 100).toFixed(2),
        volume: data.f47,
        amount: data.f48
      };
    }
    
    throw new Error('获取最新行情失败');
  } catch (error) {
    console.error('获取最新行情失败:', error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node fetch-stock-data.js <股票代码或名称> [开始日期] [结束日期]');
    console.log('');
    console.log('示例:');
    console.log('  node fetch-stock-data.js 600519');
    console.log('  node fetch-stock-data.js 贵州茅台');
    console.log('  node fetch-stock-data.js 000001 2024-01-01 2024-03-01');
    console.log('  node fetch-stock-data.js 上证指数');
    console.log('');
    console.log('支持的指数:');
    console.log('  上证指数、深证成指、创业板指、科创50、沪深300、上证50、中证500');
    console.log('');
    console.log('日期格式: YYYY-MM-DD');
    process.exit(1);
  }
  
  const input = args[0];
  const startDate = args[1];
  const endDate = args[2];
  
  // 解析股票代码
  const code = parseStockCode(input);
  if (!code) {
    console.error(`错误: 无法识别"${input}"，请输入6位股票代码或已知股票名称`);
    process.exit(1);
  }
  
  try {
    console.log(`正在获取 ${code} 的日线数据...`);
    const result = await fetchDailyData(code, startDate, endDate);
    
    console.log('\n========================================');
    console.log(`股票代码: ${result.code}`);
    console.log(`股票名称: ${result.name}`);
    console.log(`市场: ${result.market === 'sh' ? '沪市' : '深市'}`);
    console.log(`数据条数: ${result.data.length}`);
    console.log('========================================\n');
    
    // 输出JSON格式数据
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

// 导出函数供其他模块使用
module.exports = {
  parseStockCode,
  fetchDailyData,
  fetchLatestQuote,
  getStockName,
  INDEX_MAP,
  STOCK_NAME_MAP
};
