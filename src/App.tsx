import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Loader2, MessageSquare, FileText, Trash2, TrendingUp, Shield, HeartPulse, Target, BarChart3, User, Lock, ChevronDown, ChevronUp, Info, Settings, LogOut, Plus, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatInputPrompt } from './data/chatInputPrompt';
import { investmentDisclaimer } from './data/disclaimerText';
import questionCards from './data/questionCards.json';
import { chatTheme } from './styles/chatTheme';
import { BACKEND_API_BASE_URL, BACKEND_PROXY_ACCESS_TOKEN, BACKEND_SESSION_ID } from './config/backend';
import MarkdownMessage from './components/MarkdownMessage';
import {
  authenticateUser,
  canUseQuery,
  createAccount,
  getQueryUsage,
  recordQuery,
  type BackendAssignment,
  type QueryUsage,
  type UserAccount,
} from './config/accounts';
import {
  buildOpenClawSessionId,
  createChatSession,
  fetchChatSession,
  fetchChatSessions,
  toHistoryUserId,
  type ChatSessionSummary,
  type StoredChatMessage,
} from './utils/sessionHistory';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasFile?: boolean;
  fileUrl?: string;
  fileName?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'chat'>('login');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showStarterCards, setShowStarterCards] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccount | null>(null);
  const [queryUsage, setQueryUsage] = useState<QueryUsage | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fallbackBackend: BackendAssignment = {
    apiBaseUrl: BACKEND_API_BASE_URL,
    proxyAccessToken: BACKEND_PROXY_ACCESS_TOKEN,
    sessionId: BACKEND_SESSION_ID,
  };
  const activeBackend = authenticatedUser?.backend || fallbackBackend;

  useEffect(() => {
    if (currentView === 'chat' && authenticatedUser) {
      checkHealth();
    }
  }, [currentView, authenticatedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkHealth = async () => {
    try {
      const response = await fetch(`${activeBackend.apiBaseUrl.replace(/\/v1\/?$/, '')}/healthz`);
      setIsConnected(response.status === 200);
    } catch {
      setIsConnected(false);
    }
  };

  const messageFromStored = (message: StoredChatMessage): Message => {
    const hasFileMarker = message.content.includes('[FILE:') || message.content.includes('下载文件');
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.createdAt),
      hasFile: hasFileMarker,
      fileUrl: hasFileMarker ? extractFileUrl(message.content) : undefined,
      fileName: hasFileMarker ? extractFileName(message.content) : undefined,
    };
  };

  const summaryFromSession = (session: { id: string; title: string; createdAt: string; updatedAt: string; messages: StoredChatMessage[] }): ChatSessionSummary => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
  });

  const refreshSessionList = async (account: UserAccount) => {
    const backend = account.backend || fallbackBackend;
    const historyUserId = toHistoryUserId(account.username);
    const nextSessions = await fetchChatSessions(backend, historyUserId);
    setSessions(nextSessions);
  };

  const loadSessionMessages = async (sessionId: string, accountOverride?: UserAccount) => {
    const account = accountOverride || authenticatedUser;
    if (!account || isLoading) return;

    const backend = account.backend || fallbackBackend;
    const historyUserId = toHistoryUserId(account.username);
    setHistoryError('');
    try {
      const session = await fetchChatSession(backend, historyUserId, sessionId);
      setActiveSessionId(session.id);
      setMessages(session.messages.map(messageFromStored));
    } catch {
      setHistoryError('会话读取失败，请稍后再试');
    }
  };

  const createAndActivateSession = async (accountOverride?: UserAccount, title = '新对话'): Promise<string | null> => {
    const account = accountOverride || authenticatedUser;
    if (!account) return null;

    const backend = account.backend || fallbackBackend;
    const historyUserId = toHistoryUserId(account.username);
    setHistoryError('');
    try {
      const session = await createChatSession(backend, historyUserId, title);
      setSessions((prev) => [summaryFromSession(session), ...prev.filter((item) => item.id !== session.id)]);
      setActiveSessionId(session.id);
      setMessages([]);
      return session.id;
    } catch {
      setHistoryError('新建会话失败，请稍后再试');
      return null;
    }
  };

  const loadUserSessions = async (account: UserAccount) => {
    const backend = account.backend || fallbackBackend;
    const historyUserId = toHistoryUserId(account.username);
    setIsHistoryLoading(true);
    setHistoryError('');
    try {
      const nextSessions = await fetchChatSessions(backend, historyUserId);
      if (nextSessions.length === 0) {
        const session = await createChatSession(backend, historyUserId, '新对话');
        setSessions([summaryFromSession(session)]);
        setActiveSessionId(session.id);
        setMessages([]);
        return;
      }

      setSessions(nextSessions);
      const latest = nextSessions[0];
      setActiveSessionId(latest.id);
      const session = await fetchChatSession(backend, historyUserId, latest.id);
      setMessages(session.messages.map(messageFromStored));
    } catch {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      setHistoryError('会话历史加载失败，请刷新或重新登录');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const ensureActiveSession = async (account: UserAccount, firstMessage: string): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;
    return createAndActivateSession(account, firstMessage);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setLoginError('');
    const account = await authenticateUser(username, password);
    setAuthLoading(false);
    if (!account) {
      setLoginError('用户名或密码不正确');
      return;
    }

    setAuthenticatedUser(account);
    setQueryUsage(getQueryUsage(account));
    setLoginError('');
    setPassword('');
    setCurrentView('chat');
    void loadUserSessions(account);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setLoginError('密码至少6位');
      return;
    }

    setAuthLoading(true);
    setLoginError('');
    try {
      const account = await createAccount(username, password, 10);
      if (!account) {
        setLoginError('注册失败，请检查用户名是否已存在');
        return;
      }

      setAuthenticatedUser(account);
      setQueryUsage(getQueryUsage(account));
      setPassword('');
      setCurrentView('chat');
      void loadUserSessions(account);
    } catch {
      setLoginError('账号管理服务不可用，暂时无法注册');
    } finally {
      setAuthLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!authenticatedUser) {
      setLoginError('请先登录');
      setCurrentView('login');
      return;
    }

    if (!canUseQuery(authenticatedUser)) {
      setQueryUsage(getQueryUsage(authenticatedUser));
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '今日查询次数已用完，请明天再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const promptText = input.trim();
    const currentSessionId = await ensureActiveSession(authenticatedUser, promptText);
    if (!currentSessionId) return;

    setQueryUsage(recordQuery(authenticatedUser));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const backend = authenticatedUser.backend || fallbackBackend;
      const historyUserId = toHistoryUserId(authenticatedUser.username);
      const response = await fetch(`${backend.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backend.proxyAccessToken}`,
        },
        body: JSON.stringify({
          model: 'openclaw',
          messages: [{ role: 'user', content: userMessage.content }],
          user: buildOpenClawSessionId(backend.sessionId, currentSessionId),
          metadata: {
            history_user_id: historyUserId,
            history_session_id: currentSessionId,
          },
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
      void refreshSessionList(authenticatedUser);
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
    void createAndActivateSession(authenticatedUser || undefined);
  };

  const logout = () => {
    setAuthenticatedUser(null);
    setQueryUsage(null);
    setSessions([]);
    setActiveSessionId(null);
    setHistoryError('');
    setMessages([]);
    setInput('');
    setCurrentView('login');
  };

  const formatSessionDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
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

          <form onSubmit={authMode === 'login' ? handleLogin : handleCreateAccount} className="w-full space-y-3">
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
                placeholder="密码"
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
            {loginError && <p className="text-xs text-red-300">{loginError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all text-sm"
            >
              {authLoading ? '处理中...' : authMode === 'login' ? '登录' : '注册并登录'}
            </button>
          </form>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setLoginError('');
              }}
              className="px-4 py-1.5 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition-colors"
            >
              {authMode === 'login' ? '注册' : '返回登录'}
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
    <div className={chatTheme.pageShell}>
      <div className={chatTheme.appFrame}>
        <aside className={chatTheme.historyRail}>
          <div className={chatTheme.historyHeader}>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <History className="w-4 h-4 text-amber-200" />
              <span>会话历史</span>
            </div>
            <button
              type="button"
              onClick={() => void createAndActivateSession(authenticatedUser || undefined)}
              className={chatTheme.newSessionButton}
            >
              <Plus className="w-4 h-4" />
              <span>新建会话</span>
            </button>
          </div>
          {historyError && <div className={chatTheme.historyError}>{historyError}</div>}
          <div className={chatTheme.historyList}>
            {isHistoryLoading && (
              <div className={chatTheme.historyState}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>加载中...</span>
              </div>
            )}
            {!isHistoryLoading && sessions.length === 0 && (
              <div className={chatTheme.historyState}>暂无会话</div>
            )}
            {!isHistoryLoading && sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => void loadSessionMessages(session.id)}
                className={`${chatTheme.historyItem} ${
                  activeSessionId === session.id ? chatTheme.historyItemActive : ''
                }`}
              >
                <span className={chatTheme.historyItemTitle}>{session.title}</span>
                <span className={chatTheme.historyItemMeta}>
                  {formatSessionDate(session.updatedAt)}
                  {session.messageCount > 0 ? ` · ${session.messageCount} 条` : ''}
                </span>
              </button>
            ))}
          </div>
        </aside>

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
                {authenticatedUser && (
                  <span className="text-xs text-white/60">
                    {authenticatedUser.username} · {queryUsage?.limit === null ? '不限次数' : `今日剩余 ${queryUsage?.remaining ?? 0}/${queryUsage?.limit ?? 10}`}
                  </span>
                )}
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
                        logout();
                      }}
                      className={chatTheme.settingsMenuItemDanger}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出登录</span>
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
    </div>
  );
}

export default App;
