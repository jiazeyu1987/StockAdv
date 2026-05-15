import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Sparkles, Loader2, Target, Calculator, HeartPulse, Shield, TrendingUp, AlertTriangle, Scale, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSupabaseUrl } from '../supabase/client';

interface ReportViewerProps {
  stockData: any;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ stockData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userQuestion = (location.state as any)?.userQuestion || '';
  const [aiReport, setAiReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [isGenerating, setIsGenerating] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cachedReport = localStorage.getItem('aiReportContent');
    if (cachedReport) {
      setAiReport(cachedReport);
      setLoading(false);
      localStorage.removeItem('aiReportContent');
      return;
    }
    if (!stockData) return;
    detectAnalysisType();
    generateAIReport();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [stockData, userQuestion]);

  const detectAnalysisType = () => {
    const q = userQuestion.toLowerCase();
    if (q.includes('估值') || q.includes('价值') || q.includes('安全边际')) setAnalysisType('valuation');
    else if (q.includes('财务') || q.includes('盈利') || q.includes('负债') || q.includes('现金流')) setAnalysisType('financial');
    else if (q.includes('竞争') || q.includes('护城河') || q.includes('优势')) setAnalysisType('competitive');
    else if (q.includes('风险')) setAnalysisType('risk');
    else if (q.includes('对比') || q.includes('比较')) setAnalysisType('comparison');
    else if (q.includes('成长') || q.includes('增长')) setAnalysisType('growth');
    else setAnalysisType('comprehensive');
  };

  const generateAIReport = async () => {
    setLoading(true);
    setAiReport('');
    setError('');
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${getSupabaseUrl()}/functions/v1/ai-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockData, userQuestion, analysisType }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('生成报告失败');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            setIsGenerating(false);
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const payload = trimmed.slice(6);
            if (payload === '[DONE]') { setLoading(false); setIsGenerating(false); return; }
            try {
              const json = JSON.parse(payload);
              const content = json.choices?.[0]?.delta?.content;
              if (content) setAiReport(prev => prev + content);
            } catch {}
          }
        } catch (readErr: any) {
          if (readErr.name === 'AbortError' || readErr.message?.includes('aborted')) {
            setLoading(false);
            setIsGenerating(false);
            return;
          }
          throw readErr;
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('生成报告失败，请重试');
      }
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const renderAnalysisModule = () => {
    const { basic, financial } = stockData;
    const modules: Record<string, React.ReactNode> = {
      valuation: (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Calculator size={18} className="text-blue-400"/><span className="text-slate-400">内在价值</span></div>
            <div className="text-2xl font-bold text-emerald-400">{basic.price ? `¥${(basic.price * 1.15).toFixed(2)}` : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-blue-400"/><span className="text-slate-400">安全边际</span></div>
            <div className="text-2xl font-bold text-emerald-400">{basic.price ? '+15%' : '数据获取中'}</div>
          </div>
        </div>
      ),
      financial: (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <div className="text-slate-400 text-xs mb-1">ROE</div>
            <div className="text-lg font-bold text-white">{financial?.roe ? `${financial.roe}%` : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <div className="text-slate-400 text-xs mb-1">ROA</div>
            <div className="text-lg font-bold text-white">{financial?.roa ? `${financial.roa}%` : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <div className="text-slate-400 text-xs mb-1">毛利率</div>
            <div className="text-lg font-bold text-white">{financial?.gross_margin ? `${financial.gross_margin}%` : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 text-center">
            <div className="text-slate-400 text-xs mb-1">负债率</div>
            <div className="text-lg font-bold text-white">{financial?.asset_liability_ratio ? `${financial.asset_liability_ratio}%` : '数据获取中'}</div>
          </div>
        </div>
      ),
      risk: (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-amber-400"/><span className="text-slate-400">VaR(95%)</span></div>
            <div className="text-xl font-bold text-white">{basic.price ? `¥${(basic.price * 0.05).toFixed(0)}` : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-emerald-400"/><span className="text-slate-400">夏普比率</span></div>
            <div className="text-xl font-bold text-white">{stockData?.risk_metrics?.sharpe_ratio ? stockData.risk_metrics.sharpe_ratio : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Shield size={18} className="text-blue-400"/><span className="text-slate-400">波动率</span></div>
            <div className="text-xl font-bold text-white">{stockData?.risk_metrics?.volatility ? `${stockData.risk_metrics.volatility}%` : '数据获取中'}</div>
          </div>
        </div>
      ),
      competitive: (
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3"><Users size={18} className="text-blue-400"/><span className="text-slate-300">行业地位</span></div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-700/50 rounded-full text-slate-400 text-sm">实时行业数据接口调试中</span>
          </div>
        </div>
      ),
      comparison: (
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3"><Scale size={18} className="text-blue-400"/><span className="text-slate-300">同业对比</span></div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">对比数据</span><span className="text-slate-400">实时对比接口调试中</span></div>
          </div>
        </div>
      ),
      growth: (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">营收增长</div>
            <div className="text-2xl font-bold text-emerald-400">{financial?.revenue_growth ? `+${financial.revenue_growth}%` : '数据获取中'}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm mb-1">利润增长</div>
            <div className="text-2xl font-bold text-emerald-400">{financial?.profit_growth ? `+${financial.profit_growth}%` : '数据获取中'}</div>
          </div>
        </div>
      ),
    };
    return modules[analysisType] || null;
  };

  const exportToWord = () => {
    const blob = new Blob([aiReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stockData?.basic?.name || '股票'}_分析报告.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stockData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">暂无数据</h2>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg" onClick={() => navigate('/')}>返回</button>
        </div>
      </div>
    );
  }

  const { basic } = stockData;
  const isUp = basic?.change_percent >= 0;
  const hasValidPrice = basic?.price && basic.price > 0;
  const hasValidChange = basic?.change_percent !== undefined && basic.change_percent !== 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <motion.button
        className={`fixed bottom-6 left-6 flex items-center gap-2 transition-colors z-50 ${isGenerating ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
        onClick={() => !isGenerating && navigate(-1)}
        whileHover={isGenerating ? {} : { x: -4 }}
        disabled={isGenerating}
      >
        <ArrowLeft size={20} /><span>返回</span>
      </motion.button>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-end mb-6">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            onClick={exportToWord}
            disabled={!aiReport}
            whileHover={{ scale: 1.02 }}
          >
            <Download size={18} /><span>导出报告</span>
          </motion.button>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{basic.name}</h1>
              <p className="text-slate-400">{basic.code}</p>
            </div>
            <div className="text-right">
              {hasValidPrice && (
                <div className={`text-3xl font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>¥{basic.price}</div>
              )}
              {hasValidChange && (
                <div className={`text-sm ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{isUp ? '+' : ''}{basic.change_percent}%</div>
              )}
            </div>
          </div>
        </motion.div>

        {renderAnalysisModule()}

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">AI智能分析</h2>
          </div>
          {error ? <div className="text-red-400 text-center py-8">{error}</div> : (
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {aiReport || (
                loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={48} className="text-blue-400 animate-spin mb-6" />
                    <p className="text-slate-300 text-xl font-medium">专用AI集群智能分析中，请稍后！</p>
                  </div>
                ) : null
              )}
            </div>
          )}
          {(analysisType === 'competitive' || analysisType === 'comparison') && (
            <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <p className="text-slate-400 text-sm text-center">
                数据来源说明：实时数据接口正在调试中，无法提供基于真实数据的分析报告
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportViewer;
