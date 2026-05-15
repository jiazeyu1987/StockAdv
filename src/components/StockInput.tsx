import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Sparkles, Zap, Coins, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseUrl, supabase } from '../supabase/client';

const STOCK_NAME_MAP: Record<string, string> = {
  '贵州茅台': '600519', '中国平安': '601318', '招商银行': '600036', '五粮液': '000858',
  '宁德时代': '300750', '比亚迪': '002594', '美的集团': '000333', '格力电器': '000651',
  '平安银行': '000001', '兴业银行': '601166', '中信证券': '600030', '东方财富': '300059',
  '隆基绿能': '601012', '药明康德': '603259', '迈瑞医疗': '300760', '恒瑞医药': '600276',
  '伊利股份': '600887', '海康威视': '002415', '立讯精密': '002475', '京东方A': '000725',
  '万科A': '000002', '保利发展': '600048', '中国建筑': '601668', '中国中免': '601888',
  '长江电力': '600900', '牧原股份': '002714', '顺丰控股': '002352', '工业富联': '601138',
  '紫金矿业': '601899', '万华化学': '600309', '中国银行': '601988', '工商银行': '601398',
  '建设银行': '601939', '农业银行': '601288', '交通银行': '601328', '邮储银行': '601658',
  '浦发银行': '600000', '民生银行': '600016', '中信银行': '601998', '光大银行': '601818',
  '华夏银行': '600015', '北京银行': '601169', '上海银行': '601229', '南京银行': '601009',
  '宁波银行': '002142', '杭州银行': '600926', '江苏银行': '600919', '成都银行': '601838',
  '长沙银行': '601577', '重庆银行': '601963', '贵阳银行': '601997', '郑州银行': '002936',
  '青岛银行': '002948', '苏州银行': '002966', '西安银行': '600928', '厦门银行': '601187',
  '齐鲁银行': '601665', '兰州银行': '001227', '紫金银行': '601860', '常熟银行': '601128',
  '无锡银行': '600908', '江阴银行': '002807', '张家港行': '002839', '苏农银行': '603323',
  '瑞丰银行': '601528', '山东黄金': '600547', '中金黄金': '600489', '赤峰黄金': '600988',
  '湖南黄金': '002155', '银泰黄金': '000975', '西部黄金': '601069', '四川黄金': '001337',
  '恒邦股份': '002237', '中国黄金': '600916', '捷佳伟创': '300724', '迈为股份': '300751',
  '晶盛机电': '300316', '上机数控': '603185', '通威股份': '600438', '大全能源': '688303',
  'TCL中环': '002129', '晶澳科技': '002459', '天合光能': '688599', '阳光电源': '300274',
  '固德威': '688390', '锦浪科技': '300763', '德业股份': '605117', '禾迈股份': '688032',
  '昱能科技': '688348', '派能科技': '688063', '鹏辉能源': '300438', '亿纬锂能': '300014',
  '国轩高科': '002074', '欣旺达': '300207', '孚能科技': '688567', '天赐材料': '002709',
  '新宙邦': '300037', '当升科技': '300073', '容百科技': '688005', '杉杉股份': '600884',
  '璞泰来': '603659', '恩捷股份': '002812', '星源材质': '300568', '中材科技': '002080',
  '科达利': '002850', '诺德股份': '600110', '嘉元科技': '688388', '天奈科技': '688116',
  '贝特瑞': '835185', '中科电气': '300035', '石大胜华': '603026', '永太科技': '002326',
  '多氟多': '002407', '天际股份': '002759', '华盛锂电': '688353', '中伟股份': '300919',
  '华友钴业': '603799', '格林美': '002340', '洛阳钼业': '603993', '寒锐钴业': '300618',
  '盛屯矿业': '600711', '赣锋锂业': '002460', '天齐锂业': '002466', '盐湖股份': '000792',
  '雅化集团': '002497', '永兴材料': '002756', '江特电机': '002176', '融捷股份': '002192',
  '盛新锂能': '002240', '西藏矿业': '000762', '西藏珠峰': '600338', '西藏城投': '600773',
  '川能动力': '000155', '科华数据': '002335', '科士达': '002518', '英维克': '002837',
  '高澜股份': '300499', '同飞股份': '300990', '申菱环境': '301018', '甘李药业': '603087',
  '中国银行H股': '03988', '工商银行H股': '01398', '建设银行H股': '00939',
  '农业银行H股': '01288', '交通银行H股': '03328', '招商银行H股': '03968',
};

