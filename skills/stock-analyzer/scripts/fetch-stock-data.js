/**
 * 股票数据获取脚本
 * 封装妙想金融助手的数据获取逻辑，统一接口处理
 */

// 模拟妙想金融助手 API 调用（实际使用时替换为真实 API）
const MiaoxiangAPI = {
  async getMarketData(stockCode) {
    console.log(`Fetching market data for ${stockCode}`);
    return {
      code: stockCode,
      name: "贵州茅台",
      price: 1453.96,
      change_percent: -0.45,
      change_amount: -6.54,
      volume: 2345678,
      amount: 3412345678,
      turnover_rate: 0.19,
      high: 1465.00,
      low: 1448.00,
      open: 1455.00,
      prev_close: 1460.50,
      support_level: 1440.00,
      resistance_level: 1470.00,
      ma5: 1458.20,
      ma10: 1462.50,
      ma20: 1475.30,
      ma60: 1510.80,
      rsi_6: 42.5,
      rsi_12: 45.8,
      macd_dif: -2.5,
      macd_dea: -1.8,
      macd_bar: -1.4,
      boll_upper: 1480.00,
      boll_mid: 1460.00,
      boll_lower: 1440.00,
      pe_ttm: 20.22,
      pe_lyr: 21.50,
      pb: 8.5,
      ps_ttm: 9.8,
      dividend_yield: 2.8,
      market_cap: 18234567890,
      circulating_market_cap: 18234567890,
      total_shares: 1254000000,
      circulating_shares: 1254000000,
    };
  },

  async getFinancialData(stockCode, period = "latest") {
    console.log(`Fetching financial data for ${stockCode}, period: ${period}`);
    return {
      revenue: 130900000000,
      revenue_growth: 6.32,
      net_profit: 65000000000,
      profit_growth: 5.8,
      gross_margin: 91.5,
      net_margin: 49.6,
      roe: 28.5,
      roa: 22.3,
      eps: 51.8,
      bvps: 185.6,
      operating_cash_flow: 72000000000,
      free_cash_flow: 68000000000,
      asset_liability_ratio: 18.5,
      current_ratio: 4.2,
      quick_ratio: 3.8,
      inventory_turnover: 0.45,
      report_period: "2025Q3",
      yoy_revenue_q1: 5.8,
      yoy_revenue_q2: 6.1,
      yoy_revenue_q3: 6.32,
      yoy_profit_q1: 5.2,
      yoy_profit_q2: 5.5,
      yoy_profit_q3: 5.8,
    };
  },

  async getResearchReports(stockCode, limit = 10) {
    console.log(`Fetching research reports for ${stockCode}, limit: ${limit}`);
    return [
      {
        institution: "中信证券",
        rating: "买入",
        target_price: 1650.00,
        publish_date: "2025-04-10",
        summary: "业绩稳健增长，高端产品占比提升，盈利能力持续增强。维持买入评级。",
      },
      {
        institution: "中金公司",
        rating: "跑赢行业",
        target_price: 1872.00,
        publish_date: "2025-04-08",
        summary: "品牌护城河深厚，渠道改革成效显著，长期价值凸显。",
      },
      {
        institution: "华泰证券",
        rating: "买入",
        target_price: 1720.00,
        publish_date: "2025-04-05",
        summary: "直销渠道增长强劲，系列酒表现亮眼，看好全年业绩达成。",
      },
      {
        institution: "国泰君安",
        rating: "增持",
        target_price: 1580.00,
        publish_date: "2025-04-01",
        summary: "估值处于历史低位，安全边际较高，建议逢低配置。",
      },
      {
        institution: "招商证券",
        rating: "强烈推荐",
        target_price: 1750.00,
        publish_date: "2025-03-28",
        summary: "提价预期强烈，若落地将显著提升利润弹性。",
      },
      {
        institution: "广发证券",
        rating: "买入",
        target_price: 1680.00,
        publish_date: "2025-03-25",
        summary: "现金流充沛，分红率稳定，具备长期配置价值。",
      },
      {
        institution: "申万宏源",
        rating: "增持",
        target_price: 1600.00,
        publish_date: "2025-03-20",
        summary: "系列酒战略清晰，有望成为第二增长曲线。",
      },
      {
        institution: "兴业证券",
        rating: "买入",
        target_price: 1700.00,
        publish_date: "2025-03-15",
        summary: "管理层换届完成，战略方向明确，经营效率提升。",
      },
      {
        institution: "光大证券",
        rating: "增持",
        target_price: 1550.00,
        publish_date: "2025-03-10",
        summary: "短期增速放缓不改长期逻辑，回调即是买点。",
      },
      {
        institution: "海通证券",
        rating: "优于大市",
        target_price: 1620.00,
        publish_date: "2025-03-05",
        summary: "行业龙头地位稳固，抗风险能力强，防御属性突出。",
      },
    ];
  },

  async getAnnouncements(stockCode, limit = 10) {
    console.log(`Fetching announcements for ${stockCode}, limit: ${limit}`);
    return [
      {
        title: "2025年第一季度报告",
        date: "2025-04-12",
        type: "定期报告",
        url: "http://example.com/announcement/1",
      },
      {
        title: "关于召开2024年年度股东大会的通知",
        date: "2025-04-10",
        type: "公司治理",
        url: "http://example.com/announcement/2",
      },
      {
        title: "关于部分董事、高级管理人员减持股份计划实施完成的公告",
        date: "2025-04-08",
        type: "股份变动",
        url: "http://example.com/announcement/3",
      },
      {
        title: "2024年年度报告摘要",
        date: "2025-03-30",
        type: "定期报告",
        url: "http://example.com/announcement/4",
      },
      {
        title: "2024年年度报告",
        date: "2025-03-30",
        type: "定期报告",
        url: "http://example.com/announcement/5",
      },
      {
        title: "关于计提资产减值准备的公告",
        date: "2025-03-28",
        type: "财务数据",
        url: "http://example.com/announcement/6",
      },
      {
        title: "关于聘任会计师事务所的公告",
        date: "2025-03-25",
        type: "公司治理",
        url: "http://example.com/announcement/7",
      },
      {
        title: "关于日常关联交易的公告",
        date: "2025-03-20",
        type: "关联交易",
        url: "http://example.com/announcement/8",
      },
      {
        title: "关于使用闲置募集资金进行现金管理的进展公告",
        date: "2025-03-15",
        type: "资金管理",
        url: "http://example.com/announcement/9",
      },
      {
        title: "关于获得政府补助的公告",
        date: "2025-03-10",
        type: "其他",
        url: "http://example.com/announcement/10",
      },
    ];
  },

  async getNewsAndFlow(stockCode, limit = 10) {
    console.log(`Fetching news and capital flow for ${stockCode}, limit: ${limit}`);
    return {
      news: [
        {
          title: "白酒板块持续回暖，龙头股受资金青睐",
          source: "证券时报",
          date: "2025-04-13",
          sentiment: "positive",
        },
        {
          title: "贵州茅台：一季度营收同比增长6.32%，净利润增长5.8%",
          source: "东方财富网",
          date: "2025-04-12",
          sentiment: "neutral",
        },
        {
          title: "机构调研：多家券商看好白酒行业长期发展",
          source: "中国证券报",
          date: "2025-04-11",
          sentiment: "positive",
        },
        {
          title: "消费复苏不及预期？专家解读最新经济数据",
          source: "财新网",
          date: "2025-04-10",
          sentiment: "negative",
        },
        {
          title: "贵州茅台发布2024年年报：营收净利双增",
          source: "上海证券报",
          date: "2025-03-30",
          sentiment: "positive",
        },
        {
          title: "高端白酒价格倒挂现象缓解，渠道库存回归正常",
          source: "每日经济新闻",
          date: "2025-03-28",
          sentiment: "positive",
        },
        {
          title: "外资连续三日净流入白酒板块",
          source: "华尔街见闻",
          date: "2025-03-25",
          sentiment: "positive",
        },
        {
          title: "贵州茅台：拟每10股派发现金红利XXX元",
          source: "公告解读",
          date: "2025-03-20",
          sentiment: "positive",
        },
        {
          title: "行业观察：白酒行业集中度进一步提升",
          source: "酒业家",
          date: "2025-03-15",
          sentiment: "neutral",
        },
        {
          title: "警惕！部分白酒企业业绩增速放缓",
          source: "投资者报",
          date: "2025-03-10",
          sentiment: "negative",
        },
      ],
      capital_flow: {
        net_inflow: 123456789,
        main_force_inflow: 98765432,
        retail_inflow: 24691357,
      },
    };
  },
};

