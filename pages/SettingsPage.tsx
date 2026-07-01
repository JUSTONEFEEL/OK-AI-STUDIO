import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Globe,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  Check,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Volume2
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState('zh');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: false,
    weekly: true,
  });

  const sections = [
    { id: 'profile', label: '个人信息', icon: <User size={18} /> },
    { id: 'appearance', label: '外观设置', icon: <Palette size={18} /> },
    { id: 'notifications', label: '通知设置', icon: <Bell size={18} /> },
    { id: 'language', label: '语言设置', icon: <Globe size={18} /> },
    { id: 'security', label: '安全隐私', icon: <Shield size={18} /> },
  ];

  const languages = [
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">个人信息</h2>
              <p className="text-sm text-gray-500">管理你的个人资料和账户信息</p>
            </div>

            <div className="flex items-center gap-5 p-5 bg-[#0a0a0a] rounded-xl border border-white/5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                  U
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-500 transition-colors">
                  <User size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">用户</h3>
                <p className="text-sm text-gray-500">user@workspace.com</p>
                <p className="text-xs text-gray-600 mt-1">加入于 2024年1月</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <User size={14} />
                  用户名
                </label>
                <input
                  type="text"
                  defaultValue="用户"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Briefcase size={14} />
                  职位
                </label>
                <input
                  type="text"
                  defaultValue="产品经理"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Mail size={14} />
                  邮箱
                </label>
                <input
                  type="email"
                  defaultValue="user@workspace.com"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Phone size={14} />
                  手机号
                </label>
                <input
                  type="tel"
                  defaultValue="138****8888"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <MapPin size={14} />
                地区
              </label>
              <input
                type="text"
                defaultValue="中国 · 深圳"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20">
                保存更改
              </button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">外观设置</h2>
              <p className="text-sm text-gray-500">自定义界面的外观和主题</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">主题模式</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: 'light', label: '亮色', icon: <Sun size={20} /> },
                  { mode: 'dark', label: '暗色', icon: <Moon size={20} /> },
                  { mode: 'system', label: '跟随系统', icon: <Laptop size={20} /> },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setTheme(item.mode as any)}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                      theme === item.mode
                        ? 'bg-violet-500/10 border-violet-500/50 text-violet-400'
                        : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                    {theme === item.mode && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">主题色</h3>
              <div className="flex gap-3">
                {[
                  'from-violet-500 to-purple-600',
                  'from-blue-500 to-cyan-600',
                  'from-emerald-500 to-teal-600',
                  'from-pink-500 to-rose-600',
                  'from-amber-500 to-orange-600',
                  'from-indigo-500 to-blue-600',
                ].map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} transition-all hover:scale-110 ${
                      index === 0 ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#050505]' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400">字体大小</h3>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">小</span>
                <input
                  type="range"
                  min="12"
                  max="18"
                  defaultValue="14"
                  className="flex-1 accent-violet-500"
                />
                <span className="text-xs text-gray-500">大</span>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">通知设置</h2>
              <p className="text-sm text-gray-500">管理你想要接收的通知类型</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'email', label: '邮件通知', desc: '通过邮件接收重要更新', icon: <Mail size={18} /> },
                { key: 'push', label: '推送通知', desc: '桌面和移动端推送提醒', icon: <Bell size={18} /> },
                { key: 'sound', label: '声音提醒', desc: '通知时播放提示音', icon: <Volume2 size={18} /> },
                { key: 'weekly', label: '周报摘要', desc: '每周发送工作汇总邮件', icon: <Calendar size={18} /> },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev],
                    }))}
                    className={`w-12 h-7 rounded-full p-1 transition-all ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-violet-600'
                        : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">语言设置</h2>
              <p className="text-sm text-gray-500">选择你偏好的界面语言</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    language === lang.code
                      ? 'bg-violet-500/10 border-violet-500/50'
                      : 'bg-[#0a0a0a] border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`text-sm font-medium ${
                    language === lang.code ? 'text-violet-400' : 'text-white'
                  }`}>
                    {lang.name}
                  </span>
                  {language === lang.code && (
                    <Check size={16} className="ml-auto text-violet-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">安全隐私</h2>
              <p className="text-sm text-gray-500">管理你的账户安全和隐私设置</p>
            </div>

            <div className="space-y-3">
              {[
                { label: '修改密码', desc: '定期更换密码保护账户安全', icon: <Shield size={18} /> },
                { label: '两步验证', desc: '启用双重身份认证增强安全', icon: <Lock size={18} /> },
                { label: '登录设备', desc: '管理已登录的设备列表', icon: <Laptop size={18} /> },
                { label: '隐私设置', desc: '控制你的数据和隐私偏好', icon: <Eye size={18} /> },
              ].map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              ))}
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <h3 className="text-sm font-medium text-red-400 mb-2">危险操作</h3>
              <p className="text-xs text-gray-500 mb-3">删除账户将清除所有数据，此操作不可撤销</p>
              <button className="px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
                删除账户
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">设置</h1>
        <p className="text-gray-400">管理你的账户和应用偏好设置</p>
      </div>

      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={activeSection === section.id ? 'text-violet-400' : ''}>
                {section.icon}
              </span>
              {section.label}
              {activeSection === section.id && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-[#121212] border border-white/5 rounded-2xl p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

const Lock = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Eye = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default SettingsPage;
