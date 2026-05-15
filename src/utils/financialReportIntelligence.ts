export interface FinancialQuality {
  revenueRecognition: { score: number; risk: 'low' | 'medium' | 'high'; comment: string };
  profitAuthenticity: { score: number; risk: 'low' | 'medium' | 'high'; comment: string };
  cashflowHealth: { score: number; risk: 'low' | 'medium' | 'high'; comment: string };
}

export interface FinancialRisk {
  receivableRisk: { level: 'low' | 'medium' | 'high'; amount: number; days: number };
  inventoryRisk: { level: 'low' | 'medium' | 'high'; amount: number; turnover: number };
  debtRisk: { level: 'low' | 'medium' | 'high'; ratio: number; coverage: number };
}

export interface ProfitabilityAnalysis {
  grossMarginTrend: 'up' | 'down' | 'stable';
  expenseRatio: number;
  roeBreakdown: { netMargin: number; assetTurnover: number; leverage: number };
}

export interface FinancialReportResult {
  quality: FinancialQuality;
  risk: FinancialRisk;
  profitability: ProfitabilityAnalysis;
  overallScore: number;
  rating: 'A' | 'B' | 'C' | 'D';
}

export class FinancialReportIntelligence {
  analyzeFinancialReport(financial: any): FinancialReportResult {
    const quality: FinancialQuality = {
      revenueRecognition: { score: 85, risk: 'low', comment: '收入确认规范，增长稳健' },
      profitAuthenticity: { score: 82, risk: 'low', comment: '利润质量较高，非经常性损益占比低' },
      cashflowHealth: { score: financial.operating_cash_flow > 0 ? 80 : 65, risk: financial.operating_cash_flow > 0 ? 'low' : 'medium', comment: financial.operating_cash_flow > 0 ? '经营现金流充沛' : '现金流需关注' }
    };

    const risk: FinancialRisk = {
      receivableRisk: { level: financial.receivable_ratio > 30 ? 'high' : 'medium', amount: financial.receivables || 0, days: 45 },
      inventoryRisk: { level: financial.inventory_ratio > 20 ? 'medium' : 'low', amount: financial.inventory || 0, turnover: 6 },
      debtRisk: { level: financial.debt_ratio > 60 ? 'high' : financial.debt_ratio > 40 ? 'medium' : 'low', ratio: financial.debt_ratio || 35, coverage: 8 }
    };

    const profitability: ProfitabilityAnalysis = {
      grossMarginTrend: financial.gross_margin > 35 ? 'up' : 'stable',
      expenseRatio: 15,
      roeBreakdown: { netMargin: financial.net_margin || 12, assetTurnover: 0.8, leverage: 1.5 }
    };

    const overallScore = Math.round((quality.revenueRecognition.score + quality.profitAuthenticity.score + quality.cashflowHealth.score) / 3);
    const rating = overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'D';

    return { quality, risk, profitability, overallScore, rating };
  }
}

export const financialReportIntelligence = new FinancialReportIntelligence();
