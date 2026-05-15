import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Target, Calculator, HeartPulse, Shield, TrendingUp, Globe, Users, AlertTriangle, Scale, Clock, Briefcase, Sparkles, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const questionTypes = [
  { id: 1, category: '全面评估类', icon: Target, question: '用价值投资方法全面分析[股票名称]的投资价值' },
  { id: 2, category: '估值判断类', icon: Calculator, question: '计算[股票名称]的内在价值，当前价格的安全边际有多大？' },
  { id: 3, category: '财务健康类', icon: HeartPulse, question: '分析[股票名称]的财务健康度，重点关注盈利能力、负债率和现金流' },
  { id: 4, category: '竞争优势类', icon: Shield, question: '[股票名称]的核心竞争优势是什么？护城河有多深？' },
  { id: 5, category: '成长性分析类', icon: TrendingUp, question: '[股票名称]过去5年的营收和利润增长趋势如何？未来成长逻辑是什么？' },
  { id: 6, category: '行业前景类', icon: Globe, question: '[股票名称]所在行业的未来5-10年发展趋势如何？机遇和挑战是什么？' },
  { id: 7, category: '管理层评估类', icon: Users, question: '[股票名称]的管理层是否值得信任？资本配置能力如何？' },
  { id: 8, category: '风险识别类', icon: AlertTriangle, question: '投资[股票名称]最大的风险是什么？如何应对这些风险？' },
  { id: 9, category: '对比分析类', icon: Scale, question: '对比[股票名称]和[竞争对手]，谁的投资价值更高？为什么？' },
  { id: 10, category: '长期价值类', icon: Clock, question: '从5-10年的长期视角看，[股票名称]是否值得持有？核心逻辑是什么？' },
  { id: 11, category: '组合分析类', icon: Briefcase, question: '我的持仓：股票A 30%、股票B 25%、股票C 20%、现金25%，请分析这个组合的健康度和优化建议' },
  { id: 12, category: '财报解读类', icon: FileText, question: '专业视角精确解读[股票名称]过往及最新招股说明书、[年份]年[季度]季定期财报、投资机构交流材料等' }
];

const HowToAskAI: React.FC = () => {
  const navigate = useNavigate();

  const handleQuestionClick = (question: string) => {
    localStorage.setItem('presetQuestion', question);
    navigate('/search-input');
  };

  return (
    <motion.div
      className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-full max-w-7xl mx-auto px-6 py-4 flex flex-col">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-4 relative"
        >
          <h1 className="text-3xl font-bold text-white">如何问AI?</h1>
          <motion.button
            onClick={() => navigate('/search-input')}
            className="absolute left-0 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search size={18} />
            开始提问
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1">
          {questionTypes.map((item, index) => (
            <motion.button
              key={item.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-700/50 hover:border-blue-500/30 transition-all group text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuestionClick(item.question)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <item.icon size={18} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 text-sm font-semibold">{item.id}</span>
                    <span className="text-slate-500 text-sm">{item.category}</span>
                  </div>
                  <p className="text-slate-200 text-base leading-snug">{item.question}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl p-4 mt-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">关于我们</h2>
              <p className="text-slate-300 text-base leading-relaxed mb-3">
                股票投研智能助手是一款基于人工智能技术的专业股票分析工具。我们致力于帮助投资者深入理解企业内在价值，通过量化评估、安全边际计算、财务健康诊断等多维度分析，为用户提供科学、客观的投资决策支持。
              </p>
              <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-600/30 pt-3">
                免责声明：本工具提供的分析结果仅供参考，不构成投资建议。投资有风险，入市需谨慎。用户应根据自身情况独立做出投资决策，并承担相应风险。
              </p>
            </div>
          </div>
        </motion.div>


        <motion.button
          className="absolute bottom-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => navigate(-1)}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={18} />
          <span>返回</span>
        </motion.button>

        <motion.button
          className="absolute bottom-6 right-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => {
            const password = prompt('请输入管理密码：');
            if (password === '1217d621231') {
              navigate('/admin');
            } else if (password !== null) {
              alert('密码错误');
            }
          }}
          whileHover={{ x: 4 }}
        >
          <span>管理</span>
          <ShieldCheck size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HowToAskAI;
