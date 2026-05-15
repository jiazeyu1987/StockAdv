/**
 * 股票分析报告生成脚本
 * 根据输入数据生成完整的 HTML 报告
 */

function generateReport(data) {
  const {
    stockName = '招商轮船',
    bullPoints = [],
    bearPoints = [],
    rating = { level: 'S级（强烈关注）', score: '8.37' },
    summary = {},
    agents = [],
    valuation = {},
    financial = {},
    macro = {},
    industries = []
  } = data;

  // 读取模板
  const template = require('fs').readFileSync(
    require('path').join(__dirname, '../assets/template.html'),
    'utf-8'
  );

  let html = template;

  // 替换多空分歧
  html = html.replace(
    '<!-- 多方观点动态插入 -->',
    bullPoints.map(p => `
      <div class="point-item">
        <div class="point-title">${p.title}</div>
        <div class="point-desc">${p.desc}</div>
      </div>
    `).join('')
  );

  html = html.replace(
    '<!-- 空方观点动态插入 -->',
    bearPoints.map(p => `
      <div class="point-item">
        <div class="point-title">${p.title}</div>
        <div class="point-desc">${p.desc}</div>
      </div>
    `).join('')
  );

  // 替换综合评级
  html = html.replace('{{RATING_LEVEL}}', rating.level);
  html = html.replace('{{RATING_SCORE}}', rating.score);
  html = html.replace('{{SUMMARY_TEXT}}', summary.text || '');

  // 替换Agent评分
  html = html.replace(
    '<!-- Agent卡片动态插入 -->',
    agents.map(agent => `
      <div class="agent-card">
        <div class="agent-header">
          <div class="agent-name">${agent.name}</div>
          <div class="agent-score">${agent.score}</div>
        </div>
        ${agent.metrics.map(m => `
          <div class="metric-row">
            <div class="metric-label">${m.label}</div>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${(m.value / 10) * 100}%"></div>
            </div>
            <div class="metric-value">${m.value}</div>
          </div>
        `).join('')}
        <div class="agent-desc">${agent.desc}</div>
      </div>
    `).join('')
  );

  // 替换估值对比
  html = html.replace('{{VALUATION_SUBTITLE}}', valuation.subtitle || '');
  html = html.replace(
    '<!-- 估值卡片动态插入 -->',
    (valuation.items || []).map(item => `
      <div class="valuation-card">
        <div class="valuation-label">${item.label}</div>
        <div class="valuation-value">${item.value}</div>
        <div class="valuation-sub">${item.sub}</div>
      </div>
    `).join('')
  );

  // 替换财务指标
  html = html.replace('{{FINANCIAL_PERIOD}}', financial.period || '');
  html = html.replace(
    '<!-- 财务卡片动态插入 -->',
    (financial.items || []).map(item => `
      <div class="financial-card">
        <div class="financial-label">${item.label}</div>
        <div class="financial-value">${item.value}</div>
        <div class="financial-change ${item.negative ? 'negative' : ''}">${item.change}</div>
      </div>
    `).join('')
  );

  // 替换净利润趋势
  html = html.replace('{{TREND_SUBTITLE}}', financial.trendSubtitle || '');
  html = html.replace(
    '<!-- 趋势行动态插入 -->',
    (financial.trends || []).map(t => `
      <div class="trend-row">
        <div class="trend-year">${t.year}</div>
        <div class="trend-bar-container">
          <div class="trend-bar ${t.predicted ? 'predicted' : ''}" style="width: ${t.width}%">${t.value}</div>
          <div class="trend-change">${t.change}</div>
        </div>
      </div>
    `).join('')
  );

  // 替换业务板块
  html = html.replace(
    '<!-- 业务卡片动态插入 -->',
    (financial.business || []).map(b => `
      <div class="business-card">
        <div class="business-title">${b.title}</div>
        ${b.metrics.map(m => `
          <div class="business-metric">
            <div class="business-metric-label">${m.label}</div>
            <div class="business-metric-bar">
              <div class="business-metric-fill" style="width: ${m.percent}%"></div>
            </div>
            <div class="business-metric-value">
              <div class="value">${m.value}</div>
              <div class="change">${m.change}</div>
            </div>
          </div>
        `).join('')}
        <div class="business-desc">${b.desc}</div>
      </div>
    `).join('')
  );

  // 替换宏观Agent
  html = html.replace('{{MACRO_DATE}}', macro.date || '');
  html = html.replace(
    '<!-- 宏观卡片动态插入 -->',
    (macro.items || []).map(m => `
      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-tag ${m.tagClass}">${m.tag}</span>
          <span class="macro-title">${m.title}</span>
        </div>
        <div class="macro-items">
          ${m.items.map(i => `<span class="macro-item">${i}</span>`).join('')}
        </div>
      </div>
    `).join('')
  );
  html = html.replace('{{MACRO_SUMMARY}}', macro.summary || '');

  // 替换行业筛选
  html = html.replace(
    '<!-- 行业卡片动态插入 -->',
    industries.map(ind => `
      <div class="industry-card">
        <div class="industry-header">
          <span class="industry-tag ${ind.tagClass}">${ind.tag}</span>
          <span class="industry-name">${ind.name}</span>
        </div>
        <div class="industry-desc">${ind.desc}</div>
        <div class="industry-metrics">
          ${ind.metrics.map(m => `
            <div class="industry-metric">
              <div class="industry-metric-label">${m.label}</div>
              <div class="industry-metric-bar">
                <div class="industry-metric-fill ${m.fillClass}" style="width: ${(m.value / 10) * 100}%"></div>
              </div>
              <div class="industry-metric-value">${m.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')
  );

  return html;
}

// 示例数据
const exampleData = {
  stockName: '招商轮船',
  bullPoints: [
    { title: '结构性供给收紧：', desc: '合规VLCC净增速仅2.1~2.6%，创历史低位；老旧船加速退出' },
    { title: '需求长程化：', desc: '印度停购俄油→转向中东/美国，吨海里需求额外增加1%+' },
    { title: '制裁加码：', desc: '影子船队持续退出合规市场，约150艘VLCC受制裁（占比17%）' },
    { title: '极低估值：', desc: '2026E PE仅10倍，股息率潜在4%+，安全边际高' },
    { title: '一季报催化：', desc: 'Q1高运价（1~2月VLCC运价突破17万美元/日）将在一季报中兑现' }
  ],
  bearPoints: [
    { title: '美伊停火→运价骤降：', desc: '本次中东地缘停火若持续，俄伊制裁松动，影子船队回归会打压合规运价' },
    { title: 'OPEC+增产节奏：', desc: '若增产不及预期或再次减产，VLCC需求增量消失' },
    { title: '扣非净利增速慢：', desc: '2025年扣非仅+0.2%，真实主业景气度不如归母净利看起来好' },
    { title: '散货持续承压：', desc: '全球贸易摩擦影响铁矿石、煤炭海运需求，BDI低位拖累整体利润' },
    { title: '周期见顶风险：', desc: '2027~2028年新船交付高峰，届时运力可能过剩' }
  ],
  rating: { level: 'S级（强烈关注）', score: '8.37' },
  summary: {
    text: '三个Agent一致的结论：招商轮船是当前A股里少数同时满足"基本面真实高增长+估值极低+行业景气有结构性支撑+近期催化剂密集"四个条件的标的。2026年机构一致预期净利翻倍至132亿，对应PE仅10倍，且有43%分红率保障，是典型的"低PE高股息+业绩爆发弹性"组合。'
  },
  agents: [
    {
      name: '基本面Agent（F）',
      score: '8.8',
      metrics: [
        { label: '盈利质量', value: 8.8 },
        { label: '增速趋势', value: 9.2 },
        { label: '现金流', value: 8.5 },
        { label: '股东回报', value: 9.0 }
      ],
      desc: '净利润连续3年增长，2026年机构一致预测翻倍至132亿以上，是已披露财务数据支撑的预测，非预期拔高。Q4净利同比+56%是景气上行周期的明确信号。分红43%+回购5%，股东回报率近50%，对于PE仅10倍的公司极具吸引力。'
    },
    {
      name: '技术面Agent（T）',
      score: '7.8',
      metrics: [
        { label: '均线结构', value: 8.0 },
        { label: '量价配合', value: 7.8 },
        { label: '位置与估值', value: 8.5 },
        { label: '周期位置', value: 7.2 }
      ],
      desc: '春节以来股价累计涨幅约33%，反映了市场对油运景气的提前定价，但估值依然处于历史低位（PE约10倍）。技术面扣分项：航运是强周期行业，Q4运价高峰后若出现季节性回落，股价会提前反应，需密切监控VLCC即期运价走势作为技术面跟踪指标。'
    },
    {
      name: '催化剂Agent（C）',
      score: '8.5',
      metrics: [
        { label: '行业景气', value: 9.0 },
        { label: '政策催化', value: 8.8 },
        { label: '新船交付', value: 8.2 },
        { label: '事件触发', value: 7.8 }
      ],
      desc: '多重催化共振：①制裁影子船队减少合规运力供给（结构性）②OPEC+增产直接拉动VLCC需求③2026年将有28艘新船交付（含14艘LNG船），运力增厚⑤一季报即将披露（Q1高运价有望直接兑现为业绩超预期）。中东局势是双刃剑——高地缘风险既是风险溢价来源，也是近期油运需求强劲的核心推手。'
    }
  ],
  valuation: {
    subtitle: '当前股价约17元，总市值约1370亿',
    items: [
      { label: '2025年PE', value: '~23x', sub: '基于60亿实际净利' },
      { label: '2026E PE', value: '~10x', sub: '基于132亿机构预测' },
      { label: '股息率（TTM）', value: '~1.9%', sub: '若2026年按43%分红→约4.5%' },
      { label: '机构目标价', value: '24.5元', sub: '华创，较现价+43%空间' }
    ]
  },
  financial: {
    period: '2025年年报·已披露',
    items: [
      { label: '营业总收入', value: '281.8亿', change: '同比+9.2%' },
      { label: '归母净利润', value: '60.1亿', change: '同比+17.7%' },
      { label: 'Q4单季净利', value: '27.1亿', change: '同比+56%/Q3的2.3倍' },
      { label: '全年分红', value: '25.8亿', change: '分红率43%+回购5%' }
    ],
    trendSubtitle: '进入上行周期',
    trends: [
      { year: '2022', value: '~20亿', width: 20, change: '周期低位' },
      { year: '2023', value: '~36亿', width: 36, change: '+80%' },
      { year: '2024', value: '51.1亿', width: 51, change: '+42%' },
      { year: '2025', value: '60.1亿', width: 60, change: '+18%' },
      { year: '2026E', value: '132~145亿（机构预测）', width: 100, change: '+120~141%', predicted: true }
    ],
    business: [
      {
        title: '油轮（VLCC/Suezmax）—核心驱动',
        metrics: [
          { label: '2025净利润', value: '41.9亿', change: '+59%', percent: 85 },
          { label: 'Q4单季净利', value: '23亿', change: '+300%', percent: 95 },
          { label: '运价趋势', value: 'Q4 VLCC+144%', change: '', percent: 90 }
        ],
        desc: '2026年初VLCC运价突破17万美元/日创近6年新高；合规市场供需持续收紧；制裁影子船队减少有效运力'
      },
      {
        title: '其他业务（散/集/LNG/滚装）',
        metrics: [
          { label: '干散货净利', value: '11.4亿', change: '-27%', percent: 45 },
          { label: '集装箱净利', value: '~15亿', change: '高增长', percent: 70 },
          { label: 'LNG净利', value: '~7亿', change: '+18%', percent: 55 }
        ],
        desc: '散货承压（BDI低迷）但逐季改善；集运超预期高增；LNG新船陆续交付，利润有望持续增厚；滚装受汽车出口放缓拖累'
      }
    ]
  },
  macro: {
    date: '2026年4月',
    items: [
      {
        tag: '偏中性',
        tagClass: 'neutral',
        title: '经济周期',
        items: ['PMI 50.2 温和扩张', '一季报改善预期', '中长期资金待入场']
      },
      {
        tag: '偏宽松',
        tagClass: 'loose',
        title: '货币政策',
        items: ['央行阶段性净回笼', '中短端利率下行', '降准降息预期仍在']
      },
      {
        tag: '偏避险',
        tagClass: 'risk',
        title: '风险偏好',
        items: ['美伊停火谈判中', '地缘溢价未退', '存量博弈资金观望']
      }
    ],
    summary: '宏观层结论：国内温和复苏+货币偏宽松，但地缘扰动压制风险偏好→市场状态标签「震荡蓄力·结构为王」，建议仓位上限70~80%，优先景气确定性方向，规避高估值+长兑现周期板块'
  },
  industries: [
    {
      tag: '推荐',
      tagClass: 'recommend',
      name: '科技硬件（算力/半导体）',
      desc: 'AI算力需求持续；国产替代加速；4月多场科技峰会催化',
      metrics: [
        { label: '景气度', value: 9, fillClass: 'high' },
        { label: '资金流', value: 8.2, fillClass: 'high' },
        { label: '政策面', value: 8.8, fillClass: 'high' }
      ]
    },
    {
      tag: '推荐',
      tagClass: 'recommend',
      name: '新能源（储能/电网/新能车）',
      desc: '油价高位强化能源替代逻辑；储能装机加速；一季报业绩亮眼',
      metrics: [
        { label: '景气度', value: 8.5, fillClass: 'high' },
        { label: '资金流', value: 8.0, fillClass: 'high' },
        { label: '政策面', value: 8.5, fillClass: 'high' }
      ]
    },
    {
      tag: '推荐',
      tagClass: 'recommend',
      name: '创新药（医疗/CXO/出海）',
      desc: '需求刚性独立于宏观；出海BD高景气；兼具攻防属性',
      metrics: [
        { label: '景气度', value: 8.0, fillClass: 'high' },
        { label: '资金流', value: 7.5, fillClass: 'medium' },
        { label: '政策面', value: 7.8, fillClass: 'medium' }
      ]
    },
    {
      tag: '底仓',
      tagClass: 'base',
      name: '高股息防御（公用事业/银行）',
      desc: '地缘避险资金青睐；稳定现金流；震荡期压舱石',
      metrics: [
        { label: '景气度', value: 6.5, fillClass: 'medium' },
        { label: '资金流', value: 8.0, fillClass: 'high' },
        { label: '政策面', value: 7.0, fillClass: 'medium' }
      ]
    }
  ]
};

// 如果直接运行脚本，生成示例报告
if (require.main === module) {
  const html = generateReport(exampleData);
  const outputPath = process.argv[2] || './stock-report.html';
  require('fs').writeFileSync(outputPath, html, 'utf-8');
  console.log(`报告已生成: ${outputPath}`);
}

module.exports = { generateReport };
