export interface ValuationInput {
  eps?: number;
  pe_ratio?: number;
  target_pe?: number;
  growth_rate?: number;
  book_value_per_share?: number;
  pb_ratio?: number;
  target_pb?: number;
  roe?: number;
  fcf?: number;
  growth_rate_5y?: number;
  growth_rate_terminal?: number;
  wacc?: number;
  shares_outstanding?: number;
  net_debt?: number;
  ebitda?: number;
  ev_ebitda_current?: number;
  ev_ebitda_target?: number;
  dividend_per_share?: number;
  required_return?: number;
}

export interface ValuationResult {
  method: string;
  target_price?: number;
  value_per_share?: number;
  assumptions: Record<string, any>;
  sensitivity: Record<string, number>;
  confidence: 'high' | 'medium' | 'low';
}

export class ValuationEngine {
  private warnings: string[] = [];
  private riskFreeRate = 0.04;
  private marketRiskPremium = 0.06;

  calculatePEValuation(data: Partial<ValuationInput>): ValuationResult {
    const eps = data.eps || 0;
    const currentPE = data.pe_ratio || 0;
    const targetPE = data.target_pe || currentPE;
    const growthRate = data.growth_rate || 0;

    const targetPrice = eps * targetPE;
    const peg = growthRate > 0 ? currentPE / growthRate : Infinity;

    const sensitivity: Record<string, number> = {};
    [targetPE * 0.8, targetPE, targetPE * 1.2].forEach(pe => {
      sensitivity[`PE_${pe.toFixed(1)}`] = Math.round(eps * pe * 100) / 100;
    });

    return {
      method: 'PE估值法',
      target_price: Math.round(targetPrice * 100) / 100,
      assumptions: {
        eps,
        target_pe: targetPE,
        growth_rate: `${growthRate}%`,
        peg: peg === Infinity ? null : Math.round(peg * 100) / 100,
        peg_assessment: peg < 1 ? '低估' : peg <= 2 ? '合理' : '高估'
      },
      sensitivity,
      confidence: 'medium'
    };
  }

  calculatePBValuation(data: Partial<ValuationInput>): ValuationResult {
    const bvps = data.book_value_per_share || 0;
    const currentPB = data.pb_ratio || 0;
    const targetPB = data.target_pb || currentPB;
    const roe = data.roe || 0;

    const targetPrice = bvps * targetPB;
    const requiredReturn = this.riskFreeRate + this.marketRiskPremium;
    const fairPB = roe > 0 ? (roe / 100) / requiredReturn : 0;

    const sensitivity: Record<string, number> = {};
    [targetPB * 0.8, targetPB, targetPB * 1.2].forEach(pb => {
      sensitivity[`PB_${pb.toFixed(1)}`] = Math.round(bvps * pb * 100) / 100;
    });

    return {
      method: 'PB估值法',
      target_price: Math.round(targetPrice * 100) / 100,
      assumptions: {
        book_value_per_share: bvps,
        target_pb: targetPB,
        roe: `${roe}%`,
        fair_pb: Math.round(fairPB * 100) / 100,
        pb_premium: fairPB > 0 ? Math.round((currentPB / fairPB - 1) * 10000) / 100 : null
      },
      sensitivity,
      confidence: 'medium'
    };
  }

  calculateDCFValuation(data: Partial<ValuationInput>): ValuationResult {
    const fcf = data.fcf || 0;
    const growth5Y = (data.growth_rate_5y || 0) / 100;
    const growthTerminal = (data.growth_rate_terminal || 0.02) / 100;
    const wacc = (data.wacc || 10) / 100;
    const shares = data.shares_outstanding || 1;
    const netDebt = data.net_debt || 0;

    let pvFCF = 0;
    const fcfList: { year: number; fcf: number; pv: number }[] = [];

    for (let year = 1; year <= 5; year++) {
      const fcfYear = fcf * Math.pow(1 + growth5Y, year);
      const pv = fcfYear / Math.pow(1 + wacc, year);
      pvFCF += pv;
      fcfList.push({ year, fcf: Math.round(fcfYear * 100) / 100, pv: Math.round(pv * 100) / 100 });
    }

    const fcfYear5 = fcf * Math.pow(1 + growth5Y, 5);
    const terminalValue = fcfYear5 * (1 + growthTerminal) / (wacc - growthTerminal);
    const pvTerminal = terminalValue / Math.pow(1 + wacc, 5);
    const enterpriseValue = pvFCF + pvTerminal;
    const equityValue = enterpriseValue - netDebt;
    const valuePerShare = equityValue / shares;

    const sensitivity: Record<string, number> = {};
    [wacc - 0.02, wacc, wacc + 0.02].forEach(w => {
      [growth5Y - 0.05, growth5Y, growth5Y + 0.05].forEach(g => {
        if (w > growthTerminal) {
          let pv = 0;
          for (let y = 1; y <= 5; y++) {
            pv += fcf * Math.pow(1 + g, y) / Math.pow(1 + w, y);
          }
          const fcf5 = fcf * Math.pow(1 + g, 5);
          const tv = fcf5 * (1 + growthTerminal) / (w - growthTerminal);
          const pvtv = tv / Math.pow(1 + w, 5);
          const ev = pv + pvtv;
          const eq = ev - netDebt;
          const price = eq / shares;
          sensitivity[`WACC${(w * 100).toFixed(0)}%_G${(g * 100).toFixed(0)}%`] = Math.round(price * 100) / 100;
        }
      });
    });

    return {
      method: 'DCF估值法',
      value_per_share: Math.round(valuePerShare * 100) / 100,
      assumptions: {
        current_fcf: fcf,
        growth_rate_5y: `${(growth5Y * 100).toFixed(0)}%`,
        growth_rate_terminal: `${(growthTerminal * 100).toFixed(0)}%`,
        wacc: `${(wacc * 100).toFixed(0)}%`,
        shares_outstanding: shares,
        net_debt: netDebt,
        pv_fcf_5y: Math.round(pvFCF * 100) / 100,
        pv_terminal: Math.round(pvTerminal * 100) / 100
      },
      sensitivity,
      confidence: 'medium'
    };
  }

