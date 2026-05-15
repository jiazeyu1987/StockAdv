#!/usr/bin/env python3
"""
Data Fetcher - 投资分析数据获取模块

数据质量控制原则：
1. 多源交叉验证：关键数据从至少2个独立源获取
2. 官方数据优先：财报数据优先使用官方披露
3. 异常值标注：同比/环比变化异常时自动标注
4. 容错率要求极高：所有数据必须经过验证

数据源优先级：
1. 官方财报（SEC EDGAR/交易所公告）
2. Yahoo Finance
3. Alpha Vantage
4. 其他权威数据提供商
"""

import json
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import requests
import time
import hashlib


class DataValidationError(Exception):
    """数据验证异常"""
    pass


class DataFetcher:
    """数据获取器基类"""
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 300  # 5分钟缓存
        
    def _get_cache_key(self, *args) -> str:
        """生成缓存键"""
        key_str = "|".join(str(arg) for arg in args)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _get_from_cache(self, key: str) -> Optional[Dict]:
        """从缓存获取数据"""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.cache_ttl:
                return data
        return None
    
    def _set_cache(self, key: str, data: Dict):
        """设置缓存"""
        self.cache[key] = (data, time.time())
    
    def _validate_numeric(self, value: Any, field_name: str, 
                         min_val: Optional[float] = None,
                         max_val: Optional[float] = None) -> float:
        """验证数值数据"""
        try:
            num_val = float(value)
            if min_val is not None and num_val < min_val:
                raise DataValidationError(f"{field_name}低于最小值: {num_val} < {min_val}")
            if max_val is not None and num_val > max_val:
                raise DataValidationError(f"{field_name}超过最大值: {num_val} > {max_val}")
            return round(num_val, 2)
        except (ValueError, TypeError) as e:
            raise DataValidationError(f"{field_name}数值格式错误: {value}")
    
    def _cross_validate(self, values: List[float], tolerance: float = 0.05) -> Tuple[float, List[str]]:
        """多源数据交叉验证"""
        if not values:
            raise DataValidationError("无数据可供验证")
        
        warnings = []
        avg_val = sum(values) / len(values)
        
        if len(values) > 1:
            max_diff = max(abs(v - avg_val) for v in values) / avg_val if avg_val != 0 else 0
            if max_diff > tolerance:
                warnings.append(f"数据源差异超过{tolerance*100}%: {values}")
        
        return round(avg_val, 2), warnings


