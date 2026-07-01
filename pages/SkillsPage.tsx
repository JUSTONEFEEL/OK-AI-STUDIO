import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Download, 
  Trash2,
  Zap,
  Star,
  Clock,
  ChevronDown,
  Grid,
  List,
  Tag
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  usageCount: number;
  rating: number;
  version: string;
  status: 'installed' | 'available' | 'update';
  color: string;
  tags: string[];
}

const SkillsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部技能', count: 48 },
    { id: 'content', name: '内容创作', count: 12 },
    { id: 'data', name: '数据分析', count: 8 },
    { id: 'code', name: '编程开发', count: 10 },
    { id: 'design', name: '创意设计', count: 9 },
    { id: 'productivity', name: '效率工具', count: 9 },
  ];

  const skills: Skill[] = [
    {
      id: '1',
      name: '智能写作',
      category: 'content',
      description: 'AI驱动的智能写作助手，支持多种文体和风格',
      icon: '✍️',
      usageCount: 1256,
      rating: 4.9,
      version: 'v2.3.1',
      status: 'installed',
      color: 'from-violet-500 to-purple-600',
      tags: ['写作', '文案', '创意'],
    },
    {
      id: '2',
      name: '数据可视化',
      category: 'data',
      description: '快速生成精美图表，支持多种数据格式导入',
      icon: '📊',
      usageCount: 892,
      rating: 4.8,
      version: 'v1.8.0',
      status: 'installed',
      color: 'from-cyan-500 to-blue-600',
      tags: ['图表', '分析', '报表'],
    },
    {
      id: '3',
      name: '代码生成器',
      category: 'code',
      description: '多语言代码生成，自动补全和重构',
      icon: '💻',
      usageCount: 2341,
      rating: 4.9,
      version: 'v3.1.2',
      status: 'update',
      color: 'from-emerald-500 to-teal-600',
      tags: ['编程', '开发', '代码'],
    },
    {
      id: '4',
      name: '图像生成',
      category: 'design',
      description: 'AI图像生成，支持文字描述生成高质量图片',
      icon: '🎨',
      usageCount: 1567,
      rating: 4.7,
      version: 'v2.0.5',
      status: 'installed',
      color: 'from-pink-500 to-rose-600',
      tags: ['设计', '图像', '创意'],
    },
    {
      id: '5',
      name: '智能翻译',
      category: 'productivity',
      description: '支持50+语言的智能翻译，专业术语准确',
      icon: '🌐',
      usageCount: 3421,
      rating: 4.9,
      version: 'v4.0.0',
      status: 'installed',
      color: 'from-amber-500 to-orange-600',
      tags: ['翻译', '语言', '工具'],
    },
    {
      id: '6',
      name: 'PPT生成',
      category: 'productivity',
      description: '一键生成精美演示文稿，支持多种模板',
      icon: '📑',
      usageCount: 567,
      rating: 4.6,
      version: 'v1.2.3',
      status: 'available',
      color: 'from-indigo-500 to-blue-600',
      tags: ['演示', '办公', '模板'],
    },
    {
      id: '7',
      name: '视频剪辑',
      category: 'design',
      description: 'AI辅助视频剪辑，自动生成精彩片段',
      icon: '🎬',
      usageCount: 234,
      rating: 4.5,
      version: 'v0.9.0',
      status: 'available',
      color: 'from-rose-500 to-pink-600',
      tags: ['视频', '剪辑', '创作'],
    },
    {
      id: '8',
      name: 'Excel助手',
      category: 'data',
      description: '智能表格处理，公式生成和数据分析',
      icon: '📈',
      usageCount: 1089,
      rating: 4.8,
      version: 'v2.1.0',
      status: 'installed',
      color: 'from-emerald-500 to-green-600',
      tags: ['表格', '数据', '办公'],
    },
    {
      id: '9',
      name: '邮件助手',
      category: 'productivity',
      description: '智能邮件撰写和回复，商务邮件模板',
      icon: '📧',
      usageCount: 756,
      rating: 4.7,
      version: 'v1.5.2',
      status: 'installed',
      color: 'from-blue-500 to-cyan-600',
      tags: ['邮件', '办公', '沟通'],
    },
  ];

  const statusConfig = {
    installed: { label: '已安装', color: 'text-emerald-400 bg-emerald-500/10' },
    available: { label: '可安装', color: 'text-gray-400 bg-white/5' },
    update: { label: '可更新', color: 'text-amber-400 bg-amber-500/10' },
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Skill管理</h1>
          <p className="text-gray-400">管理和扩展你的AI技能库</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30">
          <Plus size={18} />
          添加技能
        </button>
      </div>

      <div className="flex items-start gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === cat.id ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-gray-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="搜索技能..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#121212] border border-white/5 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="group bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {skill.icon}
                    </div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${statusConfig[skill.status].color}`}>
                      {statusConfig[skill.status].label}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold mb-1">{skill.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{skill.version}</p>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{skill.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skill.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-500 bg-white/5 rounded-md"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Zap size={13} className="text-violet-400" />
                        <span className="text-xs text-gray-400">{skill.usageCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-400">{skill.rating}</span>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="group flex items-center gap-4 bg-[#121212] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center text-xl shadow-lg shrink-0`}>
                    {skill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{skill.name}</h3>
                      <span className="text-[10px] text-gray-500">{skill.version}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[skill.status].color}`}>
                        {statusConfig[skill.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{skill.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Zap size={13} className="text-violet-400" />
                      <span className="text-xs text-gray-400">{skill.usageCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-400">{skill.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                      <Download size={16} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
