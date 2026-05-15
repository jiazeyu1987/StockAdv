---
name: stock-sentiment-monitor
description: 监控股票舆情风险，自动抓取公开信息并分析负面新闻。当用户提到股票舆情、风险监控、负面新闻、舆情分析、股票风险、舆情监控时必须使用此技能。
dependency:
  npm:
    - axios@^1.6.0
    - xlsx@^0.18.5
    - cheerio@^1.0.0-rc.12
  system:
    - mkdir -p /tmp/stock-monitor
---

# 股票舆情风险监控

## 任务目标
- 本 Skill 用于：批量监控股票舆情风险，自动抓取公开信息并分析负面新闻
- 能力：
  - 读取 Excel 股票列表
  - 抓取股票相关新闻和公告
  - 分析舆情情感倾向
  - 识别重大负面风险
  - 生成风险报告
- 触发：当用户需要监控股票舆情、分析股票风险、批量检查负面新闻时使用

## 前置准备
- 依赖说明：axios 用于 HTTP 请求，xlsx 用于 Excel 处理，cheerio 用于 HTML 解析
- 非标准文件准备：确保系统临时目录存在

## 操作步骤

### 1. 读取股票列表
- 接收用户提供的 Excel 文件路径
- 调用 `scripts/parse-stocks.js` 解析股票代码列表
- 支持格式：股票代码列（如 600000、000001）或股票名称列

### 2. 抓取公开信息
- 对每个股票代码，调用 `scripts/fetch-news.js` 抓取近期新闻
- 数据来源：财经新闻网站、交易所公告、公司公告等
- 抓取时间范围：最近 7-30 天

### 3. 舆情分析
- 调用 `scripts/analyze-sentiment.js` 分析新闻情感倾向
- 识别关键词：负面词汇、风险信号、监管处罚、业绩下滑等
- 计算风险评分：0-100 分，分数越高风险越大

### 4. 生成风险报告
- 汇总所有股票的风险分析结果
- 标记高风险股票（风险评分 > 70）
- 输出 Excel 报告，包含风险详情和建议

## 资源索引

### 脚本工具
- **[scripts/parse-stocks.js](scripts/parse-stocks.js)**
  - 用途：解析 Excel 文件，提取股票代码列表
  - 触发时机：当用户提供股票列表 Excel 文件时，**必须调用此脚本**

- **[scripts/fetch-news.js](scripts/fetch-news.js)**
  - 用途：抓取股票相关新闻和公告
  - 触发时机：当需要获取股票公开信息时，**必须调用此脚本**

- **[scripts/analyze-sentiment.js](scripts/analyze-sentiment.js)**
  - 用途：分析新闻情感倾向，识别负面舆情
  - 触发时机：当获取到新闻数据后，**必须调用此脚本进行分析**

### 参考文档
- **[references/risk-keywords.md](references/risk-keywords.md)**
  - 内容：负面舆情关键词库和风险信号词表
  - 使用时机：在进行舆情分析前，**必须先读取此文档**
  - 关键作用：确保风险识别的准确性和全面性

- **[references/data-sources.md](references/data-sources.md)**
  - 内容：可用的数据源列表和 API 说明
  - 使用时机：在抓取新闻前，**必须先读取此文档**
  - 关键作用：了解可用的数据来源和抓取策略

## 注意事项
- **附件读取规则**：当任务涉及舆情分析时，**必须优先读取** references/risk-keywords.md 了解风险识别标准
- **脚本调用规则**：遇到数据抓取、格式转换、复杂分析时，**立即调用** scripts/ 中的对应脚本
- **资源使用规则**：需要了解数据源和风险词库时，**直接使用** references/ 中的文档
- 充分利用智能体能力进行文本分析和风险判断
- 注意遵守相关网站的 robots.txt 和数据使用协议
- 风险评分仅供参考，不构成投资建议