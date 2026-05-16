import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Loader2, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_API_BASE_URL, BACKEND_PROXY_ACCESS_TOKEN, BACKEND_SESSION_ID } from '../config/backend';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasFile?: boolean;
  fileUrl?: string;
  fileName?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamMode, setStreamMode] = useState<'off' | 'minimal' | 'low' | 'medium' | 'high'>('medium');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL.replace(/\/v1\/?$/, '')}/healthz`);
      setIsConnected(response.status === 200);
    } catch {
      setIsConnected(false);
    }
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
      const response = await fetch(`${BACKEND_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BACKEND_PROXY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'openclaw',
          messages: [{ role: 'user', content: userMessage.content }],
          user: BACKEND_SESSION_ID,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-white">股票智能查询助手</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isConnected ? '服务正常' : '连接异常'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>报告下载</span>
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
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
