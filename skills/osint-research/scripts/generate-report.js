const fs = require('fs').promises;
const path = require('path');

/**
 * OSINT调研报告生成器
 * 生成格式化的Markdown报告和可视化图表
 */

class ReportGenerator {
  constructor(options = {}) {
    this.analysisPath = options.analysisPath || '/tmp/osint-cache/analysis-results.json';
    this.outputDir = options.outputDir || '/tmp/osint-cache';
    this.reportTitle = options.title || 'OSINT调研报告';
  }

  /**
   * 执行报告生成流程
   */
  async generate() {
    console.log('[INFO] 开始生成调研报告...');
    
    const analysisData = await this.loadAnalysisData();
    if (!analysisData) {
      console.error('[ERROR] 无法加载分析数据');
      return null;
    }

    const markdownReport = await this.generateMarkdownReport(analysisData);
    const htmlVisualization = await this.generateHTMLVisualization(analysisData);
    
    await this.saveReports(markdownReport, htmlVisualization);
    
    console.log('[INFO] 报告生成完成');
    return {
      markdownPath: path.join(this.outputDir, 'report.md'),
      htmlPath: path.join(this.outputDir, 'visualization.html')
    };
  }

  /**
   * 加载分析数据
   */
  async loadAnalysisData() {
    try {
      const content = await fs.readFile(this.analysisPath, 'utf-8');
      const data = JSON.parse(content);
      console.log('[INFO] 已加载分析数据');
      return data;
    } catch (error) {
      console.error(`[ERROR] 加载分析数据失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 生成Markdown格式报告
   */
  async generateMarkdownReport(data) {
    console.log('[REPORT] 生成Markdown报告...');
    
    const timestamp = new Date().toLocaleString('zh-CN');
    
    let report = `# ${this.reportTitle}\n\n`;
    report += `**生成时间**: ${timestamp}\n\n`;
    report += `---\n\n`;

    // 执行摘要
    report += `## 执行摘要\n\n`;
    report += this.generateExecutiveSummary(data);
    report += `\n---\n\n`;

    // 数据统计
    report += `## 数据统计\n\n`;
    report += this.generateStatisticsSection(data);
    report += `\n---\n\n`;

    // 关键洞察
    report += `## 关键洞察\n\n`;
    report += this.generateInsightsSection(data);
    report += `\n---\n\n`;

    // 节点详情
    report += `## 节点详情\n\n`;
    report += this.generateNodesSection(data);
    report += `\n---\n\n`;

    // 关系图谱
    report += `## 关系图谱\n\n`;
    report += this.generateRelationsSection(data);
    report += `\n---\n\n`;

    // 数据源覆盖
    report += `## 数据源覆盖\n\n`;
    report += this.generateDataSourceSection(data);
    report += `\n---\n\n`;

    // 附录
    report += `## 附录\n\n`;
    report += `### 方法论说明\n\n`;
    report += `本报告采用螺旋迭代和种子扩散方法论，通过多轮数据采集和关联分析生成。\n\n`;
    report += `- **螺旋迭代**: 从初始种子开始，逐步扩展搜索范围\n`;
    report += `- **种子扩散**: 从已知实体发现关联实体\n`;
    report += `- **交叉验证**: 多源数据相互验证，提高准确性\n\n`;

    return report;
  }

  /**
   * 生成执行摘要
   */
  generateExecutiveSummary(data) {
    const stats = data.statistics || {};
    const insights = data.insights || [];
    
    let summary = '';
    summary += `本次调研共发现 **${stats.totalNodes || 0}** 个实体节点，\n`;
    summary += `建立 **${stats.totalEdges || 0}** 条关系连接，\n`;
    summary += `生成 **${insights.length}** 条关键洞察。\n\n`;
    
    const highSeverityInsights = insights.filter(i => i.severity === 'high');
    if (highSeverityInsights.length > 0) {
      summary += `### 重点关注\n\n`;
      highSeverityInsights.forEach(insight => {
        summary += `- **${insight.title}**: ${insight.description}\n`;
      });
      summary += `\n`;
    }
    
    return summary;
  }

  /**
   * 生成数据统计章节
   */
  generateStatisticsSection(data) {
    const stats = data.statistics || {};
    let section = '';
    
    section += `| 指标 | 数值 |\n`;
    section += `|------|------|\n`;
    section += `| 总节点数 | ${stats.totalNodes || 0} |\n`;
    section += `| 总关系数 | ${stats.totalEdges || 0} |\n`;
    section += `| 网络密度 | ${stats.totalNodes > 0 ? (stats.totalEdges / (stats.totalNodes * (stats.totalNodes - 1) / 2)).toFixed(4) : 0} |\n`;
    section += `\n`;
    
    // 节点类型分布
    if (stats.nodeTypes && Object.keys(stats.nodeTypes).length > 0) {
      section += `### 节点类型分布\n\n`;
      section += `| 类型 | 数量 |\n`;
      section += `|------|------|\n`;
      Object.entries(stats.nodeTypes).forEach(([type, count]) => {
        section += `| ${type} | ${count} |\n`;
      });
      section += `\n`;
    }
    
    // 关系类型分布
    if (stats.edgeTypes && Object.keys(stats.edgeTypes).length > 0) {
      section += `### 关系类型分布\n\n`;
      section += `| 类型 | 数量 |\n`;
      section += `|------|------|\n`;
      Object.entries(stats.edgeTypes).forEach(([type, count]) => {
        section += `| ${type} | ${count} |\n`;
      });
      section += `\n`;
    }
    
    return section;
  }

  /**
   * 生成关键洞察章节
   */
  generateInsightsSection(data) {
    const insights = data.insights || [];
    if (insights.length === 0) {
      return '暂无关键洞察。\n\n';
    }
    
    let section = '';
    insights.forEach((insight, index) => {
      const severityEmoji = insight.severity === 'high' ? '🔴' : 
                           insight.severity === 'medium' ? '🟡' : '🟢';
      section += `### ${index + 1}. ${severityEmoji} ${insight.title}\n\n`;
      section += `${insight.description}\n\n`;
      
      if (insight.details) {
        section += `**详细信息**:\n\n`;
        section += '```json\n';
        section += JSON.stringify(insight.details, null, 2);
        section += '\n```\n\n';
      }
    });
    
    return section;
  }

  /**
   * 生成节点详情章节
   */
  generateNodesSection(data) {
    const nodes = data.nodes || [];
    if (nodes.length === 0) {
      return '暂无节点数据。\n\n';
    }
    
    let section = '';
    
    // 按类型分组
    const nodesByType = {};
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      if (!nodesByType[type]) nodesByType[type] = [];
      nodesByType[type].push(node);
    });
    
    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      section += `### ${type} (${typeNodes.length})\n\n`;
      typeNodes.forEach(node => {
        section += `- **${node.name}** (${node.id})\n`;
        if (node.properties && Object.keys(node.properties).length > 0) {
          const props = Object.entries(node.properties)
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          section += `  - ${props}\n`;
        }
      });
      section += `\n`;
    });
    
    return section;
  }

  /**
   * 生成关系图谱章节
   */
  generateRelationsSection(data) {
    const edges = data.edges || [];
    if (edges.length === 0) {
      return '暂无关系数据。\n\n';
    }
    
    let section = '';
    section += `共发现 ${edges.length} 条关系连接。\n\n`;
    
    // 按类型分组展示
    const edgesByType = {};
    edges.forEach(edge => {
      const type = edge.type || 'unknown';
      if (!edgesByType[type]) edgesByType[type] = [];
      edgesByType[type].push(edge);
    });
    
    Object.entries(edgesByType).forEach(([type, typeEdges]) => {
      section += `### ${type} (${typeEdges.length})\n\n`;
      typeEdges.slice(0, 10).forEach(edge => {
        section += `- ${edge.source} → ${edge.target}\n`;
      });
      if (typeEdges.length > 10) {
        section += `- ... 还有 ${typeEdges.length - 10} 条关系\n`;
      }
      section += `\n`;
    });
    
    return section;
  }

  /**
   * 生成数据源覆盖章节
   */
  generateDataSourceSection(data) {
    const coverage = data.statistics?.dataSourceCoverage || {};
    
    let section = '';
    section += `| 数据源 | 记录数 |\n`;
    section += `|--------|--------|\n`;
    Object.entries(coverage).forEach(([source, count]) => {
      section += `| ${source} | ${count} |\n`;
    });
    section += `\n`;
    
    return section;
  }

  /**
   * 生成HTML可视化
   */
  async generateHTMLVisualization(data) {
    console.log('[REPORT] 生成HTML可视化...');
    
    const nodes = data.nodes || [];
    const edges = data.edges || [];
    
    // 准备D3.js可用的数据格式
    const graphData = {
      nodes: nodes.map(n => ({ id: n.id, name: n.name, type: n.type })),
      links: edges.map(e => ({ source: e.source, target: e.target, type: e.type }))
    };
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.reportTitle} - 可视化</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1890ff;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
    }
    #graph {
      width: 100%;
      height: 600px;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
    }
    .legend {
      margin-top: 15px;
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${this.reportTitle}</h1>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">$$$${nodes.length}</div>
        <div class="stat-label">节点</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">$$$${edges.length}</div>
        <div class="stat-label">关系</div>
      </div>
    </div>
    <div id="graph"></div>
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background: #1890ff;"></div>
        <span>企业</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #52c41a;"></div>
        <span>人员</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #faad14;"></div>
        <span>专利</span>
      </div>
    </div>
  </div>
  <script>
    const graphData = $$$${JSON.stringify(graphData)};

    const width = document.getElementById('graph').clientWidth;
    const height = 600;

    const colorMap = {
      enterprise: '#1890ff',
      person: '#52c41a',
      patent: '#faad14',
      unknown: '#999'
    };

    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', d => d.type === 'enterprise' ? 20 : 12)
      .attr('fill', d => colorMap[d.type] || colorMap.unknown)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', d => d.type === 'enterprise' ? 30 : 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  </script>
</body>
</html>`;

    return html;
  }

  /**
   * 保存报告文件
   */
  async saveReports(markdown, html) {
    const mdPath = path.join(this.outputDir, 'report.md');
    const htmlPath = path.join(this.outputDir, 'visualization.html');

    try {
      await fs.writeFile(mdPath, markdown, 'utf-8');
      console.log(`[INFO] Markdown报告已保存: $$$${mdPath}`);

      await fs.writeFile(htmlPath, html, 'utf-8');
      console.log(`[INFO] HTML可视化已保存: $$$${htmlPath}`);
    } catch (error) {
      console.error(`[ERROR] 保存报告失败: $$$${error.message}`);
    }
  }
}

// CLI入口
async function main() {
  const args = process.argv.slice(2);

  let analysisPath = '/tmp/osint-cache/analysis-results.json';
  let outputDir = '/tmp/osint-cache';
  let title = 'OSINT调研报告';

  args.forEach(arg => {
    if (arg.startsWith('--input=')) {
      analysisPath = arg.replace('--input=', '');
    } else if (arg.startsWith('--output=')) {
      outputDir = arg.replace('--output=', '');
    } else if (arg.startsWith('--title=')) {
      title = arg.replace('--title=', '');
    }
  });

  const generator = new ReportGenerator({
    analysisPath,
    outputDir,
    title
  });

  try {
    const results = await generator.generate();
    console.log('\n[COMPLETE] 报告生成完成');
    console.log(`[OUTPUT] Markdown: $$$${results.markdownPath}`);
    console.log(`[OUTPUT] HTML: $$$${results.htmlPath}`);
    process.exit(0);
  } catch (error) {
    console.error('[FATAL] 报告生成出错:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ReportGenerator };
