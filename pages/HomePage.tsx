import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  FileText, 
  Bot, 
  Layers, 
  ArrowUpRight,
  Zap,
  Target,
  Activity
} from 'lucide-react';

const HomePage: React.FC = () => {
  const stats = [
    { label: 'AI员工', value: '12', change: '+2', icon: <Bot size={20} />, color: 'from-violet-500 to-purple-600' },
    { label: '技能数', value: '48', change: '+5', icon: <Layers size={20} />, color: 'from-cyan-500 to-blue-600' },
    { label: '文件数', value: '156', change: '+23', icon: <FileText size={20} />, color: 'from-emerald-500 to-teal-600' },
    { label: '今日任务', value: '8', change: '+3', icon: <Zap size={20} />, color: 'from-amber-500 to-orange-600' },
  ];

  const recentActivities = [
    { time: '10:30', action: '创建了新的AI员工', detail: '文案助手 v2.0', type: 'bot' },
    { time: '09:15', action: '上传了新文件', detail: '产品需求文档.pdf', type: 'file' },
    { time: '昨天', action: '添加了新技能', detail: '数据分析技能包', type: 'skill' },
    { time: '昨天', action: '完成任务', detail: '季度报告生成', type: 'task' },
  ];

  const quickActions = [
    { label: '创建AI员工', icon: <Bot size={22} />, color: 'from-violet-500/20 to-purple-600/20', textColor: 'text-violet-400' },
    { label: '添加技能', icon: <Layers size={22} />, color: 'from-cyan-500/20 to-blue-600/20', textColor: 'text-cyan-400' },
    { label: '上传文件', icon: <FileText size={22} />, color: 'from-emerald-500/20 to-teal-600/20', textColor: 'text-emerald-400' },
    { label: '查看报告', icon: <TrendingUp size={22} />, color: 'from-amber-500/20 to-orange-600/20', textColor: 'text-amber-400' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">欢迎回来 👋</h1>
          <p className="text-gray-400">今天是个高效的日子，让我们开始工作吧</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">工作效率</p>
            <p className="text-lg font-bold text-emerald-400">87%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} />
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-[#121212] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target size={18} className="text-violet-400" />
              快捷操作
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-gradient-to-br ${action.color} border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`${action.textColor} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              最近动态
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {activity.type === 'bot' && <Bot size={14} className="text-violet-400" />}
                  {activity.type === 'file' && <FileText size={14} className="text-emerald-400" />}
                  {activity.type === 'skill' && <Layers size={14} className="text-cyan-400" />}
                  {activity.type === 'task' && <Sparkles size={14} className="text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          本周效率趋势
        </h2>
        <div className="flex items-end justify-between gap-4 h-40 px-4">
          {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => {
            const heights = [60, 75, 50, 85, 70, 40, 30];
            return (
              <div key={day} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full max-w-[40px] bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-500 hover:from-violet-500 hover:to-violet-300"
                  style={{ height: `${heights[index]}%` }}
                />
                <span className="text-xs text-gray-500">周{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
