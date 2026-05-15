export interface QuickAnalysisResult {
  coreConclusion: string;
  background: string;
  positiveFactors: string[];
  negativeFactors: string[];
  marketPerformance: string;
  valuation: string;
  opportunities: string[];
  risks: string[];
  recommendation: {
    position: string;
    priceRange: string;
    timeframe: string;
  };
}

export interface DeepAnalysisResult {
  overview: {
    target: string;
    timeRange: string;
    assumptions: string[];
  };
  layerAnalysis: {
    layer1: string;
    layer2: string;
    layer3: string;
  };
  scenarios: {
    optimistic: { condition: string; result: string };
    baseline: { condition: string; result: string };
    pessimistic: { condition: string; result: string };
  };
  keyVariables: {
    catalysts: string[];
    risks: string[];
  };
  confidence: {
    level: 'high' | 'medium' | 'low';
    riskPoints: string[];
  };
  investmentAdvice: {
    logic: string;
    targetPrice: number;
    stopLoss: number;
    timeframe: string;
  };
}

export interface WallStreetAnalysisResult {
  summary: {
    conclusion: string;
    position: string;
    expectedReturn: string;
    riskWarning: string;
  };
  researcher: {
    macro: string;
    industry: string;
    business: string;
    financial: string;
    valuation: string;
  };
  portfolioManager: {
    logic: string;
    riskReturn: string;
    portfolioFit: string;
    allocation: string;
    timeframe: string;
  };
  trader: {
    entryRange: string;
    targetPrice: number;
    stopLoss: number;
    execution: string;
  };
  riskManager: {
    singleRisk: string;
    portfolioImpact: string;
    hedgeSuggestion: string;
  };
}

export class InvestmentAnalyzer {
  quickAnalyze(stockData: any): QuickAnalysisResult {
    const { basic, financial } = stockData;
    const pe = basic.pe_ttm;
    const roe = financial.roe;
    
    return {
      coreConclusion: `${basic.name}当前PE(${pe}倍)处于${pe < 20 ? '低估' : pe < 40 ? '合理' : '高估'}区间，ROE(${roe}%)${roe > 15 ? '优秀' : '良好'}，建议${pe < 25 && roe > 12 ? '买入' : '观望'}。`,
      background: `${basic.name}(${basic.code})当前股价¥${basic.price}，市值${(basic.market_cap / 1e8).toFixed(0)}亿，属于${basic.market_cap > 1e11 ? '大盘' : '中盘'}蓝筹股。`,
      positiveFactors: [
        `ROE达${roe}%，股东回报${roe > 15 ? '优秀' : '良好'}`,
        `毛利率${financial.gross_margin}%，盈利能力${financial.gross_margin > 40 ? '强劲' : '稳健'}`,
        `营收增长${financial.revenue_growth}%，业绩${financial.revenue_growth > 20 ? '高增' : '稳健'}`
      ],
      negativeFactors: [
        `PE(${pe}倍)处于${pe > 40 ? '历史高位' : '中等水平'}`,
        `净利润增长${financial.profit_growth}%${financial.profit_growth < 10 ? '放缓' : ''}`,
        '宏观经济波动风险'
      ],
      marketPerformance: `近期${basic.change_percent > 0 ? '上涨' : '下跌'}${Math.abs(basic.change_percent)}%，成交量${basic.change_percent > 5 ? '放大' : '平稳'}。`,
      valuation: `当前PE(${pe}倍)${pe < 20 ? '低于' : pe < 40 ? '接近' : '高于'}行业平均，PB(${basic.pb}倍)${basic.pb < 3 ? '合理' : '偏高'}。`,
      opportunities: ['估值修复机会', '业绩持续增长', '行业景气度提升'],
      risks: ['估值回调风险', '业绩不及预期', '宏观政策变化'],
      recommendation: {
        position: pe < 25 && roe > 12 ? '重仓(>10%)' : pe < 35 ? '中仓(5-10%)' : '轻仓(<5%)',
        priceRange: `¥${(basic.price * 0.9).toFixed(2)}-¥${(basic.price * 1.2).toFixed(2)}`,
        timeframe: '6-12个月'
      }
    };
  }

