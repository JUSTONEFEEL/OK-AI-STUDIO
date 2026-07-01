// OK AI ART - AI 服务层
// 接入大模王AI聚合站 API
// API 基础地址: https://api.lk888.ai/api

const AI_CONFIG_KEY = 'api_config';
const AI_BASE_URL = 'https://api.lk888.ai/api';

async function getAIConfig() {
  if (typeof db === 'undefined') {
    const cached = localStorage.getItem('ai_config_cache');
    return cached ? JSON.parse(cached) : null;
  }
  try {
    const settings = await db.getSetting(AI_CONFIG_KEY);
    return settings?.value || null;
  } catch (e) {
    console.warn('Failed to get AI config from db, trying localStorage:', e);
    const cached = localStorage.getItem('ai_config_cache');
    return cached ? JSON.parse(cached) : null;
  }
}

async function saveAIConfig(config) {
  localStorage.setItem('ai_config_cache', JSON.stringify(config));
  if (typeof db === 'undefined') return true;
  try {
    await db.upsertSetting(AI_CONFIG_KEY, config);
    return true;
  } catch (e) {
    console.error('Failed to save AI config:', e);
    return false;
  }
}

const ai = {
  config: null,
  models: { chat: [], image: [], video: [], audio: [] },

  async init() {
    this.config = await getAIConfig();
    return this.config;
  },

  isConfigured() {
    return !!(this.config?.api_key && this.config.api_key.length > 0);
  },

  getApiKey() {
    return this.config?.api_key || '';
  },

  getBaseUrl() {
    return this.config?.base_url || AI_BASE_URL;
  },

  async request(path, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('请先在设置页面配置 API Key');
    }

    const url = `${this.getBaseUrl()}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.getApiKey()}`,
      ...(options.headers || {})
    };

    if (options.body && !options.headers?.['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || data?.msg || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return data;
    } else {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      return res;
    }
  },

  async getModels(type) {
    const data = await this.request('/v1/skills/models');
    const all = data?.models || [];
    if (type) {
      return all.filter(m => m.type === type);
    }
    return all;
  },

  async getBalance() {
    const data = await this.request('/v1/skills/balance');
    return data;
  },

  async chat(model, messages, options = {}) {
    // 判断模型格式
    const isClaude = model.startsWith('claude');
    const isGemini = model.startsWith('gemini');

    if (isClaude) {
      const data = await this.request('/v1/messages', {
        method: 'POST',
        body: {
          model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: options.max_tokens || 4096,
          stream: false
        }
      });
      return data?.content?.[0]?.text || '';
    }

    if (isGemini) {
      const data = await this.request(`/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        body: {
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        }
      });
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // 默认 OpenAI 格式
    const data = await this.request('/v1/chat/completions', {
      method: 'POST',
      body: {
        model,
        messages,
        stream: false,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4096
      }
    });
    return data?.choices?.[0]?.message?.content || '';
  },

  async generateImage(prompt, model = 'grok-4.2-image', options = {}) {
    const data = await this.request('/v1/media/generate', {
      method: 'POST',
      body: {
        model,
        prompt,
        params: options.params || {}
      }
    });

    if (data.code !== 200) {
      throw new Error(data.msg || '生成失败');
    }

    const taskId = data.data?.task_id || data.data?.['任务ids']?.[0];
    return { task_id: taskId, ...data.data };
  },

  async generateVideo(prompt, model = 'viduq3-turbo', options = {}) {
    const data = await this.request('/v1/media/generate', {
      method: 'POST',
      body: {
        model,
        prompt,
        params: options.params || {}
      }
    });

    if (data.code !== 200) {
      throw new Error(data.msg || '生成失败');
    }

    const taskId = data.data?.task_id || data.data?.['任务ids']?.[0];
    return { task_id: taskId, ...data.data };
  },

  async generateAudio(text, model = 'gemini-2.5-pro-preview-tts', options = {}) {
    const data = await this.request('/v1/media/generate', {
      method: 'POST',
      body: {
        model,
        prompt: text,
        params: options.params || {}
      }
    });

    if (data.code !== 200) {
      throw new Error(data.msg || '生成失败');
    }

    const taskId = data.data?.task_id || data.data?.['任务ids']?.[0];
    return { task_id: taskId, ...data.data };
  },

  async getTaskStatus(taskId) {
    const data = await this.request(`/v1/skills/task-status?task_id=${taskId}`);
    return data;
  },

  async pollTask(taskId, onProgress, maxWaitSeconds = 1800, interval = 5000) {
    const startTime = Date.now();
    let lastStatus = null;

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const status = await this.getTaskStatus(taskId);
      lastStatus = status;

      if (onProgress) onProgress(status);

      if (status.is_final || status.status === '生成完成' || status.state === 'completed') {
        return status;
      }

      if (status.state === 'failed' || status.status === '失败') {
        throw new Error(status.error || '生成失败');
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('生成超时');
  },

  async getVoices(model) {
    let path = '/v1/skills/voices';
    if (model) {
      path += `?model=${encodeURIComponent(model)}`;
    }
    const data = await this.request(path);
    return data?.voices || [];
  },

  async saveAsset(type, prompt, resultUrl, model, employeeId = null, projectId = null) {
    if (typeof db === 'undefined') return null;
    try {
      const asset = await db.createAsset({
        type,
        prompt,
        result_url: resultUrl,
        model,
        status: 'completed',
        employee_id: employeeId,
        project_id: projectId
      });
      return asset;
    } catch (e) {
      console.error('Failed to save asset:', e);
      return null;
    }
  }
};

ai.init().catch(e => console.warn('AI init failed:', e));