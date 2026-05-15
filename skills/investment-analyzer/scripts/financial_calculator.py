#!/usr/bin/env python3
"""
Financial Calculator - 财务指标计算模块

计算原则：
1. 所有计算基于标准化输入数据
2. 结果保留指定精度
3. 异常值自动标注
4. 支持同比/环比分析
"""

import json
import sys
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class FinancialMetrics:
    """财务指标数据结构"""
    # 盈利能力
    gross_margin: float = 0.0  # 毛利率
    operating_margin: float = 0.0  # 营业利润率
    net_margin: float = 0.0  # 净利率
    roe: float = 0.0  # 净资产收益率
    roa: float = 0.0  # 总资产收益率
    roic: float = 0.0  # 投入资本回报率
    
    # 运营效率
    asset_turnover: float = 0.0  # 总资产周转率
    inventory_turnover: float = 0.0  # 存货周转率
    receivables_turnover: float = 0.0  # 应收账款周转率
    
    # 偿债能力
    current_ratio: float = 0.0  # 流动比率
    quick_ratio: float = 0.0  # 速动比率
    debt_to_equity: float = 0.0  # 资产负债率
    interest_coverage: float = 0.0  # 利息保障倍数
    
    # 成长能力
    revenue_growth: float = 0.0  # 营收增长率
    profit_growth: float = 0.0  # 利润增长率
    
    # 现金流
    operating_cash_flow: float = 0.0  # 经营现金流
    free_cash_flow: float = 0.0  # 自由现金流
    fcf_yield: float = 0.0  # 自由现金流收益率


