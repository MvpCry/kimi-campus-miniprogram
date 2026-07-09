/**
 * 统一 API 请求层
 * 当前阶段启用 MOCK 模式，所有请求走本地 storage + 模拟延迟
 * 后续切换真实接口时，只需关闭 USE_MOCK 并配置 BASE_URL
 */

const storage = require('./storage');

const USE_MOCK = true;
const BASE_URL = 'https://api.kimi-campus.example';
const MOCK_DELAY = { min: 150, max: 400 };

// 当前登录用户缓存
let _currentUser = null;

function getCurrentUser() {
  if (_currentUser) return _currentUser;
  _currentUser = storage.get('kimi_session_user') || null;
  return _currentUser;
}

function refreshCurrentUser() {
  _currentUser = storage.get('kimi_session_user') || null;
  return _currentUser;
}

function mockDelay() {
  const ms = MOCK_DELAY.min + Math.random() * (MOCK_DELAY.max - MOCK_DELAY.min);
  return new Promise(resolve => setTimeout(resolve, ms));
}

function success(data = null, msg = '') {
  return { code: 0, data, msg };
}

function error(msg = '请求失败', code = 1) {
  return { code, data: null, msg };
}

function getList(key) {
  return storage.get(key, []);
}

function findById(key, id) {
  const list = getList(key);
  return list.find(item => item.id === id) || null;
}

function updateById(key, id, updater) {
  const list = getList(key);
  const index = list.findIndex(item => item.id === id);
  if (index === -1) return null;
  const updated = typeof updater === 'function' ? updater(list[index]) : { ...list[index], ...updater };
  updated.updatedAt = new Date().toISOString();
  list[index] = updated;
  storage.set(key, list);
  return updated;
}

function deleteById(key, id) {
  const list = getList(key);
  const filtered = list.filter(item => item.id !== id);
  if (filtered.length === list.length) return false;
  storage.set(key, filtered);
  return true;
}

function insert(key, item) {
  const list = getList(key);
  list.unshift(item);
  storage.set(key, list);
  return item;
}

