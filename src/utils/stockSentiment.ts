export interface SentimentResult {
  score: number;
  level: 'positive' | 'neutral' | 'negative';
  riskKeywords: string[];
  riskLevel: 'low' | 'medium' | 'high';
  alerts: string[];
}

export class StockSentiment {
  private riskKeywords: Record<string, string[]> = {
    high: ['财务造假', '重大诉讼', '监管处罚', '立案调查', '退市风险', '业绩暴雷', '债务违约'],
    medium: ['业绩下滑', '高管变动', '股东减持', '竞争加剧', '成本上升', '需求疲软'],
    low: ['市场波动', '估值调整', '短期回调', '流动性收紧']
  };

  analyzeSentiment(news: string[]): SentimentResult {
    const foundHigh = this.findKeywords(news, this.riskKeywords.high);
    const foundMedium = this.findKeywords(news, this.riskKeywords.medium);
    const foundLow = this.findKeywords(news, this.riskKeywords.low);

    const allRisks = [...foundHigh, ...foundMedium, ...foundLow];
    let score = 70;
    score -= foundHigh.length * 20;
    score -= foundMedium.length * 10;
    score -= foundLow.length * 5;
    score = Math.max(0, Math.min(100, score));

    const riskLevel: 'low' | 'medium' | 'high' = foundHigh.length > 0 ? 'high' : foundMedium.length > 2 ? 'medium' : 'low';
    const level: 'positive' | 'neutral' | 'negative' = score > 70 ? 'positive' : score > 40 ? 'neutral' : 'negative';

    const alerts = this.generateAlerts(foundHigh, foundMedium);

    return { score, level, riskKeywords: allRisks, riskLevel, alerts };
  }

  private findKeywords(news: string[], keywords: string[]): string[] {
    const found: string[] = [];
    news.forEach(n => {
      keywords.forEach(k => {
        if (n.includes(k) && !found.includes(k)) found.push(k);
      });
    });
    return found;
  }

  private generateAlerts(high: string[], medium: string[]): string[] {
    const alerts: string[] = [];
    if (high.length > 0) alerts.push(`高风险：发现${high.join('、')}等关键词`);
    if (medium.length > 2) alerts.push(`中风险：发现${medium.slice(0, 3).join('、')}等关键词`);
    return alerts;
  }

  getMockAnalysis(): SentimentResult {
    return {
      score: 75,
      level: 'positive',
      riskKeywords: ['市场波动'],
      riskLevel: 'low',
      alerts: []
    };
  }
}

export const stockSentiment = new StockSentiment();
