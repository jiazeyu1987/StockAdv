const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const expectedDisclaimer = '免责声明：本助手工具仅为用户提供公开信息的查询和整理服务，所提供的所有信息均来源于公开渠道，仅供参考。用户应自行判断信息的真实性和适用性，并承担因使用本助手所提供信息而产生的一切风险和后果。本助手及其运营方不对任何投资决策、商业行为或其他用途承担任何法律责任，所有信息不构成任何形式的投资建议。';
const expectedChatInputPrompt = '除了以上10个问题，您也可以针对您感兴趣的各种不同方向问题给我提问。今后，我会越用越聪明！';

const expectedCards = [
  {
    title: '查核心生意与护城河（综合体检）',
    prompt: '请帮我拆解 [股票名称]的主营业务构成。它的各项业务毛利和经营利润率是多少？过去5年它的 ROIC（投入资本回报率）是否稳定在 10% 以上？',
  },
  {
    title: '查生存底线与自由现金流（综合体检）',
    prompt: '帮我做一下 [股票名称]的财务压力测试。它的经营现金流和自由现金流健康吗？目前的长期债务能否用未来3年的自由现金流覆盖？有息负债率高不高？',
  },
  {
    title: '查长期复利与估值（综合体检）',
    prompt: '[股票名称]过去4年和10年的营收、净利润、自由现金流的复合年增长率（CAGR）是否超过了10%？结合目前的 PE、PB 和 PEG，你认为它现在被低估了吗？',
  },
  {
    title: '综合价值投资分析（综合体检）',
    prompt: '分析 [股票名称]，根据巴芒和你的价值投资框架体系，帮我设计一组问题，并针对问题做一个分析报告',
  },
  {
    title: '查利润与现金流的匹配度（财务体检：查"纸面富贵"）',
    prompt: '[股票名称]过去 5 年的净利润和"经营活动现金净流量"是否匹配？有没有出现"赚了利润但不赚钱（没现金流入）"的情况？',
  },
  {
    title: '查营收与应收账款的关系（财务体检："虚假繁荣"与"塞货"）',
    prompt: '[股票名称]近几年的应收账款增速，是不是大幅超过了营业收入的增速？应收账款周转天数有没有异常拉长？',
  },
  {
    title: '查存货与周转异常（财务体检："库存水分"与"减值风险"）',
    prompt: '[股票名称]公司的存货增速是否明显快于营收？存货周转率对比同行是不是在不断下降？毛利率和存货数据的变动逻辑是否自洽？',
  },
  {
    title: '查货币资金与有息负债（财务体检：查经典"大存大贷"）',
    prompt: '[股票名称]公司账面上是不是躺着大量现金，但同时又在借入高额的有息负债？它的利息收入和账面资金规模匹配吗？',
  },
  {
    title: '查异常资本开支与在建工程（财务体检：查"资金体外循环"）',
    prompt: '[股票名称]公司近几年的资本开支（在建工程、固定资产投资）是否畸高？这些巨额投资后来有没有转化成实打实的收入和利润，还是变成了死账？',
  },
  {
    title: '查盈利能力与同行的背离（财务体检：查"反常的优秀"）',
    prompt: '[股票名称]这家公司的毛利率和净利率是不是显著高于同行业可比公司？结合它的研发、销售费用投入，这种"远超同行"的盈利水平合理吗？',
  },
];

