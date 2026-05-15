import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Trash2, Shield, Search, Loader2, Coins, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

interface User {
  id: string;
  username: string;
  phone: string | null;
  created_at: string | null;
  last_login: string | null;
  query_count: number | null;
  remaining_queries: number | null;
  total_recharge_amount: number | null;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [recharging, setRecharging] = useState<string | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [stats, setStats] = useState({
    totalRecharge: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
        const totalRecharge = data.reduce((sum, u) => sum + (u.total_recharge_amount || 0), 0);
        setStats({
          totalRecharge,
          totalUsers: data.length
        });
      }
    } catch (err: any) {
      console.error('获取用户失败:', err);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleting(userId);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    }
    setDeleting(null);
  };

  const handleRecharge = async (userId: string) => {
    setRecharging(userId);
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newRemaining = (user.remaining_queries || 0) + rechargeAmount;
    const { error } = await supabase
      .from('users')
      .update({ remaining_queries: newRemaining })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, remaining_queries: newRemaining } : u));
    }
    setRecharging(null);
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.button
          className="fixed bottom-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-50"
          onClick={() => navigate('/')}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">管理后台</h1>
          </div>
          <p className="text-slate-400">用户管理与系统监控</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-blue-400" />
              <div>
                <div className="text-slate-400 text-sm">总用户数</div>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Coins size={24} className="text-amber-400" />
              <div>
                <div className="text-slate-400 text-sm">累计充值</div>
                <div className="text-2xl font-bold text-emerald-400">¥{stats.totalRecharge}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索用户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              加载中...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">用户名</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">手机号</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">注册时间</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">查询次数</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">累计充值</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="py-3 px-4 text-white">{user.username}</td>
                      <td className="py-3 px-4 text-slate-300">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-4 text-emerald-400">{user.query_count}</td>
                      <td className="py-3 px-4 text-amber-400">¥{user.total_recharge_amount || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                            onClick={() => handleRecharge(user.id)}
                            disabled={recharging === user.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {recharging === user.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Coins size={14} />
                            )}
                            <span className="text-sm">+{rechargeAmount}</span>
                          </motion.button>
                          <motion.button
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleting === user.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {deleting === user.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            <span className="text-sm">删除</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-500">未找到匹配的用户</div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
