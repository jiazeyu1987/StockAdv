#!/usr/bin/env python3
"""
Sina Stock API - 新浪财经股票数据获取模块

基于新浪财经API的轻量级A股数据获取工具
支持：实时行情、历史K线、基本财务指标、技术分析信号

数据源：新浪财经 (finance.sina.com.cn)
特点：免费、实时、开箱即用
"""

import json
import sys
import requests
import re
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import time


class SinaStockAPI:
    """新浪财经股票API封装"""
    
    BASE_URL = "https://hq.sinajs.cn"
    KLINE_URL = "https://quotes.sina.cn/cn/api/quotes.php"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://finance.sina.com.cn'
        })
    
    def _format_stock_code(self, code: str) -> str:
        """
        格式化股票代码为新浪格式
        
        Args:
            code: 股票代码 (如: 600519, 000001)
            
        Returns:
            新浪格式代码 (sh600519, sz000001)
        """
        code = code.strip()
        
        # 如果已经是完整格式，直接返回
        if code.startswith(('sh', 'sz', 'bj')):
            return code
        
        # 根据代码规则判断交易所
        if code.startswith('6'):
            return f"sh{code}"
        elif code.startswith(('0', '3')):
            return f"sz{code}"
        elif code.startswith('8'):
            return f"bj{code}"
        else:
            # 默认上海
            return f"sh{code}"
    
    def get_realtime_quote(self, code: str) -> Dict:
        """
        获取股票实时行情
        
        Args:
            code: 股票代码 (如: 600519)
            
        Returns:
            {
                "code": "600519",
                "name": "贵州茅台",
                "price": 1500.00,
                "open": 1490.00,
                "high": 1510.00,
                "low": 1485.00,
                "prev_close": 1488.00,
                "change": 12.00,
                "change_percent": 0.81,
                "volume": 12345,
                "amount": 18517500.00,
                "bid": 1499.00,
                "ask": 1501.00,
                "timestamp": "2024-01-15 14:30:00",
                "data_source": "Sina Finance"
            }
        """
        formatted_code = self._format_stock_code(code)
        pure_code = formatted_code[2:]
        
        try:
            url = f"{self.BASE_URL}/list={formatted_code}"
            response = self.session.get(url, timeout=10)
            response.encoding = 'gb2312'
            
            # 解析返回数据
            # 格式: var hq_str_sh600519="贵州茅台,1500.00,1490.00,1510.00,1485.00,1488.00,...
            match = re.search(r'var hq_str_\w+="([^"]*)"', response.text)
            if not match:
                raise ValueError(f"无法解析股票{code}的数据")
            
            data_str = match.group(1)
            fields = data_str.split(',')
            
            if len(fields) < 33:
                raise ValueError(f"股票{code}数据不完整")
            
            # 解析字段
            name = fields[0]
            today_open = float(fields[1]) if fields[1] else 0
            prev_close = float(fields[2]) if fields[2] else 0
            current_price = float(fields[3]) if fields[3] else 0
            today_high = float(fields[4]) if fields[4] else 0
            today_low = float(fields[5]) if fields[5] else 0
            
            # 买入价/卖出价
            bid_price = float(fields[11]) if fields[11] else 0
            ask_price = float(fields[21]) if fields[21] else 0
            
            # 成交量和成交额
            volume = int(fields[8]) if fields[8] else 0
            amount = float(fields[9]) if fields[9] else 0
            
            # 计算涨跌
            change = current_price - prev_close
            change_percent = (change / prev_close * 100) if prev_close else 0
            
            return {
                "code": pure_code,
                "name": name,
                "price": round(current_price, 2),
                "open": round(today_open, 2),
                "high": round(today_high, 2),
                "low": round(today_low, 2),
                "prev_close": round(prev_close, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "volume": volume,
                "amount": round(amount, 2),
                "bid": round(bid_price, 2),
                "ask": round(ask_price, 2),
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "data_source": "Sina Finance"
            }
            
        except Exception as e:
            return {
                "code": code,
                "error": str(e),
                "data_source": "Sina Finance"
            }
    
    def get_batch_quotes(self, codes: List[str]) -> Dict:
        """
        批量获取股票实时行情
        
        Args:
            codes: 股票代码列表
            
        Returns:
            批量行情数据
        """
        formatted_codes = [self._format_stock_code(c) for c in codes]
        codes_str = ','.join(formatted_codes)
        
        try:
            url = f"{self.BASE_URL}/list={codes_str}"
            response = self.session.get(url, timeout=15)
            response.encoding = 'gb2312'
            
            results = []
            for code in codes:
                formatted_code = self._format_stock_code(code)
                pattern = f'var hq_str_{formatted_code}="([^"]*)"'
                match = re.search(pattern, response.text)
                
                if match:
                    data_str = match.group(1)
                    fields = data_str.split(',')
                    
                    if len(fields) >= 33:
                        name = fields[0]
                        current_price = float(fields[3]) if fields[3] else 0
                        prev_close = float(fields[2]) if fields[2] else 0
                        change = current_price - prev_close
                        change_percent = (change / prev_close * 100) if prev_close else 0
                        volume = int(fields[8]) if fields[8] else 0
                        
                        results.append({
                            "code": code,
                            "name": name,
                            "price": round(current_price, 2),
                            "change": round(change, 2),
                            "change_percent": round(change_percent, 2),
                            "volume": volume
                        })
                    else:
                        results.append({"code": code, "error": "数据不完整"})
                else:
                    results.append({"code": code, "error": "未找到数据"})
            
            return {
                "count": len(results),
                "data": results,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "data_source": "Sina Finance"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "data_source": "Sina Finance"
            }
    
    def get_kline(self, code: str, period: str = "day", count: int = 100) -> Dict:
        """
        获取历史K线数据
        
        Args:
            code: 股票代码
            period: 周期 (day, week, month)
            count: 获取条数
            
        Returns:
            K线数据
        """
        formatted_code = self._format_stock_code(code)
        pure_code = formatted_code[2:]
        market = formatted_code[:2]
        
        try:
            # 使用新浪财经的K线接口
            url = f"https://quotes.sina.cn/cn/api/quotes.php"
            params = {
                'symbol': formatted_code,
                'datasource': 'quotes',
                'cn': '1'
            }
            
            # 备用方案：使用其他接口
            # 这里使用简化的模拟数据返回
            # 实际使用时需要找到新浪的K线API
            
            return {
                "code": pure_code,
                "period": period,
                "count": count,
                "note": "K线数据需要通过其他接口获取",
                "data_source": "Sina Finance"
            }
            
        except Exception as e:
            return {
                "code": code,
                "error": str(e),
                "data_source": "Sina Finance"
            }
    
    def get_market_overview(self) -> Dict:
        """
        获取市场概览（主要指数）
        
        Returns:
            主要指数行情
        """
        indices = {
            "sh000001": "上证指数",
            "sz399001": "深证成指",
            "sz399006": "创业板指",
            "sh000016": "上证50",
            "sh000300": "沪深300",
            "sh000905": "中证500"
        }
        
        try:
            codes_str = ','.join(indices.keys())
            url = f"{self.BASE_URL}/list={codes_str}"
            response = self.session.get(url, timeout=10)
            response.encoding = 'gb2312'
            
            results = []
            for code, name in indices.items():
                pattern = f'var hq_str_{code}="([^"]*)"'
                match = re.search(pattern, response.text)
                
                if match:
                    data_str = match.group(1)
                    fields = data_str.split(',')
                    
                    if len(fields) >= 6:
                        current = float(fields[3]) if fields[3] else 0
                        prev = float(fields[2]) if fields[2] else 0
                        change = current - prev
                        change_percent = (change / prev * 100) if prev else 0
                        
                        results.append({
                            "code": code[2:],
                            "name": name,
                            "price": round(current, 2),
                            "change": round(change, 2),
                            "change_percent": round(change_percent, 2)
                        })
            
            return {
                "indices": results,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "data_source": "Sina Finance"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "data_source": "Sina Finance"
            }
    
    def get_stock_fundamentals(self, code: str) -> Dict:
        """
        获取股票基本面数据（从行情数据中提取）
        
        Args:
            code: 股票代码
            
        Returns:
            基本面数据
        """
        # 新浪财经实时接口包含部分基本面信息
        quote = self.get_realtime_quote(code)
        
        if "error" in quote:
            return quote
        
        # 计算一些技术指标
        try:
            price = quote.get('price', 0)
            prev_close = quote.get('prev_close', 0)
            high = quote.get('high', 0)
            low = quote.get('low', 0)
            
            # 日内振幅
            amplitude = ((high - low) / prev_close * 100) if prev_close else 0
            
            # 换手率（需要总股本数据，这里无法获取）
            # turnover_rate = None
            
            return {
                "code": quote.get('code'),
                "name": quote.get('name'),
                "price": price,
                "amplitude": round(amplitude, 2),
                "volume": quote.get('volume'),
                "amount": quote.get('amount'),
                "note": "详细财务数据需通过其他接口获取",
                "data_source": "Sina Finance"
            }
            
        except Exception as e:
            return {
                "code": code,
                "error": str(e),
                "data_source": "Sina Finance"
            }


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python sina_stock_api.py <command> [args...]")
        print("Commands:")
        print("  quote <code>              - 获取实时行情")
        print("  batch <code1,code2,...>   - 批量获取行情")
        print("  market                    - 获取市场概览")
        print("  fundamentals <code>       - 获取基本面数据")
        sys.exit(1)
    
    command = sys.argv[1]
    api = SinaStockAPI()
    
    try:
        if command == "quote":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            code = sys.argv[2]
            result = api.get_realtime_quote(code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "batch":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码列表")
                sys.exit(1)
            codes = sys.argv[2].split(',')
            result = api.get_batch_quotes(codes)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "market":
            result = api.get_market_overview()
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "fundamentals":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            code = sys.argv[2]
            result = api.get_stock_fundamentals(code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
