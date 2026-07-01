// Supabase 初始化和工具函数
// 使用 anon / publishable key（前端安全）

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

  const options = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
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
  // Employees
  getEmployees: (filter = {}) => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    if (filter.status) params.set('status', `eq.${filter.status}`);
    if (filter.category) params.set('category', `eq.${filter.category}`);
    if (filter.search) params.set('name', `ilike.*${filter.search}*`);
    return supabaseRequest('employees', 'GET', null, params.toString());
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

  // Projects
  getProjects: () => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    return supabaseRequest('projects', 'GET', null, params.toString());
  },

  createProject: (data) => {
    return supabaseRequest('projects', 'POST', data);
  },

  // Notifications
  getNotifications: () => {
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('order', 'created_at.desc');
    params.set('limit', '10');
    return supabaseRequest('notifications', 'GET', null, params.toString());
  },
};
