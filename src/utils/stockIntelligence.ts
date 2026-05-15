export interface TechnicalAnalysis {
  supportLevel: number;
  resistanceLevel: number;
  trend: '上升' | '下降' | '震荡';
  signal: '买入' | '卖出' | '观望';
  rsi: number;
  macd: '金叉' | '死叉' | '中性';
}

export interface CapitalFlow {
  mainForce: '流入' | '流出' | '平衡';
  volumeTrend: '放大' | '萎缩' | '平稳';
  score: number;
}

export interface FundamentalScore {
  quality: number;
  growth: number;
  valuation: number;
  total: number;
}

export interface StockIntelligenceResult {
  technical: TechnicalAnalysis;
  capitalFlow: CapitalFlow;
  fundamental: FundamentalScore;
  recommendation: '买入' | '持有' | '卖出';
  confidence: number;
}

export class StockIntelligence {
  analyzeTechnical(price: number, history: number[]): TechnicalAnalysis {
    const support = price * 0.92;
    const resistance = price * 1.08;
    const trend = history[history.length - 1] > history[0] ? '上升' : '下降';
    return {
      supportLevel: support,
      resistanceLevel: resistance,
      trend,
      signal: price < support * 1.02 ? '买入' : price > resistance * 0.98 ? '卖出' : '观望',
      rsi: 55,
      macd: '金叉'
    };
  }

  analyzeCapitalFlow(): CapitalFlow {
    return {
      mainForce: '流入',
      volumeTrend: '放大',
      score: 75
    };
  }

  analyzeFundamental(pe: number, roe: number, growth: number): FundamentalScore {
    const quality = roe > 15 ? 85 : 70;
    const growthScore = growth > 20 ? 80 : 65;
    const valuation = pe < 25 ? 80 : 60;
    return {
      quality,
      growth: growthScore,
      valuation,
      total: Math.round((quality + growthScore + valuation) / 3)
    };
  }

  generateReport(price: number, history: number[], pe: number, roe: number, growth: number): StockIntelligenceResult {
    const technical = this.analyzeTechnical(price, history);
    const capitalFlow = this.analyzeCapitalFlow();
    const fundamental = this.analyzeFundamental(pe, roe, growth);
    const avgScore = (fundamental.total + capitalFlow.score) / 2;
    return {
      technical,
      capitalFlow,
      fundamental,
      recommendation: avgScore > 75 ? '买入' : avgScore > 50 ? '持有' : '卖出',
      confidence: Math.round(avgScore)
    };
  }
}

export const stockIntelligence = new StockIntelligence();