  calculateEVEBITDAValuation(data: Partial<ValuationInput>): ValuationResult {
    const ebitda = data.ebitda || 0;
    const netDebt = data.net_debt || 0;
    const shares = data.shares_outstanding || 1;
    const currentMultiple = data.ev_ebitda_current || 0;
    const targetMultiple = data.ev_ebitda_target || currentMultiple;

    const targetEV = ebitda * targetMultiple;
    const equityValue = targetEV - netDebt;
    const valuePerShare = equityValue / shares;

    const sensitivity: Record<string, number> = {};
    [targetMultiple * 0.8, targetMultiple, targetMultiple * 1.2].forEach(mult => {
      const ev = ebitda * mult;
      const eq = ev - netDebt;
      const price = eq / shares;
      sensitivity[`EV/EBITDA_${mult.toFixed(1)}x`] = Math.round(price * 100) / 100;
    });

    return {
      method: 'EV/EBITDA估值法',
      value_per_share: Math.round(valuePerShare * 100) / 100,
      assumptions: {
        ebitda,
        net_debt: netDebt,
        target_multiple: targetMultiple,
        enterprise_value: Math.round(targetEV * 100) / 100,
        equity_value: Math.round(equityValue * 100) / 100
      },
      sensitivity,
      confidence: 'medium'
    };
  }

  calculateDDMValuation(data: Partial<ValuationInput>): ValuationResult {
    const dps = data.dividend_per_share || 0;
    const growth = (data.growth_rate || 2) / 100;
    const required = (data.required_return || 10) / 100;

    let value = 0;
    if (required > growth) {
      value = dps * (1 + growth) / (required - growth);
    }

    const sensitivity: Record<string, number> = {};
    [required - 0.02, required, required + 0.02].forEach(req => {
      [Math.max(0, growth - 0.01), growth, growth + 0.01].forEach(gr => {
        if (req > gr) {
          const val = dps * (1 + gr) / (req - gr);
          sensitivity[`R${(req * 100).toFixed(0)}%_G${(gr * 100).toFixed(0)}%`] = Math.round(val * 100) / 100;
        }
      });
    });

    return {
      method: 'DDM股利贴现模型',
      value_per_share: Math.round(value * 100) / 100,
      assumptions: {
        dividend_per_share: dps,
        growth_rate: `${(growth * 100).toFixed(0)}%`,
        required_return: `${(required * 100).toFixed(0)}%`,
        dividend_yield: value > 0 ? Math.round(dps / value * 10000) / 100 : 0
      },
      sensitivity,
      confidence: dps > 0 ? 'high' : 'low'
    };
  }

  comprehensiveValuation(data: Partial<ValuationInput>): {
    individual_results: ValuationResult[];
    valuation_range: { low: number; high: number; median: number; average: number } | null;
    timestamp: string;
  } {
    const results: ValuationResult[] = [];

    if (data.eps && data.eps > 0) {
      results.push(this.calculatePEValuation(data));
    }

    if (data.book_value_per_share && data.book_value_per_share > 0) {
      results.push(this.calculatePBValuation(data));
    }

    if (data.fcf && data.fcf !== 0) {
      results.push(this.calculateDCFValuation(data));
    }

    if (data.ebitda && data.ebitda > 0) {
      results.push(this.calculateEVEBITDAValuation(data));
    }

    if (data.dividend_per_share && data.dividend_per_share > 0) {
      results.push(this.calculateDDMValuation(data));
    }

    let valuationRange: { low: number; high: number; median: number; average: number } | null = null;

    if (results.length > 0) {
      const values = results
        .map(r => r.value_per_share || r.target_price)
        .filter((v): v is number => v !== undefined && v > 0);

      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        valuationRange = {
          low: Math.round(sorted[0] * 100) / 100,
          high: Math.round(sorted[sorted.length - 1] * 100) / 100,
          median: Math.round(sorted[Math.floor(sorted.length / 2)] * 100) / 100,
          average: Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 100) / 100
        };
      }
    }

    return {
      individual_results: results,
      valuation_range: valuationRange,
      timestamp: new Date().toISOString()
    };
  }
}

export const valuationEngine = new ValuationEngine();
