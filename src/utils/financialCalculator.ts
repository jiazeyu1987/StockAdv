export interface FinancialData {
  revenue: number;
  gross_profit: number;
  operating_income: number;
  net_income: number;
  total_equity: number;
  total_assets: number;
  total_debt: number;
  cash: number;
  current_assets: number;
  current_liabilities: number;
  inventory: number;
  cogs: number;
  receivables: number;
  ebit: number;
  interest_expense: number;
  operating_cash_flow: number;
  capex: number;
}

export interface FinancialMetrics {
  profitability: {
    gross_margin: number;
    operating_margin: number;
    net_margin: number;
    roe: number;
    roa: number;
    roic: number;
  };
  efficiency: {
    asset_turnover: number;
    inventory_turnover: number;
    receivables_turnover: number;
  };
  solvency: {
    current_ratio: number;
    quick_ratio: number;
    debt_to_equity: number;
    debt_ratio: number;
    interest_coverage: number;
  };
  cashflow: {
    free_cash_flow: number;
    fcf_yield: number;
  };
  growth?: {
    revenue_growth: number;
    profit_growth: number;
  };
}

export class FinancialCalculator {
  private warnings: string[] = [];

  private safeDivide(numerator: number, denominator: number, metricName: string): number {
    if (denominator === 0 || denominator === null || denominator === undefined) {
      this.warnings.push(`${metricName}计算中除数为零`);
      return 0;
    }
    const result = numerator / denominator;
    if (Math.abs(result) > 10000) {
      this.warnings.push(`${metricName}结果异常: ${result.toFixed(2)}`);
    }
    return Math.round(result * 100) / 100;
  }

  calculateProfitability(data: Partial<FinancialData>): FinancialMetrics['profitability'] {
    const revenue = data.revenue || 0;
    const grossProfit = data.gross_profit || 0;
    const operatingIncome = data.operating_income || 0;
    const netIncome = data.net_income || 0;
    const totalEquity = data.total_equity || 0;
    const totalAssets = data.total_assets || 0;
    const totalDebt = data.total_debt || 0;
    const cash = data.cash || 0;

    const investedCapital = totalDebt + totalEquity - cash;

    return {
      gross_margin: Math.round(this.safeDivide(grossProfit, revenue, '毛利率') * 10000) / 100,
      operating_margin: Math.round(this.safeDivide(operatingIncome, revenue, '营业利润率') * 10000) / 100,
      net_margin: Math.round(this.safeDivide(netIncome, revenue, '净利率') * 10000) / 100,
      roe: Math.round(this.safeDivide(netIncome, totalEquity, 'ROE') * 10000) / 100,
      roa: Math.round(this.safeDivide(netIncome, totalAssets, 'ROA') * 10000) / 100,
      roic: Math.round(this.safeDivide(operatingIncome, investedCapital, 'ROIC') * 10000) / 100
    };
  }

  calculateEfficiency(data: Partial<FinancialData>): FinancialMetrics['efficiency'] {
    const revenue = data.revenue || 0;
    const totalAssets = data.total_assets || 0;
    const inventory = data.inventory || 0;
    const cogs = data.cogs || 0;
    const receivables = data.receivables || 0;

    return {
      asset_turnover: this.safeDivide(revenue, totalAssets, '总资产周转率'),
      inventory_turnover: this.safeDivide(cogs, inventory, '存货周转率'),
      receivables_turnover: this.safeDivide(revenue, receivables, '应收账款周转率')
    };
  }

  calculateSolvency(data: Partial<FinancialData>): FinancialMetrics['solvency'] {
    const currentAssets = data.current_assets || 0;
    const currentLiabilities = data.current_liabilities || 0;
    const inventory = data.inventory || 0;
    const totalDebt = data.total_debt || 0;
    const totalEquity = data.total_equity || 0;
    const ebit = data.ebit || 0;
    const interestExpense = data.interest_expense || 0;

    const quickAssets = currentAssets - inventory;
    const totalCapital = totalDebt + totalEquity;

    return {
      current_ratio: this.safeDivide(currentAssets, currentLiabilities, '流动比率'),
      quick_ratio: this.safeDivide(quickAssets, currentLiabilities, '速动比率'),
      debt_to_equity: this.safeDivide(totalDebt, totalEquity, '产权比率'),
      debt_ratio: Math.round(this.safeDivide(totalDebt, totalCapital, '资产负债率') * 10000) / 100,
      interest_coverage: this.safeDivide(ebit, interestExpense, '利息保障倍数')
    };
  }

  calculateCashflow(data: Partial<FinancialData>, marketCap: number = 0): FinancialMetrics['cashflow'] {
    const ocf = data.operating_cash_flow || 0;
    const capex = data.capex || 0;
    const fcf = ocf - capex;

    return {
      free_cash_flow: fcf,
      fcf_yield: marketCap > 0 ? Math.round(this.safeDivide(fcf, marketCap, 'FCF收益率') * 10000) / 100 : 0
    };
  }

  calculateGrowth(current: Partial<FinancialData>, previous: Partial<FinancialData>): FinancialMetrics['growth'] {
    const currentRevenue = current.revenue || 0;
    const previousRevenue = previous.revenue || 0;
    const currentProfit = current.net_income || 0;
    const previousProfit = previous.net_income || 0;

    return {
      revenue_growth: Math.round(this.safeDivide(currentRevenue - previousRevenue, previousRevenue, '营收增长率') * 10000) / 100,
      profit_growth: Math.round(this.safeDivide(currentProfit - previousProfit, previousProfit, '利润增长率') * 10000) / 100
    };
  }

  calculateAllMetrics(
    data: Partial<FinancialData>,
    previousData?: Partial<FinancialData>,
    marketCap: number = 0
  ): FinancialMetrics & { warnings: string[] } {
    this.warnings = [];

    const result: FinancialMetrics & { warnings: string[] } = {
      profitability: this.calculateProfitability(data),
      efficiency: this.calculateEfficiency(data),
      solvency: this.calculateSolvency(data),
      cashflow: this.calculateCashflow(data, marketCap),
      warnings: this.warnings
    };

    if (previousData) {
      result.growth = this.calculateGrowth(data, previousData);
    }

    return result;
  }

  compareWithIndustry(
    companyMetrics: FinancialMetrics,
    industryAvg: FinancialMetrics
  ): Record<string, Record<string, { company: number; industry_avg: number; difference: number; difference_percent: number; status: string }>> {
    const comparison: Record<string, any> = {};

    const categories = ['profitability', 'efficiency', 'solvency'] as const;

    categories.forEach(category => {
      if (companyMetrics[category] && industryAvg[category]) {
        comparison[category] = {};
        Object.entries(companyMetrics[category] as Record<string, number>).forEach(([metric, value]) => {
          const industryValue = (industryAvg[category] as Record<string, number>)[metric] || 0;
          const diff = value - industryValue;
          const diffPercent = industryValue !== 0 ? (diff / industryValue) * 100 : 0;

          comparison[category][metric] = {
            company: value,
            industry_avg: industryValue,
            difference: Math.round(diff * 100) / 100,
            difference_percent: Math.round(diffPercent * 100) / 100,
            status: diff > 0 ? 'above' : diff < 0 ? 'below' : 'equal'
          };
        });
      }
    });

    return comparison;
  }
}

export const financialCalculator = new FinancialCalculator();
