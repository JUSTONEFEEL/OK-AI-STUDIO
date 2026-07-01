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
  }
};