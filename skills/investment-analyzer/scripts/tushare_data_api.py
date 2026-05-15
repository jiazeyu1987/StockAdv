#!/usr/bin/env python3
"""
Tushare Data API - Tushare专业金融数据接口

Tushare是国内知名的金融数据接口平台，提供225+个专业级金融API
支持：股票、基金、期货、宏观、外汇等全品类金融数据

官网：https://tushare.pro
注意：需要注册获取API Token
"""

import json
import sys
import os
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta


class TushareDataAPI:
    """Tushare数据API封装"""
    
    BASE_URL = "https://api.tushare.pro"
    
    def __init__(self, token: Optional[str] = None):
        """
        初始化Tushare API
        
        Args:
            token: Tushare API Token，可从环境变量TUSHARE_TOKEN获取
        """
        self.token = token or os.environ.get('TUSHARE_TOKEN', '')
        
        try:
            import requests
            self.session = requests.Session()
            self.session.headers.update({
                'Content-Type': 'application/json'
            })
            self.has_requests = True
        except ImportError:
            self.has_requests = False
    
    def _call_api(self, api_name: str, params: Dict = None) -> Dict:
        """
        调用Tushare API
        
        Args:
            api_name: API接口名称
            params: 请求参数
            
        Returns:
            API响应数据
        """
        if not self.has_requests:
            return {"error": "需要安装requests库"}
        
        if not self.token:
            return {
                "error": "未设置Tushare API Token",
                "note": "请访问 https://tushare.pro/register 注册获取Token",
                "setup": "设置环境变量 TUSHARE_TOKEN=your_token"
            }
        
        try:
            import requests
            
            payload = {
                "api_name": api_name,
                "token": self.token,
                "params": params or {},
                "fields": ""
            }
            
            response = requests.post(
                self.BASE_URL,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('code') != 0:
                return {
                    "error": data.get('msg', 'API调用失败'),
                    "code": data.get('code'),
                    "data_source": "Tushare"
                }
            
            return {
                "data": data.get('data'),
                "fields": data.get('fields'),
                "data_source": "Tushare"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "data_source": "Tushare"
            }
    
    def get_daily_quote(self, ts_code: str, start_date: str = None, 
                        end_date: str = None) -> Dict:
        """
        获取股票日线行情
        
        Args:
            ts_code: 股票代码 (如: 600519.SH)
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)
            
        Returns:
            日线行情数据
        """
        if not end_date:
            end_date = datetime.now().strftime('%Y%m%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
        
        params = {
            "ts_code": ts_code,
            "start_date": start_date,
            "end_date": end_date
        }
        
        return self._call_api("daily", params)
    
    def get_realtime_quote(self, ts_code: str) -> Dict:
        """
        获取股票实时行情（使用每日行情接口的最新数据）
        
        Args:
            ts_code: 股票代码
            
        Returns:
            实时行情数据
        """
        end_date = datetime.now().strftime('%Y%m%d')
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y%m%d')
        
        result = self.get_daily_quote(ts_code, start_date, end_date)
        
        if "error" in result:
            return result
        
        data = result.get('data', [])
        if data and len(data) > 0:
            # 返回最新一条数据
            latest = data[-1]
            fields = result.get('fields', [])
            
            # 构建字段映射
            record = dict(zip(fields, latest))
            
            return {
                "ts_code": record.get('ts_code'),
                "trade_date": record.get('trade_date'),
                "open": record.get('open'),
                "high": record.get('high'),
                "low": record.get('low'),
                "close": record.get('close'),
                "pre_close": record.get('pre_close'),
                "change": record.get('change'),
                "pct_chg": record.get('pct_chg'),
                "vol": record.get('vol'),
                "amount": record.get('amount'),
                "data_source": "Tushare"
            }
        
        return {
            "error": "无数据",
            "data_source": "Tushare"
        }
    
    def get_stock_basic(self, ts_code: str = None, 
                        exchange: str = None) -> Dict:
        """
        获取股票基础信息
        
        Args:
            ts_code: 股票代码
            exchange: 交易所 (SSE/SZSE)
            
        Returns:
            股票基础信息
        """
        params = {}
        if ts_code:
            params["ts_code"] = ts_code
        if exchange:
            params["exchange"] = exchange
        
        return self._call_api("stock_basic", params)
    
    def get_financial_report(self, ts_code: str, 
                             report_type: str = "income") -> Dict:
        """
        获取财务报表数据
        
        Args:
            ts_code: 股票代码
            report_type: 报表类型 (income-利润表, balance-资产负债表, cashflow-现金流量表)
            
        Returns:
            财务报表数据
        """
        api_map = {
            "income": "income",
            "balance": "balancesheet",
            "cashflow": "cashflow"
        }
        
        api_name = api_map.get(report_type, "income")
        
        params = {
            "ts_code": ts_code,
            "period": "",
            "start_date": "",
            "end_date": ""
        }
        
        return self._call_api(api_name, params)
    
    def get_financial_indicators(self, ts_code: str) -> Dict:
        """
        获取财务指标数据
        
        Args:
            ts_code: 股票代码
            
        Returns:
            财务指标数据
        """
        params = {
            "ts_code": ts_code
        }
        
        return self._call_api("fina_indicator", params)
    
    def get_daily_basic(self, ts_code: str, 
                        trade_date: str = None) -> Dict:
        """
        获取每日基本面指标（估值指标）
        
        Args:
            ts_code: 股票代码
            trade_date: 交易日期 (YYYYMMDD)
            
        Returns:
            每日基本面指标
        """
        if not trade_date:
            trade_date = datetime.now().strftime('%Y%m%d')
        
        params = {
            "ts_code": ts_code,
            "trade_date": trade_date
        }
        
        return self._call_api("daily_basic", params)
    
    def get_money_flow(self, ts_code: str, 
                       start_date: str = None,
                       end_date: str = None) -> Dict:
        """
        获取个股资金流向
        
        Args:
            ts_code: 股票代码
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            资金流向数据
        """
        if not end_date:
            end_date = datetime.now().strftime('%Y%m%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y%m%d')
        
        params = {
            "ts_code": ts_code,
            "start_date": start_date,
            "end_date": end_date
        }
        
        return self._call_api("moneyflow", params)
    
    def get_index_quote(self, index_code: str = None) -> Dict:
        """
        获取指数行情
        
        Args:
            index_code: 指数代码 (如: 000001.SH)
            
        Returns:
            指数行情数据
        """
        end_date = datetime.now().strftime('%Y%m%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y%m%d')
        
        params = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        if index_code:
            params["ts_code"] = index_code
        
        return self._call_api("index_daily", params)
    
    def get_macro_data(self, macro_type: str = "gdp") -> Dict:
        """
        获取宏观经济数据
        
        Args:
            macro_type: 宏观数据类型 (gdp, cpi, ppi, m2等)
            
        Returns:
            宏观经济数据
        """
        api_map = {
            "gdp": "gdp",
            "cpi": "cpi",
            "ppi": "ppi",
            "m2": "money_supply",
            "industrial": "industrial"
        }
        
        api_name = api_map.get(macro_type, "gdp")
        
        return self._call_api(api_name, {})
    
    def get_concept_list(self) -> Dict:
        """
        获取概念板块列表
        
        Returns:
            概念板块列表
        """
        return self._call_api("concept", {})
    
    def get_concept_stocks(self, concept_code: str) -> Dict:
        """
        获取概念板块成分股
        
        Args:
            concept_code: 概念代码
            
        Returns:
            概念成分股
        """
        params = {
            "id": concept_code
        }
        
        return self._call_api("concept_detail", params)
    
    def get_top_list(self, trade_date: str = None) -> Dict:
        """
        获取龙虎榜数据
        
        Args:
            trade_date: 交易日期
            
        Returns:
            龙虎榜数据
        """
        if not trade_date:
            trade_date = datetime.now().strftime('%Y%m%d')
        
        params = {
            "trade_date": trade_date
        }
        
        return self._call_api("top_list", params)
    
    def get_limit_list(self, trade_date: str = None,
                       limit_type: str = "up") -> Dict:
        """
        获取涨跌停数据
        
        Args:
            trade_date: 交易日期
            limit_type: 类型 (up-涨停, down-跌停)
            
        Returns:
            涨跌停数据
        """
        if not trade_date:
            trade_date = datetime.now().strftime('%Y%m%d')
        
        params = {
            "trade_date": trade_date,
            "limit_type": limit_type
        }
        
        return self._call_api("limit_list", params)


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python tushare_data_api.py <command> [args...]")
        print("Commands:")
        print("  daily <ts_code> [start_date] [end_date]  - 获取日线行情")
        print("  realtime <ts_code>                       - 获取实时行情")
        print("  basic [ts_code]                          - 获取股票基础信息")
        print("  financial <ts_code> [report_type]        - 获取财务报表")
        print("  indicators <ts_code>                     - 获取财务指标")
        print("  valuation <ts_code> [trade_date]         - 获取估值指标")
        print("  moneyflow <ts_code>                      - 获取资金流向")
        print("  index [index_code]                       - 获取指数行情")
        print("  macro <macro_type>                       - 获取宏观数据")
        print("  concepts                                 - 获取概念板块")
        print("  top [trade_date]                         - 获取龙虎榜")
        print("")
        print("Environment:")
        print("  export TUSHARE_TOKEN=your_token_here")
        sys.exit(1)
    
    command = sys.argv[1]
    api = TushareDataAPI()
    
    try:
        if command == "daily":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            ts_code = sys.argv[2]
            start_date = sys.argv[3] if len(sys.argv) > 3 else None
            end_date = sys.argv[4] if len(sys.argv) > 4 else None
            result = api.get_daily_quote(ts_code, start_date, end_date)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "realtime":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            ts_code = sys.argv[2]
            result = api.get_realtime_quote(ts_code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "basic":
            ts_code = sys.argv[2] if len(sys.argv) > 2 else None
            result = api.get_stock_basic(ts_code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "financial":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            ts_code = sys.argv[2]
            report_type = sys.argv[3] if len(sys.argv) > 3 else "income"
            result = api.get_financial_report(ts_code, report_type)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "indicators":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            ts_code = sys.argv[2]
            result = api.get_financial_indicators(ts_code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "valuation":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            ts_code = sys.argv[2]
            trade_date = sys.argv[3] if len(sys.argv) > 3 else None
            result = api.get_daily_basic(ts_code, trade_date)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "moneyflow":
            if len(sys.argv) < 3:
                print("Error: 需要股票代码")
                sys.exit(1)
            ts_code = sys.argv[2]
            result = api.get_money_flow(ts_code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "index":
            index_code = sys.argv[2] if len(sys.argv) > 2 else None
            result = api.get_index_quote(index_code)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "macro":
            macro_type = sys.argv[2] if len(sys.argv) > 2 else "gdp"
            result = api.get_macro_data(macro_type)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "concepts":
            result = api.get_concept_list()
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        elif command == "top":
            trade_date = sys.argv[2] if len(sys.argv) > 2 else None
            result = api.get_top_list(trade_date)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
