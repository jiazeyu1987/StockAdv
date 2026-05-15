#!/usr/bin/env python3
"""
Valuation Engine - 估值模型计算模块

估值原则：
1. 多模型交叉验证
2. 敏感性分析
3. 明确假设条件
4. 估值区间表达
"""

import json
import sys
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime
import math


@dataclass
class ValuationResult:
    """估值结果数据结构"""
    method: str
    value: float
    assumptions: Dict
    sensitivity: Dict
    confidence: str  # high, medium, low


class ValuationEngine:
    """估值引擎"""
    
    def __init__(self):
        self.warnings = []
        self.risk_free_rate = 0.04  # 无风险利率假设
        self.market_risk_premium = 0.06  # 市场风险溢价假设
    
    def _validate_input(self, value: float, name: str, 
                       min_val: Optional[float] = None,
                       max_val: Optional[float] = None) -> float:
        """验证输入数据"""
        if value is None or math.isnan(value):
            raise ValueError(f"{name}不能为空或NaN")
        
        if min_val is not None and value < min_val:
            self.warnings.append(f"{name}({value})低于最小值{min_val}")
        
        if max_val is not None and value > max_val:
            self.warnings.append(f"{name}({value})超过最大值{max_val}")
        
        return float(value)
    
    def calculate_pe_valuation(self, data: Dict) -> Dict:
        """
        市盈率估值法
        
        Args:
            data: {
                "eps": 每股收益,
                "pe_ratio": 当前PE,
                "target_pe": 目标PE,
                "growth_rate": 预期增长率(%)
            }
            
        Returns:
            PE估值结果
        """
        eps = self._validate_input(data.get('eps', 0), "EPS", min_val=0.01)
        current_pe = self._validate_input(data.get('pe_ratio', 0), "当前PE", min_val=0)
        target_pe = data.get('target_pe', current_pe)
        growth_rate = data.get('growth_rate', 0)
        
        # 基于目标PE计算目标价
        target_price = eps * target_pe
        
        # PEG分析
        peg = current_pe / growth_rate if growth_rate > 0 else float('inf')
        
        # 敏感性分析
        sensitivity = {}
        for pe in [target_pe * 0.8, target_pe, target_pe * 1.2]:
            sensitivity[f"PE_{pe:.1f}"] = round(eps * pe, 2)
        
        return {
            "method": "PE估值法",
            "target_price": round(target_price, 2),
            "current_pe": round(current_pe, 2),
            "target_pe": round(target_pe, 2),
            "peg": round(peg, 2) if peg != float('inf') else None,
            "peg_assessment": "低估" if peg < 1 else "合理" if peg <= 2 else "高估",
            "sensitivity": sensitivity,
            "assumptions": {
                "eps": eps,
                "target_pe": target_pe,
                "growth_rate": f"{growth_rate}%"
            },
            "confidence": "medium"
        }
    
    def calculate_pb_valuation(self, data: Dict) -> Dict:
        """
        市净率估值法
        
        Args:
            data: {
                "book_value_per_share": 每股净资产,
                "pb_ratio": 当前PB,
                "target_pb": 目标PB,
                "roe": ROE(%)
            }
        """
        bvps = self._validate_input(data.get('book_value_per_share', 0), "每股净资产", min_val=0.01)
        current_pb = self._validate_input(data.get('pb_ratio', 0), "当前PB", min_val=0)
        target_pb = data.get('target_pb', current_pb)
        roe = data.get('roe', 0)
        
        # 基于目标PB计算目标价
        target_price = bvps * target_pb
        
        # 合理PB估算 (基于ROE)
        # 合理PB ≈ ROE / 要求回报率
        required_return = self.risk_free_rate + self.market_risk_premium
        fair_pb = (roe / 100) / required_return if roe > 0 else 0
        
        # 敏感性分析
        sensitivity = {}
        for pb in [target_pb * 0.8, target_pb, target_pb * 1.2]:
            sensitivity[f"PB_{pb:.1f}"] = round(bvps * pb, 2)
        
        return {
            "method": "PB估值法",
            "target_price": round(target_price, 2),
            "current_pb": round(current_pb, 2),
            "target_pb": round(target_pb, 2),
            "fair_pb": round(fair_pb, 2),
            "pb_premium": round((current_pb / fair_pb - 1) * 100, 2) if fair_pb > 0 else None,
            "sensitivity": sensitivity,
            "assumptions": {
                "book_value_per_share": bvps,
                "target_pb": target_pb,
                "roe": f"{roe}%"
            },
            "confidence": "medium"
        }
    
    def calculate_dcf_valuation(self, data: Dict) -> Dict:
        """
        自由现金流折现模型
        
        Args:
            data: {
                "fcf": 当前自由现金流,
                "growth_rate_5y": 前5年增长率(%),
                "growth_rate_terminal": 永续增长率(%),
                "wacc": 加权平均资本成本(%),
                "shares_outstanding": 总股本,
                "net_debt": 净负债
            }
        """
        fcf = self._validate_input(data.get('fcf', 0), "FCF")
        growth_5y = self._validate_input(data.get('growth_rate_5y', 0), "5年增长", min_val=-50, max_val=100)
        growth_terminal = self._validate_input(data.get('growth_rate_terminal', 2), "永续增长", min_val=0, max_val=5)
        wacc = self._validate_input(data.get('wacc', 10), "WACC", min_val=1, max_val=30)
        shares = self._validate_input(data.get('shares_outstanding', 1), "总股本", min_val=1)
        net_debt = data.get('net_debt', 0)
        
        # 转换为小数
        g5 = growth_5y / 100
        gt = growth_terminal / 100
        r = wacc / 100
        
        # 计算预测期现金流现值
        pv_fcf = 0
        fcf_list = []
        for year in range(1, 6):
            fcf_year = fcf * ((1 + g5) ** year)
            pv = fcf_year / ((1 + r) ** year)
            pv_fcf += pv
            fcf_list.append({
                "year": year,
                "fcf": round(fcf_year, 2),
                "pv": round(pv, 2)
            })
        
        # 计算终值
        fcf_year5 = fcf * ((1 + g5) ** 5)
        terminal_value = fcf_year5 * (1 + gt) / (r - gt)
        pv_terminal = terminal_value / ((1 + r) ** 5)
        
        # 企业价值
        enterprise_value = pv_fcf + pv_terminal
        
        # 股权价值
        equity_value = enterprise_value - net_debt
        
        # 每股价值
        value_per_share = equity_value / shares
        
        # 敏感性分析 (WACC vs 增长率)
        sensitivity = {}
        for w in [r - 0.02, r, r + 0.02]:
            for g in [g5 - 0.05, g5, g5 + 0.05]:
                if w > gt:
                    pv_fcf_sens = sum(fcf * ((1 + g) ** y) / ((1 + w) ** y) for y in range(1, 6))
                    fcf5 = fcf * ((1 + g) ** 5)
                    tv = fcf5 * (1 + gt) / (w - gt)
                    pv_tv = tv / ((1 + w) ** 5)
                    ev = pv_fcf_sens + pv_tv
                    eq = ev - net_debt
                    price = eq / shares
                    sensitivity[f"WACC{w*100:.0f}%_G{g*100:.0f}%"] = round(price, 2)
        
        return {
            "method": "DCF估值法",
            "value_per_share": round(value_per_share, 2),
            "enterprise_value": round(enterprise_value, 2),
            "equity_value": round(equity_value, 2),
            "pv_fcf_5y": round(pv_fcf, 2),
            "pv_terminal": round(pv_terminal, 2),
            "terminal_value": round(terminal_value, 2),
            "fcf_projection": fcf_list,
            "sensitivity": sensitivity,
            "assumptions": {
                "current_fcf": fcf,
                "growth_rate_5y": f"{growth_5y}%",
                "growth_rate_terminal": f"{growth_terminal}%",
                "wacc": f"{wacc}%",
                "shares_outstanding": shares,
                "net_debt": net_debt
            },
            "confidence": "medium"
        }
    
    def calculate_evebitda_valuation(self, data: Dict) -> Dict:
        """
        EV/EBITDA估值法
        
        Args:
            data: {
                "ebitda": EBITDA,
                "net_debt": 净负债,
                "shares_outstanding": 总股本,
                "ev_ebitda_current": 当前EV/EBITDA,
                "ev_ebitda_target": 目标EV/EBITDA
            }
        """
        ebitda = self._validate_input(data.get('ebitda', 0), "EBITDA", min_val=0.01)
        net_debt = data.get('net_debt', 0)
        shares = self._validate_input(data.get('shares_outstanding', 1), "总股本", min_val=1)
        current_multiple = self._validate_input(data.get('ev_ebitda_current', 0), "当前EV/EBITDA", min_val=0)
        target_multiple = data.get('ev_ebitda_target', current_multiple)
        
        # 计算目标企业价值
        target_ev = ebitda * target_multiple
        
        # 股权价值
        equity_value = target_ev - net_debt
        
        # 每股价值
        value_per_share = equity_value / shares
        
        # 敏感性分析
        sensitivity = {}
        for mult in [target_multiple * 0.8, target_multiple, target_multiple * 1.2]:
            ev = ebitda * mult
            eq = ev - net_debt
            price = eq / shares
            sensitivity[f"EV/EBITDA_{mult:.1f}x"] = round(price, 2)
        
        return {
            "method": "EV/EBITDA估值法",
            "value_per_share": round(value_per_share, 2),
            "enterprise_value": round(target_ev, 2),
            "equity_value": round(equity_value, 2),
            "current_multiple": round(current_multiple, 2),
            "target_multiple": round(target_multiple, 2),
            "sensitivity": sensitivity,
            "assumptions": {
                "ebitda": ebitda,
                "net_debt": net_debt,
                "target_multiple": target_multiple
            },
            "confidence": "medium"
        }
    
    def calculate_ddm_valuation(self, data: Dict) -> Dict:
        """
        股利贴现模型
        
        Args:
            data: {
                "dividend_per_share": 每股股利,
                "growth_rate": 股利增长率(%),
                "required_return": 要求回报率(%)
            }
        """
        dps = self._validate_input(data.get('dividend_per_share', 0), "每股股利", min_val=0)
        growth = self._validate_input(data.get('growth_rate', 2), "增长率", min_val=0, max_val=10)
        required = self._validate_input(data.get('required_return', 10), "要求回报率", min_val=growth + 1, max_val=30)
        
        g = growth / 100
        r = required / 100
        
        # Gordon增长模型
        if r > g:
            value = dps * (1 + g) / (r - g)
        else:
            value = 0
            self.warnings.append("要求回报率必须大于增长率")
        
        # 敏感性分析
        sensitivity = {}
        for req in [required - 2, required, required + 2]:
            for gr in [max(0, growth - 1), growth, growth + 1]:
                if req > gr:
                    val = dps * (1 + gr/100) / (req/100 - gr/100)
                    sensitivity[f"R{req:.0f}%_G{gr:.0f}%"] = round(val, 2)
        
        return {
            "method": "DDM股利贴现模型",
            "value_per_share": round(value, 2),
            "dividend_yield": round(dps / value * 100, 2) if value > 0 else 0,
            "sensitivity": sensitivity,
            "assumptions": {
                "dividend_per_share": dps,
                "growth_rate": f"{growth}%",
                "required_return": f"{required}%"
            },
            "confidence": "high" if dps > 0 else "low"
        }
    
    def comprehensive_valuation(self, data: Dict) -> Dict:
        """
        综合估值分析
        
        Args:
            data: 包含各估值方法所需参数的字典
            
        Returns:
            综合估值结果
        """
        results = []
        
        # PE估值
        if 'eps' in data and data['eps'] > 0:
            try:
                pe_result = self.calculate_pe_valuation(data)
                results.append(pe_result)
            except Exception as e:
                self.warnings.append(f"PE估值失败: {str(e)}")
        
        # PB估值
        if 'book_value_per_share' in data and data['book_value_per_share'] > 0:
            try:
                pb_result = self.calculate_pb_valuation(data)
                results.append(pb_result)
            except Exception as e:
                self.warnings.append(f"PB估值失败: {str(e)}")
        
        # DCF估值
        if 'fcf' in data and data['fcf'] != 0:
            try:
                dcf_result = self.calculate_dcf_valuation(data)
                results.append(dcf_result)
            except Exception as e:
                self.warnings.append(f"DCF估值失败: {str(e)}")
        
        # EV/EBITDA估值
        if 'ebitda' in data and data['ebitda'] > 0:
            try:
                ev_result = self.calculate_evebitda_valuation(data)
                results.append(ev_result)
            except Exception as e:
                self.warnings.append(f"EV/EBITDA估值失败: {str(e)}")
        
        # DDM估值
        if 'dividend_per_share' in data and data['dividend_per_share'] > 0:
            try:
                ddm_result = self.calculate_ddm_valuation(data)
                results.append(ddm_result)
            except Exception as e:
                self.warnings.append(f"DDM估值失败: {str(e)}")
        
        # 计算估值区间
        if results:
            values = [r['value_per_share'] for r in results if 'value_per_share' in r]
            if values:
                valuation_range = {
                    "low": round(min(values), 2),
                    "high": round(max(values), 2),
                    "median": round(sorted(values)[len(values)//2], 2),
                    "average": round(sum(values)/len(values), 2)
                }
            else:
                valuation_range = None
        else:
            valuation_range = None
        
        return {
            "individual_results": results,
            "valuation_range": valuation_range,
            "warnings": self.warnings,
            "timestamp": datetime.now().isoformat()
        }


def main():
    """命令行入口"""
    if len(sys.argv) < 2:
        print("Usage: python valuation_engine.py <command> [args...]")
        print("Commands:")
        print("  pe <json_file>        - PE估值")
        print("  pb <json_file>        - PB估值")
        print("  dcf <json_file>       - DCF估值")
        print("  ev_ebitda <json_file> - EV/EBITDA估值")
        print("  ddm <json_file>       - DDM估值")
        print("  comprehensive <json_file> - 综合估值")
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if len(sys.argv) < 3:
            print("Error: 需要JSON文件路径")
            sys.exit(1)
        
        with open(sys.argv[2], 'r') as f:
            data = json.load(f)
        
        engine = ValuationEngine()
        
        if command == "pe":
            result = engine.calculate_pe_valuation(data)
        elif command == "pb":
            result = engine.calculate_pb_valuation(data)
        elif command == "dcf":
            result = engine.calculate_dcf_valuation(data)
        elif command == "ev_ebitda":
            result = engine.calculate_evebitda_valuation(data)
        elif command == "ddm":
            result = engine.calculate_ddm_valuation(data)
        elif command == "comprehensive":
            result = engine.comprehensive_valuation(data)
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
        
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
