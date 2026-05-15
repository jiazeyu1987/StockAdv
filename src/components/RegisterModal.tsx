import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { getSupabaseUrl } from '../supabase/client';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入有效的手机号');
      return;
    }
    setSendingCode(true);
    setError('');
    try {
      const res = await fetch(`${getSupabaseUrl()}/functions/v1/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error('发送失败');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
    } catch {
      setError('验证码发送失败');
    }
    setSendingCode(false);
  };

  const handleSubmit = async () => {
    if (!phone || !code || !password) {
      setError('请填写完整信息');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const verifyRes = await fetch(`${getSupabaseUrl()}/functions/v1/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      if (!verifyRes.ok) throw new Error('验证码错误');
      const registerRes = await fetch(`${getSupabaseUrl()}/functions/v1/register-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (!registerRes.ok) throw new Error('注册失败');
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || '注册失败');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">注册账号</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入验证码"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={sendCode}
                    disabled={sendingCode || countdown > 0}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 disabled:opacity-50 whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : sendingCode ? <Loader2 size={16} className="animate-spin" /> : '获取验证码'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请设置密码（至少6位）"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : '注册'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal;