function paginate(list, page = 1, size = 10) {
  const start = (page - 1) * size;
  const data = list.slice(start, start + size);
  return {
    list: data,
    page,
    size,
    total: list.length,
    hasMore: start + size < list.length
  };
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function parseQuery(url) {
  const query = {};
  const idx = url.indexOf('?');
  if (idx === -1) return { path: url, query };
  const path = url.slice(0, idx);
  const params = new URLSearchParams(url.slice(idx + 1));
  params.forEach((value, key) => {
    query[key] = value;
  });
  return { path, query };
}

function parseNumeric(value) {
  if (value === '' || value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

function filterPosts(params = {}) {
  let posts = getList('kimi_posts');

  if (params.type) {
    posts = posts.filter(p => p.type === params.type);
  }
  if (params.category) {
    posts = posts.filter(p => p.category === params.category);
  }
  if (params.campus) {
    posts = posts.filter(p => p.campus === params.campus);
  }
  if (params.condition) {
    posts = posts.filter(p => p.condition === params.condition);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    posts = posts.filter(p =>
      (p.title && p.title.toLowerCase().includes(kw)) ||
      (p.description && p.description.toLowerCase().includes(kw)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(kw)))
    );
  }
  if (params.subType) {
    posts = posts.filter(p => p.subType === params.subType);
  }

  const minPrice = parseNumeric(params.minPrice);
  const maxPrice = parseNumeric(params.maxPrice);
  if (minPrice !== null) {
    posts = posts.filter(p => p.price >= minPrice);
  }
  if (maxPrice !== null) {
    posts = posts.filter(p => p.price <= maxPrice);
  }

  const sort = params.sort || 'latest';
  if (sort === 'latest') {
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'price_asc') {
    posts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === 'price_desc') {
    posts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === 'hot') {
    posts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }

  return posts;
}

function handleMockRequest(url, method, data) {
  const { path, query } = parseQuery(url);
  const params = { ...query, ...(data || {}) };

  // Posts
  if (path === '/posts') {
    if (method === 'GET') {
      const page = parseInt(params.page, 10) || 1;
      const size = parseInt(params.size, 10) || 10;
      const posts = filterPosts(params);
      return success(paginate(posts, page, size));
    }
    if (method === 'POST') {
      const user = getCurrentUser();
      const post = {
        ...data,
        id: generateId('p'),
        publisherId: user ? user.id : null,
        status: 'active',
        viewCount: 0,
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      insert('kimi_posts', post);
      return success(post);
    }
  }

  if (path.startsWith('/posts/')) {
    const id = path.slice('/posts/'.length);
    if (method === 'GET') {
      const post = findById('kimi_posts', id);
      if (!post) return error('帖子不存在', 404);
      return success(post);
    }
    if (method === 'PUT') {
      const updated = updateById('kimi_posts', id, data);
      if (!updated) return error('帖子不存在', 404);
      return success(updated);
    }
    if (method === 'DELETE') {
      const ok = deleteById('kimi_posts', id);
      if (!ok) return error('帖子不存在', 404);
      return success(null, '删除成功');
    }
  }

  // Categories
  if (path === '/categories' && method === 'GET') {
    return success(getList('kimi_categories'));
  }

  // Search
  if (path === '/search/hot' && method === 'GET') {
    return success(getList('kimi_search_hot'));
  }

  // Users
  if (path === '/users/me' && method === 'GET') {
    const user = getCurrentUser();
    if (!user) return error('未登录', 401);
    return success(user);
  }

  if (path.startsWith('/users/')) {
    const parts = path.split('/');
    const userId = parts[2];
    if (parts[3] === 'posts' && method === 'GET') {
      const posts = getList('kimi_posts').filter(p => p.publisherId === userId);
      return success(paginate(posts, parseInt(params.page, 10) || 1, parseInt(params.size, 10) || 10));
    }
    if (parts[3] === 'favorites' && method === 'GET') {
      const favIds = storage.get(`kimi_favorites_${userId}`, []);
      const posts = getList('kimi_posts').filter(p => favIds.includes(p.id));
      return success(paginate(posts, parseInt(params.page, 10) || 1, parseInt(params.size, 10) || 10));
    }
  }

  // Favorites
  if (path === '/favorites' && method === 'POST') {
    const user = getCurrentUser();
    if (!user) return error('未登录', 401);
    const key = `kimi_favorites_${user.id}`;
    const list = storage.get(key, []);
    if (!list.includes(data.postId)) {
      list.unshift(data.postId);
      storage.set(key, list);
    }
    return success(null, '收藏成功');
  }

  if (path.startsWith('/favorites/')) {
    const postId = path.slice('/favorites/'.length);
    if (method === 'DELETE') {
      const user = getCurrentUser();
      if (!user) return error('未登录', 401);
      const key = `kimi_favorites_${user.id}`;
      const list = storage.get(key, []).filter(id => id !== postId);
      storage.set(key, list);
      return success(null, '取消收藏');
    }
  }

  // Messages
  if (path === '/conversations' && method === 'GET') {
    const user = getCurrentUser();
    if (!user) return error('未登录', 401);
    const messages = getList('kimi_messages');
    const conversations = [];
    const map = new Map();
    messages
      .filter(m => m.senderId === user.id || m.receiverId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(m => {
        const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
        const key = `${m.postId}_${otherId}`;
        if (!map.has(key)) {
          map.set(key, {
            postId: m.postId,
            otherUserId: otherId,
            lastMessage: m,
            unreadCount: 0
          });
          conversations.push(map.get(key));
        }
        if (m.receiverId === user.id && !m.read) {
          map.get(key).unreadCount += 1;
        }
      });
    return success(conversations);
  }

  if (path === '/messages' && method === 'GET') {
    const user = getCurrentUser();
    if (!user) return error('未登录', 401);
    const messages = getList('kimi_messages').filter(m =>
      m.postId === params.postId &&
      ((m.senderId === user.id && m.receiverId === params.otherUserId) ||
       (m.senderId === params.otherUserId && m.receiverId === user.id))
    );
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return success(messages);
  }

  if (path === '/messages' && method === 'POST') {
    const user = getCurrentUser();
    if (!user) return error('未登录', 401);
    const message = {
      ...data,
      id: generateId('m'),
      senderId: user.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    insert('kimi_messages', message);
    return success(message);
  }

  // Reports
  if (path === '/reports' && method === 'POST') {
    const report = {
      ...data,
      id: generateId('r'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    insert('kimi_reports', report);
    return success(report);
  }

  // Verification
  if (path === '/verification' && method === 'POST') {
    const user = getCurrentUser();
    if (!user) return error('未登录', 401);
    updateById('kimi_users', user.id, { verifiedStatus: 'pending' });
    refreshCurrentUser();
    return success(null, '认证申请已提交');
  }

  // Admin
  if (path === '/admin/stats/summary' && method === 'GET') {
    return success({
      userCount: getList('kimi_users').length,
      postCount: getList('kimi_posts').length,
      reportCount: getList('kimi_reports').length,
      pendingReportCount: getList('kimi_reports').filter(r => r.status === 'pending').length
    });
  }

  if (path === '/admin/users' && method === 'GET') {
    return success(paginate(getList('kimi_users'), parseInt(params.page, 10) || 1, parseInt(params.size, 10) || 10));
  }

  if (path === '/admin/posts' && method === 'GET') {
    let posts = getList('kimi_posts');
    if (params.status) posts = posts.filter(p => p.status === params.status);
    return success(paginate(posts, parseInt(params.page, 10) || 1, parseInt(params.size, 10) || 10));
  }

  if (path === '/admin/reports' && method === 'GET') {
    let reports = getList('kimi_reports');
    if (params.status) reports = reports.filter(r => r.status === params.status);
    return success(paginate(reports, parseInt(params.page, 10) || 1, parseInt(params.size, 10) || 10));
  }

  if (path === '/admin/stats/trends' && method === 'GET') {
    return success(getList('kimi_stats'));
  }

  if (path === '/admin/stats/categories' && method === 'GET') {
    const categories = getList('kimi_categories').map(c => {
      const count = getList('kimi_posts').filter(p => p.category === c.id).length;
      return { id: c.id, name: c.name, count };
    });
    return success(categories);
  }

  if (path.startsWith('/admin/users/')) {
    const parts = path.split('/');
    const userId = parts[3];
    if (parts[4] === 'mute' && method === 'PUT') {
      updateById('kimi_users', userId, { mutedUntil: data.mutedUntil });
      return success(null, '操作成功');
    }
  }

  if (path.startsWith('/admin/posts/')) {
    const parts = path.split('/');
    const postId = parts[3];
    if (parts[4] === 'status' && method === 'PUT') {
      updateById('kimi_posts', postId, { status: data.status });
      return success(null, '状态更新成功');
    }
  }

  if (path.startsWith('/admin/reports/')) {
    const parts = path.split('/');
    const reportId = parts[3];
    if (parts[4] === 'status' && method === 'PUT') {
      updateById('kimi_reports', reportId, { status: data.status });
      return success(null, '举报已处理');
    }
  }

  return error(`未模拟的接口：${method} ${path}`, 404);
}

function request(options = {}) {
  const { url, method = 'GET', data, header = {}, showLoading = false, loadingText = '加载中...' } = options;

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true });
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      if (showLoading) wx.hideLoading();
    };

    if (USE_MOCK) {
      mockDelay().then(() => {
        try {
          const res = handleMockRequest(url, method.toUpperCase(), data);
          finish();
          if (res.code !== 0) {
            wx.showToast({ title: res.msg, icon: 'none' });
            reject(res);
          } else {
            resolve(res.data);
          }
        } catch (e) {
          finish();
          console.error('mock request error', e);
          wx.showToast({ title: '请求异常', icon: 'none' });
          reject(e);
        }
      });
      return;
    }

    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        finish();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data;
          if (body && body.code !== 0) {
            wx.showToast({ title: body.msg || '请求失败', icon: 'none' });
            reject(body);
          } else {
            resolve(body ? body.data : null);
          }
        } else {
          wx.showToast({ title: `网络错误 ${res.statusCode}`, icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        finish();
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

const api = {
  get: (url, params = {}, options = {}) => request({ url, method: 'GET', data: params, ...options }),
  post: (url, data = {}, options = {}) => request({ url, method: 'POST', data, ...options }),
  put: (url, data = {}, options = {}) => request({ url, method: 'PUT', data, ...options }),
  delete: (url, options = {}) => request({ url, method: 'DELETE', ...options }),
  refreshUser: refreshCurrentUser
};

module.exports = api;
