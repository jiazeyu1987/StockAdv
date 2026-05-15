import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def analyze_market_trend(market_data):
    """
    分析市场趋势
    
    Args:
        market_data (dict): 市场数据
        
    Returns:
        dict: 趋势分析结果
    """
    # 转换为DataFrame
    df = pd.DataFrame(market_data)
    
    # 计算移动平均线
    df['MA5'] = df['close'].rolling(window=5).mean()
    df['MA10'] = df['close'].rolling(window=10).mean()
    df['MA20'] = df['close'].rolling(window=20).mean()
    
    # 计算RSI指标
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # 判断趋势
    latest = df.iloc[-1]
    trend = {
        'direction': 'up' if latest['MA5'] > latest['MA10'] else 'down',
        'strength': 'strong' if abs(latest['MA5'] - latest['MA10']) > latest['close'] * 0.02 else 'weak',
        'rsi': latest['RSI'],
        'recommendation': _get_recommendation(latest)
    }
    
    return trend

def _get_recommendation(latest_data):
    """
    根据技术指标给出建议
    
    Args:
        latest_data: 最新数据点
        
    Returns:
        str: 投资建议
    """
    rsi = latest_data['RSI']
    ma5 = latest_data['MA5']
    ma10 = latest_data['MA10']
    
    if rsi < 30 and ma5 > ma10:
        return "买入"
    elif rsi > 70 and ma5 < ma10:
        return "卖出"
    elif 40 <= rsi <= 60:
        return "持有"
    else:
        return "观望"

if __name__ == "__main__":
    # 示例用法
    sample_data = {
        'date': pd.date_range(start='2023-01-01', periods=30),
        'open': np.random.rand(30) * 100 + 100,
        'high': np.random.rand(30) * 100 + 110,
        'low': np.random.rand(30) * 100 + 90,
        'close': np.random.rand(30) * 100 + 100,
        'volume': np.random.randint(1000000, 10000000, 30)
    }
    
    result = analyze_market_trend(sample_data)
    print("趋势分析结果:", result)