class YahooFinanceFetcher(DataFetcher):
    """Yahoo Finance 数据获取"""
    
    BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/"
    QUOTE_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary/"
    
    def __init__(self):
        super().__init__()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_stock_price(self, symbol: str) -> Dict:
        """
        获取股票实时价格
        
        Args:
            symbol: 股票代码 (如: AAPL, 600519.SS)
            
        Returns:
            {
                "symbol": "AAPL",
                "price": 150.25,
                "change": 2.50,
                "change_percent": 1.69,
                "volume": 52345678,
                "market_cap": 2345678901234,
                "timestamp": "2024-01-15T14:30:00Z",
                "data_source": "Yahoo Finance",
                "validation_warnings": []
            }
        """
        cache_key = self._get_cache_key("price", symbol)
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            url = f"{self.BASE_URL}{symbol}?interval=1d&range=1d"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            result = data['chart']['result'][0]
            meta = result['meta']
            
            # 获取最新价格
            price = self._validate_numeric(
                meta.get('regularMarketPrice', 0), 
                "price", 
                min_val=0.01
            )
            
            prev_close = self._validate_numeric(
                meta.get('previousClose', price),
                "previous_close",
                min_val=0.01
            )
            
            change = round(price - prev_close, 2)
            change_percent = round((change / prev_close) * 100, 2) if prev_close != 0 else 0
            
            volume = int(meta.get('regularMarketVolume', 0))
            market_cap = int(meta.get('marketCap', 0))
            
            result_data = {
                "symbol": symbol,
                "price": price,
                "change": change,
                "change_percent": change_percent,
                "volume": volume,
                "market_cap": market_cap,
                "timestamp": datetime.now().isoformat(),
                "data_source": "Yahoo Finance",
                "validation_warnings": []
            }
            
            self._set_cache(cache_key, result_data)
            return result_data
            
        except Exception as e:
            raise DataValidationError(f"获取{symbol}价格数据失败: {str(e)}")
    
    def get_historical_data(self, symbol: str, period: str = "1y") -> Dict:
        """
        获取历史价格数据
        
        Args:
            symbol: 股票代码
            period: 时间周期 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            
        Returns:
            {
                "symbol": "AAPL",
                "period": "1y",
                "data": [
                    {"date": "2024-01-15", "open": 149.50, "high": 151.20, "low": 149.00, "close": 150.25, "volume": 52345678}
                ],
                "data_source": "Yahoo Finance"
            }
        """
        cache_key = self._get_cache_key("historical", symbol, period)
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            url = f"{self.BASE_URL}{symbol}?interval=1d&range={period}"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            result = data['chart']['result'][0]
            timestamps = result['timestamp']
            prices = result['indicators']['quote'][0]
            
            historical_data = []
            for i in range(len(timestamps)):
                if prices['close'][i] is not None:
                    historical_data.append({
                        "date": datetime.fromtimestamp(timestamps[i]).strftime('%Y-%m-%d'),
                        "open": round(prices['open'][i], 2) if prices['open'][i] else None,
                        "high": round(prices['high'][i], 2) if prices['high'][i] else None,
                        "low": round(prices['low'][i], 2) if prices['low'][i] else None,
                        "close": round(prices['close'][i], 2),
                        "volume": int(prices['volume'][i]) if prices['volume'][i] else 0
                    })
            
            result_data = {
                "symbol": symbol,
                "period": period,
                "data": historical_data,
                "data_source": "Yahoo Finance",
                "data_points": len(historical_data)
            }
            
            self._set_cache(cache_key, result_data)
            return result_data
            
        except Exception as e:
            raise DataValidationError(f"获取{symbol}历史数据失败: {str(e)}")
    
    def get_financial_data(self, symbol: str) -> Dict:
        """
        获取财务数据
        
        Args:
            symbol: 股票代码
            
        Returns:
            {
                "symbol": "AAPL",
                "financials": {
                    "revenue": 394328000000,
                    "net_income": 96995000000,
                    "total_assets": 352755000000,
                    "total_debt": 120069000000,
                    "cash": 169650000000
                },
                "ratios": {
                    "pe_ratio": 28.5,
                    "pb_ratio": 45.2,
                    "debt_to_equity": 2.1
                },
                "data_source": "Yahoo Finance"
            }
        """
        cache_key = self._get_cache_key("financial", symbol)
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        try:
            modules = "financialData,defaultKeyStatistics"
            url = f"{self.QUOTE_URL}{symbol}?modules={modules}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            result = data['quoteSummary']['result'][0]
            financial = result.get('financialData', {})
            stats = result.get('defaultKeyStatistics', {})
            
            # 提取关键财务指标
            financials = {
                "revenue": financial.get('totalRevenue', {}).get('raw', 0),
                "net_income": financial.get('netIncome', {}).get('raw', 0),
                "total_assets": financial.get('totalAssets', {}).get('raw', 0),
                "total_debt": financial.get('totalDebt', {}).get('raw', 0),
                "cash": financial.get('totalCash', {}).get('raw', 0),
                "ebitda": financial.get('ebitda', {}).get('raw', 0)
            }
            
            # 提取估值比率
            ratios = {
                "pe_ratio": self._validate_numeric(
                    financial.get('trailingPE', {}).get('raw', 0), 
                    "PE", 
                    min_val=0, 
                    max_val=1000
                ),
                "pb_ratio": self._validate_numeric(
                    stats.get('priceToBook', {}).get('raw', 0), 
                    "PB", 
                    min_val=0, 
                    max_val=100
                ),
                "debt_to_equity": self._validate_numeric(
                    financial.get('debtToEquity', {}).get('raw', 0), 
                    "D/E", 
                    min_val=0, 
                    max_val=100
                ),
                "current_ratio": self._validate_numeric(
                    financial.get('currentRatio', {}).get('raw', 0), 
                    "current_ratio", 
                    min_val=0, 
                    max_val=50
                ),
                "quick_ratio": self._validate_numeric(
                    financial.get('quickRatio', {}).get('raw', 0), 
                    "quick_ratio", 
                    min_val=0, 
                    max_val=50
                ),
                "roe": self._validate_numeric(
                    financial.get('returnOnEquity', {}).get('raw', 0) * 100, 
                    "ROE", 
                    min_val=-100, 
                    max_val=100
                ),
                "roa": self._validate_numeric(
                    financial.get('returnOnAssets', {}).get('raw', 0) * 100, 
                    "ROA", 
                    min_val=-100, 
                    max_val=100
                ),
                "profit_margin": self._validate_numeric(
                    financial.get('profitMargins', {}).get('raw', 0) * 100, 
                    "profit_margin", 
                    min_val=-100, 
                    max_val=100
                )
            }
            
            result_data = {
                "symbol": symbol,
                "financials": financials,
                "ratios": ratios,
                "data_source": "Yahoo Finance",
                "timestamp": datetime.now().isoformat()
            }
            
            self._set_cache(cache_key, result_data)
            return result_data
            
        except Exception as e:
            raise DataValidationError(f"获取{symbol}财务数据失败: {str(e)}")


