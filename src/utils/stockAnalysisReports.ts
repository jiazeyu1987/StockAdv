export interface BullBearAnalysis {
  bullPoints: { title: string; desc: string }[];
  bearPoints: { title: string; desc: string }[];
  rating: '强烈买入' | '买入' | '持有' | '卖出';
}

export interface AgentScore {
  fundamental: { score: number; metrics: { profitability: number; growth: number; stability: number }; comment: string };
  technical: { score: number; metrics: { trend: number; momentum: number; volume: number }; comment: string };
  catalyst: { score: number; metrics: { policy: number; industry: number; company: number }; comment: string };
}

export interface ValuationComparison {
  pe: { current: number; industry: number; history: number };
  pb: { current: number; industry: number; history: number };
  targetPrice: { low: number; mid: number; high: number };
}

export interface IndustryFilter {
  score: number;
  rank: string;
  trend: 'up' | 'stable' | 'down';
}

export interface StockAnalysisReport {
  bullBear: BullBearAnalysis;
  agentScore: AgentScore;
  valuation: ValuationComparison;
  industry: IndustryFilter;
}

export class StockAnalysisReports {
  generateReport(stockData: any): StockAnalysisReport {
    return {
      bullBear: {
        bullPoints: [
          { title: '业绩稳健', desc: '营收利润双增长，盈利能力持续提升' },
          { title: '行业龙头', desc: '市场份额领先，护城河深厚' }
        ],
        bearPoints: [
          { title: '估值偏高', desc: '当前PE处于历史中高位' },
          { title: '宏观风险', desc: '经济下行可能影响需求' }
        ],
        rating: stockData.basic.pe_ttm < 25 ? '买入' : '持有'
      },
      agentScore: {
        fundamental: { score: 85, metrics: { profitability: 88, growth: 82, stability: 85 }, comment: '基本面稳健' },
        technical: { score: 75, metrics: { trend: 80, momentum: 70, volume: 75 }, comment: '技术面中性偏多' },
        catalyst: { score: 70, metrics: { policy: 75, industry: 70, company: 65 }, comment: '催化剂一般' }
      },
      valuation: {
        pe: { current: stockData.basic.pe_ttm, industry: 25, history: 22 },
        pb: { current: stockData.basic.pb, industry: 3, history: 2.8 },
        targetPrice: { low: stockData.basic.price * 0.9, mid: stockData.basic.price * 1.1, high: stockData.basic.price * 1.25 }
      },
      industry: { score: 82, rank: '前10%', trend: 'up' }
    };
  }
}

export const stockAnalysisReports = new StockAnalysisReports();
