// ===== 工作台动态数据加载 =====
async function loadDashboardData() {
  try {
    // ===== 1. 统计卡片 =====
    const statEmployees = document.getElementById('stat-employees');
    const statProjects = document.getElementById('stat-projects');
    const statAssets = document.getElementById('stat-assets');
    const statConversations = document.getElementById('stat-conversations');

    const [employees, projectsInProgress, assets, conversations] = await Promise.all([
      db.getEmployees().catch(() => []),
      db.getProjects({ status: 'ongoing' }).catch(() => []),
      db.getAssets().catch(() => []),
      db.getConversations().catch(() => [])
    ]);

    if (statEmployees) {
      const countEl = statEmployees.querySelector('.text-3xl');
      if (countEl) countEl.textContent = employees?.length || 0;
      statEmployees.addEventListener('click', () => location.href = 'ai-employees.html');
    }

    if (statProjects) {
      const countEl = statProjects.querySelector('.text-3xl');
      if (countEl) countEl.textContent = projectsInProgress?.length || 0;
      statProjects.addEventListener('click', () => location.href = 'projects.html');
    }

    if (statAssets) {
      const countEl = statAssets.querySelector('.text-3xl');
      if (countEl) countEl.textContent = assets?.length || 0;
      statAssets.addEventListener('click', () => location.href = 'resources.html');
    }

    if (statConversations) {
      const countEl = statConversations.querySelector('.text-3xl');
      if (countEl) countEl.textContent = conversations?.length || 0;
      statConversations.addEventListener('click', () => location.href = 'chat.html');
    }

    // 更新欢迎副标题
    const welcomeSubtitle = document.getElementById('welcome-subtitle');
    if (welcomeSubtitle) {
      const projectCount = projectsInProgress?.length || 0;
      const employeeCount = employees?.length || 0;
      const onlineEmployees = employees?.filter(function(e) { return e.status === 'online'; })?.length || 0;
      if (projectCount > 0 || employeeCount > 0) {
        welcomeSubtitle.textContent = '今天有 ' + projectCount + ' 个项目进行中，' + onlineEmployees + ' 位 AI 员工在线。';
      }
    }

    // ===== 2. 最近项目 =====
    const recentProjectsEl = document.getElementById('recent-projects');
    if (recentProjectsEl) {
      try {
        const allProjects = await db.getProjects();
        const recentProjects = allProjects?.slice(0, 3) || [];

        if (recentProjects.length === 0) {
          recentProjectsEl.innerHTML = '\
            <div class="flex flex-col items-center justify-center p-8 border" style="background-color: var(--surface-card); border-color: var(--border-default); border-radius: var(--radius-md);">\
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 16px;"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16Z"/></svg>\
              <p class="text-sm mb-4" style="font-family: var(--font-heading); color: var(--text-muted);">暂无项目</p>\
              <a href="projects.html" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md" style="font-family: var(--font-heading); background-color: var(--color-primary); color: var(--text-inverse);" onmouseover="this.style.backgroundColor=\'var(--color-primary-hover)\'" onmouseout="this.style.backgroundColor=\'var(--color-primary)\'">新建项目</a>\
            </div>\
          ';
        } else {
          recentProjectsEl.innerHTML = recentProjects.map(function(project) {
            const thumbnail = project.thumbnail || project.thumbnail_url || 'assets/image_1_yi19x4.jpg';
            const progress = project.progress != null ? project.progress : 0;
            const status = project.status || 'ongoing';
            const statusLabel = status === 'ongoing' ? '进行中' : status === 'completed' ? '已完成' : status === 'paused' ? '已暂停' : status;
            const title = project.title || '未命名项目';
            const description = project.description || '';
            
            return '\
              <a href="projects.html" class="flex gap-4 p-4 border transition-all duration-150 cursor-pointer" style="background-color: var(--surface-card); border-color: var(--border-default); border-radius: var(--radius-md); text-decoration:none;" onmouseover="this.style.borderColor=\'var(--color-primary)\'; this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\'var(--border-default)\'; this.style.transform=\'translateY(0)\'">\
                <div class="flex-shrink-0 overflow-hidden" style="width: 120px; height: 80px; background-color: var(--surface-inset); border-radius: var(--radius-sm);">\
                  <img src="' + thumbnail + '" alt="' + escapeHtml(title) + '" class="w-full h-full object-cover" style="border-radius: var(--radius-sm);" onerror="this.src=\'assets/image_1_yi19x4.jpg\'" />\
                </div>\
                <div class="flex-1 min-w-0 flex flex-col justify-between">\
                  <div>\
                    <h4 class="text-sm font-semibold truncate mb-1" style="font-family: var(--font-heading); color: var(--text-heading);">' + escapeHtml(title) + '</h4>\
                    <p class="text-xs truncate" style="font-family: var(--font-body); color: var(--text-secondary);">' + escapeHtml(description || statusLabel) + '</p>\
                  </div>\
                  <div class="flex items-center gap-3 mt-2">\
                    <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background-color: var(--surface-inset);">\
                      <div class="h-full rounded-full" style="width: ' + progress + '%; background-color: var(--color-primary);"></div>\
                    </div>\
                    <span class="text-xs whitespace-nowrap" style="font-family: var(--font-heading); color: var(--text-muted);">' + progress + '%</span>\
                  </div>\
                </div>\
              </a>\
            ';
          }).join('');
        }
      } catch (e) {
        console.error('加载项目失败:', e);
        recentProjectsEl.innerHTML = '\
          <div class="flex flex-col items-center justify-center p-8 border" style="background-color: var(--surface-card); border-color: var(--border-default); border-radius: var(--radius-md);">\
            <p class="text-sm mb-4" style="font-family: var(--font-heading); color: var(--text-muted);">加载失败</p>\
            <a href="projects.html" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md" style="font-family: var(--font-heading); background-color: var(--color-primary); color: var(--text-inverse);" onmouseover="this.style.backgroundColor=\'var(--color-primary-hover)\'" onmouseout="this.style.backgroundColor=\'var(--color-primary)\'">查看项目</a>\
          </div>\
        ';
      }
    }

    // ===== 3. AI员工状态 =====
    const employeeStatusEl = document.getElementById('employee-status');
    if (employeeStatusEl) {
      try {
        const employeesList = await db.getEmployees();

        if (!employeesList || employeesList.length === 0) {
          employeeStatusEl.innerHTML = '\
            <div class="flex flex-col items-center justify-center p-6 border" style="background-color: var(--surface-card); border-color: var(--border-default); border-radius: var(--radius-md);">\
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 12px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>\
              <p class="text-sm mb-3" style="font-family: var(--font-heading); color: var(--text-muted);">暂无AI员工</p>\
              <a href="new-employee.html" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md" style="font-family: var(--font-heading); background-color: var(--color-primary); color: var(--text-inverse);" onmouseover="this.style.backgroundColor=\'var(--color-primary-hover)\'" onmouseout="this.style.backgroundColor=\'var(--color-primary)\'">新建AI员工</a>\
            </div>\
          ';
        } else {
          employeeStatusEl.innerHTML = employeesList.slice(0, 5).map(function(employee) {
            const name = employee.name || '未命名';
            const role = employee.role || '未知角色';
            const status = employee.status || 'offline';
            const avatarColor = status === 'online' ? 'var(--color-primary-light)' : 'var(--surface-inset)';
            const avatarTextColor = status === 'online' ? 'var(--color-primary)' : 'var(--text-secondary)';
            const statusColor = status === 'online' ? 'var(--state-success)' : status === 'busy' ? 'var(--state-warning)' : 'var(--color-mid-gray)';
            const initial = name.charAt(0).toUpperCase();
            
            return '\
              <a href="ai-employees.html" class="flex items-center gap-3 p-3 border transition-colors duration-150" style="background-color: var(--surface-card); border-color: var(--border-default); border-radius: var(--radius-md); text-decoration:none;" onmouseover="this.style.borderColor=\'var(--color-primary)\'" onmouseout="this.style.borderColor=\'var(--border-default)\'">\
                <div class="relative flex-shrink-0">\
                  <div class="flex items-center justify-center" style="width: 36px; height: 36px; background-color: ' + avatarColor + '; color: ' + avatarTextColor + '; border-radius: var(--radius-full); font-family: var(--font-heading); font-size: 14px; font-weight: 600;">' + escapeHtml(initial) + '</div>\
                  <span class="absolute -bottom-0.5 -right-0.5" style="width: 10px; height: 10px; background-color: ' + statusColor + '; border-radius: var(--radius-full); border: 2px solid var(--surface-card);"></span>\
                </div>\
                <div class="flex-1 min-w-0">\
                  <p class="text-sm font-medium truncate" style="font-family: var(--font-heading); color: var(--text-heading);">' + escapeHtml(name) + '</p>\
                  <p class="text-xs truncate" style="font-family: var(--font-body); color: var(--text-muted);">' + escapeHtml(role) + '</p>\
                </div>\
              </a>\
            ';
          }).join('');
        }
      } catch (e) {
        console.error('加载AI员工失败:', e);
        employeeStatusEl.innerHTML = '\
          <div class="flex flex-col items-center justify-center p-6 border" style="background-color: var(--surface-card); border-color: var(--border-default); border-radius: var(--radius-md);">\
            <p class="text-sm" style="font-family: var(--font-heading); color: var(--text-muted);">加载失败</p>\
          </div>\
        ';
      }
    }

    // ===== 4. 通知下拉 =====
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifDropdown) {
      try {
        const notifications = await db.getNotifications(10);
        
        if (!notifications || notifications.length === 0) {
          notifDropdown.innerHTML = '\
            <div class="notif-item" style="justify-content: center; padding: 24px 16px;">\
              <p class="text-sm" style="font-family: var(--font-heading); color: var(--text-muted);">暂无通知</p>\
            </div>\
          ';
        } else {
          notifDropdown.innerHTML = notifications.map(function(notif) {
            const title = notif.title || '系统通知';
            const message = notif.message || '';
            const time = notif.created_at ? formatTime(notif.created_at) : '';
            const dotColor = notif.type === 'success' ? 'var(--state-success)' : notif.type === 'warning' ? 'var(--state-warning)' : 'var(--color-primary)';
            
            return '\
              <div class="notif-item">\
                <div style="width:8px;height:8px;border-radius:9999px;background:' + dotColor + ';margin-top:6px;flex-shrink:0;"></div>\
                <div>\
                  <p class="text-sm font-medium" style="font-family:var(--font-heading);color:var(--text-heading);">' + escapeHtml(title) + '</p>\
                  <p class="text-xs mt-0.5" style="color:var(--text-muted);">' + escapeHtml(message) + (time ? ' · ' + time : '') + '</p>\
                </div>\
              </div>\
            ';
          }).join('');
        }
      } catch (e) {
        console.error('加载通知失败:', e);
        notifDropdown.innerHTML = '\
          <div class="notif-item" style="justify-content: center; padding: 24px 16px;">\
            <p class="text-sm" style="font-family: var(--font-heading); color: var(--text-muted);">加载失败</p>\
          </div>\
        ';
      }
    }

  } catch (error) {
    console.error('Dashboard data loading failed:', error);
  }
}

// ===== HTML转义辅助函数 =====
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== 时间格式化辅助函数 =====
function formatTime(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return diffMin + ' 分钟前';
  if (diffHour < 24) return diffHour + ' 小时前';
  if (diffDay < 7) return diffDay + ' 天前';
  return time.toLocaleDateString('zh-CN');
}

// ===== 启动加载 =====
if (typeof db !== 'undefined') {
  loadDashboardData();
} else {
  console.error('db is not defined');
}