  deepAnalyze(stockData: any): DeepAnalysisResult {
    const { basic, financial } = stockData;
    const marginOfSafety = ((basic.price * 1.1 - basic.price) / (basic.price * 1.1)) * 100;
    
    return {
      overview: {
        target: basic.name,
        timeRange: '未来12个月',
        assumptions: ['宏观经济稳定', '行业政策无重大变化', '公司管理层稳定']
      },
      layerAnalysis: {
        layer1: `直接因素：当前PE(${basic.pe_ttm}倍)估值${basic.pe_ttm < 25 ? '合理' : '偏高'}，ROE(${financial.roe}%)${financial.roe > 15 ? '优秀' : '良好'}。`,
        layer2: `传导机制：业绩${financial.profit_growth > 20 ? '高增长' : '稳健增长'}→估值修复→股价上行。`,
        layer3: `系统性影响：行业景气度${financial.revenue_growth > 15 ? '向上' : '平稳'}，龙头地位稳固。`
      },
      scenarios: {
        optimistic: { 
          condition: '业绩超预期+估值修复', 
          result: `目标价¥${(basic.price * 1.4).toFixed(2)}，涨幅40%` 
        },
        baseline: { 
          condition: '业绩符合预期', 
          result: `目标价¥${(basic.price * 1.15).toFixed(2)}，涨幅15%` 
        },
        pessimistic: { 
          condition: '业绩不及预期+估值压缩', 
          result: `目标价¥${(basic.price * 0.85).toFixed(2)}，跌幅15%` 
        }
      },
      keyVariables: {
        catalysts: ['季度业绩超预期', '行业政策利好', '分红比例提升'],
        risks: ['原材料成本上涨', '需求下滑', '竞争加剧']
      },
      confidence: {
        level: financial.roe > 15 && marginOfSafety > 10 ? 'high' : 'medium',
        riskPoints: ['估值波动风险', '业绩不确定性']
      },
      investmentAdvice: {
        logic: `${basic.name}具备${financial.roe > 15 ? '高ROE护城河' : '稳健盈利能力'}，${marginOfSafety > 0 ? '当前具备安全边际' : '估值偏高需等待'}。`,
        targetPrice: basic.price * 1.15,
        stopLoss: basic.price * 0.88,
        timeframe: '6-12个月'
      }
    };
  }

  wallStreetAnalyze(stockData: any): WallStreetAnalysisResult {
    const { basic, financial } = stockData;
    const targetPrice = basic.price * 1.15;
    
    return {
      summary: {
        conclusion: `${basic.name}(${basic.code})${financial.roe > 15 ? '具备长期投资价值' : '适合稳健配置'}。`,
        position: financial.roe > 15 && basic.pe_ttm < 30 ? '核心仓位' : '卫星仓位',
        expectedReturn: '预期年化收益15-20%',
        riskWarning: '关注估值回调及业绩波动风险'
      },
      researcher: {
        macro: '宏观经济稳中向好，货币政策保持适度宽松。',
        industry: '行业集中度提升，龙头企业受益。',
        business: `${basic.name}具备品牌护城河，市场份额稳定。`,
        financial: `ROE(${financial.roe}%)${financial.roe > 15 ? '优秀' : '良好'}，现金流充沛。`,
        valuation: `PE(${basic.pe_ttm}倍)${basic.pe_ttm < 25 ? '低估' : basic.pe_ttm < 40 ? '合理' : '偏高'}。`
      },
      portfolioManager: {
        logic: `${financial.roe > 15 ? '高ROE' : '稳健'}蓝筹股，${basic.dividend_yield > 2 ? '分红稳定' : '成长性好'}。`,
        riskReturn: '风险收益比良好，适合中长期持有。',
        portfolioFit: '与现有持仓相关性低，分散效果好。',
        allocation: financial.roe > 15 ? '核心仓位10-15%' : '卫星仓位5-8%',
        timeframe: '中长期(1-3年)'
      },
      trader: {
        entryRange: `¥${(basic.price * 0.95).toFixed(2)}-¥${(basic.price * 1.02).toFixed(2)}`,
        targetPrice: targetPrice,
        stopLoss: basic.price * 0.88,
        execution: '分批建仓，回调买入'
      },
      riskManager: {
        singleRisk: `波动率约${(20).toFixed(0)}%，VaR(95%)约${(basic.price * 0.05).toFixed(2)}元。`,
        portfolioImpact: '单一标的仓位建议不超过15%。',
        hedgeSuggestion: '可配置防御性板块对冲系统性风险。'
      }
    };
  }

  comprehensiveAnalysis(stockData: any) {
    return {
      quick: this.quickAnalyze(stockData),
      deep: this.deepAnalyze(stockData),
      wallstreet: this.wallStreetAnalyze(stockData),
      timestamp: new Date().toISOString()
    };
  }
}

export const investmentAnalyzer = new InvestmentAnalyzer();
