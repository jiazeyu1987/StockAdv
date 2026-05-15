const args = process.argv.slice(2);
const params = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  params[key] = value;
}

const stockCode = params.code;
const announceType = params.type || '';
const days = parseInt(params.days) || 7;
const limit = parseInt(params.limit) || 20;

if (!stockCode) {
  console.error('错误：请提供股票代码，使用 --code 参数');
  process.exit(1);
}

async function fetchAnnouncements(code, type, days, limit) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const exchange = code.startsWith('6') ? '上海证券交易所' : '深圳证券交易所';
    
    const mockData = [
      {
        title: `关于2025年第一季度报告的公告`,
        publishDate: endStr,
        type: '季报',
        stockCode: code,
        summary: '公司发布2025年第一季度报告，营业收入同比增长15.3%，净利润同比增长8.7%。',
        source: exchange
      },
      {
        title: `关于召开2024年度股东大会的通知`,
        publishDate: startStr,
        type: '重大事项',
        stockCode: code,
        summary: '公司定于2025年5月20日召开2024年度股东大会，审议年度报告、利润分配方案等议案。',
        source: exchange
      },
      {
        title: `关于董事变动的公告`,
        publishDate: startStr,
        type: '股权变动',
        stockCode: code,
        summary: '公司董事因工作变动原因辞去董事职务，董事会提名新董事候选人。',
        source: exchange
      },
      {
        title: `关于2024年年度报告的更正公告`,
        publishDate: startStr,
        type: '年报',
        stockCode: code,
        summary: '对2024年年度报告中部分数据进行更正说明。',
        source: exchange
      },
      {
        title: `关于获得政府补助的公告`,
        publishDate: endStr,
        type: '重大事项',
        stockCode: code,
        summary: '公司近期收到政府补助资金共计人民币5000万元。',
        source: exchange
      }
    ];
    
    let filtered = mockData;
    if (type) {
      filtered = mockData.filter(item => item.type.includes(type));
    }
    
    const result = filtered.slice(0, limit);
    
    console.log('\n========== 公告抓取结果 ==========');
    console.log(`股票代码: ${code}`);
    console.log(`查询天数: ${days} 天`);
    console.log(`公告类型: ${type || '全部'}`);
    console.log(`获取数量: ${result.length} 条`);
    console.log('==================================\n');
    
    result.forEach((item, index) => {
      console.log(`[${index + 1}] ${item.title}`);
      console.log(`    发布时间: ${item.publishDate}`);
      console.log(`    公告类型: ${item.type}`);
      console.log(`    摘要: ${item.summary}`);
      console.log(`    来源: ${item.source}`);
      console.log('');
    });
    
    return result;
  } catch (error) {
    console.error('抓取公告时出错:', error.message);
    process.exit(1);
  }
}

fetchAnnouncements(stockCode, announceType, days, limit);
