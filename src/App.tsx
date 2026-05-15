import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Loader2, MessageSquare, FileText, Trash2, TrendingUp, Shield, HeartPulse, Target, BarChart3, User, Lock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasFile?: boolean;
  fileUrl?: string;
  fileName?: string;
}

const API_KEY = 'replace-with-proxy-access-token';
const SESSION_ID = 'web-chat-session';
const API_BASE_URL = '/api/proxy/v1';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'chat'>('login');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamMode, setStreamMode] = useState<'off' | 'minimal' | 'low' | 'medium' | 'high'>('medium');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentView === 'chat') {
      checkHealth();
    }
  }, [currentView]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/v1', '')}/healthz`);
      setIsConnected(response.status === 200);
    } catch {
      setIsConnected(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentView('chat');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        return [userMessage];
      }
      return [...prev, userMessage];
    });
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openclaw',
          messages: [{ role: 'user', content: userMessage.content }],
          user: SESSION_ID,
          stream: false,
          reasoning_effort: streamMode,
        }),
        signal: AbortSignal.timeout(300000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || '';

      const hasFileMarker = assistantContent.includes('[FILE:') || assistantContent.includes('下载文件');
      const fileUrl = hasFileMarker ? extractFileUrl(assistantContent) : undefined;
      const fileName = hasFileMarker ? extractFileName(assistantContent) : undefined;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        hasFile: hasFileMarker,
        fileUrl,
        fileName,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，请求失败：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractFileUrl = (content: string): string | undefined => {
    const match = content.match(/\[FILE:(.+?)\]/);
    return match ? match[1] : undefined;
  };

  const extractFileName = (content: string): string | undefined => {
    const match = content.match(/文件名[:：]\s*(.+?)(?:\n|$)/);
    return match ? match[1] : 'document.docx';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanContent = (content: string): string => {
    return content
      .replace(/off\s*minimal\s*low\s*medium\s*high/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const downloadReport = () => {
    const reportContent = messages
      .map((m) => `${m.role === 'user' ? '用户' : '助手'} (${m.timestamp.toLocaleString()}):\n${cleanContent(m.content)}`)
      .join('\n\n---\n\n');
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `对话记录_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4">PD股票投研智能助手</h1>
            <p className="text-cyan-400 text-3xl mb-4">关注价值 · 发现价值 · <span className="text-amber-400">兑现价值</span></p>
            <p className="text-white/80 text-xl mb-2">AI驱动的专业股票分析工具</p>
            <p className="text-white/60 text-base mb-12">专注企业内在价值，而非短期价格波动</p>

            <div className="grid grid-cols-3 gap-6 max-w-3xl">
              <div className="flex flex-col items-center gap-2 text-white/80">
                <Target className="w-10 h-10 text-cyan-400" />
                <span className="text-base">内在价值量化评估</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <Shield className="w-10 h-10 text-cyan-400" />
                <span className="text-base">安全边际自动计算</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <HeartPulse className="w-10 h-10 text-cyan-400" />
                <span className="text-base">财务健康全面诊断</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <BarChart3 className="w-10 h-10 text-cyan-400" />
                <span className="text-base">能力圈智能匹配</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <TrendingUp className="w-10 h-10 text-cyan-400" />
                <span className="text-base">长期价值持续追踪</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <Target className="w-10 h-10 text-cyan-400" />
                <span className="text-base">审视资产配置合理性</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 bg-white/10 backdrop-blur-lg border-l border-white/20 flex flex-col items-center justify-center p-6"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-4">用户登录</h2>

          <form onSubmit={handleLogin} className="w-full space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="测试版，免密登录"
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all text-sm"
            >
              登录
            </button>
          </form>

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition-colors">
              注册
            </button>
            <button className="px-4 py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition-colors">
              忘记密码
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('login')}
              className="p-2 text-white/60 hover:text-white transition-colors"
              title="返回首页"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">PD股票智能查询助手</h1>
              <p className="text-xs text-white/60">免责声明: 本助手只为协助用户获取公开信息，仅供参考，不构成投资建议</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-white/60">
                  {isConnected ? '服务正常' : '连接异常'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>报告下载</span>
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-white/60 hover:text-red-400 transition-colors"
                title="清空对话"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="max-w-3xl mx-auto space-y-4 text-left">
                <div
                  onClick={() => setInput('请帮我拆解 [公司名称/代码] 的主营业务构成。它的各项业务毛利和经营利润率是多少？过去5年它的 ROIC（投入资本回报率）是否稳定在 10% 以上？')}
                  className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                    查核心生意与护城河
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">看它靠什么赚钱，赚的钱真不真</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                    请帮我拆解 [公司名称/代码] 的主营业务构成。它的各项业务毛利和经营利润率是多少？过去5年它的 ROIC（投入资本回报率）是否稳定在 10% 以上？
                  </div>
                </div>

                <div
                  onClick={() => setInput('帮我做一下 [公司名称/代码] 的财务压力测试。它的经营现金流和自由现金流健康吗？目前的长期债务能否用未来3年的自由现金流覆盖？有息负债率高不高？')}
                  className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                    查生存底线与自由现金流
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">看它会不会暴雷</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                    帮我做一下 [公司名称/代码] 的财务压力测试。它的经营现金流和自由现金流健康吗？目前的长期债务能否用未来3年的自由现金流覆盖？有息负债率高不高？
                  </div>
                </div>

                <div
                  onClick={() => setInput('[公司名称/代码] 过去4年和10年的营收、净利润、自由现金流的复合年增长率（CAGR）是否超过了10%？结合目前的 PE、PB 和 PEG，你认为它现在被低估了吗？')}
                  className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                    查长期复利与估值
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">看它便不便宜</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                    [公司名称/代码] 过去4年和10年的营收、净利润、自由现金流的复合年增长率（CAGR）是否超过了10%？结合目前的 PE、PB 和 PEG，你认为它现在被低估了吗？
                  </div>
                </div>

                <div
                  onClick={() => setInput('调用你的 cn-stock 数据工具，提取 [股票代码] 最近三年的核心财务指标（PE, PB, ROE, 净利润同比增长），并用价值投资的视角给我一段150字以内的点评。')}
                  className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                    A股/港股快速查询
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                    调用你的 cn-stock 数据工具，提取 [股票代码] 最近三年的核心财务指标（PE, PB, ROE, 净利润同比增长），并用价值投资的视角给我一段150字以内的点评。
                  </div>
                </div>

                <div
                  onClick={() => setInput('分析 [股票代码]，根据巴芒和你的价值投资框架体系，帮我设计一组问题，并针对问题做一个分析报告')}
                  className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                    综合价值投资分析
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                    分析 [股票代码]，根据巴芒和你的价值投资框架体系，帮我设计一组问题，并针对问题做一个分析报告
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  {message.hasFile && message.fileUrl && (
                    <button
                      onClick={() => downloadFile(message.fileUrl!, message.fileName || 'document.docx')}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>下载 {message.fileName || '文档'}</span>
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-slate-700 rounded-2xl px-5 py-4 shadow-sm border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">思考中...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">推理强度:</span>
              <div className="flex gap-1">
                {(['off', 'minimal', 'low', 'medium', 'high'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setStreamMode(mode)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      streamMode === mode
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题..."
                  rows={3}
                  className="w-full px-4 py-3 pr-12 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder:text-slate-400"
                  style={{ minHeight: '80px', maxHeight: '150px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
