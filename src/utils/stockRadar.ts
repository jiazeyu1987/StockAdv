export interface MacroAnalysis {
  monetaryPolicy: {
    trend: '宽松' | '中性' | '紧缩';
    liquidity: number;
    assessment: string;
  };
  policyDirection: {
    supportSectors: string[];
    openingUp: string;
    assessment: string;
  };
  regulatory: {
    stance: '支持' | '中性' | '收紧';
    marketSentiment: number;
    assessment: string;
  };
}

export interface IndustryAnalysis {
  lifeCycle: '导入期' | '成长期' | '成熟期' | '衰退期';
  competition: '分散' | '集中' | '垄断';
  policyImpact: string;
  upstream: { bargaining: '强' | '中' | '弱'; keyFactors: string[] };
  downstream: { bargaining: '强' | '中' | '弱'; keyFactors: string[] };
}

export interface TechnicalAnalysis {
  trend: '上升' | '下降' | '震荡';
  maSignal: '买入' | '卖出' | '观望';
  rsi: number;
  macd: '金叉' | '死叉' | '中性';
  supportLevel: number;
  resistanceLevel: number;
}

export interface SentimentAnalysis {
  marketSentiment: '乐观' | '中性' | '悲观';
  volumeTrend: '放大' | '萎缩' | '平稳';
  advanceDeclineRatio: number;
  mainForceFlow: '流入' | '流出' | '平衡';
}

export interface RiskAnalysis {
  policyRisk: { level: '高' | '中' | '低'; factors: string[] };
  trendRisk: { level: '高' | '中' | '低'; factors: string[] };
  eventRisk: { level: '高' | '中' | '低'; factors: string[] };
  stockSpecificRisk: { level: '高' | '中' | '低'; factors: string[] };
  sentimentRisk: { level: '高' | '中' | '低'; factors: string[] };
}

export interface RadarReport {
  macro: MacroAnalysis;
  industry: IndustryAnalysis;
  technical: TechnicalAnalysis;
  sentiment: SentimentAnalysis;
  risk: RiskAnalysis;
  overallScore: number;
  recommendation: string;
}

export class StockRadar {
  analyzeMacro(): MacroAnalysis {
    return {
      monetaryPolicy: {
        trend: '中性',
        liquidity: 65,
        assessment: '流动性合理充裕，支持实体经济'
      },
      policyDirection: {
        supportSectors: ['科技', '消费', '新能源'],
        openingUp: '持续扩大对外开放',
        assessment: '政策面整体友好，利好优质企业'
      },
      regulatory: {
        stance: '支持',
        marketSentiment: 70,
        assessment: '监管态度积极，市场信心稳定'
      }
    };
  }

  analyzeIndustry(sector: string): IndustryAnalysis {
    return {
      lifeCycle: '成长期',
      competition: '集中',
      policyImpact: '政策支持力度大，发展前景良好',
      upstream: { bargaining: '中', keyFactors: ['原材料价格', '供应链稳定性'] },
      downstream: { bargaining: '弱', keyFactors: ['品牌影响力', '渠道覆盖'] }
    };
  }

  analyzeTechnical(price: number, history: number[]): TechnicalAnalysis {
    const avg20 = history.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const avg60 = history.slice(-60).reduce((a, b) => a + b, 0) / 60;
    const trend = price > avg20 && avg20 > avg60 ? '上升' : price < avg20 ? '下降' : '震荡';
    return {
      trend,
      maSignal: price > avg20 ? '买入' : '卖出',
      rsi: 55,
      macd: '金叉',
      supportLevel: price * 0.9,
      resistanceLevel: price * 1.1
    };
  }

  analyzeSentiment(): SentimentAnalysis {
    return {
      marketSentiment: '乐观',
      volumeTrend: '放大',
      advanceDeclineRatio: 1.5,
      mainForceFlow: '流入'
    };
  }

  analyzeRisk(): RiskAnalysis {
    return {
      policyRisk: { level: '低', factors: ['政策稳定', '监管友好'] },
      trendRisk: { level: '中', factors: ['市场波动', '宏观不确定性'] },
      eventRisk: { level: '中', factors: ['地缘政治', '突发事件'] },
      stockSpecificRisk: { level: '低', factors: ['基本面稳健', '财务健康'] },
      sentimentRisk: { level: '低', factors: ['情绪稳定', '理性投资'] }
    };
  }

  generateReport(stockCode: string, price: number, history: number[]): RadarReport {
    const macro = this.analyzeMacro();
    const industry = this.analyzeIndustry('default');
    const technical = this.analyzeTechnical(price, history);
    const sentiment = this.analyzeSentiment();
    const risk = this.analyzeRisk();

    const overallScore = this.calculateScore(macro, industry, technical, sentiment, risk);

    return {
      macro,
      industry,
      technical,
      sentiment,
      risk,
      overallScore,
      recommendation: overallScore > 70 ? '强烈买入' : overallScore > 50 ? '买入' : overallScore > 30 ? '持有' : '观望'
    };
  }

  private calculateScore(m: MacroAnalysis, i: IndustryAnalysis, t: TechnicalAnalysis, s: SentimentAnalysis, r: RiskAnalysis): number {
    let score = 50;
    if (m.monetaryPolicy.trend === '宽松') score += 10;
    if (m.regulatory.stance === '支持') score += 10;
    if (i.lifeCycle === '成长期') score += 10;
    if (t.trend === '上升') score += 10;
    if (s.marketSentiment === '乐观') score += 10;
    if (r.policyRisk.level === '低') score += 5;
    return Math.min(100, Math.max(0, score));
  }
}

export const stockRadar = new StockRadar();
