# 妙想金融助手数据源规范

## 概览
本文档定义了通过妙想金融助手获取股票数据的 API 字段结构、调用方式和解析规范。在获取任何股票数据前，必须先阅读此文档以确保正确使用各数据源。

## 核心数据源

### 1. 行情数据 (Market Data)
**API**: `get_market_data(stock_code)`

**返回字段**:
```javascript
{
  code: "600519",               // 股票代码
  name: "贵州茅台",              // 股票名称
  price: 1453.96,               // 当前价格
  change_percent: -0.45,        // 涨跌幅 (%)
  change_amount: -6.54,         // 涨跌额 (元)
  volume: 2345678,              // 成交量 (手)
  amount: 3412345678,           // 成交额 (元)
  turnover_rate: 0.19,          // 换手率 (%)
  high: 1465.00,                // 最高价
  low: 1448.00,                 // 最低价
  open: 1455.00,                // 开盘价
  prev_close: 1460.50,          // 昨收价
  support_level: 1440.00,       // 支撑位
  resistance_level: 1470.00,    // 压力位
  ma5: 1458.20,                 // 5日均线
  ma10: 1462.50,                // 10日均线
  ma20: 1475.30,                // 20日均线
  ma60: 1510.80,                // 60日均线
  rsi_6: 42.5,                  // RSI(6)
  rsi_12: 45.8,                 // RSI(12)
  macd_dif: -2.5,               // MACD DIF
  macd_dea: -1.8,               // MACD DEA
  macd_bar: -1.4,               // MACD BAR
  boll_upper: 1480.00,          // 布林带上轨
  boll_mid: 1460.00,            // 布林带中轨
  boll_lower: 1440.00,          // 布林带下轨
  pe_ttm: 20.22,                // PE(TTM)
  pe_lyr: 21.50,                // PE(LYR)
  pb: 8.5,                      // 市净率
  ps_ttm: 9.8,                  // 市销率
  dividend_yield: 2.8,          // 股息率 (%)
  market_cap: 18234567890,      // 总市值 (元)
  circulating_market_cap: 18234567890, // 流通市值 (元)
  total_shares: 1254000000,     // 总股本
  circulating_shares: 1254000000 // 流通股本
}
```

### 2. 财务数据 (Financial Data)
**API**: `get_financial_data(stock_code, period = "latest")`

**返回字段**:
```javascript
{
  revenue: 130900000000,        // 营收 (元)
  revenue_growth: 6.32,         // 营收增速 (%)
  net_profit: 65000000000,      // 净利润 (元)
  profit_growth: 5.8,           // 净利润增速 (%)
  gross_margin: 91.5,           // 毛利率 (%)
  net_margin: 49.6,             // 净利率 (%)
  roe: 28.5,                    // ROE (%)
  roa: 22.3,                    // ROA (%)
  eps: 51.8,                    // 每股收益 (元)
  bvps: 185.6,                  // 每股净资产 (元)
  operating_cash_flow: 72000000000, // 经营现金流 (元)
  free_cash_flow: 68000000000,  // 自由现金流 (元)
  asset_liability_ratio: 18.5,  // 资产负债率 (%)
  current_ratio: 4.2,           // 流动比率
  quick_ratio: 3.8,             // 速动比率
  inventory_turnover: 0.45,     // 存货周转率
  report_period: "2025Q3",      // 报告期
  yoy_revenue_q1: 5.8,          // Q1营收同比 (%)
  yoy_revenue_q2: 6.1,          // Q2营收同比 (%)
  yoy_revenue_q3: 6.32,         // Q3营收同比 (%)
  yoy_profit_q1: 5.2,           // Q1净利同比 (%)
  yoy_profit_q2: 5.5,           // Q2净利同比 (%)
  yoy_profit_q3: 5.8            // Q3净利同比 (%)
}
```

### 3. 研报数据 (Research Reports)
**API**: `get_research_reports(stock_code, limit = 5)`

**返回字段**:
```javascript
[
  {
    institution: "中信证券",
    rating: "买入",
    target_price: 1650.00,
    publish_date: "2025-04-10",
    summary: "业绩稳健增长，估值处于低位...",
  },
  {
    institution: "中金公司",
    rating: "跑赢行业",
    target_price: 1872.00,
    publish_date: "2025-04-08",
    summary: "品牌护城河深厚，长期价值凸显...",
  }
]
```

### 4. 公告数据 (Announcements)
**API**: `get_announcements(stock_code, limit = 3)`

**返回字段**:
```javascript
[
  {
    title: "2025年第一季度报告",
    date: "2025-04-12",
    type: "定期报告",
    url: "http://example.com/announcement/123",
  },
  {
    title: "关于召开股东大会的通知",
    date: "2025-04-10",
    type: "公司治理",
    url: "http://example.com/announcement/124",
  }
]
```

### 5. 资讯数据 (News & Capital Flow)
**API**: `get_news_and_flow(stock_code, limit = 5)`

**返回字段**:
```javascript
{
  news: [
    {
      title: "白酒板块持续回暖，龙头股受资金青睐",
      source: "证券时报",
      date: "2025-04-13",
      sentiment: "positive",  // positive/neutral/negative
    }
  ],
  capital_flow: {
    net_inflow: 123456789,     // 净流入 (元)
    main_force_inflow: 98765432, // 主力净流入 (元)
    retail_inflow: 24691357,   // 散户净流入 (元)
  }
}
```

## 验证规则
- 所有价格字段单位为元，保留两位小数
- 百分比字段为数值类型，不带 % 符号
- 金额字段单位为元，可能为大数
- 日期格式统一为 YYYY-MM-DD

## 约束与注意事项
- API 调用频率限制：每秒最多 5 次请求
- 部分数据可能存在延迟，以最新可用数据为准
- 研报目标价为机构预测值，仅供参考
- 资金流向数据为估算值，可能存在误差

## 示例调用

### 获取完整股票数据
```javascript
const stockCode = "600519";

// 并行获取所有数据
const [market, financial, reports, announcements, newsFlow] = await Promise.all([
  get_market_data(stockCode),
  get_financial_data(stockCode),
  get_research_reports(stockCode, 5),
  get_announcements(stockCode, 3),
  get_news_and_flow(stockCode, 5)
]);

// 整合数据用于分析
const stockData = {
  basic: market,
  financial,
  reports,
  announcements,
  newsFlow
};
```

### 计算平均目标价
```javascript
const avgTargetPrice = reports.reduce((sum, r) => sum + r.target_price, 0) / reports.length;
```
