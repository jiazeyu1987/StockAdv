import pandas as pd
import numpy as np

def analyze_stock_fundamentals(stock_data):
    """
    分析个股基本面
    
    Args:
        stock_data (dict): 个股数据
        
    Returns:
        dict: 基本面分析结果
    """
    # 计算关键财务指标
    pe_ratio = stock_data.get('price', 0) / stock_data.get('eps', 1) if stock_data.get('eps', 0) != 0 else 0
    pb_ratio = stock_data.get('price', 0) / stock_data.get('book_value', 1) if stock_data.get('book_value', 0) != 0 else 0
    roe = stock_data.get('net_income', 0) / stock_data.get('equity', 1) if stock_data.get('equity', 0) != 0 else 0
    
    # 评估估值水平
    valuation = _evaluate_valuation(pe_ratio, pb_ratio)
    
    # 评估盈利能力
    profitability = _evaluate_profitability(roe)
    
    return {
        'pe_ratio': pe_ratio,
        'pb_ratio': pb_ratio,
        'roe': roe,
        'valuation': valuation,
        'profitability': profitability,
        'recommendation': _get_stock_recommendation(valuation, profitability)
    }

def _evaluate_valuation(pe_ratio, pb_ratio):
    """
    评估估值水平
    
    Args:
        pe_ratio: 市盈率
        pb_ratio: 市净率
        
    Returns:
        str: 估值评价
    """
    if pe_ratio < 15 and pb_ratio < 2:
        return "低估"
    elif pe_ratio > 30 or pb_ratio > 5:
        return "高估"
    else:
        return "合理"

def _evaluate_profitability(roe):
    """
    评估盈利能力
    
    Args:
        roe: 净资产收益率
        
    Returns:
        str: 盈利能力评价
    """
    if roe > 0.15:
        return "强"
    elif roe > 0.08:
        return "中等"
    else:
        return "弱"

def _get_stock_recommendation(valuation, profitability):
    """
    根据基本面给出投资建议
    
    Args:
        valuation: 估值评价
        profitability: 盈利能力评价
        
    Returns:
        str: 投资建议
    """
    if valuation == "低估" and profitability in ["强", "中等"]:
        return "买入"
    elif valuation == "高估":
        return "卖出"
    elif valuation == "合理" and profitability == "强":
        return "持有"
    else:
        return "观望"

if __name__ == "__main__":
    # 示例用法
    sample_stock_data = {
        'price': 50.0,
        'eps': 2.5,
        'book_value': 20.0,
        'net_income': 1000000,
        'equity': 8000000
    }
    
    result = analyze_stock_fundamentals(sample_stock_data)
    print("个股基本面分析结果:", result)