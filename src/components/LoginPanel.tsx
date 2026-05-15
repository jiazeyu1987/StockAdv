import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { getSupabaseUrl } from '../supabase/client';

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone) {
      setError('请输入手机号');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${getSupabaseUrl()}/functions/v1/test-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) throw new Error('登录失败');
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      onClose();
    } catch {
      setError('登录失败，请检查手机号');
    } finally {
      setLoading(false);
    }
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
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">登录</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="密码"
                  disabled
                  className="w-full bg-slate-900/30 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-slate-500 placeholder-slate-600 cursor-not-allowed"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <motion.button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
                onClick={handleLogin}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : '登录'}
              </motion.button>
            </div>

            <div className="flex justify-between mt-4 text-sm">
              <button onClick={onSwitchToRegister} className="text-blue-400 hover:text-blue-300">
                注册账号
              </button>
              <button onClick={onSwitchToForgot} className="text-slate-400 hover:text-white">
                忘记密码
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPanel;
