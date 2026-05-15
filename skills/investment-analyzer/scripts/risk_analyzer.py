#!/usr/bin/env python3
"""
Risk Analyzer - 风险分析模块

风险计算原则：
1. 多维度风险度量
2. 历史与隐含波动结合
3. 压力测试覆盖
4. 明确风险限额
"""

import json
import sys
import math
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime
import statistics


@dataclass
class RiskMetrics:
    """风险指标数据结构"""
    volatility: float = 0.0  # 年化波动率
    var_95: float = 0.0  # 95%置信度VaR
    var_99: float = 0.0  # 99%置信度VaR
    cvar_95: float = 0.0  # 95%CVaR
    max_drawdown: float = 0.0  # 最大回撤
    beta: float = 0.0  # Beta系数
    sharpe_ratio: float = 0.0  # 夏普比率
    sortino_ratio: float = 0.0  # Sortino比率


class RiskAnalyzer:
    """风险分析器"""

    def __init__(self):
        self.warnings = []
        self.trading_days = 252  # 年化交易日

    def calculate_volatility(self, returns: List[float]) -> Dict:
        """
        计算波动率

        Args:
            returns: 日收益率列表

        Returns:
            波动率指标
        """
        if len(returns) < 30:
            self.warnings.append("收益率数据不足30天，波动率估计可能不准确")

        # 计算日波动率
        mean_return = sum(returns) / len(returns)
        variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
        daily_vol = math.sqrt(variance)

        # 年化波动率
        annual_vol = daily_vol * math.sqrt(self.trading_days)

        # 下行波动率
        downside_returns = [r for r in returns if r < 0]
        if downside_returns:
            downside_mean = sum(downside_returns) / len(downside_returns)
            downside_var = sum((r - downside_mean) ** 2 for r in downside_returns) / len(downside_returns)
            downside_vol = math.sqrt(downside_var) * math.sqrt(self.trading_days)
        else:
            downside_vol = 0

        return {
            "daily_volatility": round(daily_vol * 100, 2),
            "annual_volatility": round(annual_vol * 100, 2),
            "downside_volatility": round(downside_vol * 100, 2),
            "data_points": len(returns)
        }

    def calculate_var(self, returns: List[float], portfolio_value: float = 100000) -> Dict:
        """
        计算风险价值(VaR)

        Args:
            returns: 日收益率列表
            portfolio_value: 投资组合价值

        Returns:
            VaR指标
        """
        if len(returns) < 100:
            self.warnings.append("收益率数据不足100天，VaR估计可能不准确")

        sorted_returns = sorted(returns)
        n = len(sorted_returns)

        # 历史模拟法VaR
        var_95_index = int(n * 0.05)
        var_99_index = int(n * 0.01)

        var_95_return = sorted_returns[var_95_index]
        var_99_return = sorted_returns[var_99_index]

        # 转换为金额
        var_95 = abs(var_95_return) * portfolio_value
        var_99 = abs(var_99_return) * portfolio_value

        # CVaR (Expected Shortfall)
        cvar_95 = abs(sum(sorted_returns[:var_95_index]) / var_95_index) * portfolio_value if var_95_index > 0 else 0

        # 参数法VaR (正态分布假设)
        mean = sum(returns) / len(returns)
        std = math.sqrt(sum((r - mean) ** 2 for r in returns) / (len(returns) - 1))

        var_95_param = abs(mean - 1.65 * std) * portfolio_value
        var_99_param = abs(mean - 2.33 * std) * portfolio_value

        return {
            "var_95_historical": round(var_95, 2),
            "var_99_historical": round(var_99, 2),
            "var_95_parametric": round(var_95_param, 2),
            "var_99_parametric": round(var_99_param, 2),
            "cvar_95": round(cvar_95, 2),
            "var_95_percent": round(abs(var_95_return) * 100, 2),
            "var_99_percent": round(abs(var_99_return) * 100, 2),
            "portfolio_value": portfolio_value
        }

    def calculate_drawdown(self, prices: List[float]) -> Dict:
        """
        计算最大回撤

        Args:
            prices: 价格序列

        Returns:
            回撤指标
        """
        if len(prices) < 2:
            return {"max_drawdown": 0, "max_drawdown_percent": 0}

        peak = prices[0]
        max_drawdown = 0
        max_drawdown_percent = 0

        for price in prices:
            if price > peak:
                peak = price

            drawdown = peak - price
            drawdown_percent = (drawdown / peak) * 100

            if drawdown > max_drawdown:
                max_drawdown = drawdown
                max_drawdown_percent = drawdown_percent

        return {
            "max_drawdown": round(max_drawdown, 2),
            "max_drawdown_percent": round(max_drawdown_percent, 2),
            "peak_price": round(peak, 2)
        }

    def calculate_beta(self, stock_returns: List[float], market_returns: List[float]) -> Dict:
        """
        计算Beta系数

        Args:
            stock_returns: 股票收益率
            market_returns: 市场收益率

        Returns:
            Beta指标
        """
        if len(stock_returns) != len(market_returns):
            raise ValueError("股票收益率和市场收益率长度不一致")

        n = len(stock_returns)

        # 计算均值
        stock_mean = sum(stock_returns) / n
        market_mean = sum(market_returns) / n

        # 计算协方差和方差
        covariance = sum((s - stock_mean) * (m - market_mean) for s, m in zip(stock_returns, market_returns)) / (n - 1)
        market_variance = sum((m - market_mean) ** 2 for m in market_returns) / (n - 1)

        # Beta = Cov(r_stock, r_market) / Var(r_market)
        beta = covariance / market_variance if market_variance != 0 else 0

        # Alpha
        alpha = stock_mean - beta * market_mean

        # R-squared
        ss_res = sum((s - (alpha + beta * m)) ** 2 for s, m in zip(stock_returns, market_returns))
        ss_tot = sum((s - stock_mean) ** 2 for s in stock_returns)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

        return {
            "beta": round(beta, 2),
            "alpha": round(alpha * 100, 2),
            "r_squared": round(r_squared, 2),
            "correlation": round(math.sqrt(r_squared) * (1 if beta > 0 else -1), 2)
        }

    def calculate_sharpe_ratio(self, returns: List[float], risk_free_rate: float = 0.04) -> Dict:
        """
        计算夏普比率

        Args:
            returns: 日收益率
            risk_free_rate: 年化无风险利率

        Returns:
            夏普比率
        """
        daily_rf = risk_free_rate / self.trading_days

        mean_return = sum(returns) / len(returns)
        excess_return = mean_return - daily_rf

        variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
        std = math.sqrt(variance)

        daily_sharpe = excess_return / std if std != 0 else 0
        annual_sharpe = daily_sharpe * math.sqrt(self.trading_days)

        return {
            "daily_sharpe": round(daily_sharpe, 2),
            "annual_sharpe": round(annual_sharpe, 2),
            "risk_free_rate": risk_free_rate
        }

    def calculate_sortino_ratio(self, returns: List[float], risk_free_rate: float = 0.04) -> Dict:
        """
        计算Sortino比率

        Args:
            returns: 日收益率
            risk_free_rate: 年化无风险利率

        Returns:
            Sortino比率
        """
        daily_rf = risk_free_rate / self.trading_days

        mean_return = sum(returns) / len(returns)
        excess_return = mean_return - daily_rf

        # 下行标准差
        downside_returns = [r for r in returns if r < 0]
        if downside_returns:
            downside_std = math.sqrt(sum(r ** 2 for r in downside_returns) / len(downside_returns))
        else:
            downside_std = 0

        daily_sortino = excess_return / downside_std if downside_std != 0 else 0
        annual_sortino = daily_sortino * math.sqrt(self.trading_days)

        return {
            "daily_sortino": round(daily_sortino, 2),
            "annual_sortino": round(annual_sortino, 2),
            "downside_deviation": round(downside_std * math.sqrt(self.trading_days) * 100, 2)
        }

    def stress_test(self, returns: List[float], portfolio_value: float = 100000) -> Dict:
        """
        压力测试

        Args:
            returns: 日收益率
            portfolio_value: 投资组合价值

        Returns:
            压力测试结果
        """
        scenarios = {
            "2008_financial_crisis": -0.20,  # 单日下跌20%
            "2020_covid_crash": -0.12,  # 单日下跌12%
            "flash_crash": -0.10,  # 单日下跌10%
            "moderate_decline": -0.05,  # 单日下跌5%
        }

        results = {}
        for scenario, daily_return in scenarios.items():
            loss = abs(daily_return) * portfolio_value
            results[scenario] = {
                "daily_return": f"{daily_return*100:.0f}%",
                "portfolio_loss": round(loss, 2),
                "loss_percent": round(abs(daily_return) * 100, 2)
            }

        # 基于历史数据的尾部风险
        sorted_returns = sorted(returns)
        worst_1_percent = sorted_returns[:max(1, len(sorted_returns) // 100)]
        avg_worst_1_percent = sum(worst_1_percent) / len(worst_1_percent) if worst_1_percent else 0

        results["historical_tail_1_percent"] = {
            "avg_return": f"{avg_worst_1_percent*100:.2f}%",
            "portfolio_loss": round(abs(avg_worst_1_percent) * portfolio_value, 2)
        }

        return results

    def comprehensive_risk_analysis(self, data: Dict) -> Dict:
        """
        综合风险分析

        Args:
            data: {
                "returns": 日收益率列表,
                "prices": 价格序列,
                "market_returns": 市场收益率列表,
                "portfolio_value": 投资组合价值
            }

        Returns:
            综合风险分析结果
        """
        returns = data.get('returns', [])
        prices = data.get('prices', [])
        market_returns = data.get('market_returns', [])
        portfolio_value = data.get('portfolio_value', 100000)

        if not returns:
            raise ValueError("收益率数据不能为空")

        self.warnings = []

        result = {
            "volatility": self.calculate_volatility(returns),
            "var": self.calculate_var(returns, portfolio_value),
            "sharpe": self.calculate_sharpe_ratio(returns),
            "sortino": self.calculate_sortino_ratio(returns),
            "stress_test": self.stress_test(returns, portfolio_value),
            "warnings": self.warnings,
            "timestamp": datetime.now().isoformat()
        }

        if prices:
            result["drawdown"] = self.calculate_drawdown(prices)

        if market_returns and len(market_returns) == len(returns):
            result["beta"] = self.calculate_beta(returns, market_returns)

        return result


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python risk_analyzer.py <command> [args...]")
        print("Commands:")
        print("  analyze <json_file>     - 综合风险分析")
        print("  volatility <json_file>  - 计算波动率")
        print("  var <json_file>         - 计算VaR")
        print("  stress <json_file>      - 压力测试")
        sys.exit(1)

    command = sys.argv[1]

    try:
        if len(sys.argv) < 3:
            print("Error: 需要JSON文件路径")
            sys.exit(1)

        with open(sys.argv[2], 'r') as f:
            data = json.load(f)

        analyzer = RiskAnalyzer()

        if command == "analyze":
            result = analyzer.comprehensive_risk_analysis(data)
        elif command == "volatility":
            returns = data.get('returns', [])
            result = analyzer.calculate_volatility(returns)
        elif command == "var":
            returns = data.get('returns', [])
            portfolio_value = data.get('portfolio_value', 100000)
            result = analyzer.calculate_var(returns, portfolio_value)
        elif command == "stress":
            returns = data.get('returns', [])
            portfolio_value = data.get('portfolio_value', 100000)
            result = analyzer.stress_test(returns, portfolio_value)
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

        print(json.dumps(result, indent=2, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
