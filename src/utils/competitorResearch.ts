export interface CompetitorInfo {
  name: string;
  marketShare: number;
  revenue: number;
  growthRate: number;
  strengths: string[];
  weaknesses: string[];
}

export interface SupplyChain {
  upstream: { name: string; bargaining: '强' | '中' | '弱' }[];
  downstream: { name: string; bargaining: '强' | '中' | '弱' }[];
}

export interface IndustryLandscape {
  totalMarket: number;
  growthRate: number;
  cr5: number;
  trend: '集中' | '分散' | '稳定';
}

export interface KeyPerson {
  name: string;
  position: string;
  background: string;
  risk: 'low' | 'medium' | 'high';
}

export interface CompetitorResearchResult {
  competitors: CompetitorInfo[];
  supplyChain: SupplyChain;
  industry: IndustryLandscape;
  keyPersons: KeyPerson[];
  comparison: {
    target: string;
    advantages: string[];
    disadvantages: string[];
  };
}

export class CompetitorResearch {
  analyzeCompetitors(stockName: string): CompetitorInfo[] {
    return [
      { name: '竞争对手A', marketShare: 25, revenue: 120, growthRate: 15, strengths: ['品牌优势', '渠道覆盖'], weaknesses: ['成本高', '创新慢'] },
      { name: '竞争对手B', marketShare: 18, revenue: 85, growthRate: 12, strengths: ['技术领先', '成本控制'], weaknesses: ['规模小', '品牌弱'] },
      { name: stockName, marketShare: 22, revenue: 100, growthRate: 18, strengths: ['综合竞争力强', '盈利稳定'], weaknesses: ['国际化不足'] }
    ];
  }

  analyzeSupplyChain(): SupplyChain {
    return {
      upstream: [
        { name: '原材料供应商A', bargaining: '中' },
        { name: '原材料供应商B', bargaining: '弱' }
      ],
      downstream: [
        { name: '经销商A', bargaining: '弱' },
        { name: '终端客户', bargaining: '中' }
      ]
    };
  }

  analyzeIndustry(): IndustryLandscape {
    return {
      totalMarket: 500,
      growthRate: 10,
      cr5: 65,
      trend: '集中'
    };
  }

  analyzeKeyPersons(): KeyPerson[] {
    return [
      { name: '董事长', position: '董事长/CEO', background: '20年行业经验', risk: 'low' },
      { name: '财务总监', position: 'CFO', background: '知名会计师事务所背景', risk: 'low' }
    ];
  }

  compareWithCompetitors(stockName: string): CompetitorResearchResult {
    return {
      competitors: this.analyzeCompetitors(stockName),
      supplyChain: this.analyzeSupplyChain(),
      industry: this.analyzeIndustry(),
      keyPersons: this.analyzeKeyPersons(),
      comparison: {
        target: stockName,
        advantages: ['市场地位稳固', '盈利能力领先', '管理团队优秀'],
        disadvantages: ['国际化程度低', '新产品占比待提升']
      }
    };
  }
}

export const competitorResearch = new CompetitorResearch();
