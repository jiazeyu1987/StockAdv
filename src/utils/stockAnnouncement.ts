export interface Announcement {
  id: string;
  title: string;
  date: string;
  type: '年报' | '季报' | '重大事项' | '股权变动' | '其他';
  importance: '高' | '中' | '低';
  summary: string;
  url?: string;
}

export class StockAnnouncement {
  async fetchAnnouncements(stockCode: string, days: number = 30): Promise<Announcement[]> {
    const mockData: Announcement[] = [
      {
        id: '1',
        title: `${stockCode} 2024年年度报告`,
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        type: '年报',
        importance: '高',
        summary: '公司2024年实现营收增长15%，净利润增长20%，业绩符合预期。'
      },
      {
        id: '2',
        title: `${stockCode} 2024年第三季度报告`,
        date: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0],
        type: '季报',
        importance: '中',
        summary: 'Q3单季度营收环比增长8%，毛利率保持稳定。'
      },
      {
        id: '3',
        title: `${stockCode} 关于对外投资公告`,
        date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
        type: '重大事项',
        importance: '高',
        summary: '公司拟投资5亿元建设新生产基地，预计2025年底投产。'
      },
      {
        id: '4',
        title: `${stockCode} 股东减持股份计划公告`,
        date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
        type: '股权变动',
        importance: '中',
        summary: '控股股东计划减持不超过2%股份，用于个人资金需求。'
      }
    ];
    return mockData.filter(a => new Date(a.date) >= new Date(Date.now() - days * 86400000));
  }

  classifyByType(announcements: Announcement[]): Record<string, Announcement[]> {
    return announcements.reduce((acc, ann) => {
      if (!acc[ann.type]) acc[ann.type] = [];
      acc[ann.type].push(ann);
      return acc;
    }, {} as Record<string, Announcement[]>);
  }

  getHighImportance(announcements: Announcement[]): Announcement[] {
    return announcements.filter(a => a.importance === '高');
  }

  getRecentAnnouncements(announcements: Announcement[], days: number = 7): Announcement[] {
    const cutoff = new Date(Date.now() - days * 86400000);
    return announcements.filter(a => new Date(a.date) >= cutoff);
  }
}

export const stockAnnouncement = new StockAnnouncement();
