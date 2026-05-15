export interface RiskData {
  returns: number[];
  prices: number[];
  market_returns: number[];
  portfolio_value: number;
}

export interface RiskMetrics {
  volatility: {
    daily_volatility: number;
    annual_volatility: number;
    downside_volatility: number;
    data_points: number;
  };
  var: {
    var_95_historical: number;
    var_99_historical: number;
    var_95_parametric: number;
    var_99_parametric: number;
    cvar_95: number;
    var_95_percent: number;
    var_99_percent: number;
  };
  drawdown: {
    max_drawdown: number;
    max_drawdown_percent: number;
    peak_price: number;
  };
  beta: {
    beta: number;
    alpha: number;
    r_squared: number;
    correlation: number;
  };
  sharpe: {
    daily_sharpe: number;
    annual_sharpe: number;
    risk_free_rate: number;
  };
  sortino: {
    daily_sortino: number;
    annual_sortino: number;
    downside_deviation: number;
  };
  stress_test: Record<string, { daily_return: string; portfolio_loss: number; loss_percent: number }>;
}

export class RiskAnalyzer {
  private warnings: string[] = [];
  private tradingDays = 252;

  calculateVolatility(returns: number[]): RiskMetrics['volatility'] {
    if (returns.length < 30) {
      this.warnings.push('收益率数据不足30天，波动率估计可能不准确');
    }

    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
    const dailyVol = Math.sqrt(variance);
    const annualVol = dailyVol * Math.sqrt(this.tradingDays);

    const downsideReturns = returns.filter(r => r < 0);
    let downsideVol = 0;
    if (downsideReturns.length > 0) {
      const downsideMean = downsideReturns.reduce((a, b) => a + b, 0) / downsideReturns.length;
      const downsideVar = downsideReturns.reduce((sum, r) => sum + Math.pow(r - downsideMean, 2), 0) / downsideReturns.length;
      downsideVol = Math.sqrt(downsideVar) * Math.sqrt(this.tradingDays);
    }

    return {
      daily_volatility: Math.round(dailyVol * 10000) / 100,
      annual_volatility: Math.round(annualVol * 10000) / 100,
      downside_volatility: Math.round(downsideVol * 10000) / 100,
      data_points: returns.length
    };
  }

