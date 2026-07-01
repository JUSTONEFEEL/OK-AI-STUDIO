import React from 'react';
import { 
  Home, 
  Bot, 
  Layers, 
  FolderOpen, 
  Settings,
  Sparkles
} from 'lucide-react';

export type PageType = 'home' | 'ai-employees' | 'skills' | 'library' | 'settings';

interface SidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

const menuItems: { id: PageType; icon: React.ReactNode; label: string }[] = [
  { id: 'home', icon: <Home size={20} />, label: '首页' },
  { id: 'ai-employees', icon: <Bot size={20} />, label: 'AI员工' },
  { id: 'skills', icon: <Layers size={20} />, label: 'Skill管理' },
  { id: 'library', icon: <FolderOpen size={20} />, label: '资料库' },
  { id: 'settings', icon: <Settings size={20} />, label: '设置' },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  return (
    <div className="w-64 h-full bg-[#0d0d0d] border-r border-white/5 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">工作台</h1>
            <p className="text-[10px] text-gray-500">Personal Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activePage === item.id
                  ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={activePage === item.id ? 'text-violet-400' : ''}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {activePage === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">用户</p>
            <p className="text-[10px] text-gray-500 truncate">user@workspace.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