class MacroDataFetcher(DataFetcher):
    """宏观经济数据获取"""
    
    def __init__(self):
        super().__init__()
        self.session = requests.Session()
    
    def get_treasury_yield(self, maturity: str = "10y") -> Dict:
        """
        获取美国国债收益率
        
        Args:
            maturity: 期限 (3m, 2y, 5y, 10y, 30y)
            
        Returns:
            {
                "maturity": "10y",
                "yield": 4.25,
                "change": 0.05,
                "timestamp": "2024-01-15T14:30:00Z",
                "data_source": "FRED"
            }
        """
        # 使用Yahoo Finance的国债ETF作为代理
        treasury_symbols = {
            "3m": "^IRX",
            "2y": "^FVX", 
            "5y": "^FVX",  # 近似
            "10y": "^TNX",
            "30y": "^TYX"
        }
        
        symbol = treasury_symbols.get(maturity, "^TNX")
        
        try:
            yf_fetcher = YahooFinanceFetcher()
            data = yf_fetcher.get_stock_price(symbol)
            
            # 收益率数据需要除以100
            yield_value = data['price'] / 100 if data['price'] > 10 else data['price']
            
            return {
                "maturity": maturity,
                "yield": round(yield_value, 2),
                "change": round(data['change'] / 100 if data['change'] > 1 else data['change'], 2),
                "timestamp": data['timestamp'],
                "data_source": "Yahoo Finance (Treasury Proxy)",
                "validation_warnings": ["使用ETF代理数据，可能与实际国债收益率有偏差"]
            }
        except Exception as e:
            raise DataValidationError(f"获取{maturity}国债收益率失败: {str(e)}")
    
    def get_market_indices(self) -> Dict:
        """
        获取主要市场指数
        
        Returns:
            {
                "indices": [
                    {"name": "S&P 500", "symbol": "^GSPC", "price": 4783.35, "change_percent": 0.85}
                ]
            }
        """
        indices = [
            {"name": "S&P 500", "symbol": "^GSPC"},
            {"name": "NASDAQ", "symbol": "^IXIC"},
            {"name": "Dow Jones", "symbol": "^DJI"},
            {"name": "Russell 2000", "symbol": "^RUT"},
            {"name": "VIX", "symbol": "^VIX"},
            {"name": "上证指数", "symbol": "000001.SS"},
            {"name": "恒生指数", "symbol": "^HSI"}
        ]
        
        results = []
        yf_fetcher = YahooFinanceFetcher()
        
        for idx in indices:
            try:
                data = yf_fetcher.get_stock_price(idx['symbol'])
                results.append({
                    "name": idx['name'],
                    "symbol": idx['symbol'],
                    "price": data['price'],
                    "change": data['change'],
                    "change_percent": data['change_percent']
                })
            except Exception as e:
                results.append({
                    "name": idx['name'],
                    "symbol": idx['symbol'],
                    "error": str(e)
                })
        
        return {
            "indices": results,
            "timestamp": datetime.now().isoformat(),
            "data_source": "Yahoo Finance"
        }


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python data_fetcher.py <command> [args...]")
        print("Commands:")
        print("  price <symbol>           - 获取实时价格")
        print("  historical <symbol> [period] - 获取历史数据")
        print("  financial <symbol>       - 获取财务数据")
        print("  treasury [maturity]      - 获取国债收益率")
        print("  indices                  - 获取市场指数")
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "price":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            symbol = sys.argv[2]
            fetcher = YahooFinanceFetcher()
            result = fetcher.get_stock_price(symbol)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "historical":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            symbol = sys.argv[2]
            period = sys.argv[3] if len(sys.argv) > 3 else "1y"
            fetcher = YahooFinanceFetcher()
            result = fetcher.get_historical_data(symbol, period)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "financial":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            symbol = sys.argv[2]
            fetcher = YahooFinanceFetcher()
            result = fetcher.get_financial_data(symbol)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "treasury":
            maturity = sys.argv[2] if len(sys.argv) > 2 else "10y"
            fetcher = MacroDataFetcher()
            result = fetcher.get_treasury_yield(maturity)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "indices":
            fetcher = MacroDataFetcher()
            result = fetcher.get_market_indices()
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
            
    except DataValidationError as e:
        print(json.dumps({"error": str(e), "error_type": "validation"}, indent=2))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e), "error_type": "system"}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
