# AI Workspace

基于设计稿还原的AI工作台多页面静态网站。

## 项目结构

```
ai-workspace/
├── index.html          工作台（设计稿还原）
├── ai-employees.html   AI员工管理（设计稿还原）
├── new-employee.html   新建AI员工（设计稿还原）
├── news-hub.html       资讯台
├── creative-studio.html 创作工坊
├── projects.html       项目中心
├── resources.html      资源库
├── settings.html       设置
└── assets/
    ├── css/theme.css   设计令牌
    ├── js/app.js       共享交互
    ├── image_0_yi19x4.jpg
    └── image_1_yi19x4.jpg
```

## 本地运行

```bash
cd ai-workspace
python3 -m http.server 8765
# 打开 http://127.0.0.1:8765/
```

## 技术栈

- 纯静态HTML（无构建步骤）
- Tailwind CSS (CDN)
- Lucide Icons (CDN)
- CSS设计令牌系统
- 响应式布局（桌面220px侧边栏 / 移动端离屏抽屉）

## 功能

- 深色/浅色主题切换
- 响应式侧边栏导航
- AI员工筛选与搜索
- 表单验证与文件上传
- Toast提示系统