async function searchStockByName(name: string): Promise<string | null> {
  if (STOCK_NAME_MAP[name]) return STOCK_NAME_MAP[name];
  for (const [stockName, code] of Object.entries(STOCK_NAME_MAP)) {
    if (stockName.includes(name) || name.includes(stockName)) return code;
  }
  try {
    const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(name)}&type=14&count=5`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.QuotationCodeTable?.Data?.length > 0) {
      for (const item of data.QuotationCodeTable.Data) {
        if (item.Code && /^\d{6}$/.test(item.Code)) {
          return item.Code;
        }
      }
    }
    return null;
  } catch (e) {
    console.error('Search error:', e);
    return null;
  }
}

async function fetchAStockData(code: string) {
  let prefix: string;
  let secid: string;

  if (/^\d{5}$/.test(code)) {
    secid = `116.${code}`;
  } else if (code.startsWith('6') || code.startsWith('5') || code.startsWith('9')) {
    prefix = 'sh';
    secid = `1.${code}`;
  } else {
    prefix = 'sz';
    secid = `0.${code}`;
  }

  const latestUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f170`;
  const response = await fetch(latestUrl);
  if (!response.ok) throw new Error('A股数据API请求失败');
  const data = await response.json();
  if (!data.data) throw new Error('未获取到股票数据');
  const d = data.data;
  const price = d.f43 ? d.f43 / 100 : 0;
  const prevClose = d.f60 ? d.f60 / 100 : price;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();
  const start = startDate.toISOString().split('T')[0].replace(/-/g, '');
  const end = endDate.toISOString().split('T')[0].replace(/-/g, '');

  const klineUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=0&beg=${start}&end=${end}`;
  const klineResponse = await fetch(klineUrl);
  let klineData = [];
  if (klineResponse.ok) {
    const klineResult = await klineResponse.json();
    if (klineResult.data && klineResult.data.klines) {
      klineData = klineResult.data.klines.slice(-5).map((line: string) => {
        const parts = line.split(',');
        return {
          date: parts[0],
          open: parseFloat(parts[1]),
          close: parseFloat(parts[2]),
          high: parseFloat(parts[3]),
          low: parseFloat(parts[4]),
          volume: parseInt(parts[5]),
          changePercent: parseFloat(parts[8]),
        };
      });
    }
  }

  return {
    code,
    name: d.f58 || d.f57 || code,
    price,
    prevClose,
    open: d.f46 ? d.f46 / 100 : price,
    high: d.f44 ? d.f44 / 100 : price,
    low: d.f45 ? d.f45 / 100 : price,
    volume: d.f47 || 0,
    amount: d.f48 ? d.f48 / 10000 : 0,
    change: d.f170 ? d.f170 / 100 : 0,
    changePercent: prevClose > 0 ? ((price - prevClose) / prevClose * 100).toFixed(2) : 0,
    history: klineData,
  };
}

interface StockInputProps {
  onDataLoaded: (data: any) => void;
}

const DAILY_FREE_LIMIT = 10;
const RECHARGE_AMOUNT = 10;
const RECHARGE_PRICE = 5;

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

const StockInput: React.FC<StockInputProps> = ({ onDataLoaded }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingQueries, setRemainingQueries] = useState(DAILY_FREE_LIMIT);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeCount, setRechargeCount] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserLimit = async () => {
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          setRemainingQueries(0);
          return;
        }
        const response = await fetch(`${getSupabaseUrl()}/functions/v1/check-user-limit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRemainingQueries(data.remaining);
        }
      } catch {
        setRemainingQueries(DAILY_FREE_LIMIT);
      }
    };

    checkUserLimit();

    const presetQuestion = localStorage.getItem('presetQuestion');
    if (presetQuestion) {
      setQuery(presetQuestion);
      localStorage.removeItem('presetQuestion');
    }
  }, []);

  const updateRemainingQueries = (count: number) => {
    setRemainingQueries(count);
    localStorage.setItem('remainingQueries', String(count));
  };

  const extractStockCode = (input: string): string | null => {
    const trimmed = input.trim();
    const codeMatch = trimmed.match(/(\d{6})/);
    if (codeMatch) return codeMatch[1];
    const nameMatch = trimmed.match(/([\u4e00-\u9fa5]{2,})/);
    if (nameMatch) return nameMatch[1];
    if (trimmed.length >= 2) return trimmed;
    return null;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    const stockCode = extractStockCode(query.trim());
    if (!stockCode) {
      setError('请输入有效的股票代码或名称');
      return;
    }

    if (remainingQueries <= 0) {
      setError('今日查询次数已用完，请充值后继续');
      setShowRechargeModal(true);
      return;
    }

    setLoading(true);
    setIsGenerating(true);
    setError('');
    setProgress(0);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setError('请先登录');
        setIsGenerating(false);
        setLoading(false);
        return;
      }
      const incrementResponse = await fetch(`${getSupabaseUrl()}/functions/v1/increment-user-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!incrementResponse.ok) {
        throw new Error('查询次数更新失败');
      }

      const resolvedCode = await searchStockByName(stockCode);
      if (!resolvedCode) {
        throw new Error('抱歉，测试版接入数据时，采用免费数据接口，有时数据不全，无法继续分析。');
      }
      const stockData = await fetchAStockData(resolvedCode);
      const currentPrice = stockData.price || 0;
      const prevClose = stockData.prevClose || currentPrice;
      const change = currentPrice - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      const data = {
        basic: {
          code: resolvedCode,
          name: stockData.name,
          price: parseFloat(currentPrice.toFixed(2)),
          change_percent: parseFloat(changePercent.toFixed(2)),
          change_amount: parseFloat(change.toFixed(2)),
          volume: Math.floor(stockData.volume || 0),
          amount: Math.floor(stockData.amount || 0),
          high: parseFloat((stockData.high || currentPrice).toFixed(2)),
          low: parseFloat((stockData.low || currentPrice).toFixed(2)),
          open: parseFloat((stockData.open || currentPrice).toFixed(2)),
          prev_close: parseFloat(prevClose.toFixed(2)),
        },
        financial: { revenue: 0, net_profit: 0, roe: 0, eps: 0 },
        reports: [],
        announcements: [],
        newsFlow: { news: [], capital_flow: { net_inflow: 0 } },
      };
      onDataLoaded(data);
      updateRemainingQueries(remainingQueries - 1);

      const response = await fetch(`${getSupabaseUrl()}/functions/v1/ai-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockData: data, userQuestion: query.trim(), analysisType: 'comprehensive' }),
      });

      if (!response.ok) throw new Error('生成报告失败');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let receivedLength = 0;
      let reportContent = '';
      const contentLength = parseInt(response.headers.get('Content-Length') || '15000');
      let lastProgressUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        receivedLength += value.length;

        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const content = json.choices?.[0]?.delta?.content;
            if (content) reportContent += content;
          } catch {}
        }

        const byteProgress = Math.min((receivedLength / contentLength) * 70, 70);
        const contentProgress = reportContent.length > 0 ? Math.min((reportContent.length / 2000) * 25, 25) : 0;
        const newProgress = Math.min(byteProgress + contentProgress, 95);

        if (newProgress - lastProgressUpdate >= 2 || newProgress >= 95) {
          setProgress(newProgress);
          lastProgressUpdate = newProgress;
        }
      }

      localStorage.setItem('aiReportContent', reportContent);
      setProgress(100);

      setTimeout(() => {
        setIsGenerating(false);
        setLoading(false);
        navigate('/report');
      }, 300);
    } catch (err: any) {
      setError(err.message || '获取股票数据失败，请重试');
      setIsGenerating(false);
      setLoading(false);
      setProgress(0);
    }
  };

  const handleRecharge = async () => {
    const addedQueries = rechargeCount * RECHARGE_AMOUNT;
    const rechargeTotalPrice = rechargeCount * RECHARGE_PRICE;
    const newTotal = remainingQueries + addedQueries;
    updateRemainingQueries(newTotal);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { data: userData } = await supabase
        .from('users')
        .select('total_recharge_amount, today_recharge_amount, last_recharge_date')
        .eq('id', user.id)
        .single();

      const isNewDay = userData?.last_recharge_date !== today;
      const newTotalRecharge = (userData?.total_recharge_amount || 0) + rechargeTotalPrice;
      const newTodayRecharge = isNewDay ? rechargeTotalPrice : (userData?.today_recharge_amount || 0) + rechargeTotalPrice;

      await supabase
        .from('users')
        .update({
          remaining_queries: newTotal,
          total_recharge_amount: newTotalRecharge,
          today_recharge_amount: newTodayRecharge,
          last_recharge_date: today
        })
        .eq('id', user.id);

      await supabase
        .from('recharge_records')
        .insert({
          user_id: user.id,
          amount: rechargeTotalPrice,
          queries_added: addedQueries
        });
    }

    setShowRechargeModal(false);
    setRechargeCount(1);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.button
          className={`fixed bottom-6 left-6 flex items-center gap-2 transition-colors z-50 ${isGenerating ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
          onClick={() => !isGenerating && navigate(-1)}
          whileHover={isGenerating ? {} : { x: -4 }}
          disabled={isGenerating}
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </motion.button>

        <div className="flex justify-end mb-8">
          <motion.div
            className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/50 rounded-2xl px-6 py-4 cursor-pointer hover:border-blue-500/30 transition-colors"
            onClick={() => setShowRechargeModal(true)}
            whileHover={{ scale: 1.02 }}
          >
            <Zap size={28} className={remainingQueries > 0 ? 'text-amber-400' : 'text-slate-500'} />
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">测试版免费充查询次数</div>
              <div className={`text-3xl font-bold ${remainingQueries > 0 ? 'text-white' : 'text-red-400'}`}>
                {remainingQueries}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-4"
          >
            <Sparkles size={48} className="text-blue-400 mx-auto" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">输入您的问题</h2>
          <p className="text-slate-400">详细描述您想了解的股票信息，AI将为您生成专业分析报告</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="mb-4">
            <textarea
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none"
              rows={4}
              placeholder="请输入您的问题，例如：用价值投资方法全面分析贵州茅台的投资价值，包括估值、财务健康度、竞争优势等方面..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-center mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 font-semibold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search size={20} />
                <span>开始分析</span>
                <span className="text-blue-200 text-sm">(消耗1次)</span>
              </>
            )}
          </motion.button>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  正在调动专业AI集群
                </span>
                <span className="text-blue-400 text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-slate-400 text-xs mt-2 text-center">报告生成完成后将自动跳转</p>
            </motion.div>
          )}
        </motion.div>

      </div>

      <AnimatePresence>
        {showRechargeModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRechargeModal(false)}
          >
            <motion.div
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Coins size={24} className="text-amber-400" />
                  充值查询次数
                </h3>
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                <div className="text-center mb-4">
                  <span className="text-slate-400 text-sm">当前剩余：</span>
                  <span className="text-2xl font-bold text-white ml-2">{remainingQueries}</span>
                  <span className="text-slate-400 text-sm ml-1">次</span>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setRechargeCount(Math.max(1, rechargeCount - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-white hover:bg-slate-600 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-3xl font-bold text-white w-16 text-center">{rechargeCount}</span>
                  <button
                    onClick={() => setRechargeCount(rechargeCount + 1)}
                    className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="text-center text-slate-400 text-sm">
                  可获得 <span className="text-emerald-400 font-semibold">{rechargeCount * RECHARGE_AMOUNT}</span> 次查询
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-400">支付金额</span>
                <span className="text-2xl font-bold text-emerald-400">测试版免费</span>
              </div>

              <motion.button
                onClick={handleRecharge}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 font-semibold transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                立即充值
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StockInput;
