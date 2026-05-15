---
name: stock-analysis-skill
description: 基于大数据的股市行情分析技能，提供大势研判、个股挖掘、个性化投资策略和突发风险应急预案。当用户提到股票分析、股情挖掘、投资策略、风险控制、大盘走势、个股推荐时必须使用此技能。
dependency:
  npm:
    - axios@^1.6.0
    - lodash@^4.17.21
  system:
    - pip3 install pandas numpy matplotlib
---

# 大数据股情分析平台

## 任务目标
- 本 Skill 用于: 提供全面的股市行情分析和投资决策支持
- 能力: 大势研判、个股挖掘、个性化投资策略、突发风险应急预案
- 触发: 股票分析、股情挖掘、投资策略、风险控制、大盘走势、个股推荐

## 前置准备
- 依赖说明: axios用于数据获取，lodash用于数据处理，pandas/numpy/matplotlib用于数据分析
- 非标准文件准备: 需要配置数据源API密钥

## 操作步骤
1. 输入/准备: 获取用户关注的股票或市场信息
   - 调用 `scripts/fetch-market-data.js` 获取实时市场数据
2. 执行/处理: 分析市场趋势和个股情况
   - 调用 `scripts/analyze-trend.py` 进行趋势分析
   - 调用 `scripts/analyze-stock.py` 进行个股分析
3. 输出/校验: 生成分析报告和建议
   - 调用 `scripts/generate-report.js` 生成可视化报告

## 资源索引

### 脚本工具
- **[scripts/fetch-market-data.js](scripts/fetch-market-data.js)**
  - 用途: 获取实时市场数据和个股信息
  - 触发时机: 当需要获取股票市场数据时，**必须调用此脚本**
- **[scripts/analyze-trend.py](scripts/analyze-trend.py)**
  - 用途: 分析市场整体趋势和大势走向
  - 触发时机: 当需要分析大盘走势时，**必须调用此脚本**
- **[scripts/analyze-stock.py](scripts/analyze-stock.py)**
  - 用途: 分析个股基本面和技术面
  - 触发时机: 当需要分析特定股票时，**必须调用此脚本**
- **[scripts/generate-report.js](scripts/generate-report.js)**
  - 用途: 生成可视化的分析报告
  - 触发时机: 当需要输出分析结果时，**必须调用此脚本**

### 参考文档
- **[references/market-analysis-framework.md](references/market-analysis-framework.md)**
  - 内容: 市场分析框架和方法论
  - 使用时机: 在进行市场分析前，**必须先读取此文档**
  - 关键作用: 确保分析方法的科学性和系统性
- **[references/risk-management-strategies.md](references/risk-management-strategies.md)**
  - 内容: 风险管理策略和应急预案
  - 使用时机: 在制定投资策略前，**必须先读取此文档**
  - 关键作用: 帮助识别和规避潜在风险

### 静态资源
- **[assets/templates/](assets/templates/)**
  - 内容: 分析报告模板和图表样式
  - 使用方式: 当生成报告时，**直接使用此资源**

## 注意事项
- **附件读取规则**：当任务涉及特定分析方法或风险模型时，**必须优先读取** references/ 中的相关文档，不要凭推测执行
- **脚本调用规则**：遇到数据获取、复杂计算或报告生成时，**立即调用** scripts/ 中的对应脚本，而不是尝试自行处理
- **资源使用规则**：需要报告模板或图表样式时，**直接使用** assets/ 中的文件，不要重新创建
- 充分利用智能体能力，避免为简单任务编写脚本