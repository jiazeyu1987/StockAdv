const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

/**
 * OSINT数据采集引擎
 * 支持多源数据采集：企业信息、新闻资讯、社交媒体、专利数据
 */

class OSINTCollector {
  constructor(options = {}) {
    this.seeds = options.seeds || [];
    this.dataSources = options.dataSources || ['enterprise', 'news'];
    this.depth = options.depth || 2;
    this.cacheDir = options.cacheDir || '/tmp/osint-cache';
    this.results = {
      enterprises: [],
      news: [],
      people: [],
      patents: [],
      relations: []
    };
  }

  /**
   * 初始化缓存目录
   */
  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      console.log(`[INFO] 缓存目录已创建: ${this.cacheDir}`);
    } catch (error) {
      console.error(`[ERROR] 创建缓存目录失败: ${error.message}`);
    }
  }

  /**
   * 执行完整的数据采集流程
   */
  async collect() {
    await this.init();
    console.log('[INFO] 开始OSINT数据采集...');
    console.log(`[INFO] 种子信息: ${this.seeds.join(', ')}`);
    console.log(`[INFO] 数据源: ${this.dataSources.join(', ')}`);
    console.log(`[INFO] 迭代深度: ${this.depth}`);

    for (let iteration = 1; iteration <= this.depth; iteration++) {
      console.log(`\n[ITERATION ${iteration}] 开始第${iteration}轮迭代采集`);
      
      const currentSeeds = iteration === 1 ? this.seeds : this.extractNewSeeds();
      
      if (currentSeeds.length === 0) {
        console.log('[INFO] 没有新的种子，停止迭代');
        break;
      }

      for (const seed of currentSeeds) {
        await this.collectBySeed(seed);
      }
    }

    await this.saveResults();
    return this.results;
  }

  /**
   * 基于单个种子进行数据采集
   */
  async collectBySeed(seed) {
    console.log(`\n[SEED] 采集种子: "${seed}"`);

    for (const source of this.dataSources) {
      try {
        switch (source) {
          case 'enterprise':
            await this.collectEnterpriseInfo(seed);
            break;
          case 'news':
            await this.collectNewsInfo(seed);
            break;
          case 'social':
            await this.collectSocialInfo(seed);
            break;
          case 'patent':
            await this.collectPatentInfo(seed);
            break;
          default:
            console.log(`[WARN] 未知数据源: ${source}`);
        }
      } catch (error) {
        console.error(`[ERROR] 采集 ${source} 数据失败: ${error.message}`);
      }
    }
  }

  /**
   * 采集企业工商信息
   */
  async collectEnterpriseInfo(companyName) {
    console.log(`[ENTERPRISE] 采集企业信息: ${companyName}`);
    
    // 模拟企业信息采集
    // 实际实现中可调用天眼查、企查查等API或爬取公开数据
    const enterpriseData = {
      name: companyName,
      type: 'enterprise',
      collectedAt: new Date().toISOString(),
      source: 'public-registry',
      data: {
        registeredName: companyName,
        status: 'active',
        registeredCapital: '待查询',
        establishmentDate: '待查询',
        legalRepresentative: '待查询',
        businessScope: '待查询',
        shareholders: [],
        subsidiaries: [],
        investments: []
      }
    };

    this.results.enterprises.push(enterpriseData);
    console.log(`[ENTERPRISE] 企业信息采集完成: ${companyName}`);
  }

  /**
   * 采集新闻资讯
   */
  async collectNewsInfo(keyword) {
    console.log(`[NEWS] 采集新闻资讯: ${keyword}`);
    
    // 模拟新闻采集
    // 实际实现中可调用搜索引擎API或新闻聚合API
    const newsData = {
      keyword: keyword,
      type: 'news',
      collectedAt: new Date().toISOString(),
      articles: [
        {
          title: `${keyword} - 相关新闻标题示例`,
          source: '示例来源',
          publishDate: new Date().toISOString(),
          summary: '新闻摘要示例...',
          url: 'https://example.com/news/1'
        }
      ]
    };

    this.results.news.push(newsData);
    console.log(`[NEWS] 新闻采集完成: ${keyword}`);
  }

  /**
   * 采集社交媒体信息
   */
  async collectSocialInfo(keyword) {
    console.log(`[SOCIAL] 采集社交媒体信息: ${keyword}`);
    
    // 模拟社交媒体信息采集
    const socialData = {
      keyword: keyword,
      type: 'social',
      collectedAt: new Date().toISOString(),
      profiles: [
        {
          platform: 'LinkedIn',
          profileType: 'company',
          name: keyword,
          followers: '待查询',
          description: '待查询'
        }
      ]
    };

    this.results.people.push(socialData);
    console.log(`[SOCIAL] 社交媒体采集完成: ${keyword}`);
  }

  /**
   * 采集专利信息
   */
  async collectPatentInfo(keyword) {
    console.log(`[PATENT] 采集专利信息: ${keyword}`);
    
    // 模拟专利信息采集
    const patentData = {
      keyword: keyword,
      type: 'patent',
      collectedAt: new Date().toISOString(),
      patents: [
        {
          patentNumber: 'CNXXXXXXXX.X',
          title: `${keyword} 相关专利示例`,
          applicant: keyword,
          applicationDate: '待查询',
          status: '授权'
        }
      ]
    };

    this.results.patents.push(patentData);
    console.log(`[PATENT] 专利采集完成: ${keyword}`);
  }

  /**
   * 从当前结果中提取新的种子
   */
  extractNewSeeds() {
    const newSeeds = new Set();
    
    // 从企业信息中提取关联企业
    this.results.enterprises.forEach(ent => {
      if (ent.data.shareholders) {
        ent.data.shareholders.forEach(s => newSeeds.add(s.name));
      }
      if (ent.data.subsidiaries) {
        ent.data.subsidiaries.forEach(s => newSeeds.add(s.name));
      }
      if (ent.data.investments) {
        ent.data.investments.forEach(i => newSeeds.add(i.target));
      }
    });

    // 从新闻中提取新实体
    this.results.news.forEach(news => {
      news.articles.forEach(article => {
        // 提取文章中的公司名、人名等
        const entities = this.extractEntities(article.title + ' ' + article.summary);
        entities.forEach(e => newSeeds.add(e));
      });
    });

    // 过滤掉已采集的种子
    const existingSeeds = new Set(this.seeds);
    const filteredSeeds = Array.from(newSeeds).filter(s => !existingSeeds.has(s));
    
    console.log(`[EXTRACT] 提取到 ${filteredSeeds.length} 个新种子`);
    return filteredSeeds.slice(0, 10); // 限制每轮新种子数量
  }

  /**
   * 从文本中提取实体（简化版）
   */
  extractEntities(text) {
    // 简化实现：提取可能的公司名（包含"公司"、"集团"、"科技"等关键词）
    const patterns = [
      /[\u4e00-\u9fa5]{2,}(?:公司|集团|科技|网络|信息|软件)/g,
      /[A-Z][a-zA-Z0-9]*(?:\s+(?:Inc|Corp|Ltd|Company|Group))/g
    ];
    
    const entities = new Set();
    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(m => entities.add(m));
    });
    
    return Array.from(entities);
  }

  /**
   * 保存采集结果
   */
  async saveResults() {
    const outputPath = path.join(this.cacheDir, 'collection-results.json');
    try {
      await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`\n[INFO] 采集结果已保存: ${outputPath}`);
      console.log(`[SUMMARY] 企业信息: ${this.results.enterprises.length}`);
      console.log(`[SUMMARY] 新闻资讯: ${this.results.news.length}`);
      console.log(`[SUMMARY] 人员信息: ${this.results.people.length}`);
      console.log(`[SUMMARY] 专利信息: ${this.results.patents.length}`);
    } catch (error) {
      console.error(`[ERROR] 保存结果失败: ${error.message}`);
    }
  }
}

// CLI入口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node collect-data.js <seed1> [seed2] [seed3] ...');
    console.log('Options:');
    console.log('  --sources=enterprise,news,social,patent  指定数据源');
    console.log('  --depth=2                                指定迭代深度');
    process.exit(1);
  }

  const seeds = [];
  let dataSources = ['enterprise', 'news'];
  let depth = 2;

  args.forEach(arg => {
    if (arg.startsWith('--sources=')) {
      dataSources = arg.replace('--sources=', '').split(',');
    } else if (arg.startsWith('--depth=')) {
      depth = parseInt(arg.replace('--depth=', ''));
    } else {
      seeds.push(arg);
    }
  });

  const collector = new OSINTCollector({
    seeds,
    dataSources,
    depth
  });

  try {
    const results = await collector.collect();
    console.log('\n[COMPLETE] 数据采集完成');
    process.exit(0);
  } catch (error) {
    console.error('[FATAL] 采集过程出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { OSINTCollector };
