import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { getSupabaseUrl } from '../supabase/client';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入有效的手机号');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getSupabaseUrl()}/functions/v1/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getSupabaseUrl()}/functions/v1/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) {
      setError('密码至少6位');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getSupabaseUrl()}/functions/v1/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setStep(1);
        setPhone('');
        setCode('');
        setNewPassword('');
      }, 1500);
    } catch (e: any) {
      setError(e.message);
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
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">忘记密码</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                <p className="text-white">密码重置成功</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="space-y-4">
                    <input
                      type="tel"
                      placeholder="请输入手机号"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      maxLength={11}
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      onClick={sendCode}
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : '发送验证码'}
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="请输入6位验证码"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      maxLength={6}
                    />
                    {countdown > 0 && (
                      <p className="text-slate-400 text-sm text-center">{countdown}秒后重试</p>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      onClick={verifyCode}
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : '验证'}
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="设置新密码（至少6位）"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      onClick={resetPassword}
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : '重置密码'}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