class FinancialCalculator:
    """财务指标计算器"""
    
    def __init__(self):
        self.warnings = []
    
    def _safe_divide(self, numerator: float, denominator: float, 
                     metric_name: str) -> float:
        """安全除法，处理除零情况"""
        if denominator == 0 or denominator is None:
            self.warnings.append(f"{metric_name}计算中除数为零")
            return 0.0
        result = numerator / denominator
        # 检查异常值
        if abs(result) > 10000:
            self.warnings.append(f"{metric_name}结果异常: {result:.2f}")
        return round(result, 2)
    
    def calculate_profitability(self, data: Dict) -> Dict:
        """
        计算盈利能力指标
        
        Args:
            data: {
                "revenue": 营业收入,
                "gross_profit": 毛利润,
                "operating_income": 营业利润,
                "net_income": 净利润,
                "total_equity": 股东权益,
                "total_assets": 总资产,
                "total_debt": 总负债,
                "cash": 现金
            }
            
        Returns:
            盈利能力指标字典
        """
        revenue = data.get('revenue', 0)
        gross_profit = data.get('gross_profit', 0)
        operating_income = data.get('operating_income', 0)
        net_income = data.get('net_income', 0)
        total_equity = data.get('total_equity', 0)
        total_assets = data.get('total_assets', 0)
        total_debt = data.get('total_debt', 0)
        cash = data.get('cash', 0)
        
        metrics = {}
        
        # 毛利率
        metrics['gross_margin'] = self._safe_divide(
            gross_profit, revenue, "毛利率"
        ) * 100
        
        # 营业利润率
        metrics['operating_margin'] = self._safe_divide(
            operating_income, revenue, "营业利润率"
        ) * 100
        
        # 净利率
        metrics['net_margin'] = self._safe_divide(
            net_income, revenue, "净利率"
        ) * 100
        
        # ROE
        metrics['roe'] = self._safe_divide(
            net_income, total_equity, "ROE"
        ) * 100
        
        # ROA
        metrics['roa'] = self._safe_divide(
            net_income, total_assets, "ROA"
        ) * 100
        
        # ROIC = EBIT * (1 - 税率) / (总负债 + 股东权益 - 现金)
        # 简化计算：使用营业利润近似
        invested_capital = total_debt + total_equity - cash
        metrics['roic'] = self._safe_divide(
            operating_income, invested_capital, "ROIC"
        ) * 100
        
        return metrics
    
    def calculate_efficiency(self, data: Dict) -> Dict:
        """
        计算运营效率指标
        
        Args:
            data: {
                "revenue": 营业收入,
                "total_assets": 总资产,
                "inventory": 存货,
                "cogs": 营业成本,
                "receivables": 应收账款
            }
        """
        revenue = data.get('revenue', 0)
        total_assets = data.get('total_assets', 0)
        inventory = data.get('inventory', 0)
        cogs = data.get('cogs', 0)
        receivables = data.get('receivables', 0)
        
        metrics = {}
        
        # 总资产周转率
        metrics['asset_turnover'] = self._safe_divide(
            revenue, total_assets, "总资产周转率"
        )
        
        # 存货周转率
        metrics['inventory_turnover'] = self._safe_divide(
            cogs, inventory, "存货周转率"
        )
        
        # 应收账款周转率
        metrics['receivables_turnover'] = self._safe_divide(
            revenue, receivables, "应收账款周转率"
        )
        
        return metrics
    
    def calculate_solvency(self, data: Dict) -> Dict:
        """
        计算偿债能力指标
        
        Args:
            data: {
                "current_assets": 流动资产,
                "current_liabilities": 流动负债,
                "inventory": 存货,
                "total_debt": 总负债,
                "total_equity": 股东权益,
                "ebit": 息税前利润,
                "interest_expense": 利息费用
            }
        """
        current_assets = data.get('current_assets', 0)
        current_liabilities = data.get('current_liabilities', 0)
        inventory = data.get('inventory', 0)
        total_debt = data.get('total_debt', 0)
        total_equity = data.get('total_equity', 0)
        ebit = data.get('ebit', 0)
        interest_expense = data.get('interest_expense', 0)
        
        metrics = {}
        
        # 流动比率
        metrics['current_ratio'] = self._safe_divide(
            current_assets, current_liabilities, "流动比率"
        )
        
        # 速动比率 = (流动资产 - 存货) / 流动负债
        quick_assets = current_assets - inventory
        metrics['quick_ratio'] = self._safe_divide(
            quick_assets, current_liabilities, "速动比率"
        )
        
        # 资产负债率
        total_capital = total_debt + total_equity
        metrics['debt_to_equity'] = self._safe_divide(
            total_debt, total_equity, "产权比率"
        )
        metrics['debt_ratio'] = self._safe_divide(
            total_debt, total_capital, "资产负债率"
        ) * 100
        
        # 利息保障倍数
        metrics['interest_coverage'] = self._safe_divide(
            ebit, interest_expense, "利息保障倍数"
        )
        
        return metrics
    
    def calculate_growth(self, current: Dict, previous: Dict) -> Dict:
        """
        计算成长能力指标
        
        Args:
            current: 当期数据
            previous: 上期数据
        """
        metrics = {}

        # 营收增长率
        current_revenue = current.get('revenue', 0)
        previous_revenue = previous.get('revenue', 0)
        metrics['revenue_growth'] = self._safe_divide(
            current_revenue - previous_revenue, previous_revenue, "营收增长率"
        ) * 100

        # 利润增长率
        current_profit = current.get('net_income', 0)
        previous_profit = previous.get('net_income', 0)
        metrics['profit_growth'] = self._safe_divide(
            current_profit - previous_profit, previous_profit, "利润增长率"
        ) * 100

        return metrics

    def calculate_cashflow(self, data: Dict, market_cap: float = 0) -> Dict:
        """
        计算现金流指标

        Args:
            data: {
                "operating_cash_flow": 经营现金流,
                "capex": 资本支出,
                "market_cap": 市值
            }
            market_cap: 市值（用于计算收益率）
        """
        ocf = data.get('operating_cash_flow', 0)
        capex = data.get('capex', 0)

        metrics = {}

        # 自由现金流
        metrics['free_cash_flow'] = ocf - capex

        # 自由现金流收益率
        if market_cap > 0:
            metrics['fcf_yield'] = self._safe_divide(
                metrics['free_cash_flow'], market_cap, "FCF收益率"
            ) * 100
        else:
            metrics['fcf_yield'] = 0.0

        return metrics

    def calculate_all_metrics(self, data: Dict, previous_data: Dict = None,
                             market_cap: float = 0) -> Dict:
        """
        计算所有财务指标

        Args:
            data: 当期财务数据
            previous_data: 上期财务数据（用于计算增长率）
            market_cap: 市值

        Returns:
            完整财务指标字典
        """
        self.warnings = []

        result = {
            "profitability": self.calculate_profitability(data),
            "efficiency": self.calculate_efficiency(data),
            "solvency": self.calculate_solvency(data),
            "cashflow": self.calculate_cashflow(data, market_cap),
            "warnings": self.warnings,
            "timestamp": datetime.now().isoformat()
        }

        if previous_data:
            result["growth"] = self.calculate_growth(data, previous_data)

        return result

    def compare_with_industry(self, company_metrics: Dict,
                              industry_avg: Dict) -> Dict:
        """
        与行业平均水平对比

        Args:
            company_metrics: 公司指标
            industry_avg: 行业平均指标

        Returns:
            对比结果
        """
        comparison = {}

        for category in ['profitability', 'efficiency', 'solvency']:
            if category in company_metrics and category in industry_avg:
                comparison[category] = {}
                for metric, value in company_metrics[category].items():
                    industry_value = industry_avg[category].get(metric, 0)
                    diff = value - industry_value
                    diff_percent = (diff / industry_value * 100) if industry_value != 0 else 0

                    comparison[category][metric] = {
                        "company": value,
                        "industry_avg": industry_value,
                        "difference": round(diff, 2),
                        "difference_percent": round(diff_percent, 2),
                        "status": "above" if diff > 0 else "below" if diff < 0 else "equal"
                    }

        return comparison


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python financial_calculator.py <command> [args...]")
        print("Commands:")
        print("  calculate <json_file>     - 从JSON文件计算财务指标")
        print("  compare <company_json> <industry_json> - 与行业对比")
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "calculate":
            if len(sys.argv) < 3:
                print("Error: 需要JSON文件路径")
                sys.exit(1)

            with open(sys.argv[2], 'r') as f:
                data = json.load(f)

            calculator = FinancialCalculator()

            current_data = data.get('current', data)
            previous_data = data.get('previous')
            market_cap = data.get('market_cap', 0)

            result = calculator.calculate_all_metrics(
                current_data, previous_data, market_cap
            )

            print(json.dumps(result, indent=2, ensure_ascii=False))

        elif command == "compare":
            if len(sys.argv) < 4:
                print("Error: 需要公司数据和行业数据文件")
                sys.exit(1)

            with open(sys.argv[2], 'r') as f:
                company_data = json.load(f)

            with open(sys.argv[3], 'r') as f:
                industry_data = json.load(f)

            calculator = FinancialCalculator()
            result = calculator.compare_with_industry(company_data, industry_data)

            print(json.dumps(result, indent=2, ensure_ascii=False))

        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()