/**
 * 获取股票完整数据
 * @param {string} stockCode - 股票代码
 * @returns {Promise<Object>} 完整的股票数据对象
 */
async function fetchCompleteStockData(stockCode) {
  try {
    const [market, financial, reports, announcements, newsFlow] = await Promise.all([
      MiaoxiangAPI.getMarketData(stockCode),
      MiaoxiangAPI.getFinancialData(stockCode),
      MiaoxiangAPI.getResearchReports(stockCode, 5),
      MiaoxiangAPI.getAnnouncements(stockCode, 3),
      MiaoxiangAPI.getNewsAndFlow(stockCode, 5),
    ]);

    return {
      basic: market,
      financial,
      reports,
      announcements,
      newsFlow,
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw new Error(`Failed to fetch data for stock ${stockCode}: ${error.message}`);
  }
}

/**
 * 计算平均目标价
 * @param {Array} reports - 研报数组
 * @returns {number} 平均目标价
 */
function calculateAvgTargetPrice(reports) {
  if (!reports || reports.length === 0) {
    return 0;
  }
  const sum = reports.reduce((acc, report) => acc + report.target_price, 0);
  return parseFloat((sum / reports.length).toFixed(2));
}

/**
 * 格式化金额显示
 * @param {number} amount - 金额（元）
 * @returns {string} 格式化后的金额字符串
 */
function formatAmount(amount) {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(2)}亿`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(2)}万`;
  }
  return amount.toFixed(2);
}

module.exports = {
  fetchCompleteStockData,
  calculateAvgTargetPrice,
  formatAmount,
  MiaoxiangAPI,
};
