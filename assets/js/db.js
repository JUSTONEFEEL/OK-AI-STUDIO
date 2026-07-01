// Supabase 数据访问层 - 完整 CRUD 支持
// 使用 anon key（前端安全）

const SUPABASE_URL = 'https://bsnuroxmwmjdgistoqto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbnVyb3htd21qZGdpc3RvcXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzI1NDIsImV4cCI6MjA5ODQ0ODU0Mn0.sIqs1v1Oe0TeiFY8q8t9VMhcAm6O5N8F_Y2kvwBwj08';

async function supabaseRequest(table, method = 'GET', body = null, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
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
    return supabaseRequest('settings', 'POST', { key, value }, 'on_conflict=key');
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
      title: 'AI漫剧生成迎来跨越式升级',
      summary: '新一代多模态模型上线，分镜一致性、角色表情与镜头语言全面提升，平均出片时间缩短 40%。',
      content: '近日，OK AI ART 正式发布了新一代多模态漫剧生成模型 V3.0。该版本在多个关键指标上实现了跨越式提升：\n\n**分镜一致性提升 65%**：通过引入角色记忆网络和场景连贯性约束，同一角色在不同镜头中的外貌、服装一致性大幅提升。\n\n**角色表情丰富度翻倍**：新增 200+ 精细表情控制维度，支持微妙的情绪变化，让角色更加生动立体。\n\n**镜头语言全面升级**：内置 50+ 经典电影镜头模板，一键生成专业级运镜效果。\n\n**出片效率提升 40%**：优化推理管线，平均生成时间从 12 秒缩短至 7 秒，批量生成效率提升显著。\n\n用户可在创作工坊中立即体验新版本功能。',
      category: 'product',
      category_label: '产品更新',
      cover_image: 'assets/image_0_yi19x4.jpg',
      published_at: '2025-06-30',
      is_featured: true,
      views: 12580
    },
    {
      id: 2,
      title: '多角色一致性引擎正式上线',
      summary: '同一项目内多角色立绘保持面孔、服装、配饰高度一致，无需反复调参。',
      content: '经过两个月的内测，多角色一致性引擎今日正式全量开放。\n\n**核心功能：**\n- 支持单项目内最多 20 个主要角色的一致性管理\n- 自动锁定角色外貌特征、服装风格、配饰细节\n- 支持角色关系图谱，自动生成互动场景\n- 一键切换角色年龄、表情、姿态\n\n**使用场景：**\n1. 长篇漫剧连载：确保角色形象贯穿始终\n2. 多主角叙事：每个角色有独特辨识度\n3. 系列作品：保持品牌视觉一致性\n\n该功能对所有专业版用户开放，免费版可体验 3 个角色。',
      category: 'product',
      category_label: '产品更新',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-28',
      is_featured: false,
      views: 8920
    },
    {
      id: 3,
      title: '批量生成分镜功能全量开放',
      summary: '一次性按剧本生成整集分镜，支持锁定关键镜头二次微调，效率翻倍。',
      content: '批量生成分镜功能今日正式全量开放，创作者可以一键生成完整剧集。\n\n**功能亮点：**\n- 导入剧本自动解析场景、角色、对话\n- 一次性生成 10-100 个分镜镜头\n- 支持锁定关键帧，其余镜头自动保持风格一致\n- 批量导出 PNG/PSD 多种格式\n\n**效率对比：**\n| 方式 | 单集耗时 | 修改成本 |\n|------|----------|----------|\n| 传统手绘 | 3-5 天 | 高 |\n| 单张 AI 生成 | 4-6 小时 | 中 |\n| 批量生成 | 15-30 分钟 | 低 |\n\n立即前往创作工坊体验批量生成功能。',
      category: 'product',
      category_label: '产品更新',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-22',
      is_featured: false,
      views: 6750
    },
    {
      id: 4,
      title: '2025 AI短剧市场报告解读',
      summary: '头部平台用户规模同比增长 220%，AI辅助生产成本占比已超三成。',
      content: '权威行业研究机构发布《2025年中国AI短剧市场白皮书》，数据显示行业正处于爆发式增长阶段。\n\n**关键数据：**\n- 市场规模：2025年预计达到 280 亿元，同比增长 185%\n- 用户规模：头部平台月活突破 3.2 亿，同比增长 220%\n- 内容供给：AI辅助制作的短剧占比达 35%\n- 成本下降：单集制作成本平均降低 60%\n\n**发展趋势：**\n1. **质量升级**：从粗制滥造向精品化转型\n2. **互动增强**：分支剧情、观众参与成新热点\n3. **出海加速**：东南亚、拉美市场增速超 300%\n4. **IP 衍生**：短剧→小说→游戏的全链路开发\n\nAI 创作工具的普及正在重塑整个内容产业链。',
      category: 'industry',
      category_label: '行业动态',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-24',
      is_featured: false,
      views: 15320
    },
    {
      id: 5,
      title: '海外短剧出海趋势观察',
      summary: '东南亚与拉美市场增速最快，本地化翻译与配音成为新增长点。',
      content: '中国短剧出海正迎来新一轮高速增长，东南亚和拉美市场表现尤为亮眼。\n\n**热门市场分析：**\n\n**东南亚（增速 280%）**\n- 主力市场：印尼、泰国、菲律宾\n- 题材偏好：都市情感、复仇逆袭\n- 付费意愿：ARPU 值约为国内的 60%\n\n**拉美（增速 320%）**\n- 主力市场：巴西、墨西哥、阿根廷\n- 题材偏好：悬疑、奇幻、甜宠\n- 本地化要求：配音、文化适配至关重要\n\n**关键成功要素：**\n1. 精准的题材选择（本土化改编）\n2. 高质量的多语言配音\n3. 符合当地审美的视觉风格\n4. 本地化运营与推广\n\nOK AI ART 已推出一键多语言配音功能，助力创作者快速出海。',
      category: 'industry',
      category_label: '行业动态',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-18',
      is_featured: false,
      views: 9870
    },
    {
      id: 6,
      title: 'AIGC 内容创作监管政策解读',
      summary: '多地出台AI生成内容管理细则，创作者需了解合规要点。',
      content: '近期，国家网信办等多部门相继发布AI生成内容管理规定，创作者需要关注以下要点：\n\n**核心合规要求：**\n1. **内容标识**：AI生成的内容需显著标注\n2. **版权合规**：训练数据和生成内容的版权问题\n3. **内容审核**：建立健全内容审核机制\n4. **未成年人保护**：防止不良内容传播\n\n**对创作者的影响：**\n- 正面：规范市场，保护原创者权益\n- 挑战：需要学习新的合规要求\n- 机遇：合规的优质内容将获得更多流量\n\n**OK AI ART 的应对：**\n平台已内置 AI 内容标识功能，生成内容自动添加水印和元数据标记，帮助创作者合规运营。',
      category: 'industry',
      category_label: '行业动态',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-12',
      is_featured: false,
      views: 7650
    },
    {
      id: 7,
      title: '5分钟掌握分镜构图技巧',
      summary: '从景别、机位到镜头节奏，一篇讲透漫剧分镜的底层逻辑与实操要点。',
      content: '好的分镜是漫剧成功的一半。本文将带你快速掌握分镜构图的核心技巧。\n\n**一、景别的运用**\n\n**远景**：展示环境，建立氛围\n- 常用于开场、转场、情绪铺垫\n- 注意画面层次感和氛围营造\n\n**全景**：展示角色全身动作\n- 适合表现角色关系、大动作\n- 留出足够的动作空间\n\n**中景**：最常用的叙事景别\n- 角色膝盖以上\n- 兼顾表情和动作\n- 对话场景的主力景别\n\n**近景/特写**：强调情绪和细节\n- 近景：胸部以上，侧重表情\n- 特写：肩部以上，强化情绪\n- 慎用，用在关键情绪点\n\n**二、机位与角度**\n\n- **平视**：客观、中立，最常用\n- **仰视**：突出角色高大、权威\n- **俯视**：表现角色渺小、无助\n- **倾斜**：营造紧张、不安感\n\n**三、镜头节奏**\n\n- 快节奏：短镜头、快速切换（打斗、追逐）\n- 慢节奏：长镜头、缓慢推移（情感、氛围）\n- 节奏变化：张弛有度，高潮迭起\n\n**练习建议：**\n拉片分析经典漫剧/电影，模仿优秀分镜，培养镜头感。',
      category: 'tutorial',
      category_label: '技术教程',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-26',
      is_featured: false,
      views: 11200
    },
    {
      id: 8,
      title: '角色立绘进阶训练指南',
      summary: '从素材准备到 LoRA 微调，手把手教你训练专属风格的角色立绘模型。',
      content: '想要拥有专属风格的角色立绘？LoRA 微调是最佳选择。本文将手把手教你完整流程。\n\n**准备工作**\n- 20-50 张高质量角色图片\n- 统一的风格和视角\n- 清晰的标注（可选）\n\n**第一步：数据处理**\n\n1. 图片裁剪为统一尺寸（推荐 1024x1024）\n2. 确保角色特征一致\n3. 去除水印和干扰元素\n4. 生成对应的描述文本\n\n**第二步：LoRA 训练**\n\n使用 OK AI ART 训练工具：\n1. 上传素材包\n2. 选择基础模型\n3. 设置训练参数（推荐 10-20 epochs）\n4. 开始训练，等待约 30-60 分钟\n\n**第三步：测试与调优**\n\n- 生成多张测试图\n- 检查不同角度、表情的一致性\n- 调整权重（推荐 0.6-0.8）\n- 必要时补充素材重新训练\n\n**进阶技巧：**\n- 分层训练：先学脸，再学全身\n- 风格分离：角色和风格用不同 LoRA\n- 触发词：设计独特的触发词\n\n关注下期教程，我们将讲解场景 LoRA 的训练方法。',
      category: 'tutorial',
      category_label: '技术教程',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-20',
      is_featured: false,
      views: 8450
    },
    {
      id: 9,
      title: '剧本写作黄金公式：三幕式结构详解',
      summary: '掌握经典三幕式结构，让你的短剧故事更有张力、更吸引人。',
      content: '好剧本是爆款短剧的灵魂。三幕式结构是经过时间检验的经典叙事框架。\n\n**第一幕：建置（Setup）**\n约占总时长的 25%\n\n**核心任务：**\n- 介绍主角和世界观\n- 建立日常状态\n- 抛出「激励事件」打破平静\n- 主角被迫踏上冒险/解决问题之路\n\n**关键节点：**\n- 开场画面：定调\n- 主题呈现：暗示核心冲突\n- 激励事件：故事真正开始\n- 第一幕转折点：主角做出选择，进入第二幕\n\n**第二幕：对抗（Confrontation）**\n约占总时长的 50%\n\n**核心任务：**\n- 主角不断尝试，不断失败\n- 冲突升级，赌注加大\n- 角色成长和转变\n- 中点转折：局势发生质变\n\n**关键节点：**\n- B故事开启：副线/情感线\n- 中点：局势反转\n- 一无所有：最低点\n- 第二幕转折点：找到新方法\n\n**第三幕：结局（Resolution）**\n约占总时长的 25%\n\n**核心任务：**\n- 最终决战/高潮\n- 问题解决\n- 角色完成弧光\n- 收尾，展示新的平衡\n\n**实操建议：**\n1. 先写大纲，再填细节\n2. 每个场景都要有目的\n3. 节奏要快，信息密度要高\n4. 结尾留钩子，吸引追更\n\n下一期我们将讨论「反转与悬念的设计技巧」。',
      category: 'tutorial',
      category_label: '技术教程',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-14',
      is_featured: false,
      views: 9320
    },
    {
      id: 10,
      title: 'AI 配音情感化设置完全指南',
      summary: '让 AI 配音更有感情，从选音色到调参数，打造沉浸式听觉体验。',
      content: '优秀的配音能让漫剧感染力翻倍。本文详细讲解 AI 配音的情感化设置技巧。\n\n**一、音色选择**\n\n**角色定位 → 音色匹配**\n- 少女：清澈、明亮，音调偏高\n- 御姐：成熟、低沉，语速偏慢\n- 少年：清朗、有活力，音调中高\n- 大叔：浑厚、沉稳，语速偏慢\n\n**小贴士：**\n先用短文本测试 3-5 个候选音色，再做决定。\n\n**二、情感参数调节**\n\n**语速（Speed）**\n- 激动/紧张：+10% ~ +20%\n- 悲伤/沉思：-10% ~ -20%\n- 日常对话：±0% ~ +5%\n\n**音调（Pitch）**\n- 惊讶/兴奋：提高 2-4 个半音\n- 低落/沮丧：降低 1-2 个半音\n- 愤怒：提高 + 语速加快\n\n**停顿（Pause）**\n- 强调重要信息前后加停顿\n- 情绪转折处加停顿\n- 悬念揭晓前加长停顿\n\n**三、场景化配音技巧**\n\n**对话场景：**\n- 不同角色用不同音色\n- 注意对话节奏，你一言我一语\n- 加入语气词（嗯、啊、唉）增加真实感\n\n**独白/旁白：**\n- 语速稍慢，富有情感\n- 注意呼吸感和停顿\n- 根据内容调整情绪起伏\n\n**四、后期处理建议**\n\n1. 降噪：去除背景杂音\n2. 均衡：调整频率让声音更舒服\n3. 压缩：平衡音量差异\n4. 混响：根据场景空间感调整\n\nOK AI ART 配音工具已内置 100+ 情感化音色，快去试试吧！',
      category: 'tutorial',
      category_label: '技术教程',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-08',
      is_featured: false,
      views: 6890
    },
    {
      id: 11,
      title: 'OK AI ART 移动端 App 即将发布',
      summary: '随时随地创作漫剧，移动端 App 内测开启，抢先体验报名中。',
      content: '好消息！OK AI ART 移动端 App 将于下月正式发布，现已开启内测报名。\n\n**App 核心功能：**\n\n**1. 移动端创作**\n- 手机/平板端完整创作体验\n- 触控优化的界面设计\n- 随时随地记录灵感\n\n**2. 项目同步**\n- 云端实时同步\n- 多设备无缝切换\n- 离线缓存支持\n\n**3. 社区功能**\n- 作品展示与交流\n- 创作者互相关注\n- 点赞评论互动\n\n**4. 灵感库**\n- 每日精选推荐\n- 分类浏览发现\n- 收藏保存灵感\n\n**内测报名方式：**\n1. 登录官网首页，点击「移动端内测」横幅\n2. 填写报名问卷\n3. 审核通过后将收到 TestFlight/APK 下载链接\n\n内测名额有限，先到先得！正式发布后所有内测用户将获得 1 个月专业版会员奖励。',
      category: 'product',
      category_label: '产品更新',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-16',
      is_featured: false,
      views: 13450
    },
    {
      id: 12,
      title: '漫剧变现新渠道：创作者分成计划详解',
      summary: '平台推出创作者分成计划，优质内容可获得流量分成、广告收益等多重收入。',
      content: '为了让更多创作者获得收益，OK AI ART 正式推出「创作者分成计划」。\n\n**收入来源：**\n\n**1. 流量分成**\n- 根据作品播放量计算\n- 千次播放收益约 5-20 元\n- 优质内容有额外加权\n\n**2. 付费内容**\n- 付费解锁全集/番外\n- 创作者获得 70% 分成\n- 自主定价，灵活运营\n\n**3. 广告分成**\n- 作品前贴广告收益\n- 创作者获得 50% 分成\n- 粉丝越多，单价越高\n\n**4. 打赏与礼物**\n- 观众打赏全额归创作者（扣除支付手续费）\n- 虚拟礼物 80% 归创作者\n\n**加入条件：**\n- 发布不少于 3 部作品\n- 单部作品播放量 ≥ 1000\n- 无违规记录\n- 完成实名认证\n\n**如何加入：**\n前往设置 → 创作者中心 → 分成计划，点击申请。审核周期约 3 个工作日。\n\n已有超过 2000 位创作者加入计划，最高月收入突破 5 万元。下一个会是你吗？',
      category: 'industry',
      category_label: '行业动态',
      cover_image: 'assets/image_1_yi19x4.jpg',
      published_at: '2025-06-05',
      is_featured: false,
      views: 18760
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