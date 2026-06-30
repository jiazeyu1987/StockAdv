import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Loader2, MessageSquare, FileText, Trash2, ArrowLeft, ChevronDown, ChevronUp, Info, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatInputPrompt } from '../data/chatInputPrompt';
import { investmentDisclaimer } from '../data/disclaimerText';
import questionCards from '../data/questionCards.json';
import { chatTheme } from '../styles/chatTheme';
import { useNavigate } from 'react-router-dom';
import { BACKEND_API_BASE_URL, BACKEND_PROXY_ACCESS_TOKEN, BACKEND_SESSION_ID } from '../config/backend';
import MarkdownMessage from '../components/MarkdownMessage';

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
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showStarterCards, setShowStarterCards] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    <div className={chatTheme.pageShell}>
      <div className={chatTheme.workspace}>
        <header className={chatTheme.header}>
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className={chatTheme.brandIcon}>
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={chatTheme.title}>PD股票智能查询助手</h1>
                <button
                  type="button"
                  onClick={() => setShowDisclaimer((visible) => !visible)}
                  className={chatTheme.disclaimerToggle}
                  title={showDisclaimer ? '隐藏免责声明' : '显示免责声明'}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>免责声明</span>
                  {showDisclaimer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {showDisclaimer && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={chatTheme.disclaimerText}
                  >
                    {investmentDisclaimer}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={chatTheme.statusText}>
                  {isConnected ? '服务正常' : '连接异常'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={downloadReport}
                className={chatTheme.downloadButton}
              >
                <Download className="w-4 h-4" />
                <span>报告下载</span>
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className={chatTheme.clearButton}
                title="清空对话"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSettingsOpen((open) => !open)}
                className={chatTheme.settingsButton}
                title="设置"
                aria-expanded={isSettingsOpen}
              >
                <Settings className="w-5 h-5" />
              </button>
              <AnimatePresence initial={false}>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className={chatTheme.settingsMenu}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        navigate(-1);
                      }}
                      className={chatTheme.settingsMenuItem}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>返回上一页</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className={chatTheme.contentArea}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={chatTheme.starterSection}
            >
              <button
                type="button"
                onClick={() => setShowStarterCards((open) => !open)}
                className={chatTheme.starterToggle}
              >
                <span>提问模板参考</span>
                <span className="flex items-center gap-2 text-white/70">
                  <span>{showStarterCards ? '收起' : `展开 ${questionCards.length} 个示例`}</span>
                  {showStarterCards ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {showStarterCards && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={chatTheme.starterGrid}
                  >
                    {questionCards.map((card, index) => (
                      <div
                        key={card.title}
                        onClick={() => {
                          setInput(card.prompt);
                          setShowStarterCards(false);
                        }}
                        className={chatTheme.starterCard}
                      >
                        <h3 className={chatTheme.starterCardTitle}>
                          <span className={chatTheme.starterCardIndex}>
                            {index + 1}
                          </span>
                          <span>{card.title}</span>
                        </h3>
                        <div className={chatTheme.starterCardPrompt}>
                          {card.prompt}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
                      ? chatTheme.userBubble
                      : chatTheme.assistantBubble
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  )}
                  {message.hasFile && message.fileUrl && (
                    <button
                      onClick={() => downloadFile(message.fileUrl!, message.fileName || 'document.docx')}
                      className={chatTheme.attachmentButton}
                    >
                      <FileText className="w-4 h-4" />
                      <span>下载 {message.fileName || '文档'}</span>
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-100' : chatTheme.assistantTimestamp}`}>
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
              <div className={chatTheme.loadingBubble}>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-300 animate-spin" />
                  <span className={chatTheme.loadingText}>思考中...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={chatTheme.inputShell}>
          <div className={chatTheme.inputInner}>
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={chatInputPrompt}
                  rows={3}
                  className={chatTheme.textarea}
                  style={{ minHeight: '80px', maxHeight: '150px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={chatTheme.primaryButton}
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
