---
name: investment-analyzer
description: 专业投资分析技能，支持宏观/行业/个股/事件多维度投研分析。当用户询问股票分析、行业研究、宏观经济、投资决策、风险评估、财报解读时必须使用此技能。提供AI快速分析、深度思考和华尔街投研四角色交叉验证三种分析模式。
dependency:
  npm:
    - axios@^1.6.0
    - cheerio@^1.0.0-rc.12
  system:
    - pip3 install pandas numpy requests beautifulsoup4
  env:
    - TUSHARE_TOKEN: Tushare API Token（可选，用于获取专业金融数据）
---

# Investment Analyzer - 专业投资分析技能

## 任务目标

本技能用于提供机构级投资研究分析，支持三种分析模式：
- **AI-快速分析**：简洁高效的投资观点输出
- **AI-深度思考**：基于DeepSeek R1逻辑的深度分析
- **华尔街投研**：研究员/基金经理/交易员/风控四角色交叉验证

## 能力范围

### 分析类型
1. **宏观分析**：经济周期、货币政策、利率汇率、地缘政治
2. **行业分析**：行业周期、竞争格局、政策支持、供需格局
3. **个股分析**：基本面、财务指标、估值、竞争壁垒
4. **事件分析**：政策落地、地缘政治、突发新闻、并购重组
5. **商品分析**：供需格局、价格趋势、库存周期

### 输出报告类型
- 快速投资观点（1-2页）
- 深度研究报告（多维度分析）
- 四角色交叉验证报告（机构级）

## 前置准备

### 依赖安装
- npm: axios, cheerio（网络请求与数据解析）
- system: pandas, numpy, requests, beautifulsoup4（数据处理）

### 数据获取
- **美股/全球市场**：调用 `scripts/data_fetcher.py` 获取Yahoo Finance数据
- **A股实时行情**：调用 `scripts/sina_stock_api.py` 获取新浪财经数据（免费、实时）
- **A股专业数据**：调用 `scripts/tushare_data_api.py` 获取Tushare数据（需Token）
- **财务指标计算**：调用 `scripts/financial_calculator.py`
- **估值分析**：调用 `scripts/valuation_engine.py`

## 操作步骤

### 步骤1：问题分类与框架选择
1. 识别问题类型（宏观/行业/个股/事件/商品/财务）
2. 选择分析模式（快速/深度/四角色）
3. 确定输出结构

### 步骤2：数据获取与验证
1. **根据市场选择数据源**：
   - A股实时行情：**必须调用** `scripts/sina_stock_api.py`
   - A股专业数据（财务/历史）：**必须调用** `scripts/tushare_data_api.py`
   - 美股/全球市场：**必须调用** `scripts/data_fetcher.py`
2. **必须调用** `scripts/financial_calculator.py` 计算关键指标
3. **必须调用** `scripts/valuation_engine.py` 进行估值分析
4. 数据交叉验证，确保准确性（容错率要求极高）

### 步骤3：分析执行
1. 读取 `references/analysis-framework.md` 获取分析框架
2. 根据问题类型选择对应分析模板
3. 执行多维度分析

### 步骤4：报告生成
1. 使用 `assets/report-templates/` 中的模板格式化输出
2. 生成结构化投资分析报告

## 资源索引

### 脚本工具
- **[scripts/data_fetcher.py](scripts/data_fetcher.py)**
  - 用途：获取股票、指数、宏观经济数据（国际数据源）
  - 触发时机：当需要获取美股/全球市场数据时，**必须调用此脚本**
  - 数据源：Yahoo Finance、Alpha Vantage等
  - 输出格式：标准化JSON数据

- **[scripts/sina_stock_api.py](scripts/sina_stock_api.py)**
  - 用途：获取A股实时行情与基础数据
  - 触发时机：当需要获取A股实时行情、市场概览时，**必须调用此脚本**
  - 数据源：新浪财经API（免费、实时、开箱即用）
  - 功能：实时行情、批量查询、市场指数、基础财务数据
  - 特点：无需API Key，适合日常快速查看个股概况

