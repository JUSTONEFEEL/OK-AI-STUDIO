import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Settings,
  Zap,
  Star,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  skills: string[];
  tasksCompleted: number;
  rating: number;
  lastActive: string;
  color: string;
}

const AIEmployeesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const employees: AIEmployee[] = [
    {
      id: '1',
      name: '文案助手',
      role: '内容创作',
      description: '擅长撰写营销文案、文章、邮件等各类文字内容',
      avatar: 'W',
      status: 'online',
      skills: ['文案写作', 'SEO优化', '多语言'],
      tasksCompleted: 256,
      rating: 4.9,
      lastActive: '刚刚',
      color: 'from-violet-500 to-purple-600',
    },
    {
      id: '2',
      name: '数据分析师',
      role: '数据分析',
      description: '专业的数据处理与可视化分析，支持多种数据源',
      avatar: 'D',
      status: 'online',
      skills: ['数据可视化', '统计分析', '报表生成'],
      tasksCompleted: 189,
      rating: 4.8,
      lastActive: '5分钟前',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: '3',
      name: '代码精灵',
      role: '编程开发',
      description: '全栈开发助手，支持多种编程语言和框架',
      avatar: 'C',
      status: 'busy',
      skills: ['代码生成', 'Bug修复', '代码审查'],
      tasksCompleted: 342,
      rating: 4.9,
      lastActive: '正在工作',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: '4',
      name: '设计大师',
      role: '创意设计',
      description: '平面设计、UI设计、品牌视觉设计专家',
      avatar: 'S',
      status: 'online',
      skills: ['海报设计', 'Logo设计', '品牌视觉'],
      tasksCompleted: 128,
      rating: 4.7,
      lastActive: '10分钟前',
      color: 'from-pink-500 to-rose-600',
    },
    {
      id: '5',
      name: '翻译官',
      role: '语言翻译',
      description: '支持50+语言互译，专业术语准确翻译',
      avatar: 'T',
      status: 'online',
      skills: ['中英互译', '专业术语', '文档翻译'],
      tasksCompleted: 567,
      rating: 4.9,
      lastActive: '2分钟前',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: '6',
      name: '财务顾问',
      role: '财务管理',
      description: '财务分析、预算规划、投资建议专家',
      avatar: 'F',
      status: 'offline',
      skills: ['财务分析', '预算规划', '税务咨询'],
      tasksCompleted: 89,
      rating: 4.6,
      lastActive: '2小时前',
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  const statusConfig = {
    online: { label: '在线', color: 'bg-emerald-500' },
    busy: { label: '忙碌', color: 'bg-amber-500' },
    offline: { label: '离线', color: 'bg-gray-500' },
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI员工</h1>
          <p className="text-gray-400">管理和调度你的智能员工团队</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30">
          <Plus size={18} />
          创建AI员工
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索AI员工..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-[#121212] border border-white/5 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterStatus('online')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterStatus === 'online'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            在线
          </button>
          <button
            onClick={() => setFilterStatus('busy')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterStatus === 'busy'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            忙碌
          </button>
          <button
            onClick={() => setFilterStatus('offline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterStatus === 'offline'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            离线
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="group bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${emp.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {emp.avatar}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${statusConfig[emp.status].color} border-2 border-[#121212]`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{emp.name}</h3>
                  <p className="text-xs text-gray-500">{emp.role}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{emp.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {emp.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-[10px] font-medium bg-white/5 text-gray-400 rounded-md border border-white/5"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-violet-400" />
                  <span className="text-xs text-gray-400">{emp.tasksCompleted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-400">{emp.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock size={12} />
                {emp.lastActive}
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                <MessageSquare size={16} />
                对话
              </button>
              <button className="p-2.5 bg-white/5 text-gray-400 rounded-xl hover:text-white hover:bg-white/10 transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIEmployeesPage;
