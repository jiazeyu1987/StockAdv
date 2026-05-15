const fs = require('fs');

// 负面关键词库
const NEGATIVE_KEYWORDS = {
  // 监管处罚类
  regulatory: ['处罚', '罚款', '违规', '立案调查', '监管函', '警示函', '责令改正', '行政处罚', '市场禁入'],
  
  // 财务风险类
  financial: ['亏损', '业绩下滑', '营收下降', '利润下滑', '资不抵债', '债务违约', '破产', '退市风险', 'ST'],
  
  // 经营风险类
  operational: ['停产', '停工', '裁员', '高管离职', '核心人员流失', '业务收缩', '订单取消', '客户流失'],
  
  // 法律诉讼类
  legal: ['诉讼', '仲裁', '赔偿', '败诉', '强制执行', '冻结', '查封', '扣押'],
  
  // 负面舆情类
  reputation: ['造假', '欺诈', '内幕交易', '操纵市场', '虚假宣传', '质量问题', '安全事故', '环境污染'],
  
  // 市场信号类
  market: ['减持', '清仓', '抛售', '评级下调', '目标价下调', '看空', '卖出评级']
};

// 正面关键词库（用于对比）
const POSITIVE_KEYWORDS = [
  '业绩增长', '利润上升', '营收增长', '订单增加', '扩产', '增持', '买入评级', '目标价上调', '看好'
];

function analyzeSentiment(newsList, stockCode, stockName) {
  const results = {
    stockCode,
    stockName,
    totalNews: newsList.length,
    negativeCount: 0,
    positiveCount: 0,
    neutralCount: 0,
    riskScore: 0,
    riskLevel: 'low',
    riskCategories: [],
    flaggedNews: []
  };
  
  const categoryScores = {};
  
  for (const news of newsList) {
    const content = `${news.title} ${news.content || ''}`;
    let newsSentiment = 'neutral';
    let newsRiskScore = 0;
    const matchedCategories = [];
    
    // 检查负面关键词
    for (const [category, keywords] of Object.entries(NEGATIVE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          newsSentiment = 'negative';
          // 根据风险类别赋予不同权重
          const weights = {
            regulatory: 25,  // 监管处罚权重最高
            reputation: 25,  // 负面舆情权重高
            financial: 20,   // 财务风险权重较高
            legal: 20,       // 法律诉讼权重较高
            operational: 15, // 经营风险权重中等
            market: 10       // 市场信号权重较低
          };
          newsRiskScore += weights[category] || 10;
          if (!matchedCategories.includes(category)) {
            matchedCategories.push(category);
          }
          categoryScores[category] = (categoryScores[category] || 0) + 1;
        }
      }
    }
    
    // 检查正面关键词
    for (const keyword of POSITIVE_KEYWORDS) {
      if (content.includes(keyword)) {
        if (newsSentiment === 'neutral') {
          newsSentiment = 'positive';
        }
        newsRiskScore -= 5;
      }
    }
    
    // 确保风险分数不为负
    newsRiskScore = Math.max(0, newsRiskScore);
    
    // 统计
    if (newsSentiment === 'negative') {
      results.negativeCount++;
      results.flaggedNews.push({
        title: news.title,
        date: news.date,
        source: news.source,
        riskScore: newsRiskScore,
        categories: matchedCategories
      });
    } else if (newsSentiment === 'positive') {
      results.positiveCount++;
    } else {
      results.neutralCount++;
    }
    
    results.riskScore += newsRiskScore;
  }
  
  // 计算风险分数 - 使用加权累加而非平均
  // 基础分数 + 负面新闻数量加成 + 风险类别多样性加成
  if (results.totalNews > 0) {
    const baseScore = results.riskScore;
    const negativeRatio = results.negativeCount / results.totalNews;
    const categoryBonus = Object.keys(categoryScores).length * 10;

    // 综合评分：基础分 * 负面比例 + 类别加成
    let finalScore = Math.round(baseScore * negativeRatio + categoryBonus);
    results.riskScore = Math.min(100, finalScore);
  }
  
  // 确定风险等级
  if (results.riskScore >= 70) {
    results.riskLevel = 'high';
  } else if (results.riskScore >= 40) {
    results.riskLevel = 'medium';
  } else {
    results.riskLevel = 'low';
  }
  
  // 风险类别排序
  results.riskCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      category,
      count,
      keywords: NEGATIVE_KEYWORDS[category]
    }));
  
  return results;
}

function main() {
  const newsDataPath = process.argv[2];
  
  if (!newsDataPath) {
    console.error('用法: node analyze-sentiment.js <新闻数据JSON文件路径>');
    process.exit(1);
  }
  
  try {
    const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));
    
    if (!newsData.success) {
      throw new Error(newsData.error || '新闻数据获取失败');
    }
    
    const result = analyzeSentiment(newsData.news, newsData.stockCode, newsData.stockName);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2));
    process.exit(1);
  }
}

main();
