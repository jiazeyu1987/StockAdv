import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, HeartPulse, Target, LineChart, Wallet, User, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const features = [
  { icon: Target, label: '内在价值量化评估' },
  { icon: Shield, label: '安全边际自动计算' },
  { icon: HeartPulse, label: '财务健康全面诊断' },
  { icon: TrendingUp, label: '能力圈智能匹配' },
  { icon: LineChart, label: '长期价值持续追踪' },
  { icon: Wallet, label: '审视资产配置合理性' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">股票投研智能助手</h1>

          <p className="text-cyan-400 text-lg mb-2">
            关注价值 · 发现价值 · <span className="text-amber-400">兑现价值</span>
          </p>

          <p className="text-white/80 text-xl mb-6">AI驱动的专业股票分析工具</p>

          <p className="text-white/60 text-sm mb-8">专注企业内在价值，而非短期价格波动</p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                <feature.icon className="w-4 h-4 text-cyan-400" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">用户登录</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="测试版，免密登录"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              登录
            </button>

            <div className="flex justify-between text-sm">
              <button type="button" className="text-white/60 hover:text-white transition-colors">
                注册
              </button>
              <button type="button" className="text-white/60 hover:text-white transition-colors">
                忘记密码
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
