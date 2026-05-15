export interface KLineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
}

export interface TechnicalIndicators {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi: number;
  macd: { dif: number; dea: number; bar: number };
}

export interface TrendAnalysis {
  trend: '上升' | '下降' | '震荡';
  supportLevel: number;
  resistanceLevel: number;
  signal: '买入' | '卖出' | '观望';
}

export class AStockData {
  async fetchStockData(code: string, days = 60): Promise<KLineData[]> {
    const mockData: KLineData[] = [];
    let basePrice = code.startsWith('6') ? 50 : 30;
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const change = (Math.random() - 0.48) * 0.04;
      basePrice = basePrice * (1 + change);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        open: basePrice * (1 + (Math.random() - 0.5) * 0.01),
        high: basePrice * (1 + Math.random() * 0.02),
        low: basePrice * (1 - Math.random() * 0.02),
        close: basePrice,
        change: basePrice * change,
        changePercent: change * 100,
        volume: Math.floor(Math.random() * 100000) + 50000,
        amount: Math.floor(Math.random() * 100000000) + 50000000
      });
    }
    return mockData;
  }

  async fetchIndexData(indexCode: string, days = 30): Promise<KLineData[]> {
    const indexMap: Record<string, number> = { '000001': 3000, '399001': 9500, '399006': 1800 };
    let basePrice = indexMap[indexCode] || 3000;
    const mockData: KLineData[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const change = (Math.random() - 0.48) * 0.015;
      basePrice = basePrice * (1 + change);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        open: basePrice * 0.998,
        high: basePrice * 1.008,
        low: basePrice * 0.992,
        close: basePrice,
        change: basePrice * change,
        changePercent: change * 100,
        volume: Math.floor(Math.random() * 10000000) + 5000000,
        amount: Math.floor(Math.random() * 10000000000)
      });
    }
    return mockData;
  }

  calculateIndicators(data: KLineData[]): TechnicalIndicators {
    const closes = data.map(d => d.close);
    const ma5 = this.calculateMA(closes, 5);
    const ma10 = this.calculateMA(closes, 10);
    const ma20 = this.calculateMA(closes, 20);
    const ma60 = this.calculateMA(closes, 60);
    const rsi = this.calculateRSI(closes, 14);
    const macd = this.calculateMACD(closes);
    
    return { ma5, ma10, ma20, ma60, rsi, macd };
  }

  analyzeTrend(data: KLineData[]): TrendAnalysis {
    const closes = data.map(d => d.close);
    const recent = closes.slice(-20);
    const ma20 = this.calculateMA(closes, 20);
    const current = closes[closes.length - 1];
    
    const support = Math.min(...recent) * 0.98;
    const resistance = Math.max(...recent) * 1.02;
    
    let trend: '上升' | '下降' | '震荡' = '震荡';
    if (current > ma20 * 1.02) trend = '上升';
    else if (current < ma20 * 0.98) trend = '下降';
    
    let signal: '买入' | '卖出' | '观望' = '观望';
    if (current < support * 1.01) signal = '买入';
    else if (current > resistance * 0.99) signal = '卖出';
    
    return { trend, supportLevel: support, resistanceLevel: resistance, signal };
  }

  private calculateMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];
    const sum = data.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateRSI(data: number[], period = 14): number {
    if (data.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = data.length - period; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(data: number[]): { dif: number; dea: number; bar: number } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const dif = ema12 - ema26;
    const dea = dif * 0.2 + (ema26 - ema12) * 0.8;
    return { dif, dea, bar: (dif - dea) * 2 };
  }

  private calculateEMA(data: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    return ema;
  }
}

export const aStockData = new AStockData();
