// Supabase 数据访问层 - 完整 CRUD 支持
// 使用 anon key（前端安全）

const SUPABASE_URL = 'https://bsnuroxmwmjdgistoqto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbnVyb3htd21qZGdpc3RvcXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzI1NDIsImV4cCI6MjA5ODQ0ODU0Mn0.sIqs1v1Oe0TeiFY8q8t9VMhcAm6O5N8F_Y2kvwBwj08';

async function supabaseRequest(table, method = 'GET', body = null, query = '', opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const preferValues = ['return=representation'];
  if (opts.upsert) preferValues.push('resolution=merge-duplicates');

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': preferValues.join(',')
  };

  const options = { method, headers };

  if (body && method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase ${method} ${table} failed: ${res.status} ${errText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const db = {
  // ===== Employees =====
  getEmployees: (filter = {}) => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    if (filter.status) params.set('status', `eq.${filter.status}`);
    if (filter.category) params.set('category', `eq.${filter.category}`);
    if (filter.search) params.set('or', `(name.ilike.*${filter.search}*,role.ilike.*${filter.search}*)`);
    return supabaseRequest('employees', 'GET', null, params.toString());
  },

  getEmployee: (id) => {
    return supabaseRequest('employees', 'GET', null, `select=*&id=eq.${id}`);
  },

  createEmployee: (data) => {
    return supabaseRequest('employees', 'POST', data);
  },

  updateEmployee: (id, data) => {
    return supabaseRequest('employees', 'PATCH', data, `id=eq.${id}`);
  },

  deleteEmployee: (id) => {
    return supabaseRequest('employees', 'DELETE', null, `id=eq.${id}`);
  },

  // ===== Projects =====
  getProjects: (filter = {}) => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    if (filter.status) params.set('status', `eq.${filter.status}`);
    if (filter.search) params.set('title', `ilike.*${filter.search}*`);
    return supabaseRequest('projects', 'GET', null, params.toString());
  },

  getProject: (id) => {
    return supabaseRequest('projects', 'GET', null, `select=*&id=eq.${id}`);
  },

  createProject: (data) => {
    return supabaseRequest('projects', 'POST', data);
  },

  updateProject: (id, data) => {
    return supabaseRequest('projects', 'PATCH', data, `id=eq.${id}`);
  },

  deleteProject: (id) => {
    return supabaseRequest('projects', 'DELETE', null, `id=eq.${id}`);
  },

  // ===== Settings =====
  getSettings: () => {
    return supabaseRequest('settings', 'GET', null, 'select=*&order=updated_at.desc');
  },

  getSetting: (key) => {
    return supabaseRequest('settings', 'GET', null, `select=*&key=eq.${key}`).then(arr => arr?.[0] || null);
  },

  upsertSetting: (key, value) => {
    return supabaseRequest('settings', 'POST', { key, value }, '', { upsert: true });
  },

  deleteSetting: (key) => {
    return supabaseRequest('settings', 'DELETE', null, `key=eq.${key}`);
  },

  // ===== Notifications =====
  getNotifications: (limit = 10) => {
    return supabaseRequest('notifications', 'GET', null, `select=*&order=created_at.desc&limit=${limit}`);
  },

  createNotification: (data) => {
    return supabaseRequest('notifications', 'POST', data);
  },

  markNotificationRead: (id) => {
    return supabaseRequest('notifications', 'PATCH', { is_read: true }, `id=eq.${id}`);
  },

  deleteNotification: (id) => {
    return supabaseRequest('notifications', 'DELETE', null, `id=eq.${id}`);
  },

  clearNotifications: () => {
    return supabaseRequest('notifications', 'DELETE', null, 'is_read=eq.true');
  },

  // ===== Conversations (AI Chat) =====
  getConversations: () => {
    return supabaseRequest('conversations', 'GET', null, 'select=*&order=updated_at.desc');
  },

  getConversation: (id) => {
    return supabaseRequest('conversations', 'GET', null, `select=*&id=eq.${id}`).then(arr => arr?.[0] || null);
  },

  createConversation: (data) => {
    return supabaseRequest('conversations', 'POST', data);
  },

  updateConversation: (id, data) => {
    return supabaseRequest('conversations', 'PATCH', data, `id=eq.${id}`);
  },

  deleteConversation: (id) => {
    return supabaseRequest('conversations', 'DELETE', null, `id=eq.${id}`);
  },

  addMessageToConversation: async (id, message) => {
    const conv = await db.getConversation(id);
    if (!conv) throw new Error('Conversation not found');
    const messages = conv.messages || [];
    messages.push(message);
    return db.updateConversation(id, { messages, updated_at: new Date().toISOString() });
  },

  // ===== Generated Assets =====
  getAssets: (filter = {}) => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    if (filter.type) params.set('type', `eq.${filter.type}`);
    if (filter.status) params.set('status', `eq.${filter.status}`);
    if (filter.employee_id) params.set('employee_id', `eq.${filter.employee_id}`);
    if (filter.project_id) params.set('project_id', `eq.${filter.project_id}`);
    return supabaseRequest('generated_assets', 'GET', null, params.toString());
  },

  getAsset: (id) => {
    return supabaseRequest('generated_assets', 'GET', null, `select=*&id=eq.${id}`);
  },

  createAsset: (data) => {
    return supabaseRequest('generated_assets', 'POST', data);
  },

  updateAsset: (id, data) => {
    return supabaseRequest('generated_assets', 'PATCH', data, `id=eq.${id}`);
  },

  deleteAsset: (id) => {
    return supabaseRequest('generated_assets', 'DELETE', null, `id=eq.${id}`);
  },

  // ===== Resources =====
  getResources: (filter = {}) => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    if (filter.type) params.set('type', `eq.${filter.type}`);
    if (filter.search) params.set('or', `(name.ilike.*${filter.search}*,description.ilike.*${filter.search}*)`);
    return supabaseRequest('resources', 'GET', null, params.toString());
  },

  getResource: (id) => {
    return supabaseRequest('resources', 'GET', null, `select=*&id=eq.${id}`);
  },

  createResource: (data) => {
    return supabaseRequest('resources', 'POST', data);
  },

  updateResource: (id, data) => {
    return supabaseRequest('resources', 'PATCH', data, `id=eq.${id}`);
  },

  deleteResource: (id) => {
    return supabaseRequest('resources', 'DELETE', null, `id=eq.${id}`);
  },

  // ===== News (with local mock data fallback) =====
  _mockNews: [
    {
      id: 1,
      title: 'OpenAI 发布 GPT-5，多模态推理能力全面升级',
      summary: 'GPT-5 正式发布，在推理、编码、数学等领域实现显著提升，支持更长上下文和更精准的多模态理解。',
      content: 'OpenAI 于 2026 年 5 月正式发布 GPT-5，这是其旗舰大语言模型的最新版本。\n\n**核心升级亮点：**\n- **推理能力大幅提升**：在 MMLU、GSM8K 等基准测试中成绩较 GPT-4o 提升 30% 以上\n- **更长上下文**：支持最高 200 万 token 的上下文窗口\n- **多模态融合**：文本、图像、音频、视频的理解和生成能力全面增强\n- **实时搜索集成**：内置联网搜索，回答更具时效性\n\n**技术突破：**\n1. 新一代 MoE（混合专家）架构，在保持效率的同时提升模型容量\n2. 改进的 RLHF 算法，输出更符合人类偏好\n3. 强化的代码生成能力，支持复杂系统级开发\n\n**定价与可用性：**\n- ChatGPT Plus/Pro 用户可立即体验\n- API 已开放企业级访问\n- 提供多种价格档位的模型变体',
      category: 'industry',
      category_label: '行业动态',
      source: 'OpenAI 官方博客',
      url: 'https://openai.com/index/gpt-5/',
      hot: 9850,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-05-15',
      published_at: '2026-05-15',
      is_featured: true,
      views: 28560
    },
    {
      id: 2,
      title: 'Anthropic 发布 Claude 4，上下文窗口达 200 万 token',
      summary: 'Claude 4 系列正式发布，包含 Opus、Sonnet、Haiku 三个版本，在长文档处理和代码能力上表现突出。',
      content: 'Anthropic 于 2026 年 3 月推出 Claude 4 系列模型，继续强化其在长上下文处理方面的优势。\n\n**系列模型对比：**\n\n**Claude 4 Opus**\n- 最强性能版本，适合复杂推理任务\n- 200 万 token 上下文窗口\n- 性能超越 GPT-4o\n\n**Claude 4 Sonnet**\n- 性能与速度的最佳平衡\n- 200 万 token 上下文\n- 性价比最高的选择\n\n**Claude 4 Haiku**\n- 最快速度，最低延迟\n- 适合高并发场景\n- 成本效益出众\n\n**新特性：**\n- 改进的工具使用能力，支持复杂 Agent 工作流\n- 增强的视觉理解，支持图表和流程图解析\n- 更安全的输出，减少幻觉\n- 企业级合规支持\n\n**应用场景：**\n企业知识库问答、法律合同分析、代码库理解、学术论文综述等。',
      category: 'industry',
      category_label: '行业动态',
      source: 'Anthropic 官方',
      url: 'https://www.anthropic.com/news/claude-4',
      hot: 8720,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-03-20',
      published_at: '2026-03-20',
      is_featured: false,
      views: 22430
    },
    {
      id: 3,
      title: 'Google Gemini 2.5 Pro 正式发布，推理能力大幅提升',
      summary: 'Google 推出 Gemini 2.5 Pro，在数学推理、代码生成和长文档理解方面取得显著进步。',
      content: 'Google DeepMind 正式发布 Gemini 2.5 Pro，这是 Gemini 系列的最新旗舰模型。\n\n**核心能力提升：**\n\n**推理能力**\n- 数学推理：在竞赛级数学题上的表现提升 40%\n- 逻辑推理：更擅长复杂的多步推理\n- 科学推理：支持更深入的科学问题分析\n\n**代码能力**\n- 支持 50+ 编程语言\n- 代码库级别的理解和重构\n- 更好的调试和问题定位能力\n\n**长上下文**\n- 支持 100 万 token 上下文\n- 支持整本书、整个代码库的处理\n- 超长上下文下保持信息检索准确性\n\n**多模态**\n- 原生支持文本、图像、音频、视频\n- 视频理解最长支持 2 小时\n- 更精准的图像描述和 OCR\n\n**生态整合：**\n- Google Workspace 全面集成\n- Android 系统级 AI 助手\n- Vertex AI 企业平台支持',
      category: 'industry',
      category_label: '行业动态',
      source: 'Google DeepMind',
      url: 'https://deepmind.google/technologies/gemini/',
      hot: 7950,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-01-10',
      published_at: '2026-01-10',
      is_featured: false,
      views: 19870
    },
    {
      id: 4,
      title: 'OpenAI Sora 正式向公众开放，视频生成迈入新纪元',
      summary: 'Sora 文生视频模型全面开放，支持最长 60 秒 1080p 视频生成，画面质量和一致性大幅提升。',
      content: '经过近一年的内测，OpenAI 的文生视频模型 Sora 于 2025 年 12 月正式向所有用户开放。\n\n**核心能力：**\n\n**视频生成质量**\n- 最高支持 1080p 分辨率，60 秒时长\n- 场景连贯性和物理真实感显著提升\n- 角色一致性大幅改善\n- 支持复杂摄像机运动\n\n**输入方式**\n- 纯文本提示词生成视频\n- 参考图+文本生成视频\n- 视频扩展和续写\n- 风格迁移和视频重绘\n\n**应用场景**\n- 创意短片和广告制作\n- 游戏和动画预览\n- 教育和培训内容\n- 社交媒体内容创作\n\n**定价：**\n按生成分钟数计费，不同分辨率价格不同。ChatGPT Plus 用户每月包含免费额度。\n\n**行业影响：**\nSora 的公开发布被认为是视频创作领域的里程碑事件，将深刻影响影视、广告、游戏等多个行业的生产方式。',
      category: 'industry',
      category_label: '行业动态',
      source: 'OpenAI 官方',
      url: 'https://openai.com/sora/',
      hot: 12500,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-12-01',
      published_at: '2025-12-01',
      is_featured: true,
      views: 35620
    },
    {
      id: 5,
      title: '欧盟 AI 法案正式生效，分级监管体系落地',
      summary: '《人工智能法案》全面实施，AI 系统按风险等级分级管理，高风险应用需严格合规。',
      content: '欧盟《人工智能法案》（AI Act）于 2025 年 8 月正式生效，成为全球首部综合性 AI 监管法律。\n\n**监管框架要点：**\n\n**风险分级管理**\n\n**不可接受风险（禁止）**\n- 社会评分系统\n- 实时生物识别监控（特定例外）\n- 操纵弱势群体的 AI 系统\n\n**高风险（严格监管）**\n- 医疗设备 AI\n- 教育评估系统\n- 招聘筛选工具\n- 关键基础设施 AI\n- 需符合合规评估、透明度、数据治理等要求\n\n**中风险（透明度要求）**\n- 与公众互动的 AI 系统\n- 需明确标识为 AI 生成\n\n**低风险（基本无限制）**\n- 游戏 AI、翻译工具等\n- 自愿遵守行为准则\n\n**对企业的影响：**\n- 高风险 AI 产品需要进行符合性评估\n- 需建立 AI 风险管理体系\n- 违规罚款最高可达全球营业额的 7%\n- 非欧盟企业向欧盟提供 AI 服务也需合规\n\n**全球影响：**\n该法案被普遍认为将成为全球 AI 监管的基准，多国正在参考欧盟框架制定本国的 AI 监管政策。',
      category: 'industry',
      category_label: '行业动态',
      source: '欧盟委员会',
      url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
      hot: 6840,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-08-01',
      published_at: '2025-08-01',
      is_featured: false,
      views: 15230
    },
    {
      id: 6,
      title: '中国生成式 AI 服务管理办法实施细则发布',
      summary: '国家网信办发布生成式 AI 服务管理实施细则，明确备案、内容审核、安全评估等具体要求。',
      content: '国家互联网信息办公室联合多部门于 2025 年 10 月发布《生成式人工智能服务管理暂行办法》实施细则。\n\n**核心要求：**\n\n**备案制度**\n- 面向公众提供服务的生成式 AI 需履行备案手续\n- 备案内容包括模型基本信息、训练数据来源、安全评估报告等\n- 新增功能或重大更新需重新备案\n\n**内容安全**\n- 建立健全内容审核机制\n- 生成内容需符合社会主义核心价值观\n- 禁止生成违法违规内容\n- 建立内容投诉和处置机制\n\n**数据合规**\n- 训练数据需合法获取\n- 不得侵犯知识产权\n- 个人信息保护需符合《个人信息保护法》\n- 数据跨境传输需合规\n\n**标识要求**\n- AI 生成内容需显著标识\n- 平台需提供标识工具\n- 鼓励使用水印、元数据等技术手段\n\n**对开发者的建议：**\n1. 及时了解政策要求，做好合规准备\n2. 建立内容安全审核机制\n3. 保留训练数据来源证明\n4. 关注政策更新，及时调整',
      category: 'industry',
      category_label: '行业动态',
      source: '国家网信办',
      url: 'http://www.cac.gov.cn/',
      hot: 5920,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-10-15',
      published_at: '2025-10-15',
      is_featured: false,
      views: 13450
    },
    {
      id: 7,
      title: 'NVIDIA 发布 Blackwell Ultra，AI 算力再创新高',
      summary: 'NVIDIA 推出新一代 Blackwell Ultra 架构 GPU，训练性能较前代提升 4 倍，能效大幅改善。',
      content: 'NVIDIA 在 2026 年 4 月的 GTC 大会上正式发布 Blackwell Ultra 架构，以及基于该架构的新一代 GPU 产品。\n\n**性能提升：**\n\n**GB200 NVL72**\n- 72 颗 GPU 组成的机架级系统\n- AI 训练性能较 H100 提升 4 倍\n- 推理性能提升 6 倍\n- 支持万亿参数模型训练\n\n**关键技术创新：**\n1. **第二代 Transformer Engine**：支持 FP4 精度，计算密度翻倍\n2. **第五代 NVLink**：1.8TB/s 超高带宽互联\n3. **先进封装技术**：Chiplet 设计，良率和性能双赢\n4. **集成 CPU+GPU+DPU**：全栈优化的计算平台\n\n**能效改善：**\n- 每瓦性能提升 2.5 倍\n- 液冷散热方案\n- 数据中心总拥有成本降低\n\n**产品路线图：**\n- 2026 Q2：GB200 开始出货\n- 2026 下半年：大规模部署\n- 2027：Rubin 架构预计发布\n\n**市场影响：**\nBlackwell Ultra 的发布将进一步巩固 NVIDIA 在 AI 算力市场的领导地位，同时也为大模型训练和推理提供更强大的硬件基础。',
      category: 'industry',
      category_label: '行业动态',
      source: 'NVIDIA 官方',
      url: 'https://www.nvidia.com/en-us/data-center/blackwell/',
      hot: 7380,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-04-20',
      published_at: '2026-04-20',
      is_featured: false,
      views: 18560
    },
    {
      id: 8,
      title: '2026 年全球 AI 企业融资总额突破 5000 亿美元',
      summary: 'AI 行业投资持续火热，半年融资额已超去年全年，大模型、Agent、机器人成为热门赛道。',
      content: '据权威市场研究机构统计，2026 年上半年全球 AI 企业融资总额已突破 5000 亿美元，创历史新高。\n\n**融资数据概览：**\n\n**整体规模**\n- 上半年融资总额：5230 亿美元\n- 同比增长：+78%\n- 已超过 2025 年全年水平\n\n**热门赛道**\n\n**基础大模型**\n- 融资金额：1860 亿美元，占比 35.6%\n- 代表交易：某大模型公司融资 150 亿美元\n- 特点：资金向头部集中\n\n**AI Agent**\n- 融资金额：1250 亿美元，占比 23.9%\n- 同比增速：+215%\n- 特点：增长最快的赛道\n\n**具身智能/机器人**\n- 融资金额：980 亿美元，占比 18.7%\n- 特点：硬件+AI 结合\n\n**AI 应用**\n- 融资金额：760 亿美元，占比 14.5%\n- 特点：垂直领域应用增多\n\n**投资趋势：**\n1. **阶段后移**：更多资金投向成熟期公司\n2. **估值分化**：头部公司估值飙升，早期项目更理性\n3. **垂直深入**：行业专用 AI 受到更多关注\n4. **全球布局**：美国、中国、欧洲三足鼎立\n\n**风险提示：**\n市场也存在估值过高、商业模式不清晰等隐忧，投资者需理性看待 AI 热潮。',
      category: 'industry',
      category_label: '行业动态',
      source: 'CB Insights',
      url: 'https://www.cbinsights.com/research/artificial-intelligence-trends/',
      hot: 6540,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-06-01',
      published_at: '2026-06-01',
      is_featured: false,
      views: 14890
    },
    {
      id: 9,
      title: 'RAG 进阶实战：从检索增强到多跳推理的完整指南',
      summary: '深入讲解 RAG 的进阶技术，包括多跳推理、混合检索、重排序等，让你的 AI 应用更智能。',
      content: '检索增强生成（RAG）是构建企业级 AI 应用的核心技术。本文将从基础到进阶，全面讲解 RAG 的实战技巧。\n\n**RAG 基础回顾**\n\n基本流程：文档 → 切片 → 向量化 → 检索 → 生成\n\n常见问题：\n- 检索结果不相关\n- 缺失关键信息\n- 答案不完整\n\n**进阶技术一：混合检索**\n\n**向量检索 + 关键词检索**\n- 向量检索：语义相似度匹配\n- 关键词检索：精确匹配，适合专业术语\n- 混合检索：两者结合，Reciprocal Rank Fusion (RRF) 融合结果\n\n代码示例框架：\n```\n1. 分别用 BM25 和向量检索获取 Top-K 结果\n2. 用 RRF 算法融合两个结果列表\n3. 取融合后的 Top-N 作为最终结果\n```\n\n**进阶技术二：重排序（Rerank）**\n\n为什么需要重排序？\n- 向量检索是粗筛，速度快但精度有限\n- 重排序模型更精准，但计算成本高\n- 两阶段策略：先粗筛再精排，兼顾效率和效果\n\n常用重排序模型：\n- Cohere Rerank\n- BGE-Reranker\n- Cross-Encoder 系列\n\n**进阶技术三：多跳推理**\n\n什么是多跳推理？\n需要从多个文档中获取信息，经过多步推理才能回答问题。\n实现方案：\n1. **子问题分解**：将复杂问题拆分为多个子问题\n2. **逐步检索**：先检索子问题答案，再综合\n3. **迭代检索**：根据中间结果不断调整检索策略\n4. **图 RAG**：构建知识图谱，支持关系推理\n\n**进阶技术四：查询改写**\n\n用户原始查询可能不适合检索，需要改写：\n- 歧义消解\n- 补充上下文\n- 关键词扩展\n- 查询分解\n\n可以用 LLM 本身来做查询改写。\n\n**总结与最佳实践：**\n1. 从简单 RAG 开始，逐步升级\n2. 评估指标要跟上，数据驱动优化\n3. 混合检索 + 重排序是性价比最高的组合\n4. 多跳推理按需使用，复杂度和收益要平衡',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/rag-advanced-guide',
      hot: 4280,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-05-20',
      published_at: '2026-05-20',
      is_featured: false,
      views: 10560
    },
    {
      id: 10,
      title: 'AI Agent 开发实战：从零构建自主智能体',
      summary: '手把手教你构建一个功能完整的 AI Agent，涵盖规划、工具使用、记忆系统等核心模块。',
      content: 'AI Agent 是当前 AI 领域最热门的方向之一。本文将带你从零开始，构建一个具备自主能力的智能体。\n\n**什么是 AI Agent？**\n\nAI Agent 是能够感知环境、自主决策并采取行动以实现目标的 AI 系统。\n\n核心组件：\n- **规划（Planning）**：分解目标，制定计划\n- **记忆（Memory）**：短期记忆和长期记忆\n- **工具使用（Tool Use）**：调用外部工具和 API\n- **反思（Reflection）**：自我评估和改进\n\n**第一步：搭建基础框架**\n\n选择开发框架：\n- LangChain / LangGraph：功能全面，生态丰富\n- AutoGPT / CrewAI：多 Agent 协作\n- 自定义框架：完全可控\n\n推荐从 LangGraph 入门，它提供了清晰的 Agent 工作流编排能力。\n\n**第二步：实现规划能力**\n\n规划模式：\n1. **ReAct**：思考-行动-观察循环\n2. **Plan-and-Execute**：先制定完整计划，再逐步执行\n3. **Tree of Thoughts**：多路径探索，选择最优解\n\n从 ReAct 模式开始最容易上手。\n\n**第三步：集成工具系统**\n\n常用工具类型：\n- **搜索工具**：Google Search、Tavily\n- **代码执行**：Python REPL、Jupyter\n- **数据库查询**：SQL 执行\n- **文件操作**：读写文件\n- **API 调用**：各种第三方服务\n\n工具调用的关键：\n- 清晰的工具描述（Schema）\n- 错误处理和重试机制\n- 安全沙箱隔离\n\n**第四步：构建记忆系统**\n\n记忆分层：\n- **短期记忆**：当前对话上下文\n- **工作记忆**：任务相关的中间结果\n- **长期记忆**：持久化存储的知识和经验\n\n记忆实现：\n- 向量数据库存储长期记忆\n- 基于语义相似度检索记忆\n- 记忆摘要和遗忘机制\n\n**第五步：评估与优化**\n\nAgent 评估维度：\n- 任务成功率\n- 工具使用效率\n- 资源消耗\n- 错误恢复能力\n\n优化技巧：\n1. 好的提示词设计事半功倍\n2. 给 Agent 明确的角色和目标\n3. 逐步增加复杂度，不要一步到位\n4. 记录完整的执行轨迹便于调试\n\n**进阶方向：**\n- 多 Agent 协作\n- 人机协作（Human-in-the-loop）\n- 自主学习和自我改进\n- 多模态 Agent',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/ai-agent-dev-guide',
      hot: 5120,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-04-10',
      published_at: '2026-04-10',
      is_featured: false,
      views: 12340
    },
    {
      id: 11,
      title: '提示词工程最佳实践：2026 年最新技巧汇总',
      summary: '系统梳理提示词工程的核心原则和实战技巧，助你充分发挥大模型的潜力。',
      content: '提示词工程是与大模型有效沟通的必备技能。本文系统总结 2026 年最新的提示词工程最佳实践。\n\n**核心原则**\n\n1. **清晰明确**：指令要具体，不要模糊\n2. **提供上下文**：给足背景信息\n3. **给出示例**：Few-shot 比 Zero-shot 效果好\n4. **分步指导**：复杂任务拆成步骤\n5. **指定格式**：明确输出格式要求\n\n**基础技巧**\n\n**1. 角色设定**\n让模型扮演特定角色，输出更专业。\n示例：「你是一位资深软件架构师，请分析以下系统设计...」\n\n**2. 思维链（Chain of Thought）**\n让模型逐步推理，而不是直接给答案。\n技巧：在提示词中加入「请一步步思考」或给出思考示例。\n\n**3. 少样本学习（Few-shot）**\n提供几个输入输出示例，模型更容易理解你的需求。\n关键：示例要有代表性，覆盖常见情况。\n\n**进阶技巧**\n\n**4. 自我一致性（Self-Consistency）**\n多次采样，选择多数一致的答案。\n适用场景：数学题、逻辑推理等有确定答案的问题。\n\n**5. 思维树（Tree of Thoughts）**\n让模型探索多条推理路径，选择最优解。\n实现方式：提示模型生成多个方案，然后评估选择。\n\n**6. 检索增强提示（RAG）**\n在提示词中加入检索到的相关信息。\n这是企业应用中最常用的技术之一。\n\n**结构化输出技巧**\n\n**7. 格式约束**\n明确要求 JSON、Markdown 表格等格式。\n推荐使用：\n- 明确的 JSON Schema\n- Pydantic 模型（配合框架）\n- 输出解析器校验\n\n**8. 约束引导**\n用标记符分隔不同部分的内容。\n例如：\n```\n<context>\n{context}\n</context>\n<question>\n{question}\n</question>\n```\n\n**调试与优化**\n\n**9. 迭代优化**\n- 从简单提示词开始\n- 逐步添加细节和约束\n- 用测试集评估效果\n\n**10. 常见问题排查**\n- 输出太长：加长度限制\n- 输出太短：要求详细说明\n- 偏离主题：强调核心任务\n- 格式不对：给出明确格式示例\n\n**工具推荐：**\n- PromptLayer / LangSmith：提示词调试和追踪\n- PromptPerfect：自动优化提示词\n- OpenAI Playground / Anthropic Console：快速测试\n\n**总结：**\n好的提示词是迭代出来的，不是一次写就的。建立测试用例，数据驱动优化，才能持续提升效果。',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/prompt-engineering-2026',
      hot: 3850,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-02-15',
      published_at: '2026-02-15',
      is_featured: false,
      views: 9870
    },
    {
      id: 12,
      title: '大模型 Fine-tuning 完全指南：LoRA 与全参微调对比',
      summary: '详解大模型微调的各种方法，包括全参微调、LoRA、QLoRA 等，帮你选择最合适的方案。',
      content: '大模型微调是让通用大模型适应特定领域或任务的关键技术。本文将全面介绍各种微调方法的原理、优缺点和适用场景。\n\n**微调概述**\n\n为什么需要微调？\n- 领域适配：让模型学习专业知识\n- 任务优化：针对特定任务提升效果\n- 风格定制：让输出符合特定风格\n- 成本优化：微调小模型可能比用超大模型更划算\n\n**方法一：全参微调（Full Fine-tuning）**\n\n**原理**：更新模型的所有参数\n\n**优点：**\n- 效果最好，能充分适配目标任务\n- 可以学习复杂的新模式\n\n**缺点：**\n- 计算成本极高（需要大量 GPU 显存）\n- 训练时间长\n- 有灾难性遗忘风险\n- 每个任务需要一份完整模型副本\n\n**适用场景：**\n- 有充足的计算资源\n- 任务差异非常大\n- 需要最高的效果\n\n**方法二：LoRA（Low-Rank Adaptation）**\n\n**原理**：只训练低秩矩阵，冻结原始模型参数\n\n**优点：**\n- 训练速度快，显存需求小\n- 只需要保存很小的 LoRA 权重（通常几 MB）\n- 可以在消费级 GPU 上微调 7B/13B 模型\n- 不容易灾难性遗忘\n\n**缺点：**\n- 效果略逊于全参微调\n- 对特别复杂的任务可能不够\n\n**关键参数：**\n- **rank（秩）**：越大效果越好，但参数越多（常用 8-64）\n- **alpha**：缩放因子，通常设为 rank 的 2 倍\n- **dropout**：防止过拟合\n- **目标模块**：选择哪些层加 LoRA（通常 q,k,v,o 投影层）\n\n**方法三：QLoRA**\n\n**原理**：量化 + LoRA，把模型量化到 4-bit，然后加 LoRA 训练\n\n**优点：**\n- 显存需求进一步降低\n- 可以在单张消费级 GPU 上调 70B 模型\n- 效果接近全参微调（论文声称）\n\n**缺点：**\n- 训练速度稍慢\n- 需要更高的显存带宽\n\n**方法四：其他参数高效微调方法**\n\n- **Prefix Tuning**：只训练前缀向量\n- **Prompt Tuning**：只训练软提示\n- **Adapter Tuning**：在模型层间插入小适配器\n\n**选型建议**\n\n| 方法 | 显存需求 | 效果 | 训练速度 | 推荐场景 |\n|------|---------|------|---------|----------|\n| 全参微调 | 极高 | 最好 | 慢 | 资源充足，追求极致 |\n| LoRA | 中等 | 好 | 快 | 大多数场景推荐 |\n| QLoRA | 低 | 较好 | 中等 | 显存有限，模型较大 |\n| Prompt Tuning | 很低 | 一般 | 很快 | 简单任务 |\n\n**实践步骤（以 LoRA 为例）：**\n1. 准备和清洗数据\n2. 选择基础模型\n3. 设置 LoRA 参数\n4. 开始训练，监控 loss\n5. 评估效果，调整参数\n6. 合并或部署\n\n**常见问题：**\n- **过拟合**：减少 epoch，增加数据，加 dropout\n- **效果不好**：增加 rank，调整学习率，检查数据质量\n- **训练太慢**：减少数据，降低 rank，用更大的 batch size\n\n**工具推荐：**\n- PEFT（Hugging Face）：参数高效微调库\n- Axolotl：LLaMA 系列微调工具\n- Unsloth：更快的 LoRA 训练',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/finetuning-complete-guide',
      hot: 4560,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-11-20',
      published_at: '2025-11-20',
      is_featured: false,
      views: 11230
    },
    {
      id: 13,
      title: '向量数据库选型与性能优化实战',
      summary: '对比主流向量数据库的特点与适用场景，详解索引算法选择和性能调优技巧。',
      content: '向量数据库是 AI 应用的核心基础设施之一。本文将帮你选择合适的向量数据库，并进行性能优化。\n\n**什么是向量数据库？**\n\n向量数据库专门用于存储和检索向量嵌入（embeddings），支持相似度搜索，是 RAG、推荐系统等应用的核心组件。\n\n**主流向量数据库对比**\n\n**1. Pinecone**\n- 类型：全托管 SaaS\n- 特点：简单易用，运维无忧\n- 规模支持：十亿级向量\n- 适用：不想运维，快速上线\n\n**2. Weaviate**\n- 类型：开源 + 托管\n- 特点：功能丰富，有混合搜索\n- 语言：Go 开发\n- 适用：需要灵活部署\n\n**3. Milvus**\n- 类型：开源，LF AI 基金会项目\n- 特点：性能优秀，生态成熟\n- 规模：超大规模\n- 适用：企业级大规模场景\n\n**4. Qdrant**\n- 类型：开源 + 托管\n- 特点：Rust 开发，性能优秀\n- 特性：支持过滤 + 向量搜索\n- 适用：高性能场景\n\n**5. Chroma**\n- 类型：轻量级开源\n- 特点：简单易用，Python 友好\n- 适用：原型开发，中小规模\n\n**6. pgvector**\n- 类型：PostgreSQL 扩展\n- 特点：与关系数据共存\n- 适用：已有 PostgreSQL，向量数据量不大\n\n**选型建议：**\n- 快速原型 → Chroma / pgvector\n- 生产环境，中小规模 → Qdrant / Weaviate\n- 超大规模 → Milvus / Pinecone\n- 与关系数据紧密结合 → pgvector\n\n**索引算法详解**\n\n**1. HNSW（Hierarchical Navigable Small World）**\n- 目前最主流的算法\n- 基于图结构\n- 查询速度快，内存占用较高\n- 参数：M（连接数）、ef_construction（构建时搜索深度）、ef_search（查询时搜索深度）\n\n**2. IVF（Inverted File Index）**\n- 基于聚类的倒排索引\n- 内存占用较低\n- 适合大规模数据\n- 参数：nlist（聚类数）、nprobe（查询时探查聚类数）\n\n**3. Flat / Brute Force**\n- 暴力搜索，精确结果\n- 速度慢（数据量大时）\n- 适合小规模数据或验证效果\n\n**性能优化技巧**\n\n**1. 选择合适的索引**\n- 数据量小（<10万）：Flat 即可\n- 中等规模（10万-1000万）：HNSW 优先\n- 超大规模（>1000万）：IVF 或考虑分片\n\n**2. 调整索引参数**\n- HNSW：M 通常设为 16-64，ef_search 根据延迟要求调整\n- IVF：nlist ≈ sqrt(N)，nprobe 从 nlist/10 开始调\n\n**3. 优化嵌入维度**\n- 维度越高，精度可能越好，但速度越慢、存储越大\n- 常用：384、768、1024、1536\n- 根据实际效果选择，不是越高越好\n\n**4. 数据分片与扩容**\n- 单机不够就分片（sharding）\n- 读写分离，主从复制\n- 热点数据缓存\n\n**5. 查询优化**\n- 只取需要的 Top-K\n- 预过滤减少向量计算量\n- 分页用游标，不要用 offset\n\n**RAG 场景下的最佳实践：**\n1. 切片大小要合适（通常 512-1024 token）\n2. 切片要有重叠（overlap）\n3. 不要只靠向量检索，结合关键词检索\n4. 用重排序（rerank）提升效果\n5. 定期评估检索质量\n\n**未来趋势：**\n- 混合检索（向量 + 关键词 + 过滤）成为标配\n- 向量数据库与关系数据库融合\n- 更智能的索引自动调优\n- 多向量和稀疏向量支持',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/vector-db-guide',
      hot: 3240,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-12-15',
      published_at: '2025-12-15',
      is_featured: false,
      views: 8760
    },
    {
      id: 14,
      title: '多模态应用开发：图文音视频一体化方案',
      summary: '详解如何构建多模态 AI 应用，涵盖多模态模型选型、数据处理和典型应用场景。',
      content: '多模态 AI 是未来的发展方向，让 AI 能够同时理解和生成文本、图像、音频、视频等多种模态的内容。\n\n**多模态模型概览**\n\n**主流多模态模型：**\n\n**1. GPT-4o / GPT-5**\n- 支持文本、图像、音频输入\n- 输出文本和图像\n- 综合能力最强\n\n**2. Gemini 系列**\n- Google 旗舰多模态模型\n- 支持视频理解（最长 2 小时）\n- 与 Google 生态深度整合\n\n**3. Claude 系列**\n- 文本+图像能力强\n- 长上下文优势明显\n- 适合文档+图表理解\n\n**4. 开源多模态模型**\n- LLaVA 系列：开源代表\n- Qwen-VL：阿里开源\n- MiniCPM-V：端侧多模态\n- 可以自部署，数据隐私好\n\n**多模态应用架构**\n\n**典型架构模式：**\n\n**模式一：统一模型**\n- 一个大模型处理所有模态\n- 开发简单，成本较高\n- 适合原型和小规模应用\n\n**模式二：模型组合**\n- 不同模态用专门模型\n- 通过编排层整合\n- 灵活高效，成本可控\n- 推荐生产环境使用\n\n**模式三：多模态 RAG**\n- 对图像、视频等也做向量化检索\n- 结合多模态理解模型\n- 适合有大量多模态素材的场景\n\n**图像理解应用**\n\n**常见场景：**\n1. **图片描述**：自动生成图片说明\n2. **OCR + 理解**：提取并理解文档内容\n3. **图像问答**：关于图片的问答\n4. **图表分析**：理解图表数据\n5. **质量检测**：检测图片质量问题\n\n**实现要点：**\n- 图片预处理（缩放、压缩）\n- 控制图片分辨率（影响成本和效果）\n- 支持多张图片对比\n\n**音频应用**\n\n**常见场景：**\n1. **语音转文字（ASR）**\n2. **文字转语音（TTS）**\n3. **语音翻译**\n4. **音频内容理解**（播客、会议）\n\n**推荐工具：**\n- Whisper：开源 ASR，支持多语言\n- ElevenLabs：高质量 TTS\n- OpenAI Whisper API：简单易用\n\n**视频应用**\n\n**常见场景：**\n1. **视频内容理解**：摘要、问答\n2. **视频生成**：文生视频、图生视频\n3. **视频编辑**：AI 辅助剪辑\n\n**技术挑战：**\n- 视频数据量大，处理成本高\n- 时序理解复杂\n- 长视频需要分段处理\n\n**典型应用案例**\n\n**案例一：智能文档处理**\n- 输入：PDF、扫描件、图片文档\n- 处理：OCR + 布局分析 + 内容理解\n- 输出：结构化数据、摘要、问答\n\n**案例二：智能客服**\n- 用户发送图片/语音/视频\n- 多模态理解用户问题\n- 结合知识库给出答案\n\n**案例三：内容创作助手**\n- 生成文案 + 配图建议\n- 视频脚本生成\n- 多语言配音\n\n**开发建议：**\n1. 从单模态开始，逐步增加\n2. 先评估效果，再考虑成本优化\n3. 注意多模态数据的版权和隐私\n4. 错误处理要全面（模态缺失、格式不支持等）\n\n**未来趋势：**\n- 端侧多模态模型普及\n- 实时多模态交互\n- 更高质量的多模态生成\n- 更自然的人机交互方式',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/multimodal-dev-guide',
      hot: 3680,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-03-01',
      published_at: '2026-03-01',
      is_featured: false,
      views: 9340
    },
    {
      id: 15,
      title: 'Function Calling 深度解析：让 AI 学会使用工具',
      summary: '深入理解大模型的函数调用能力，掌握工具使用的设计原则和最佳实践。',
      content: 'Function Calling（函数调用）是大模型的重要能力，它让 AI 不再只是聊天，而是能够调用外部工具执行实际操作。\n\n**什么是 Function Calling？**\n\nFunction Calling 是指大模型根据用户需求，自主选择并调用外部函数/工具的能力。\n\n为什么重要？\n- 突破模型自身知识限制\n- 与外部世界交互\n- 执行实际操作\n- 构建复杂工作流\n\n**工作原理**\n\n基本流程：\n1. 用户提问\n2. 模型判断是否需要调用工具\n3. 如果需要，生成工具调用参数\n4. 程序执行工具调用\n5. 把结果返回给模型\n6. 模型根据工具结果回答用户\n\n这是一个典型的「模型调用 + 程序执行 + 结果回传」的循环。\n\n**工具定义规范**\n\n**函数定义三要素：**\n1. **name**：函数名，要清晰描述功能\n2. **description**：函数描述，告诉模型什么时候用\n3. **parameters**：参数定义（JSON Schema 格式）\n\n**好的工具定义示例：**\n```json\n{\n  \"name\": \"search_web\",\n  \"description\": \"搜索互联网获取最新信息，适用于需要时效性知识或不确定答案的问题\",\n  \"parameters\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"query\": {\n        \"type\": \"string\",\n        \"description\": \"搜索关键词\"\n      },\n      \"num_results\": {\n        \"type\": \"integer\",\n        \"description\": \"返回结果数量\",\n        \"default\": 5\n      }\n    },\n    \"required\": [\"query\"]\n  }\n}\n```\n\n**工具设计原则**\n\n**1. 单一职责**\n每个工具只做一件事，功能清晰。\n\n**2. 描述清晰**\n- 说明工具的用途\n- 说明什么时候该用，什么时候不该用\n- 描述参数的含义和格式\n\n**3. 颗粒度适中**\n- 太细：模型需要调用很多次，慢\n- 太粗：不灵活，不通用\n- 根据实际场景找到平衡点\n\n**4. 错误友好**\n- 工具出错时返回有用的错误信息\n- 让模型知道为什么失败，以及如何修正\n\n**常用工具类型**\n\n**1. 信息获取类**\n- 网页搜索\n- 数据库查询\n- 文件读取\n- API 数据获取\n\n**2. 操作执行类**\n- 发送邮件/消息\n- 创建日历事件\n- 代码执行\n- 文件写入\n\n**3. 计算处理类**\n- 数学计算\n- 数据处理\n- 格式转换\n\n**安全注意事项**\n\n**重要：不要让 AI 直接执行危险操作！**\n\n安全措施：\n1. **权限控制**：AI 使用的账号权限最小化\n2. **人工确认**：重要操作需要人类确认\n3. **沙箱隔离**：代码执行在沙箱中\n4. **操作审计**：记录所有 AI 执行的操作\n5. **速率限制**：防止误操作造成大规模影响\n\n**高级技巧**\n\n**1. 工具选择策略**\n- 工具多时，先做检索再调用\n- 给工具分类，帮助模型快速选择\n\n**2. 并行工具调用**\n- 多个独立工具可以并行调用\n- 提高效率，减少等待时间\n\n**3. 工具结果处理**\n- 工具返回结果可能很长\n- 需要摘要或截断后再给模型\n- 重要信息要保留\n\n**4. 多轮工具调用**\n- 复杂任务可能需要多次工具调用\n- 模型根据上一步结果决定下一步\n- 要设置最大调用次数防止死循环\n\n**框架支持：**\n- LangChain：工具集成丰富\n- LangGraph：复杂工作流编排\n- AutoGPT：自主 Agent 框架\n- 自建：简单场景可以自己实现\n\n**调试建议：**\n1. 记录完整的工具调用日志\n2. 查看模型为什么选择/不选择某个工具\n3. 优化工具描述往往比换模型更有效\n4. 准备测试用例，回归验证\n\n**总结：**\nFunction Calling 是连接 AI 和现实世界的桥梁。设计好的工具集、保障安全、处理好异常，才能充分发挥 AI 的能力。',
      category: 'tutorial',
      category_label: '技术教程',
      source: '技术博客',
      url: 'https://example.com/function-calling-guide',
      hot: 2980,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-01-25',
      published_at: '2026-01-25',
      is_featured: false,
      views: 7650
    },
    {
      id: 16,
      title: 'Midjourney v7 正式发布，图像质量再创新高',
      summary: 'Midjourney v7 版本正式上线，在细节表现、文字渲染、提示词理解方面均有显著提升。',
      content: 'Midjourney 于 2026 年 5 月正式发布 v7 版本，这是其 AI 图像生成模型的最新旗舰版本。\n\n**核心升级亮点：**\n\n**图像质量提升**\n- **细节更丰富**：纹理、材质表现更加真实细腻\n- **光照更自然**：光影效果更加真实可信\n- **构图更专业**：审美水平整体提升\n- **分辨率提升**：默认生成更高分辨率图片\n\n**提示词理解**\n- 更准确地理解复杂提示词\n- 更好地遵循细节描述\n- 支持更丰富的风格描述\n- 多主体场景一致性提升\n\n**文字渲染**\n- 文字生成能力大幅改善\n- 支持多种字体和风格\n- 中英文都能较好生成\n- 文字准确性显著提升\n\n**新功能特性**\n\n**1. 风格参考（Style Reference）增强**\n- 可以更精准地模仿参考图的风格\n- 支持多张参考图融合\n- 风格强度可调节\n\n**2. 角色一致性（Character Consistency）**\n- 新的角色一致性功能\n- 同一张脸在不同场景中保持一致\n- 支持多角度、多表情\n- 对漫画、游戏设计非常有用\n\n**3. 图像扩展（Outpaint）升级**\n- 更智能的图像外扩\n- 保持风格和内容一致性\n- 支持任意方向扩展\n\n**4. 局部重绘（Vary Region）改进**\n- 更精准的区域控制\n- 更好的融合效果\n- 支持多次迭代调整\n\n**性能改善**\n- 生成速度提升约 30%\n- 更快的放大（Upscale）\n- 更稳定的服务可用性\n\n**定价与可用性：**\n- 所有订阅用户均可使用\n- 默认模型已切换为 v7\n- 可以用 --v 6 继续使用旧版\n- 新功能按正常 fast hours 计费\n\n**使用建议：**\n1. 用新模型重新测试旧提示词，效果可能更好\n2. 尝试 Character Consistency 做系列作品\n3. 利用文字生成能力做海报设计\n4. 配合 Style Reference 做风格统一的项目\n\nMidjourney v7 的发布再次拉高了 AI 图像生成的天花板，创作者们可以期待用它产出更优质的作品。',
      category: 'product',
      category_label: '产品更新',
      source: 'Midjourney 官方',
      url: 'https://www.midjourney.com/',
      hot: 10200,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-05-05',
      published_at: '2026-05-05',
      is_featured: true,
      views: 26780
    },
    {
      id: 17,
      title: 'Runway Gen-4 发布，视频生成质量实现飞跃',
      summary: 'Runway 推出第四代视频生成模型 Gen-4，画面质量、运动连贯性、时长均大幅提升。',
      content: 'Runway 于 2026 年 4 月正式发布 Gen-4 视频生成模型，这是其文生视频技术的最新里程碑。\n\n**核心提升：**\n\n**画面质量**\n- 分辨率最高支持 4K\n- 画面清晰度和细节显著提升\n- 更真实的材质和光照\n- 更少的伪影和畸变\n\n**运动连贯性**\n- 更自然流畅的运动\n- 物体运动轨迹更合理\n- 减少了闪烁和抖动\n- 摄像机运动更顺滑\n\n**时长支持**\n- 单次生成长度提升至 30 秒\n- 支持视频续写，可无限延长\n- 更好的首尾衔接一致性\n\n**新功能特性：\n\n**1. 运动控制（Motion Control）**\n- 更精细的运动强度控制\n- 支持指定摄像机运动轨迹\n- 可调节运动速度\n- 支持镜头语言描述\n\n**2. 角色一致性**\n- 人物在视频中保持一致\n- 支持角色参考图\n- 服装、发型稳定\n- 多角度运动不变形\n\n**3. 风格迁移增强**\n- 视频风格迁移效果更好\n- 支持参考视频风格\n- 实时风格预览\n\n**4. 音频同步**\n- 支持根据音频生成对口型视频\n- 语音驱动表情\n- 动作与音乐节奏同步\n\n**Gen-3 vs Gen-4 对比：**\n\n| 特性 | Gen-3 | Gen-4 |\n|------|-------|-------|\n| 最大分辨率 | 1080p | 4K |\n| 单段时长 | 16 秒 | 30 秒 |\n| 运动质量 | 良好 | 优秀 |\n| 角色一致性 | 一般 | 良好 |\n| 生成速度 | 基准 | +20% |\n\n**使用场景拓展：**\n- **广告制作**：高质量产品视频\n- **影视前期**：概念视频、分镜动态化\n- **游戏开发**：CG 预告片、过场动画\n- **社交媒体**：短视频内容创作\n- **教育内容**：教学动画、演示视频\n\n**定价：**\n- Gen-4 已纳入所有付费计划\n- 按生成秒数消耗 credits\n- 4K 生成消耗更多 credits\n- 企业版可定制配额\n\nRunway 作为 AI 视频生成领域的领导者之一，Gen-4 的发布将进一步推动视频创作的 AI 化转型。',
      category: 'product',
      category_label: '产品更新',
      source: 'Runway 官方',
      url: 'https://runwayml.com/',
      hot: 8560,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-04-01',
      published_at: '2026-04-01',
      is_featured: false,
      views: 21340
    },
    {
      id: 18,
      title: 'Stable Diffusion 3.5 开源，速度与质量双提升',
      summary: 'Stability AI 发布 Stable Diffusion 3.5 并完全开源，图像质量大幅提升，推理速度更快。',
      content: 'Stability AI 于 2026 年 2 月正式发布 Stable Diffusion 3.5，并将模型权重完全开源，社区可以自由使用和二次开发。\n\n**SD 3.5 核心改进：**\n\n**图像质量**\n- 整体画质较 SD 3 提升一个档次\n- 人体结构更准确\n- 手部生成显著改善（历史老大难问题）\n- 文字生成能力大幅提升\n- 更细腻的纹理和材质\n\n**架构更新**\n- 基于 MMDiT（多模态扩散变换器）架构\n- 更好的文本-图像对齐\n- 更大的模型容量（Medium 8B 参数）\n- 支持更高分辨率生成\n\n**性能优化**\n- 推理速度较 SD 3 提升 25%\n- 显存占用优化\n- 支持更多加速技术\n- 消费级显卡即可运行\n\n**版本矩阵：**\n\n**SD 3.5 Large**\n- 最高质量版本\n- 推荐用于专业创作\n- 需要较高显存（16GB+）\n\n**SD 3.5 Medium**\n- 质量与速度平衡\n- 8B 参数\n- 8GB 显存即可运行\n- 大多数用户的首选\n\n**SD 3.5 Large Turbo**\n- 快速生成版本\n- 4-8 步即可出图\n- 适合快速迭代和预览\n\n**开源协议：**\n- 模型权重完全开放\n- 非商业用途免费\n- 商业使用需申请授权\n- 可以基于 SD 3.5 训练 LoRA 和微调\n\n**社区生态：**\n\n开源后社区迅速跟进：\n- ComfyUI 已完整支持\n- Automatic1111 适配中\n- 大量 LoRA 和 ControlNet 模型开始涌现\n- 第三方优化方案不断出现\n\n**与 Midjourney 对比：**\n\n| 维度 | SD 3.5（开源） | Midjourney v7 |\n|------|---------------|--------------|\n| 画质 | 优秀 | 最佳 |\n| 可控性 | 极高 | 中等 |\n| 成本 | 一次性硬件投入 | 订阅制 |\n| 隐私 | 本地部署，数据不出门 | 云端处理 |\n| 使用难度 | 较复杂 | 简单 |\n| 定制化 | 几乎无限 | 有限 |\n\n**部署建议：**\n- 入门用户：先试试在线版本\n- 有显卡用户：本地部署 Medium 版本\n- 专业用户：Large + 定制 workflow\n- 企业用户：考虑商业授权\n\nStable Diffusion 3.5 的开源标志着开源 AI 图像生成达到了新的高度，对于需要自定义工作流和数据隐私的用户来说是一大福音。',
      category: 'product',
      category_label: '产品更新',
      source: 'Stability AI',
      url: 'https://stability.ai/news/stable-diffusion-3-5',
      hot: 7890,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-02-20',
      published_at: '2026-02-20',
      is_featured: false,
      views: 19450
    },
    {
      id: 19,
      title: 'DALL·E 4 发布，理解能力与画质全面升级',
      summary: 'OpenAI 推出 DALL·E 4 图像生成模型，提示词理解更精准，图像质量更高，支持更多创作控制。',
      content: 'OpenAI 在 2026 年 3 月正式发布 DALL·E 4，集成在 ChatGPT 中为用户提供更强大的图像生成能力。\n\n**核心升级：**\n\n**图像质量提升**\n- 整体画质显著提升，更接近真实照片\n- 细节更加丰富细腻\n- 色彩更加自然准确\n- 支持更高分辨率输出\n\n**提示词理解**\n- 更准确地理解复杂描述\n- 多物体场景更可控\n- 空间关系理解更好\n- 支持更精细的风格控制\n\n**文字生成能力**\n- 文字生成准确性大幅改善\n- 支持多种语言\n- 字体和排版更自然\n- 适合海报、封面等设计\n\n**新功能：**\n\n**1. 图像编辑增强**\n- 更智能的局部编辑\n- 自然的融合效果\n- 支持复杂的修改需求\n- 对话式修改，迭代优化\n\n**2. 风格一致性**\n- 生成同一系列图片风格统一\n- 支持参考图风格迁移\n- 适合品牌内容创作\n- 多图项目更省心\n\n**3. 扩展画布**\n- 智能图像外扩\n- 上下左右任意方向扩展\n- 保持内容连贯\n- 适合调整构图\n\n**4. 多样化生成**\n- 一次生成更多变体\n- 风格差异更大\n- 更容易找到满意的结果\n- 激发创意灵感\n\n**与 ChatGPT 深度整合：**\n\nDALL·E 4 的最大优势是与 ChatGPT 的深度整合：\n- 自然语言描述需求，ChatGPT 自动优化提示词\n- 可以边聊边改，迭代创作\n- ChatGPT 理解上下文，生成更符合需求的图\n- 结合文本创作，图文一体\n\n**使用方式：**\n- ChatGPT Plus / Pro / Enterprise 用户可用\n- API：通过 Images API 调用\n- 支持 gpt-image-4 模型\n- 按张数计费\n\n**适用场景：**\n- **内容创作**：博客配图、社交媒体图片\n- **设计原型**：快速生成设计灵感\n- **教育演示**：教学插图、示意图\n- **营销素材**：广告图、产品图\n- **创意探索**：艺术创作、概念设计\n\n对于已经在使用 ChatGPT 的用户来说，DALL·E 4 提供了无缝的图像生成体验，无需切换工具即可完成图文创作工作流。',
      category: 'product',
      category_label: '产品更新',
      source: 'OpenAI 官方',
      url: 'https://openai.com/dall-e-4/',
      hot: 6780,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-03-15',
      published_at: '2026-03-15',
      is_featured: false,
      views: 16890
    },
    {
      id: 20,
      title: '字节跳动即梦 AI 2.0 发布，国产文生图新标杆',
      summary: '字节跳动推出即梦 AI 2.0，在中文理解、东方美学、生成速度方面表现突出。',
      content: '字节跳动于 2025 年 11 月正式发布即梦 AI 2.0 版本，这是其自研的文生图大模型的重大升级。\n\n**核心亮点：**\n\n**中文理解更精准**\n- 深度优化中文提示词理解\n- 熟悉中文网络文化和梗\n- 更好的古诗词、成语意境理解\n- 中国风元素更地道\n\n**东方美学风格**\n- 专门优化了东方人面部特征\n- 国风、古风效果出色\n- 中式审美偏好调优\n- 更符合国内用户审美\n\n**生成速度**\n- 平均生成时间 3-5 秒\n- 极速模式 2 秒出图\n- 高并发下稳定响应\n- 批量生成效率高\n\n**功能特性：**\n\n**1. 多种生成模式**\n- 文生图：文字描述生成图片\n- 图生图：基于参考图生成\n- 局部重绘：精准修改局部\n- 智能扩图：扩展画面边界\n\n**2. 丰富的风格模型**\n- 写实人像\n- 二次元/动漫\n- 国风水墨\n- 3D 渲染\n- 赛博朋克\n- 油画艺术\n- 持续更新中\n\n**3. ControlNet 支持**\n- 支持姿态控制\n- 深度图控制\n- 线稿上色\n- Canny 边缘控制\n- 让构图更可控\n\n**4. 高清放大**\n- 智能无损放大\n- 支持 2x/4x 放大\n- 保持细节清晰\n- 适合打印和商用\n\n**产品形态：**\n\n- **网页版**：jimeng.jianying.com\n- **抖音小程序**：即梦 AI\n- **剪映集成**：剪映专业版内置\n- **API 服务**：企业级接入\n\n**定价策略：**\n- 新用户注册送免费额度\n- 每日签到领积分\n- 会员订阅制\n- 按量充值也可\n\n**与国际模型对比：**\n\n即梦 AI 的差异化优势：\n1. **中文更好**：对中文提示词的理解和生成质量优于海外模型\n2. **国内访问快**：本地服务，低延迟\n3. **合规友好**：符合国内内容监管要求\n4. **价格亲民**：比国际模型便宜不少\n\n**适用人群：**\n- 国内内容创作者\n- 自媒体和新媒体从业者\n- 电商美工和设计师\n- AI 绘画爱好者\n- 需要中文内容的企业\n\n即梦 AI 2.0 的发布标志着国产 AI 图像生成模型已经达到了国际先进水平，在中文场景下甚至更有优势。',
      category: 'product',
      category_label: '产品更新',
      source: '字节跳动',
      url: 'https://jimeng.jianying.com/',
      hot: 5670,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-11-01',
      published_at: '2025-11-01',
      is_featured: false,
      views: 14560
    },
    {
      id: 21,
      title: 'Perplexity AI 推出企业版搜索服务',
      summary: 'Perplexity 推出面向企业的 AI 搜索解决方案，支持私有知识库集成、团队协作和权限管理。',
      content: 'Perplexity AI 于 2026 年 1 月正式推出企业版服务，为组织提供安全、可控的 AI 驱动搜索解决方案。\n\n**企业版核心功能：**\n\n**1. 私有知识库集成**\n- 上传企业内部文档、Wiki、知识库\n- 索引结构化和非结构化数据\n- 支持多种格式：PDF、Word、PPT、HTML 等\n- 支持连接 Confluence、Notion 等工具\n- 答案引用内部数据来源\n\n**2. 团队协作功能**\n- 团队共享搜索历史和收藏\n- 协作空间管理\n- 答案评价和反馈\n- 知识发现和推荐\n\n**3. 企业级安全与权限**\n- SSO 单点登录（SAML, OIDC）\n- 基于角色的权限控制（RBAC）\n- 数据加密（传输中 + 静态）\n- 审计日志\n- 数据驻留选项\n- SOC 2 合规\n\n**4. 自定义模型选择**\n- 支持多种底层模型\n- 企业可以选择适合的模型\n- 平衡性能和成本\n- 支持使用自有微调模型\n\n**5. API 和集成**\n- 完整的 REST API\n- 接入企业内部系统\n- 支持 Slack、Microsoft Teams 等集成\n- 可嵌入内部工具和门户\n\n**产品版本：**\n\n**Pro**：个人高级版\n- 适合个人用户\n- 高级模型访问\n- 更多搜索配额\n\n**Team**：小团队版\n- 2-50 人团队\n- 团队协作空间\n- 共享知识库（有限）\n\n**Enterprise**：企业版\n- 无限制用户\n- 完整知识库集成\n- 企业级安全和支持\n- 定制化部署选项\n\n**与传统企业搜索对比：**\n\n| 特性 | 传统企业搜索 | Perplexity 企业版 |\n|------|------------|-----------------|\n| 查询方式 | 关键词 | 自然语言 |\n| 结果形式 | 链接列表 | 直接答案+引用 |\n| 实施难度 | 高，需要调优 | 低，开箱即用 |\n| 维护成本 | 高 | 低 |\n| 准确率 | 依赖配置 | 更高更智能 |\n\n**应用场景：**\n- **企业内部知识库问答**：员工快速找到内部信息\n- **客户支持**：客服快速找到答案\n- **销售赋能**：销售快速获取产品和竞品信息\n- **研发效率**：工程师快速查找技术文档\n- **合规与风控**：快速检索政策和法规\n\n**竞品对比：**\n- Glean：企业 AI 搜索老牌厂商\n- Microsoft Copilot：绑定 Microsoft 生态\n- Google Gemini for Workspace：Google 生态\n- Perplexity：更通用，用户体验好\n\nPerplexity 企业版的推出，标志着 AI 原生搜索正在从消费级向企业级市场渗透，有望重塑企业知识管理和信息检索的方式。',
      category: 'product',
      category_label: '产品更新',
      source: 'Perplexity 官方',
      url: 'https://www.perplexity.ai/enterprise',
      hot: 4560,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2026-01-05',
      published_at: '2026-01-05',
      is_featured: false,
      views: 11230
    },
    {
      id: 22,
      title: 'Notion AI 推出写作助手 2.0，长文创作更流畅',
      summary: 'Notion AI 2.0 版本上线，改进长文写作、多文档总结、知识问答等功能，深度融入工作流。',
      content: 'Notion 于 2025 年 10 月推出 AI 写作助手 2.0 版本，在长文创作和知识管理方面带来多项重要升级。\n\n**2.0 核心升级：**\n\n**长文写作能力**\n- 支持超长文档的 AI 写作\n- 更好的上下文连贯性\n- 章节级别的内容生成\n- 自动整理文章结构\n- 智能续写和扩写\n\n**多文档理解**\n- 跨多个页面的内容总结\n- 项目级别的知识问答\n- 关联文档自动发现\n- 从多个来源综合回答\n\n**改进的 AI 指令**\n- 更智能的空白页助手\n- 选中内容的 AI 操作更丰富\n- 自定义 AI 指令（Custom Instructions）\n- 常用指令快速访问\n\n**新功能详解：**\n\n**1. AI 写作伴侣（AI Writing Companion）**\n- 实时提供写作建议\n- 帮助梳理思路和大纲\n- 自动修正和润色\n- 保持风格一致\n- 边写边给反馈\n\n**2. 智能摘要 2.0**\n- 单页摘要：快速了解文档要点\n- 数据库摘要：从多条记录生成汇总\n- 周报/月报自动生成\n- 会议纪要自动整理\n\n**3. Notion Q&A 升级**\n- 问答更准确\n- 支持更复杂的问题\n- 答案自动引用来源页面\n- 可以追问和深入\n\n**4. 数据库 AI 功能**\n- AI 自动填充属性\n- 智能分类和标签\n- 数据洞察和趋势分析\n- 自动生成项目状态更新\n\n**与工作流深度整合：**\n\nNotion AI 的最大优势是与 Notion 本身的深度整合：\n- 写文档时随时调用 AI\n- 数据库中 AI 批量处理\n- 项目管理中 AI 辅助规划\n- 知识库中 AI 问答\n不用切换工具，在一个地方完成所有工作\n\n**使用场景：**\n\n**内容创作**\n- 博客文章、技术文档\n- 营销文案、产品描述\n- 邮件、报告\n\n**知识管理**\n- 会议纪要整理\n- 文档摘要\n- 知识库问答\n\n**项目管理**\n- 任务拆解\n- 进度报告\n- 风险识别\n\n**产品工作**\n- 用户反馈分析\n- PRD 写作辅助\n- 竞品分析\n\n**定价：**\n- Notion AI 作为附加功能订阅\n- Plus 及以上计划可购买\n- 按成员计费\n- 企业版有定制方案\n- 包含一定额度的 AI 使用量\n\n**竞品对比：**\n- **Notion AI**：深度整合，知识管理强\n- **ChatGPT**：通用能力强，但不连接你的数据\n- **Claude**：长文档处理强，但需要自己组织\n- **Copy.ai**：营销文案专业，但通用性弱\n\n对于已经在使用 Notion 的团队和个人来说，Notion AI 2.0 提供了最无缝的 AI 增强体验，让知识工作效率更上一层楼。',
      category: 'product',
      category_label: '产品更新',
      source: 'Notion 官方',
      url: 'https://www.notion.so/product/ai',
      hot: 3890,
      cover_image: 'assets/image_1_yi19x4.jpg',
      date: '2025-10-20',
      published_at: '2025-10-20',
      is_featured: false,
      views: 9870
    }
  ],

  getNews: function(filter = {}) {
    let result = [...this._mockNews];
    
    if (filter.category && filter.category !== 'all') {
      result = result.filter(item => item.category === filter.category);
    }
    
    if (filter.search) {
      const keyword = filter.search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword)
      );
    }
    
    result.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    
    return Promise.resolve(result);
  },

  getNewsById: function(id) {
    const news = this._mockNews.find(item => item.id === parseInt(id));
    return Promise.resolve(news || null);
  },

  getFeaturedNews: function() {
    const featured = this._mockNews.filter(item => item.is_featured);
    return Promise.resolve(featured);
  }
};