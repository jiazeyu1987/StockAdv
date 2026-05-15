import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Sparkles, Shield, HeartPulse, Target, LineChart, Wallet, User, Lock, Eye, EyeOff, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCompleteStockData } from '../utils/stockApi';
import { getSupabaseUrl, supabase } from '../supabase/client';
import Fireworks from './Fireworks';

interface StockSearchProps {
  onDataLoaded: (data: any) => void;
}

const features = [
  { icon: Target, text: '内在价值量化评估' },
  { icon: Shield, text: '安全边际自动计算' },
  { icon: HeartPulse, text: '财务健康全面诊断' },
  { icon: Sparkles, text: '能力圈智能匹配' },
  { icon: LineChart, text: '长期价值持续追踪' },
  { icon: Wallet, text: '审视资产配置合理性' },
];

const StockSearch: React.FC<StockSearchProps> = ({ onDataLoaded }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompleteStockData(query.trim());
      onDataLoaded(data);
      navigate('/report');
    } catch (err) {
      setError('获取股票数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入有效的手机号');
      return;
    }
    const res = await fetch(`${getSupabaseUrl()}/functions/v1/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (res.ok) {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert('请输入用户名和密码');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username}@meoo.local`,
      password,
    });
    if (error) {
      alert('登录失败：' + error.message);
    } else {
      navigate('/how-to-ask');
    }
  };

  const handleRegister = async () => {
    if (!phone.trim() || !password.trim()) {
      alert('请填写手机号和密码');
      return;
    }
    const res = await fetch(`${getSupabaseUrl()}/functions/v1/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: phone, password, phone }),
    });
    const data = await res.json();
    if (data.success) {
      setShowRegister(false);
      navigate('/how-to-ask');
    } else {
      alert(data.error || '注册失败');
    }
  };

  const handleForgot = async () => {
    if (!phone.trim() || !code.trim() || !newPassword.trim()) {
      alert('请填写完整信息');
      return;
    }
    const verifyRes = await fetch(`${getSupabaseUrl()}/functions/v1/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      alert('验证码无效');
      return;
    }
    const res = await fetch(`${getSupabaseUrl()}/functions/v1/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setShowForgot(false);
      alert('密码重置成功，请使用新密码登录');
    } else {
      alert(data.error || '重置失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      <div className="flex-[3] flex items-center justify-center p-8">
        <motion.div className="search-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="search-box" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <TrendingUp size={56} className="mx-auto mb-4 text-blue-400" />
            </motion.div>
            <h1 className="search-title">股票投研智能助手</h1>
            <motion.div className="flex items-center justify-center gap-2 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-blue-400 font-medium">关注价值</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-medium">发现价值</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-medium">兑现价值</span>
            </motion.div>
            <p className="search-subtitle">AI驱动的专业股票分析工具</p>
            <p className="text-slate-500 text-sm mb-6">专注企业内在价值，而非短期价格波动</p>
            <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
              {features.map((f, i) => (
                <motion.div key={f.text} className="flex items-center gap-2 text-slate-300 text-sm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                  <f.icon size={16} className="text-blue-400" />
                  <span>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-72 bg-slate-800/50 border-l border-slate-700/50 p-5 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <User size={40} className="text-blue-400 mb-3" />
          <h2 className="text-lg font-bold text-white mb-4">用户登录</h2>
          <div className="w-full space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" placeholder="测试版，免密登录" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex gap-2">
              <motion.button onClick={handleLogin} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium">
                登录
              </motion.button>
            </div>
            <div className="flex gap-2 mt-2">
              <motion.button onClick={() => setShowRegister(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 text-sm font-medium">
                注册
              </motion.button>
              <motion.button onClick={() => setShowForgot(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 text-sm font-medium">
                忘记密码
              </motion.button>
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-700/50"></div>
      </div>


      <AnimatePresence>
        {showRegister && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegister(false)}>
            <motion.div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">用户注册</h3>
                <button onClick={() => setShowRegister(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <input type="tel" placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                <input type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                <motion.button onClick={handleRegister} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 font-semibold">注册</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForgot && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForgot(false)}>
            <motion.div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">忘记密码</h3>
                <button onClick={() => setShowForgot(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <input type="tel" placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                <div className="flex gap-2">
                  <input type="text" placeholder="验证码" value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                  <button onClick={sendCode} disabled={countdown > 0} className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm disabled:opacity-50">{countdown > 0 ? `${countdown}s` : '获取验证码'}</button>
                </div>
                <input type="password" placeholder="新密码（至少6位）" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                <motion.button onClick={handleForgot} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-semibold">重置密码</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockSearch;
