import React, { useState, useRef } from 'react';
import { 
  FolderOpen, 
  Search, 
  MoreHorizontal, 
  Upload, 
  Download, 
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  File,
  Star,
  Clock,
  Grid,
  List,
  ChevronRight,
  Folder
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'folder';
  size: string;
  modified: string;
  starred: boolean;
  color?: string;
  children?: FileItem[];
}

const LibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'recent'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files: FileItem[] = [
    { id: '1', name: '项目文档', type: 'folder', size: '-', modified: '今天 14:30', starred: true, color: 'from-violet-500 to-purple-600' },
    { id: '2', name: '设计素材', type: 'folder', size: '-', modified: '昨天 10:15', starred: false, color: 'from-cyan-500 to-blue-600' },
    { id: '3', name: '产品需求文档.pdf', type: 'document', size: '2.4 MB', modified: '今天 11:20', starred: true },
    { id: '4', name: '产品海报.png', type: 'image', size: '5.1 MB', modified: '今天 09:45', starred: false },
    { id: '5', name: '宣传片.mp4', type: 'video', size: '128 MB', modified: '昨天 16:30', starred: true },
    { id: '6', name: '背景音乐.mp3', type: 'audio', size: '8.5 MB', modified: '2天前', starred: false },
    { id: '7', name: '季度报告.docx', type: 'document', size: '1.2 MB', modified: '3天前', starred: false },
    { id: '8', name: '品牌Logo.svg', type: 'image', size: '256 KB', modified: '1周前', starred: true },
    { id: '9', name: '用户调研数据.xlsx', type: 'document', size: '3.8 MB', modified: '1周前', starred: false },
    { id: '10', name: '会议录音.mp3', type: 'audio', size: '45 MB', modified: '2周前', starred: false },
    { id: '11', name: '产品演示.mp4', type: 'video', size: '89 MB', modified: '2周前', starred: true },
    { id: '12', name: '界面设计稿.png', type: 'image', size: '7.2 MB', modified: '3周前', starred: false },
  ];

  const tabs = [
    { id: 'all', label: '全部文件', icon: <FolderOpen size={16} /> },
    { id: 'starred', label: '收藏', icon: <Star size={16} /> },
    { id: 'recent', label: '最近', icon: <Clock size={16} /> },
  ];

  const typeIcons = {
    document: <FileText size={20} />,
    image: <Image size={20} />,
    video: <Video size={20} />,
    audio: <Music size={20} />,
    folder: <Folder size={20} />,
  };

  const typeColors = {
    document: 'text-blue-400 bg-blue-500/10',
    image: 'text-emerald-400 bg-emerald-500/10',
    video: 'text-pink-400 bg-pink-500/10',
    audio: 'text-amber-400 bg-amber-500/10',
    folder: 'text-violet-400 bg-violet-500/10',
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'starred' && file.starred) ||
                       (activeTab === 'recent');
    return matchesSearch && matchesTab;
  });

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => console.log('Upload files:', e.target.files)}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">资料库</h1>
          <p className="text-gray-400">管理你的所有文件和资源</p>
        </div>
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
        >
          <Upload size={18} />
          上传文件
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">42</p>
            <p className="text-xs text-gray-500">文档</p>
          </div>
        </div>
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Image size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">86</p>
            <p className="text-xs text-gray-500">图片</p>
          </div>
        </div>
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
            <Video size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">18</p>
            <p className="text-xs text-gray-500">视频</p>
          </div>
        </div>
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Music size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-xs text-gray-500">音频</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#121212] border border-white/5 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
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

      {viewMode === 'list' ? (
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">名称</div>
            <div className="col-span-2">大小</div>
            <div className="col-span-3">修改时间</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          <div className="divide-y divide-white/5">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[file.type]}`}>
                    {file.type === 'folder' ? (
                      <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${file.color} flex items-center justify-center`}>
                        <Folder size={16} className="text-white" />
                      </div>
                    ) : (
                      typeIcons[file.type]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star
                      size={16}
                      className={file.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
                    />
                  </button>
                </div>
                <div className="col-span-2 text-sm text-gray-400">{file.size}</div>
                <div className="col-span-3 text-sm text-gray-500">{file.modified}</div>
                <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                    <Download size={15} />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group bg-[#121212] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[file.type]}`}>
                  {file.type === 'folder' ? (
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${file.color} flex items-center justify-center`}>
                      <Folder size={18} className="text-white" />
                    </div>
                  ) : (
                    typeIcons[file.type]
                  )}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star
                    size={14}
                    className={file.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
                  />
                </button>
              </div>
              <p className="text-sm text-white font-medium truncate mb-1">{file.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{file.size}</span>
                <span className="text-[10px] text-gray-600">{file.modified}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