- **[scripts/tushare_data_api.py](scripts/tushare_data_api.py)**
  - 用途：获取专业级金融数据
  - 触发时机：当需要获取详细财务数据、历史K线、资金流向、宏观经济数据时，**必须调用此脚本**
  - 数据源：Tushare Pro（225+专业金融API）
  - 功能：日线/分钟线行情、财务报表、财务指标、估值数据、资金流向、龙虎榜、宏观数据
  - 注意：需要注册获取API Token（https://tushare.pro）

- **[scripts/financial_calculator.py](scripts/financial_calculator.py)**
  - 用途：计算财务指标（ROE、ROIC、毛利率、净利率等）
  - 触发时机：当需要计算财务指标时，**必须调用此脚本**
  - 功能：财务比率计算、趋势分析、同业对比

- **[scripts/valuation_engine.py](scripts/valuation_engine.py)**
  - 用途：估值模型计算（PE、PB、DCF、EV/EBITDA等）
  - 触发时机：当需要进行估值分析时，**必须调用此脚本**
  - 功能：多模型估值、敏感性分析、估值区间计算

- **[scripts/risk_analyzer.py](scripts/risk_analyzer.py)**
  - 用途：风险指标计算（VaR、波动率、最大回撤等）
  - 触发时机：当需要进行风险评估时，**必须调用此脚本**
  - 功能：风险度量、压力测试、尾部风险分析

### 参考文档
- **[references/analysis-framework.md](references/analysis-framework.md)**
  - 内容：三种分析模式的完整框架定义
  - 使用时机：在执行任何分析前，**必须先读取此文档**
  - 关键作用：确保分析结构符合专业投研标准

- **[references/macro-indicators.md](references/macro-indicators.md)**
  - 内容：宏观经济指标定义与解读方法
  - 使用时机：在进行宏观分析前，**必须先读取此文档**
  - 关键作用：提供标准化的宏观分析维度

- **[references/industry-metrics.md](references/industry-metrics.md)**
  - 内容：各行业关键指标字典（KPI Dictionary）
  - 使用时机：在进行行业分析前，**必须先读取此文档**
  - 关键作用：提供行业特定的分析指标

- **[references/valuation-methods.md](references/valuation-methods.md)**
  - 内容：估值方法详解与适用场景
  - 使用时机：在进行估值分析前，**必须先读取此文档**
  - 关键作用：确保估值方法选择正确

- **[references/risk-framework.md](references/risk-framework.md)**
  - 内容：风险评估框架与风控指标
  - 使用时机：在进行风险评估前，**必须先读取此文档**
  - 关键作用：提供标准化的风险分析维度

### 静态资源
- **[assets/report-templates/](assets/report-templates/)**
  - 内容：分析报告输出模板
  - 使用方式：当生成报告时，**直接使用此目录下的模板**
  - 包含：快速分析模板、深度分析模板、四角色报告模板

## 注意事项

### 数据质量控制（关键）
- **容错率要求极高**：所有数据必须经过交叉验证
- 当数据存在异常时，必须标注并说明数据来源
- 价格数据保留2位小数，比率数据保留2位小数（百分比形式）
- 财务数据必须与官方财报一致

### 附件读取规则
- 在执行分析前，**必须优先读取** references/ 中的相关文档
- 不同分析类型对应不同的参考文档，不要凭推测执行

### 脚本调用规则
- 数据获取和计算任务**必须调用** scripts/ 中的对应脚本
- 不要尝试自行处理复杂的数据计算

### 分析框架选择
| 用户问题特征 | 推荐模式 |
|-------------|---------|
| "怎么看XX？"、"简单分析" | AI-快速分析 |
| "深度研究"、"详细分析" | AI-深度思考 |
| "机构视角"、"专业报告" | 华尔街投研四角色 |

### 输出规范
- 核心结论必须放在最前面
- 投资建议必须包含具体的价格区间和仓位建议
- 风险提示必须明确列出主要风险点