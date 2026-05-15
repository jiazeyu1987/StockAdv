const fs = require('fs').promises;
const path = require('path');

/**
 * OSINT数据关联分析引擎
 * 构建企业关系图谱、识别关键节点、提取洞察
 */

class RelationAnalyzer {
  constructor(options = {}) {
    this.inputPath = options.inputPath || '/tmp/osint-cache/collection-results.json';
    this.outputDir = options.outputDir || '/tmp/osint-cache';
    this.analysisResults = {
      nodes: [],
      edges: [],
      insights: [],
      statistics: {}
    };
  }

  /**
   * 执行完整的分析流程
   */
  async analyze() {
    console.log('[INFO] 开始数据关联分析...');
    
    const rawData = await this.loadData();
    if (!rawData) {
      console.error('[ERROR] 无法加载采集数据');
      return null;
    }

    await this.buildNodes(rawData);
    await this.buildEdges(rawData);
    await this.generateInsights(rawData);
    await this.calculateStatistics(rawData);
    await this.saveResults();

    console.log('[INFO] 分析完成');
    return this.analysisResults;
  }

  /**
   * 加载采集数据
   */
  async loadData() {
    try {
      const content = await fs.readFile(this.inputPath, 'utf-8');
      const data = JSON.parse(content);
      console.log(`[INFO] 已加载采集数据`);
      return data;
    } catch (error) {
      console.error(`[ERROR] 加载数据失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 构建节点图谱
   */
  async buildNodes(data) {
    console.log('[ANALYZE] 构建节点图谱...');
    
    const nodeMap = new Map();

    // 企业节点
    if (data.enterprises) {
      data.enterprises.forEach(ent => {
        const nodeId = this.normalizeId(ent.name);
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, {
            id: nodeId,
            type: 'enterprise',
            name: ent.name,
            properties: ent.data || {},
            sources: ['enterprise-registry']
          });
        }
      });
    }

    // 人员节点
    if (data.people) {
      data.people.forEach(person => {
        person.profiles?.forEach(profile => {
          const nodeId = this.normalizeId(profile.name);
          if (!nodeMap.has(nodeId)) {
            nodeMap.set(nodeId, {
              id: nodeId,
              type: 'person',
              name: profile.name,
              properties: profile,
              sources: ['social-media']
            });
          }
        });
      });
    }

    // 专利节点
    if (data.patents) {
      data.patents.forEach(patentGroup => {
        patentGroup.patents?.forEach(patent => {
          const nodeId = this.normalizeId(patent.patentNumber);
          if (!nodeMap.has(nodeId)) {
            nodeMap.set(nodeId, {
              id: nodeId,
              type: 'patent',
              name: patent.title,
              properties: patent,
              sources: ['patent-database']
            });
          }
        });
      });
    }

    this.analysisResults.nodes = Array.from(nodeMap.values());
    console.log(`[ANALYZE] 构建完成: ${this.analysisResults.nodes.length} 个节点`);
  }

  /**
   * 构建关系边
   */
  async buildEdges(data) {
    console.log('[ANALYZE] 构建关系边...');
    
    const edges = [];

    // 投资关系
    if (data.enterprises) {
      data.enterprises.forEach(ent => {
        const sourceId = this.normalizeId(ent.name);
        
        // 股东关系
        ent.data?.shareholders?.forEach(shareholder => {
          const targetId = this.normalizeId(shareholder.name);
          edges.push({
            source: targetId,
            target: sourceId,
            type: 'shareholder',
            properties: {
              ratio: shareholder.ratio || 'unknown',
              amount: shareholder.amount || 'unknown'
            }
          });
        });

        // 子公司关系
        ent.data?.subsidiaries?.forEach(subsidiary => {
          const targetId = this.normalizeId(subsidiary.name);
          edges.push({
            source: sourceId,
            target: targetId,
            type: 'subsidiary',
            properties: {
              controlRatio: subsidiary.controlRatio || 'unknown'
            }
          });
        });

        // 投资关系
        ent.data?.investments?.forEach(investment => {
          const targetId = this.normalizeId(investment.target);
          edges.push({
            source: sourceId,
            target: targetId,
            type: 'investment',
            properties: {
              round: investment.round || 'unknown',
              amount: investment.amount || 'unknown',
              date: investment.date || 'unknown'
            }
          });
        });
      });
    }

    // 专利归属关系
    if (data.patents) {
      data.patents.forEach(patentGroup => {
        patentGroup.patents?.forEach(patent => {
          const patentId = this.normalizeId(patent.patentNumber);
          const applicantId = this.normalizeId(patent.applicant);
          edges.push({
            source: applicantId,
            target: patentId,
            type: 'owns_patent',
            properties: {
              applicationDate: patent.applicationDate,
              status: patent.status
            }
          });
        });
      });
    }

    this.analysisResults.edges = edges;
    console.log(`[ANALYZE] 构建完成: $$$${edges.length} 条关系边`);
  }

  /**
   * 生成洞察信息
   */
  async generateInsights(data) {
    console.log('[ANALYZE] 生成洞察信息...');

    const insights = [];

    // 分析企业集中度
    const enterpriseCount = data.enterprises?.length || 0;
    if (enterpriseCount > 0) {
      insights.push({
        type: 'scale',
        title: '企业网络规模',
        description: `发现 $$$${enterpriseCount} 家关联企业`,
        severity: enterpriseCount > 10 ? 'high' : 'medium'
      });
    }

    // 分析投资活跃度
    const investmentCount = this.analysisResults.edges.filter(e => e.type === 'investment').length;
    if (investmentCount > 0) {
      insights.push({
        type: 'investment',
        title: '投资活跃度',
        description: `发现 $$$${investmentCount} 条投资关系`,
        severity: investmentCount > 5 ? 'high' : 'medium'
      });
    }

    // 分析专利布局
    const patentCount = data.patents?.reduce((sum, p) => sum + (p.patents?.length || 0), 0) || 0;
    if (patentCount > 0) {
      insights.push({
        type: 'patent',
        title: '专利布局',
        description: `发现 $$$${patentCount} 项相关专利`,
        severity: patentCount > 10 ? 'high' : 'medium'
      });
    }

    // 识别关键节点（度中心性）
    const nodeDegrees = new Map();
    this.analysisResults.edges.forEach(edge => {
      nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
      nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
    });

    const sortedNodes = Array.from(nodeDegrees.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedNodes.length > 0) {
      insights.push({
        type: 'key_nodes',
        title: '关键节点识别',
        description: `识别出 $$$${sortedNodes.length} 个关键节点`,
        details: sortedNodes.map(([nodeId, degree]) => ({ nodeId, degree })),
        severity: 'high'
      });
    }

    this.analysisResults.insights = insights;
    console.log(`[ANALYZE] 生成完成: $$$${insights.length} 条洞察`);
  }

  /**
   * 计算统计信息
   */
  async calculateStatistics(data) {
    console.log('[ANALYZE] 计算统计信息...');

    this.analysisResults.statistics = {
      totalNodes: this.analysisResults.nodes.length,
      totalEdges: this.analysisResults.edges.length,
      nodeTypes: {},
      edgeTypes: {},
      dataSourceCoverage: {
        enterprise: data.enterprises?.length || 0,
        news: data.news?.length || 0,
        people: data.people?.length || 0,
        patents: data.patents?.length || 0
      }
    };

    // 统计节点类型
    this.analysisResults.nodes.forEach(node => {
      const type = node.type || 'unknown';
      this.analysisResults.statistics.nodeTypes[type] =
        (this.analysisResults.statistics.nodeTypes[type] || 0) + 1;
    });

    // 统计关系类型
    this.analysisResults.edges.forEach(edge => {
      const type = edge.type || 'unknown';
      this.analysisResults.statistics.edgeTypes[type] =
        (this.analysisResults.statistics.edgeTypes[type] || 0) + 1;
    });

    console.log('[ANALYZE] 统计完成');
  }

  /**
   * 保存分析结果
   */
  async saveResults() {
    const outputPath = path.join(this.outputDir, 'analysis-results.json');
    try {
      await fs.writeFile(outputPath, JSON.stringify(this.analysisResults, null, 2));
      console.log(`[INFO] 分析结果已保存: $$$${outputPath}`);
    } catch (error) {
      console.error(`[ERROR] 保存分析结果失败: $$$${error.message}`);
    }
  }

  /**
   * 标准化ID
   */
  normalizeId(name) {
    return name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_');
  }
}

// CLI入口
async function main() {
  const args = process.argv.slice(2);

  let inputPath = '/tmp/osint-cache/collection-results.json';
  let outputDir = '/tmp/osint-cache';

  args.forEach(arg => {
    if (arg.startsWith('--input=')) {
      inputPath = arg.replace('--input=', '');
    } else if (arg.startsWith('--output=')) {
      outputDir = arg.replace('--output=', '');
    }
  });

  const analyzer = new RelationAnalyzer({
    inputPath,
    outputDir
  });

  try {
    const results = await analyzer.analyze();
    console.log('\n[COMPLETE] 分析完成');
    console.log(`[SUMMARY] 节点数: $$$${results.statistics.totalNodes}`);
    console.log(`[SUMMARY] 关系数: $$$${results.statistics.totalEdges}`);
    console.log(`[SUMMARY] 洞察数: $$$${results.insights.length}`);
    process.exit(0);
  } catch (error) {
    console.error('[FATAL] 分析过程出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { RelationAnalyzer };
