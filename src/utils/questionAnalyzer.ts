export type QuestionType = 
  | 'comprehensive' | 'valuation' | 'financial' | 'competitive' | 'growth'
  | 'industry' | 'management' | 'risk' | 'comparison' | 'longterm' | 'portfolio';

export interface AnalysisTask {
  type: QuestionType;
  tools: string[];
  priority: number;
  description: string;
}

const questionPatterns: Record<QuestionType, string[]> = {
  comprehensive: ['全面分析', '投资价值', '综合分析', '整体评估', '价值投资'],
  valuation: ['估值', '内在价值', '安全边际', 'PE', 'PB', 'DCF', '价格', '合理价位'],
  financial: ['财务', '盈利能力', '负债率', '现金流', 'ROE', '毛利率', '财务健康', 'ROA'],
  competitive: ['竞争优势', '护城河', '竞争力', '市场地位', '核心竞争力', '壁垒'],
  growth: ['增长', '成长', '营收增长', '利润增长', '未来', '增速'],
  industry: ['行业', '前景', '趋势', '机遇', '挑战', '赛道', '周期'],
  management: ['管理层', '团队', '治理', '资本配置', '高管', '创始人'],
  risk: ['风险', '危险', '隐患', '应对', '风控', '波动', '回撤'],
  comparison: ['对比', '比较', 'vs', 'versus', '竞争对手', '同行', '竞品'],
  longterm: ['长期', '持有', '5年', '10年', '价值投资', '定投'],
  portfolio: ['组合', '持仓', '配置', '仓位', '资产', '分散']
};

const toolChains: Record<QuestionType, { tools: string[]; description: string }> = {
  comprehensive: {
    tools: ['stockApi', 'financialCalculator', 'valuationEngine', 'riskAnalyzer', 'aiReport'],
    description: '全面评估：基础数据(快)→财务分析(快)→估值计算(中)→风险评估(中)→AI综合报告(慢)'
  },
  valuation: {
    tools: ['stockApi', 'financialCalculator', 'valuationEngine', 'aiReport'],
    description: '估值判断：基础数据(快)→财务指标(快)→估值模型(中)→AI估值报告(慢)'
  },
  financial: {
    tools: ['stockApi', 'financialCalculator', 'aiReport'],
    description: '财务健康：基础数据(快)→财务计算(快)→AI财务诊断(慢)'
  },
  competitive: {
    tools: ['stockApi', 'stockIntelligence', 'aiReport'],
    description: '竞争优势：基础数据(快)→情报分析(中)→AI护城河评估(慢)'
  },
  growth: {
    tools: ['stockApi', 'financialCalculator', 'aiReport'],
    description: '成长性分析：基础数据(快)→财务趋势(快)→AI成长评估(慢)'
  },
  industry: {
    tools: ['stockApi', 'stockSentiment', 'aiReport'],
    description: '行业前景：基础数据(快)→舆情监测(快)→AI行业分析(慢)'
  },
  management: {
    tools: ['stockApi', 'stockIntelligence', 'aiReport'],
    description: '管理层评估：基础数据(快)→管理层情报(中)→AI管理评估(慢)'
  },
  risk: {
    tools: ['stockApi', 'riskAnalyzer', 'aiReport'],
    description: '风险识别：基础数据(快)→风险量化(中)→AI风险报告(慢)'
  },
  comparison: {
    tools: ['stockApi', 'valuationEngine', 'aiReport'],
    description: '对比分析：基础数据(快)→估值比较(中)→AI对比报告(慢)'
  },
  longterm: {
    tools: ['stockApi', 'financialCalculator', 'aiReport'],
    description: '长期价值：基础数据(快)→财务稳健性(快)→AI长期评估(慢)'
  },
  portfolio: {
    tools: ['stockApi', 'riskAnalyzer', 'aiReport'],
    description: '组合分析：持仓数据(快)→组合风险(中)→AI优化建议(慢)'
  }
};

export function analyzeQuestion(question: string): AnalysisTask[] {
  const q = question.toLowerCase();
  
  const matchedTypes: QuestionType[] = [];
  
  (Object.keys(questionPatterns) as QuestionType[]).forEach(type => {
    const patterns = questionPatterns[type];
    if (patterns.some(p => q.includes(p.toLowerCase()))) {
      matchedTypes.push(type);
    }
  });

  if (matchedTypes.length === 0) {
    matchedTypes.push('comprehensive');
  }

  const tasks: AnalysisTask[] = matchedTypes.map((type, index) => ({
    type,
    tools: toolChains[type].tools,
    priority: index + 1,
    description: toolChains[type].description
  }));

  return tasks;
}

export function getToolExecutionOrder(tasks: AnalysisTask[]): string[] {
  const allTools = tasks.flatMap(t => t.tools);
  return [...new Set(allTools)];
}