  calculateVaR(returns: number[], portfolioValue: number = 100000): RiskMetrics['var'] {
    if (returns.length < 100) {
      this.warnings.push('收益率数据不足100天，VaR估计可能不准确');
    }

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const n = sortedReturns.length;

    const var95Index = Math.floor(n * 0.05);
    const var99Index = Math.floor(n * 0.01);

    const var95Return = sortedReturns[var95Index];
    const var99Return = sortedReturns[var99Index];

    const var95 = Math.abs(var95Return) * portfolioValue;
    const var99 = Math.abs(var99Return) * portfolioValue;

    const worstReturns = sortedReturns.slice(0, var95Index);
    const cvar95 = worstReturns.length > 0
      ? Math.abs(worstReturns.reduce((a, b) => a + b, 0) / worstReturns.length) * portfolioValue
      : 0;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const std = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1));

    const var95Param = Math.abs(mean - 1.65 * std) * portfolioValue;
    const var99Param = Math.abs(mean - 2.33 * std) * portfolioValue;

    return {
      var_95_historical: Math.round(var95 * 100) / 100,
      var_99_historical: Math.round(var99 * 100) / 100,
      var_95_parametric: Math.round(var95Param * 100) / 100,
      var_99_parametric: Math.round(var99Param * 100) / 100,
      cvar_95: Math.round(cvar95 * 100) / 100,
      var_95_percent: Math.round(Math.abs(var95Return) * 10000) / 100,
      var_99_percent: Math.round(Math.abs(var99Return) * 10000) / 100
    };
  }

  calculateDrawdown(prices: number[]): RiskMetrics['drawdown'] {
    if (prices.length < 2) {
      return { max_drawdown: 0, max_drawdown_percent: 0, peak_price: prices[0] || 0 };
    }

    let peak = prices[0];
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    prices.forEach(price => {
      if (price > peak) {
        peak = price;
      }
      const drawdown = peak - price;
      const drawdownPercent = (drawdown / peak) * 100;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    });

    return {
      max_drawdown: Math.round(maxDrawdown * 100) / 100,
      max_drawdown_percent: Math.round(maxDrawdownPercent * 100) / 100,
      peak_price: Math.round(peak * 100) / 100
    };
  }

  calculateBeta(stockReturns: number[], marketReturns: number[]): RiskMetrics['beta'] {
    if (stockReturns.length !== marketReturns.length) {
      throw new Error('股票收益率和市场收益率长度不一致');
    }

    const n = stockReturns.length;
    const stockMean = stockReturns.reduce((a, b) => a + b, 0) / n;
    const marketMean = marketReturns.reduce((a, b) => a + b, 0) / n;

    const covariance = stockReturns.reduce((sum, s, i) => {
      return sum + (s - stockMean) * (marketReturns[i] - marketMean);
    }, 0) / (n - 1);

    const marketVariance = marketReturns.reduce((sum, m) => {
      return sum + Math.pow(m - marketMean, 2);
    }, 0) / (n - 1);

    const beta = marketVariance !== 0 ? covariance / marketVariance : 0;
    const alpha = stockMean - beta * marketMean;

    const ssRes = stockReturns.reduce((sum, s, i) => {
      return sum + Math.pow(s - (alpha + beta * marketReturns[i]), 2);
    }, 0);

    const ssTot = stockReturns.reduce((sum, s) => {
      return sum + Math.pow(s - stockMean, 2);
    }, 0);

    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    return {
      beta: Math.round(beta * 100) / 100,
      alpha: Math.round(alpha * 10000) / 100,
      r_squared: Math.round(rSquared * 100) / 100,
      correlation: Math.round(Math.sqrt(rSquared) * (beta > 0 ? 1 : -1) * 100) / 100
    };
  }

  calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.04): RiskMetrics['sharpe'] {
    const dailyRf = riskFreeRate / this.tradingDays;
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const excessReturn = meanReturn - dailyRf;

    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
    const std = Math.sqrt(variance);

    const dailySharpe = std !== 0 ? excessReturn / std : 0;
    const annualSharpe = dailySharpe * Math.sqrt(this.tradingDays);

    return {
      daily_sharpe: Math.round(dailySharpe * 100) / 100,
      annual_sharpe: Math.round(annualSharpe * 100) / 100,
      risk_free_rate: riskFreeRate
    };
  }

  calculateSortinoRatio(returns: number[], riskFreeRate: number = 0.04): RiskMetrics['sortino'] {
    const dailyRf = riskFreeRate / this.tradingDays;
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const excessReturn = meanReturn - dailyRf;

    const downsideReturns = returns.filter(r => r < 0);
    let downsideStd = 0;
    if (downsideReturns.length > 0) {
      downsideStd = Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length);
    }

    const dailySortino = downsideStd !== 0 ? excessReturn / downsideStd : 0;
    const annualSortino = dailySortino * Math.sqrt(this.tradingDays);

    return {
      daily_sortino: Math.round(dailySortino * 100) / 100,
      annual_sortino: Math.round(annualSortino * 100) / 100,
      downside_deviation: Math.round(downsideStd * Math.sqrt(this.tradingDays) * 10000) / 100
    };
  }

  stressTest(returns: number[], portfolioValue: number = 100000): RiskMetrics['stress_test'] {
    const scenarios: Record<string, number> = {
      '2008_financial_crisis': -0.20,
      '2020_covid_crash': -0.12,
      'flash_crash': -0.10,
      'moderate_decline': -0.05
    };

    const results: RiskMetrics['stress_test'] = {};

    Object.entries(scenarios).forEach(([scenario, dailyReturn]) => {
      const loss = Math.abs(dailyReturn) * portfolioValue;
      results[scenario] = {
        daily_return: `${(dailyReturn * 100).toFixed(0)}%`,
        portfolio_loss: Math.round(loss * 100) / 100,
        loss_percent: Math.round(Math.abs(dailyReturn) * 10000) / 100
      };
    });

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const worst1Percent = sortedReturns.slice(0, Math.max(1, Math.floor(sortedReturns.length / 100)));
    const avgWorst1Percent = worst1Percent.length > 0
      ? worst1Percent.reduce((a, b) => a + b, 0) / worst1Percent.length
      : 0;

    results['historical_tail_1_percent'] = {
      daily_return: `${(avgWorst1Percent * 100).toFixed(2)}%`,
      portfolio_loss: Math.round(Math.abs(avgWorst1Percent) * portfolioValue * 100) / 100,
      loss_percent: Math.round(Math.abs(avgWorst1Percent) * 10000) / 100
    };

    return results;
  }

  comprehensiveRiskAnalysis(data: Partial<RiskData>): Partial<RiskMetrics> & { warnings: string[]; timestamp: string } {
    const returns = data.returns || [];
    const prices = data.prices || [];
    const marketReturns = data.market_returns || [];
    const portfolioValue = data.portfolio_value || 100000;

    if (returns.length === 0) {
      throw new Error('收益率数据不能为空');
    }

    this.warnings = [];

    const result: Partial<RiskMetrics> & { warnings: string[]; timestamp: string } = {
      volatility: this.calculateVolatility(returns),
      var: this.calculateVaR(returns, portfolioValue),
      sharpe: this.calculateSharpeRatio(returns),
      sortino: this.calculateSortinoRatio(returns),
      stress_test: this.stressTest(returns, portfolioValue),
      warnings: this.warnings,
      timestamp: new Date().toISOString()
    };

    if (prices.length > 0) {
      result.drawdown = this.calculateDrawdown(prices);
    }

    if (marketReturns.length > 0 && marketReturns.length === returns.length) {
      result.beta = this.calculateBeta(returns, marketReturns);
    }

    return result;
  }
}

export const riskAnalyzer = new RiskAnalyzer();