test('question cards are defined once and reused by both chat entry points', () => {
  const cardsPath = path.join(__dirname, '../src/data/questionCards.json');
  assert.ok(fs.existsSync(cardsPath), 'missing shared question card definitions');

  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  assert.equal(cards.length, 10);
  assert.deepEqual(cards, expectedCards);

  const appSource = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
  const chatPageSource = fs.readFileSync(path.join(__dirname, '../src/pages/ChatPage.tsx'), 'utf8');

  assert.match(appSource, /from '\.\/data\/questionCards\.json'/);
  assert.match(chatPageSource, /from '\.\.\/data\/questionCards\.json'/);
  assert.match(appSource, /questionCards\.map\(/);
  assert.match(chatPageSource, /questionCards\.map\(/);
  assert.doesNotMatch(appSource, /A股\/港股快速查询/);
  assert.doesNotMatch(chatPageSource, /A股\/港股快速查询/);
});

test('home and ask pages share the same dark chat theme', () => {
  const themePath = path.join(__dirname, '../src/styles/chatTheme.ts');
  assert.ok(fs.existsSync(themePath), 'missing shared dark chat theme');

  const themeSource = fs.readFileSync(themePath, 'utf8');
  const appSource = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
  const chatPageSource = fs.readFileSync(path.join(__dirname, '../src/pages/ChatPage.tsx'), 'utf8');

  assert.match(themeSource, /pageShell:/);
  assert.match(themeSource, /header:/);
  assert.match(themeSource, /starterCard:/);
  assert.match(themeSource, /assistantBubble:/);
  assert.match(themeSource, /inputShell:/);
  assert.match(themeSource, /textarea:/);

  assert.match(appSource, /from '\.\/styles\/chatTheme'/);
  assert.match(chatPageSource, /from '\.\.\/styles\/chatTheme'/);
  assert.match(appSource, /chatTheme\.pageShell/);
  assert.match(chatPageSource, /chatTheme\.pageShell/);
  assert.match(appSource, /chatTheme\.starterCard/);
  assert.match(chatPageSource, /chatTheme\.starterCard/);
  assert.match(appSource, /chatTheme\.inputShell/);
  assert.match(chatPageSource, /chatTheme\.inputShell/);
});

test('all visible disclaimers reuse the updated legal copy', () => {
  const disclaimerPath = path.join(__dirname, '../src/data/disclaimerText.ts');
  assert.ok(fs.existsSync(disclaimerPath), 'missing shared disclaimer copy source');

  const disclaimerSource = fs.readFileSync(disclaimerPath, 'utf8');
  const appSource = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
  const chatPageSource = fs.readFileSync(path.join(__dirname, '../src/pages/ChatPage.tsx'), 'utf8');
  const howToAskSource = fs.readFileSync(path.join(__dirname, '../src/components/HowToAskAI.tsx'), 'utf8');

  assert.match(disclaimerSource, new RegExp(expectedDisclaimer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(appSource, /from '\.\/data\/disclaimerText'/);
  assert.match(chatPageSource, /from '\.\.\/data\/disclaimerText'/);
  assert.match(howToAskSource, /from '\.\.\/data\/disclaimerText'/);
  assert.match(appSource, /investmentDisclaimer/);
  assert.match(chatPageSource, /investmentDisclaimer/);
  assert.match(howToAskSource, /investmentDisclaimer/);
});

test('starter-question chat pages reuse the updated input prompt copy', () => {
  const promptPath = path.join(__dirname, '../src/data/chatInputPrompt.ts');
  assert.ok(fs.existsSync(promptPath), 'missing shared chat input prompt source');

  const promptSource = fs.readFileSync(promptPath, 'utf8');
  const appSource = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
  const chatPageSource = fs.readFileSync(path.join(__dirname, '../src/pages/ChatPage.tsx'), 'utf8');

  assert.match(promptSource, new RegExp(expectedChatInputPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(appSource, /from '\.\/data\/chatInputPrompt'/);
  assert.match(chatPageSource, /from '\.\.\/data\/chatInputPrompt'/);
  assert.match(appSource, /chatInputPrompt/);
  assert.match(chatPageSource, /chatInputPrompt/);
});

test('starter-question chat theme matches the reference-style palette and layout cues', () => {
  const themeSource = fs.readFileSync(path.join(__dirname, '../src/styles/chatTheme.ts'), 'utf8');
  const appSource = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
  const chatPageSource = fs.readFileSync(path.join(__dirname, '../src/pages/ChatPage.tsx'), 'utf8');
  const cssSource = fs.readFileSync(path.join(__dirname, '../src/styles/index.css'), 'utf8');

  assert.match(themeSource, /from-\[#2946a3\]/);
  assert.match(themeSource, /bg-\[#3b4a63\]/);
  assert.match(themeSource, /bg-\[#24324b\]/);
  assert.match(themeSource, /bg-\[#24345c\]\/95/);
  assert.match(themeSource, /max-w-\[940px\]/);
  assert.match(themeSource, /sticky bottom-0/);

  assert.match(appSource, /className=\{chatTheme\.starterGrid\}/);
  assert.match(chatPageSource, /className=\{chatTheme\.starterGrid\}/);
  assert.doesNotMatch(appSource, /emptyIconWrap/);
  assert.doesNotMatch(chatPageSource, /emptyIconWrap/);
  assert.match(chatPageSource, /ArrowLeft/);
  assert.match(chatPageSource, /navigate\(-1\)/);
  assert.match(cssSource, /\.chat-scrollbar::-webkit-scrollbar/);
});
