const fs = require('fs');
const path = require('path');

/**
 * 生成分析报告
 * @param {Object} analysisData - 分析数据
 * @param {string} outputPath - 输出路径
 * @returns {string} 报告文件路径
 */
function generateReport(analysisData, outputPath = './reports') {
  try {
    // 确保输出目录存在
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // 生成报告文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `stock-analysis-${timestamp}.md`;
    const filePath = path.join(outputPath, fileName);
    
    // 生成报告内容
    const reportContent = _createReportContent(analysisData);
    
    // 写入文件
    fs.writeFileSync(filePath, reportContent, 'utf8');
    
    console.log(`报告已生成: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('生成报告失败:', error.message);
    throw error;
  }
}

/**
 * 创建报告内容
 * @param {Object} data - 分析数据
 * @returns {string} 报告内容
 */
function _createReportContent(data) {
  const { marketTrend, stockAnalysis, recommendations } = data;
  
  return `# 股市分析报告

## 生成时间
${new Date().toLocaleString('zh-CN')}

## 市场趋势分析
- 趋势方向: ${marketTrend.direction === 'up' ? '上涨' : '下跌'}
- 趋势强度: ${marketTrend.strength === 'strong' ? '强' : '弱'}
- RSI指标: ${marketTrend.rsi.toFixed(2)}
- 建议: ${marketTrend.recommendation}

## 个股分析
- 市盈率: ${stockAnalysis.pe_ratio.toFixed(2)}
- 市净率: ${stockAnalysis.pb_ratio.toFixed(2)}
- 净资产收益率: ${(stockAnalysis.roe * 100).toFixed(2)}%
- 估值评价: ${stockAnalysis.valuation}
- 盈利能力: ${stockAnalysis.profitability}
- 建议: ${stockAnalysis.recommendation}

## 投资建议
${recommendations.map(rec => `- ${rec}`).join('\n')}

---
*本报告由大数据股情分析平台生成，仅供参考，不构成投资建议。*
`;
}

module.exports = {
  generateReport
};